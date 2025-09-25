import http from "http";

import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { startContractWatcher } from "./services/contractWatcher.js";
import { initNotificationService } from "./services/notificationService.js";

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const server = http.createServer(app);
  initNotificationService(server);
  startContractWatcher();

  server.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Teritage backend listening on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start backend server", error);
  process.exit(1);
});
