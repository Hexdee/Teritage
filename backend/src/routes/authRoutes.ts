import { Router } from "express";

import {
  handleRequestPasswordReset,
  handleRequestSignupCode,
  handleResetPassword,
  handleSetPassword,
  handleSetUsername,
  handleSignIn,
  handleVerifyResetCode,
  handleVerifySignupCode} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const authRouter = Router();

/**
 * @openapi
 * /api/auth/signup/request-code:
 *   post:
 *     summary: Request a verification code for email signup
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Verification code sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
authRouter.post("/signup/request-code", handleRequestSignupCode);

/**
 * @openapi
 * /api/auth/signup/verify:
 *   post:
 *     summary: Verify the signup code sent to email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *     responses:
 *       200:
 *         description: Verification successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerificationTokenResponse'
 *       400:
 *         description: Verification failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
authRouter.post("/signup/verify", handleVerifySignupCode);

/**
 * @openapi
 * /api/auth/signup/set-password:
 *   post:
 *     summary: Set account password after verification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - verificationToken
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               verificationToken:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account created and JWT returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokenResponse'
 *       400:
 *         description: Unable to set password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
authRouter.post("/signup/set-password", handleSetPassword);

/**
 * @openapi
 * /api/auth/signin:
 *   post:
 *     summary: Sign in with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSignInResponse'
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
authRouter.post("/signin", handleSignIn);

/**
 * @openapi
 * /api/auth/password/forgot:
 *   post:
 *     summary: Request password reset code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset code sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       400:
 *         description: Failed to send reset code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
authRouter.post("/password/forgot", handleRequestPasswordReset);

/**
 * @openapi
 * /api/auth/password/verify:
 *   post:
 *     summary: Verify password reset code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               code:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *     responses:
 *       200:
 *         description: Verification successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerificationTokenResponse'
 *       400:
 *         description: Verification failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
authRouter.post("/password/verify", handleVerifyResetCode);

/**
 * @openapi
 * /api/auth/password/reset:
 *   post:
 *     summary: Reset password after verification
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - verificationToken
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               verificationToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 *       400:
 *         description: Reset failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
authRouter.post("/password/reset", handleResetPassword);

/**
 * @openapi
 * /api/auth/username:
 *   post:
 *     summary: Set a unique username
 *     security:
 *       - bearerAuth: []
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 pattern: "^[a-zA-Z0-9_]+$"
 *                 minLength: 3
 *                 maxLength: 32
 *     responses:
 *       200:
 *         description: Username set successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsernameResponse'
 *       400:
 *         description: Failed to set username
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiMessageResponse'
 */
authRouter.post("/username", authenticate, handleSetUsername);

export default authRouter;
