import { keccak256, toHex } from 'viem';

export const normalizeSecretAnswer = (answer: string): string =>
  answer.trim().toLowerCase();

export const hashSecretAnswer = (answer: string): `0x${string}` =>
  keccak256(toHex(normalizeSecretAnswer(answer)));
