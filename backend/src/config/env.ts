import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] ?? defaultValue;
  if (value === undefined) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  mongoUri: requiredEnv('MONGODB_URI', 'mongodb://localhost:27017/teritage'),
  jwtSecret: requiredEnv('JWT_SECRET', 'change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  emailFrom: process.env.EMAIL_FROM ?? 'no-reply@teritage.app',
  smtpHost: process.env.SMTP_HOST ?? '',
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpUser: process.env.SMTP_USER ?? '',
  smtpPass: process.env.SMTP_PASS ?? '',
  hederaApiBaseUrl:
    process.env.HEDERA_API_BASE_URL ??
    'https://testnet.mirrornode.hedera.com/api/v1',
  socketPingInterval: Number(process.env.SOCKET_PING_INTERVAL ?? 25000),
  socketPingTimeout: Number(process.env.SOCKET_PING_TIMEOUT ?? 60000),
  contractAddress: '0xb84cb6c12592Ae8a12F2471cFc3C7Aa7FFB26773',
  contractRpcUrl: process.env.CONTRACT_RPC_URL ?? '',
  contractRelayerKey: process.env.CONTRACT_RELAYER_PRIVATE_KEY ?? '',
  claimSweepIntervalMs: Number(process.env.CLAIM_SWEEP_INTERVAL_MS ?? 60000),
  logLevel: (process.env.LOG_LEVEL ?? 'info').toLowerCase(),
};
