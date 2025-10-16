import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { NotificationModel } from "../../models/Notification.js";
import { UserModel } from "../../models/User.js";
import { connectTestDatabase, disconnectTestDatabase, resetTestDatabase } from "../../tests/mongo.js";
import { emitNotification } from "../notificationService.js";

describe("Notification Service", () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  beforeEach(async () => {
    await resetTestDatabase();
  });

  it("stores notifications when emitted", async () => {
    const user = await UserModel.create({ email: "notify@example.com", username: "notify-user" });
    await emitNotification(user.id, "test:event", { foo: "bar" });

    const notifications = await NotificationModel.find({ userId: user.id });
    expect(notifications).toHaveLength(1);
    expect(notifications[0]?.event).toBe("test:event");
    expect(notifications[0]?.payload).toEqual({ foo: "bar" });
  });
});
