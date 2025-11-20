import { Contract, JsonRpcProvider, Wallet } from 'ethers';

import { env } from '../config/env.js';
import { TeritagePlanModel } from '../models/TeritagePlan.js';
import { recordClaim } from './teritageService.js';
import { logger } from '../utils/logger.js';

const CLAIM_FUNCTION_ABI = ['function claimInheritance(address owner)'];

let schedulerHandle: NodeJS.Timeout | null = null;
let contractInstance: Contract | null = null;
let relayerAddress: string | null = null;

const ensureContract = (): Contract | null => {
  if (contractInstance) {
    return contractInstance;
  }

  if (!env.contractAddress || !env.contractRpcUrl || !env.contractRelayerKey) {
    logger.warn('Claim scheduler disabled: contract configuration incomplete');
    return null;
  }

  try {
    const provider = new JsonRpcProvider(env.contractRpcUrl, undefined, {
      batchMaxCount: 1,
    });
    const wallet = new Wallet(env.contractRelayerKey, provider);
    contractInstance = new Contract(
      env.contractAddress,
      CLAIM_FUNCTION_ABI,
      wallet
    );
    logger.info('Claim scheduler initialized relayer wallet', {
      relayer: wallet.address,
    });
    relayerAddress = wallet.address.toLowerCase();
    return contractInstance;
  } catch (error) {
    logger.error(
      'Failed to initialize contract relayer for claim scheduler',
      error
    );
    contractInstance = null;
    return null;
  }
};

const isPlanDue = (
  lastCheckInAt: Date,
  checkInIntervalSeconds: number
): boolean => {
  if (!Number.isFinite(checkInIntervalSeconds) || checkInIntervalSeconds <= 0) {
    return false;
  }

  const dueAt = lastCheckInAt.getTime() + checkInIntervalSeconds * 1000;
  return Date.now() > dueAt;
};

export const runClaimSweep = async (): Promise<void> => {
  const contract = ensureContract();
  if (!contract) {
    return;
  }

  const pendingPlans = await TeritagePlanModel.find({
    isClaimInitiated: false,
  }).lean();
  if (!pendingPlans.length) {
    return;
  }

  for (const plan of pendingPlans) {
    const lastCheckInAt =
      plan.lastCheckInAt instanceof Date
        ? plan.lastCheckInAt
        : new Date(plan.lastCheckInAt);
    if (!isPlanDue(lastCheckInAt, plan.checkInIntervalSeconds)) {
      continue;
    }

    const ownerAddress = plan.ownerAddress.toLowerCase();
    logger.info('Attempting automated claim distribution', { ownerAddress });

    try {
      const tx = await contract.claimInheritance(ownerAddress);
      await tx.wait();
      let initiatedBy = relayerAddress;
      if (!initiatedBy) {
        const runner = contract.runner as unknown;
        if (
          runner &&
          typeof runner === 'object' &&
          typeof (runner as { getAddress?: () => Promise<string> }).getAddress ===
            'function'
        ) {
          try {
            initiatedBy = (
              await (runner as { getAddress: () => Promise<string> }).getAddress()
            )?.toLowerCase();
          } catch {
            // ignore failures and fall back to owner address below
          }
        }
      }
      await recordClaim(ownerAddress, {
        initiatedBy: initiatedBy ?? ownerAddress,
        txHash: tx.hash,
      });
      logger.info('Automated claim completed', {
        ownerAddress,
        txHash: tx.hash,
      });
    } catch (error) {
      logger.error('Automated claim failed', { ownerAddress, error });
    }
  }
};

export const startInheritanceClaimScheduler = (): void => {
  const contract = ensureContract();
  if (!contract) {
    return;
  }

  const intervalMs = Math.max(15_000, env.claimSweepIntervalMs || 60_000);

  const tick = async () => {
    try {
      await runClaimSweep();
    } catch (error) {
      logger.error('Claim scheduler sweep failed', error);
    }
  };

  void tick();
  schedulerHandle = setInterval(tick, intervalMs);
  logger.info('Claim scheduler started', { intervalMs });
};

export const stopInheritanceClaimScheduler = (): void => {
  if (schedulerHandle) {
    clearInterval(schedulerHandle);
    schedulerHandle = null;
    logger.info('Claim scheduler stopped');
  }
};
