import { keccak256, toUtf8Bytes } from "ethers";

export const normalizeSecretAnswer = (answer: string): string =>
  answer.trim().toLowerCase();

export const hashSecretAnswer = (answer: string): string =>
  keccak256(toUtf8Bytes(normalizeSecretAnswer(answer)));
