import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { sendEmail } from "../../utils/email.js";
import { TeritagePlanModel } from "../../models/TeritagePlan.js";
import { IUser, UserModel } from "../../models/User.js";
import { connectTestDatabase, disconnectTestDatabase, resetTestDatabase } from "../../tests/mongo.js";
import { createTeritagePlan, recordCheckIn, updateTeritagePlan } from "../teritageService.js";

vi.mock("../../utils/email.js", () => ({
  sendEmail: vi.fn(async () => {})
}));
const sendEmailMock = vi.mocked(sendEmail);

describe("Teritage Service", () => {
  beforeAll(async () => {
    await connectTestDatabase();
  });

  afterAll(async () => {
    await disconnectTestDatabase();
  });

  beforeEach(async () => {
    await resetTestDatabase();
    vi.clearAllMocks();
  });

  it("creates a plan linked to the authenticated user profile", async () => {
    const owner = await UserModel.create({ email: "owner@example.com", username: "Jane Doe", name: "Jane Doe" });

    const plan = await createTeritagePlan(owner.id, {
      ownerAddress: "0xABC123",
      inheritors: [
        { address: "0x1", sharePercentage: 50, email: "beneficiary1@example.com" },
        { address: "0x2", sharePercentage: 50, email: "beneficiary2@example.com" }
      ],
      tokens: [
        { address: "0xTokenA", type: "ERC20" },
        { address: "hbar", type: "HBAR" }
      ],
      checkInIntervalSeconds: 86400,
      notifyBeneficiary: true,
      socialLinks: ["https://example.com"]
    });

    expect(plan.ownerAddress).toBe("0xabc123");
    const ownerRef = plan.ownerAccount as unknown;
    const ownerId =
      ownerRef && typeof ownerRef === "object" && "id" in ownerRef
        ? (ownerRef as IUser & { id: string }).id
        : String(ownerRef);
    expect(ownerId).toBe(owner.id);
    expect(plan.activities[0]?.type).toBe("PLAN_CREATED");

    const storedOwner = await UserModel.findById(owner.id);
    expect(storedOwner?.name).toBe("Jane Doe");
    expect(storedOwner?.walletAddresses).toContain("0xABC123");
    expect(sendEmailMock).toHaveBeenCalledTimes(2);

    const planFromDb = await TeritagePlanModel.findOne({ ownerAccount: owner.id }).populate<{ ownerAccount: IUser }>(
      "ownerAccount"
    );
    expect(planFromDb?.ownerAccount).toBeTruthy();
  });

  it("prevents creating multiple plans for the same user", async () => {
    const owner = await UserModel.create({ email: "duplicate@example.com", username: "John Duplicate" });

    await createTeritagePlan(owner.id, {
      ownerAddress: "0xdup",
      inheritors: [{ address: "0x3", sharePercentage: 100 }],
      tokens: [{ address: "0xTokenB", type: "ERC20" }],
      checkInIntervalSeconds: 3600
    });

    await expect(
      createTeritagePlan(owner.id, {
        ownerAddress: "0xdup2",
        inheritors: [{ address: "0x4", sharePercentage: 100 }],
        tokens: [{ address: "0xTokenC", type: "ERC20" }],
        checkInIntervalSeconds: 3600
      })
    ).rejects.toThrow(/already exists/i);
  });

  it("updates plan fields while preserving owner profile details", async () => {
    const owner = await UserModel.create({ email: "update@example.com", username: "Original Owner", name: "Original Owner" });

    await createTeritagePlan(owner.id, {
      ownerAddress: "0xupdate",
      inheritors: [{ address: "0x5", sharePercentage: 100, email: "update-beneficiary@example.com" }],
      tokens: [{ address: "0xTokenD", type: "ERC20" }],
      checkInIntervalSeconds: 7200,
      socialLinks: [],
      notifyBeneficiary: false
    });

    const plan = await updateTeritagePlan(owner.id, {
      inheritors: [
        { address: "0x5", sharePercentage: 70 },
        { address: "0x6", sharePercentage: 30 }
      ],
      tokens: [{ address: "0xTokenE", type: "ERC20" }],
      checkInIntervalSeconds: 14400,
      socialLinks: ["https://updated.example.com"],
      notifyBeneficiary: true
    });

    expect(plan.inheritors).toHaveLength(2);
    expect(plan.tokens[0]?.address).toBe("0xtokene");
    expect(plan.checkInIntervalSeconds).toBe(14400);
    expect(plan.socialLinks).toEqual(["https://updated.example.com"]);
    expect(plan.notifyBeneficiary).toBe(true);

    const ownerDoc = plan.ownerAccount as unknown as IUser;
    expect(ownerDoc.name ?? ownerDoc.username).toBe("Original Owner");
  });

  it("sends beneficiary emails when notify is enabled after creation", async () => {
    const owner = await UserModel.create({ email: "toggle@example.com", username: "Toggle Owner" });

    await createTeritagePlan(owner.id, {
      ownerAddress: "0xtoggle",
      inheritors: [{ address: "0x9", sharePercentage: 100, email: "toggle-beneficiary@example.com" }],
      tokens: [{ address: "0xTokenToggle", type: "ERC20" }],
      checkInIntervalSeconds: 3600,
      notifyBeneficiary: false
    });

    expect(sendEmailMock).toHaveBeenCalledTimes(0);

    const updatedPlan = await updateTeritagePlan(owner.id, { notifyBeneficiary: true });
    expect(updatedPlan.notifyBeneficiary).toBe(true);
    expect(sendEmailMock).toHaveBeenCalledTimes(1);
  });

  it("records check-ins and keeps profile accessible", async () => {
    const owner = await UserModel.create({ email: "checkin@example.com", username: "Check In Owner", name: "Check In Owner" });

    await createTeritagePlan(owner.id, {
      ownerAddress: "0xcheck",
      inheritors: [{ address: "0x7", sharePercentage: 100 }],
      tokens: [{ address: "0xTokenF", type: "ERC20" }],
      checkInIntervalSeconds: 3600
    });

    const plan = await recordCheckIn(owner.id, { triggeredBy: "owner" });

    expect(plan.checkIns).toHaveLength(1);
    expect(plan.activities.at(-1)?.type).toBe("CHECK_IN");

    const ownerDoc = plan.ownerAccount as unknown as IUser;
    expect(ownerDoc.name ?? ownerDoc.username).toBe("Check In Owner");
  });
});
