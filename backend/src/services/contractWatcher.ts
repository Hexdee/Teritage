import { Contract, JsonRpcProvider, WebSocketProvider } from "ethers";

import { env } from "../config/env.js";
import { emitNotification } from "./notificationService.js";
import { updateTeritagePlan } from "./teritageService.js";

const contractAbi = [
  "event PlanCreated(address indexed owner,address[] inheritors,uint96[] shares,address[] tokens,uint64 checkInInterval)",
  "event InheritorsUpdated(address indexed owner,address[] inheritors,uint96[] shares)",
  "event TokensUpdated(address indexed owner,address[] tokens)",
  "event CheckInIntervalUpdated(address indexed owner,uint64 newInterval)",
  "event OwnerCheckedIn(address indexed owner,uint64 timestamp)",
  "event InheritanceClaimInitiated(address indexed owner,address indexed triggeredBy,uint64 timestamp)"
];

export function startContractWatcher() {
  if (!env.contractAddress || !env.contractRpcUrl) {
    // eslint-disable-next-line no-console
    console.log("Contract watcher disabled: CONTRACT_ADDRESS or CONTRACT_RPC_URL not set");
    return;
  }

  let provider: JsonRpcProvider | WebSocketProvider;
  if (env.contractRpcUrl.startsWith("ws")) {
    provider = new WebSocketProvider(env.contractRpcUrl);
  } else {
    provider = new JsonRpcProvider(env.contractRpcUrl);
  }

  const contract = new Contract(env.contractAddress, contractAbi, provider);

  contract.on("OwnerCheckedIn", async (owner: string) => {
    try {
      await updateTeritagePlan(owner, {});
      await emitNotification(owner.toLowerCase(), "contract:checkin", { owner });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to update plan from OwnerCheckedIn event", error);
    }
  });

  contract.on("InheritanceClaimInitiated", async (owner: string) => {
    try {
      await updateTeritagePlan(owner, { notifyBeneficiary: true });
      await emitNotification(owner.toLowerCase(), "contract:claim", { owner });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to update plan from claim event", error);
    }
  });
}
