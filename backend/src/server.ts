import http from 'http';

import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import { initNotificationService } from './services/notificationService.js';
import { startInheritanceClaimScheduler } from './services/inheritanceClaimScheduler.js';
import { logger } from './utils/logger.js';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const server = http.createServer(app);
  initNotificationService(server);
  startInheritanceClaimScheduler();

  server.listen(env.port, () => {
    logger.info(`Teritage backend listening on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  logger.error('Failed to start backend server', error);
  process.exit(1);
});
