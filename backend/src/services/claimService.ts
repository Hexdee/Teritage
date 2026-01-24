import { Contract, JsonRpcProvider, Wallet, isAddress } from "ethers";

import { env } from "../config/env.js";
import { TeritagePlanModel } from "../models/TeritagePlan.js";
import { UserModel } from "../models/User.js";
import { ApiError } from "../utils/errors.js";
import { hashSecretAnswer, normalizeSecretAnswer } from "../utils/secret.js";
import { recordClaim } from "./teritageService.js";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const CLAIM_ABI = [
  "function getClaimStatus(address owner) view returns (bool claimable, uint256 nextDeadline)",
  "function resolveInheritorWithSecret(address owner,uint256 index,address beneficiary,string answer)",
  "function claimInheritance(address owner)"
];

let relayerContract: Contract | null = null;

const getRelayerContract = (): Contract => {
  if (relayerContract) {
    return relayerContract;
  }

  if (!env.contractAddress || !env.contractRpcUrl || !env.contractRelayerKey) {
    throw new ApiError(500, "Relayer configuration missing");
  }

  const provider = new JsonRpcProvider(env.contractRpcUrl, undefined, {
    batchMaxCount: 1
  });
  const wallet = new Wallet(env.contractRelayerKey, provider);
  relayerContract = new Contract(env.contractAddress, CLAIM_ABI, wallet);
  return relayerContract;
};

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const resolvePlanAndInheritor = async (ownerAddress: string, inheritorIndex: number) => {
  const plan = await TeritagePlanModel.findOne({ ownerAddress: ownerAddress.toLowerCase() }).populate("ownerAccount");
  if (!plan) {
    throw new ApiError(404, "Teritage plan not found");
  }

  if (!Number.isInteger(inheritorIndex) || inheritorIndex < 0 || inheritorIndex >= plan.inheritors.length) {
    throw new ApiError(404, "Beneficiary record not found");
  }

  const inheritor = plan.inheritors[inheritorIndex];
  return { plan, inheritor };
};

export async function lookupClaimByOwnerEmail(ownerEmail: string, beneficiaryEmail?: string) {
  const owner = await UserModel.findOne({ email: normalizeEmail(ownerEmail) });
  if (!owner) {
    throw new ApiError(404, "Owner not found");
  }

  const plan = await TeritagePlanModel.findOne({ ownerAccount: owner._id });
  if (!plan) {
    throw new ApiError(404, "Teritage plan not found");
  }

  const inheritors = plan.inheritors
    .map((inheritor, index) => ({ inheritor, index }))
    .filter(({ inheritor }) => Boolean(inheritor.secretAnswerHash));

  if (!inheritors.length) {
    throw new ApiError(404, "No secret-based beneficiaries found");
  }

  const target = beneficiaryEmail
    ? inheritors.find(
        ({ inheritor }) =>
          inheritor.email?.trim().toLowerCase() === normalizeEmail(beneficiaryEmail)
      )
    : inheritors.length === 1
      ? inheritors[0]
      : null;

  if (!target) {
    throw new ApiError(404, "Matching beneficiary not found");
  }

  if (!target.inheritor.secretQuestion) {
    throw new ApiError(404, "Secret question unavailable for this beneficiary");
  }

  return {
    ownerAddress: plan.ownerAddress,
    inheritorIndex: target.index,
    secretQuestion: target.inheritor.secretQuestion
  };
}

export async function verifyClaimAnswer(ownerAddress: string, inheritorIndex: number, secretAnswer: string) {
  const { inheritor } = await resolvePlanAndInheritor(ownerAddress, inheritorIndex);
  if (!inheritor.secretAnswerHash) {
    throw new ApiError(400, "Beneficiary does not use a secret answer");
  }

  const answerHash = hashSecretAnswer(secretAnswer);
  if (answerHash.toLowerCase() !== inheritor.secretAnswerHash.toLowerCase()) {
    throw new ApiError(401, "Incorrect secret answer");
  }

  return true;
}

export async function submitClaim(params: {
  ownerAddress: string;
  inheritorIndex: number;
  secretAnswer: string;
  beneficiaryWallet: string;
}) {
  const { ownerAddress, inheritorIndex, secretAnswer, beneficiaryWallet } = params;

  if (!isAddress(beneficiaryWallet)) {
    throw new ApiError(400, "Invalid beneficiary wallet address");
  }

  const normalizedWallet = beneficiaryWallet.toLowerCase();
  if (normalizedWallet === ZERO_ADDRESS) {
    throw new ApiError(400, "Beneficiary wallet cannot be the zero address");
  }

  const { plan, inheritor } = await resolvePlanAndInheritor(ownerAddress, inheritorIndex);
  const normalizedOwner = plan.ownerAddress;
  if (!inheritor.secretAnswerHash) {
    throw new ApiError(400, "Beneficiary does not use a secret answer");
  }

  const answerHash = hashSecretAnswer(secretAnswer);
  if (answerHash.toLowerCase() !== inheritor.secretAnswerHash.toLowerCase()) {
    throw new ApiError(401, "Incorrect secret answer");
  }

  if (inheritor.address && inheritor.address.toLowerCase() !== ZERO_ADDRESS) {
    throw new ApiError(409, "Beneficiary wallet already resolved");
  }

  const contract = getRelayerContract();
  const normalizedAnswer = normalizeSecretAnswer(secretAnswer);

  const resolveTx = await contract.resolveInheritorWithSecret(
    normalizedOwner,
    inheritorIndex,
    normalizedWallet,
    normalizedAnswer
  );
  await resolveTx.wait();

  plan.inheritors[inheritorIndex].address = normalizedWallet;
  await plan.save();

  const [claimable] = await contract.getClaimStatus(normalizedOwner);
  let claimTxHash: string | null = null;

  if (claimable) {
    const claimTx = await contract.claimInheritance(normalizedOwner);
    await claimTx.wait();
    claimTxHash = claimTx.hash;
    await recordClaim(normalizedOwner, {
      initiatedBy: normalizedWallet,
      txHash: claimTxHash
    });
  }

  return {
    resolvedTxHash: resolveTx.hash,
    claimable,
    claimTxHash
  };
}
