import { ITeritagePlan } from "../models/TeritagePlan.js";
import { fetchHederaTokenBalances } from "./hederaService.js";
import { getTeritagePlan } from "./teritageService.js";

export async function getWalletTokens(accountId: string) {
  return fetchHederaTokenBalances(accountId);
}

export async function getWalletSummary(ownerAddress: string, accountId: string) {
  const [planDoc, tokens] = await Promise.all([
    getTeritagePlan(ownerAddress),
    fetchHederaTokenBalances(accountId)
  ]);

  const plan = planDoc ? (planDoc.toObject({ versionKey: false }) as ITeritagePlan) : undefined;

  const totalBalanceUsd = tokens.reduce((acc: number, token) => acc + token.balance * token.priceUsd, 0);
  const assignedPercentage = plan
    ? plan.inheritors.reduce((acc: number, inheritor) => acc + inheritor.sharePercentage, 0)
    : 0;
  const unallocatedPercentage = Math.max(0, 100 - assignedPercentage);

  return {
    totalPortfolioValueUsd: totalBalanceUsd,
    change24hPercent: tokens.reduce((acc: number, token) => acc + token.change24hPercent, 0),
    assignedPercentage,
    unallocatedPercentage,
    notifyBeneficiary: plan?.notifyBeneficiary ?? false,
    socialLinks: plan?.socialLinks ?? [],
    tokenCount: tokens.length
  };
}
