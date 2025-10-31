import { Contract, EventLog, JsonRpcProvider, Log, WebSocketProvider } from 'ethers';

import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { emitNotification } from './notificationService.js';
import { recordClaim, updateTeritagePlan } from './teritageService.js';

const contractAbi = [
  'event PlanCreated(address indexed owner,address[] inheritors,uint96[] shares,address[] tokens,uint64 checkInInterval)',
  'event InheritorsUpdated(address indexed owner,address[] inheritors,uint96[] shares)',
  'event TokensUpdated(address indexed owner,address[] tokens)',
  'event CheckInIntervalUpdated(address indexed owner,uint64 newInterval)',
  'event OwnerCheckedIn(address indexed owner,uint64 timestamp)',
  'event InheritanceClaimInitiated(address indexed owner,address indexed triggeredBy,uint64 timestamp)',
];

type WebSocketLike = {
  addEventListener?: (event: string, listener: (...args: unknown[]) => void) => void;
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
};

export function startContractWatcher() {
  if (!env.contractAddress || !env.contractRpcUrl) {
    logger.warn('Contract watcher disabled: CONTRACT_ADDRESS or CONTRACT_RPC_URL not set');
    return;
  }

  const httpProvider = new JsonRpcProvider(env.contractRpcUrl, undefined, {
    batchMaxCount: 1,
  });

  const deriveWebSocketUrl = (url: string): string | undefined => {
    try {
      const parsed = new URL(url);

      if (parsed.protocol === 'http:') {
        parsed.protocol = 'ws:';
      } else if (parsed.protocol === 'https:') {
        parsed.protocol = 'wss:';
      }

      if (parsed.pathname.endsWith('/api')) {
        parsed.pathname = parsed.pathname.replace(/\/api$/, '/ws');
      } else if (!parsed.pathname.endsWith('/ws')) {
        parsed.pathname = `${parsed.pathname.replace(/\/$/, '')}/ws`;
      }

      parsed.search = '';
      parsed.hash = '';

      return parsed.toString();
    } catch (error) {
      logger.warn('Unable to derive WebSocket URL from CONTRACT_RPC_URL', { error });
      return undefined;
    }
  };

  const configuredUrl = env.contractRpcUrl;
  const wsUrl = configuredUrl.startsWith('ws') ? configuredUrl : deriveWebSocketUrl(configuredUrl);

  let wsProvider: WebSocketProvider | undefined;
  if (wsUrl) {
    try {
      wsProvider = new WebSocketProvider(wsUrl);
      logger.info('Contract watcher using WebSocket provider', { wsUrl });
    } catch (error) {
      logger.warn('Failed to initialize WebSocket provider, falling back to HTTP provider', { wsUrl, error });
      wsProvider = undefined;
    }
  }

  const createContract = (provider: JsonRpcProvider | WebSocketProvider) =>
    new Contract(env.contractAddress!, contractAbi, provider);

  let activeProvider: JsonRpcProvider | WebSocketProvider = wsProvider ?? httpProvider;
  let contract = createContract(activeProvider);

  const attachEventHandlers = (instance: Contract) => {
    instance.removeAllListeners();

    instance.on('PlanCreated', async (owner: string, inheritors: string[], shares: bigint[], tokens: string[], checkInInterval: bigint) => {
      logger.info('PlanCreated event received', {
        owner,
        inheritors,
        shares: shares.map((share) => share.toString()),
        tokens,
        checkInInterval: checkInInterval.toString(),
      });
    });

    instance.on('OwnerCheckedIn', async (owner: string) => {
      try {
        await updateTeritagePlan(owner, {});
        await emitNotification(owner.toLowerCase(), 'contract:checkin', { owner });
      } catch (error) {
        logger.error('Failed to update plan from OwnerCheckedIn event', error);
      }
    });

    instance.on('InheritanceClaimInitiated', async (owner: string, triggeredBy: string, timestamp: bigint, event: EventLog | Log) => {
      try {
        const txHash =
          event && typeof event === 'object' && 'transactionHash' in event
            ? (event.transactionHash as string | undefined)
            : undefined;
        await recordClaim(owner, {
          initiatedBy: triggeredBy,
          txHash,
        });
        await emitNotification(owner.toLowerCase(), 'contract:claim', { owner, triggeredBy, timestamp: timestamp.toString() });
      } catch (error) {
        logger.error('Failed to update plan from claim event', error);
      }
    });
  };

  const switchToFallback = () => {
    if (activeProvider === httpProvider) {
      return;
    }

    logger.warn('Switching contract watcher to HTTP provider fallback');
    activeProvider = httpProvider;
    contract = createContract(activeProvider);
    attachEventHandlers(contract);
  };

  attachEventHandlers(contract);

  if (wsProvider) {
    const handleWsFailure = (error?: unknown) => {
      logger.warn('WebSocket provider error detected, attempting fallback', { error });
      switchToFallback();
    };

    // ethers v6 exposes the underlying websocket differently depending on runtime
    const rawSocket =
      (wsProvider as unknown as { websocket?: WebSocketLike }).websocket ??
      (wsProvider as unknown as { _websocket?: WebSocketLike })._websocket;

    if (rawSocket) {
      if (typeof rawSocket.addEventListener === 'function') {
        rawSocket.addEventListener('close', handleWsFailure);
        rawSocket.addEventListener('error', handleWsFailure);
      } else if (typeof rawSocket.on === 'function') {
        rawSocket.on('close', handleWsFailure);
        rawSocket.on('error', handleWsFailure);
      }
    }

    wsProvider.on('error', handleWsFailure);
  }
}
