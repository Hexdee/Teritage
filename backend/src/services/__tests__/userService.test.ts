import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { IUser, UserModel } from "../../models/User.js";
import { connectTestDatabase, disconnectTestDatabase, resetTestDatabase } from "../../tests/mongo.js";
import { hashPassword } from "../../utils/password.js";
import {
  changePassword,
  changePin,
  createPin,
  getUserProfile,
  updateUserProfile,
  updateWalletAddresses,
  verifyPin
} from "../userService.js";

describe("User Service", () => {
  let user: IUser;

  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  beforeEach(async () => {
    await resetTestDatabase();
    user = await UserModel.create({
      email: "user@example.com",
      passwordHash: await hashPassword("CurrentPass1!"),
      allowNotifications: false
    });
  });

  it("retrieves a sanitized user profile", async () => {
    const profile = await getUserProfile(user.id);
    expect(profile.email).toBe("user@example.com");
    expect(profile.allowNotifications).toBe(false);
    expect(profile.walletAddresses).toEqual([]);
  });

  it("updates profile fields", async () => {
    const profile = await updateUserProfile(user.id, {
      name: "Jane Doe",
      phone: "+1234567890",
      notes: "Primary contact",
      allowNotifications: true
    });

    expect(profile.name).toBe("Jane Doe");
    expect(profile.phone).toBe("+1234567890");
    expect(profile.notes).toBe("Primary contact");
    expect(profile.allowNotifications).toBe(true);
  });

  it("changes the account password", async () => {
    await changePassword(user.id, "CurrentPass1!", "NewPass2@");
    const updated = await UserModel.findById(user.id);
    expect(updated?.passwordHash).toBeDefined();
    expect(updated?.passwordHash).not.toEqual(user.passwordHash);
  });

  it("verifies and updates the PIN", async () => {
    expect(await verifyPin(user.id, "1234")).toEqual({ valid: true, hasPin: false });

    await createPin(user.id, "1234");
    expect(await verifyPin(user.id, "1234")).toEqual({ valid: true, hasPin: true });

    await changePin(user.id, "1234", "9876");
    expect(await verifyPin(user.id, "9876")).toEqual({ valid: true, hasPin: true });
  });

  it("normalizes and saves wallet addresses", async () => {
    const profile = await updateWalletAddresses(user.id, [" 0xABC123 ", "0xabc123", "0.0.1234"]);
    expect(profile.walletAddresses).toEqual(["0xabc123", "0.0.1234"]);
  });
});
