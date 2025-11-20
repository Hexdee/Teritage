import { Contract, Interface, JsonRpcProvider, Wallet } from "ethers";

import { env } from "../src/config/env.js";

const CLAIM_ABI = [
  "function claimInheritance(address owner)",
  "function getPlan(address owner) view returns (address[] inheritors, uint96[] shares, address[] tokens, uint8[] tokenTypes, uint64 checkInInterval, uint64 lastCheckIn, bool isClaimed, bool exists)",
  "function getClaimStatus(address owner) view returns (bool claimable, uint256 nextDeadline)",
  "error PlanAlreadyClaimed()",
  "error ClaimNotAvailable()",
  "error InvalidConfiguration()",
  "error NothingToDistribute()",
  "error InsufficientAllowance(address token, uint256 currentAllowance, uint256 requiredAllowance)"
];
const HAS_ABI = [
  "function hbarAllowance(address owner,address spender) view returns (int64 responseCode, int256 amount)",
  "function getAccountBalance(address account) view returns (int64 balance)"
];

const iface = new Interface(CLAIM_ABI);

const ownerAddress = process.argv[2];

if (!ownerAddress) {
  console.error("Usage: pnpm exec tsx scripts/debug-claim.ts <owner-address>");
  process.exit(1);
}

if (!env.contractAddress || !env.contractRpcUrl) {
  console.error("Contract address or RPC URL missing in environment");
  process.exit(1);
}

async function main() {
  const provider = new JsonRpcProvider(env.contractRpcUrl, undefined, { batchMaxCount: 1 });
  const baseContract = new Contract(env.contractAddress, CLAIM_ABI, provider);
  const has = new Contract("0x000000000000000000000000000000000000016a", HAS_ABI, provider);

  const tryCall = async (contract: Contract) => {
    try {
      await contract.claimInheritance.staticCall(ownerAddress);
      console.log("callStatic succeeded — claimInheritance would execute without reverting");
    } catch (error: unknown) {
      console.error("callStatic reverted");
      const err = error as { data?: string; error?: { data?: string; message?: string }; reason?: string; shortMessage?: string };
      const revertData = err?.error?.data ?? (typeof err?.data === "string" ? err.data : undefined);
      if (revertData && revertData !== "0x") {
        try {
          const decoded = iface.parseError(revertData);
          console.error("Decoded revert:", decoded.name, decoded.args);
        } catch (decodeError) {
          console.error("Unable to decode revert data", decodeError);
        }
      } else {
        console.error("No revert data available");
      }
      console.error("Raw error:", error);
    }
  };

  if (env.contractRelayerKey) {
    const wallet = new Wallet(env.contractRelayerKey, provider);
    console.log("Using relayer wallet", wallet.address);
    await tryCall(baseContract.connect(wallet));
  } else {
    console.log("No relayer key configured; attempting static call without signer");
    await tryCall(baseContract);
  }

  const [claimStatus, plan] = await Promise.all([
    baseContract.getClaimStatus(ownerAddress),
    baseContract.getPlan(ownerAddress)
  ]);

  console.log("Plan exists:", plan[7], "Claimed:", plan[6]);
  console.log("Inheritors:", plan[0]);
  console.log("Shares (bps):", plan[1].map((s: bigint) => Number(s)));
  console.log("Check-in interval (s):", Number(plan[4]), "Last check-in:", Number(plan[5]));
  console.log("Claim status => claimable:", claimStatus[0], "nextDeadline:", Number(claimStatus[1]), "current timestamp:", Math.floor(Date.now() / 1000));
  console.log("Tracked tokens:", plan[2], "types:", plan[3].map((t: bigint) => Number(t)));

  if (plan[2].length === 1 && plan[3][0] === 2n) {
    try {
      const balance = await provider.getBalance(ownerAddress);
      console.log("EVM-reported HBAR balance (wei):", balance.toString());
    } catch (balanceError) {
      console.error("Unable to fetch EVM balance", balanceError);
    }

    try {
      const [responseCode, allowanceAmount] = await has.hbarAllowance(ownerAddress, env.contractAddress);
      console.log("HBAR allowance responseCode:", responseCode.toString(), "amount:", allowanceAmount.toString());
    } catch (allowanceError) {
      console.error("Failed to query hbarAllowance precompile", allowanceError);
    }
  }
}

main().catch((error) => {
  console.error("Unhandled error", error);
  process.exit(1);
});
