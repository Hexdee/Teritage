import { Router } from "express";

import {
  handleChangePassword,
  handleChangePin,
  handleCreatePin,
  handleGetUserProfile,
  handleGetNotificationPreferences,
  handleUpdateNotificationPreferences,
  handleUpdateUserProfile,
  handleUpdateWalletAddresses,
  handleVerifyPin
} from "../controllers/userController.js";
import { authenticate } from "../middleware/auth.js";

const userRouter = Router();

/**
 * @openapi
 * /api/user/profile:
 *   get:
 *     summary: Retrieve the authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfileResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
userRouter.get("/user/profile", authenticate, handleGetUserProfile);

/**
 * @openapi
 * /api/user/profile:
 *   patch:
 *     summary: Update the authenticated user's profile information
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserProfileRequest'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfileResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
userRouter.patch("/user/profile", authenticate, handleUpdateUserProfile);

/**
 * @openapi
 * /api/user/password:
 *   patch:
 *     summary: Change account password
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       400:
 *         description: Invalid current password or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
userRouter.patch("/user/password", authenticate, handleChangePassword);

/**
 * @openapi
 * /api/user/pin/verify:
 *   post:
 *     summary: Verify the current Teritage PIN
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyPinRequest'
 *     responses:
 *       200:
 *         description: PIN is valid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PinVerificationResponse'
 *       400:
 *         description: Invalid PIN
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
userRouter.post("/user/pin/verify", authenticate, handleVerifyPin);

/**
 * @openapi
 * /api/user/pin:
 *   post:
 *     summary: Create a Teritage PIN
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePinRequest'
 *     responses:
 *       201:
 *         description: PIN created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       400:
 *         description: PIN already exists or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
userRouter.post("/user/pin", authenticate, handleCreatePin);

/**
 * @openapi
 * /api/user/pin:
 *   patch:
 *     summary: Update the Teritage PIN
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePinRequest'
 *     responses:
 *       200:
 *         description: PIN updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       400:
 *         description: Invalid PIN or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
userRouter.patch("/user/pin", authenticate, handleChangePin);

/**
 * @openapi
 * /api/user/wallets:
 *   patch:
 *     summary: Update the list of managed wallet addresses
 *     security:
 *       - bearerAuth: []
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWalletAddressesRequest'
 *     responses:
 *       200:
 *         description: Wallets updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfileResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
userRouter.patch("/user/wallets", authenticate, handleUpdateWalletAddresses);

/**
 * @openapi
 * /api/user/notifications:
 *   get:
 *     summary: Retrieve notification preferences
 *     security:
 *       - bearerAuth: []
 *     tags: [Notifications]
 *     responses:
 *       200:
 *         description: Notification preferences retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationPreferenceResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
userRouter.get("/user/notifications", authenticate, handleGetNotificationPreferences);

/**
 * @openapi
 * /api/user/notifications:
 *   patch:
 *     summary: Update notification preferences
 *     security:
 *       - bearerAuth: []
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNotificationPreferenceRequest'
 *     responses:
 *       200:
 *         description: Notification preferences updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationPreferenceResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       401:
 *         description: Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
userRouter.patch("/user/notifications", authenticate, handleUpdateNotificationPreferences);

export default userRouter;
