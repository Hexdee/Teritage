import { Request, Response } from "express";
import { z } from "zod";

import { AuthenticatedRequest } from "../middleware/auth.js";
import {
  requestVerificationCode,
  resetPassword,
  setPassword,
  setUsername,
  signIn,
  verifyCode} from "../services/authService.js";
import { ApiError } from "../utils/errors.js";
import { signAccessToken } from "../utils/jwt.js";

const emailSchema = z.string().email();

export async function handleRequestSignupCode(req: Request, res: Response): Promise<void> {
  try {
    const bodySchema = z.object({ email: emailSchema });
    const { email } = bodySchema.parse(req.body);
    await requestVerificationCode(email, "signup");
    res.json({ message: "Verification code sent" });
  } catch (error) {
    handleControllerError("handleRequestSignupCode", error, res);
  }
}

export async function handleVerifySignupCode(req: Request, res: Response): Promise<void> {
  try {
    const bodySchema = z.object({ email: emailSchema, code: z.string().min(6).max(6) });
    const { email, code } = bodySchema.parse(req.body);
    const result = await verifyCode(email, code, "signup");
    res.json({ verificationToken: result.verificationToken });
  } catch (error) {
    handleControllerError("handleVerifySignupCode", error, res);
  }
}

export async function handleSetPassword(req: Request, res: Response): Promise<void> {
  try {
    const bodySchema = z.object({
      email: emailSchema,
      password: z.string().min(8),
      verificationToken: z.string().min(10)
    });
    const { email, password, verificationToken } = bodySchema.parse(req.body);
    const user = await setPassword(email, password, verificationToken);
    const token = signAccessToken({ sub: user.id, email: user.email });
    res.status(201).json({ token });
  } catch (error) {
    handleControllerError("handleSetPassword", error, res);
  }
}

export async function handleSignIn(req: Request, res: Response): Promise<void> {
  try {
    const bodySchema = z.object({ email: emailSchema, password: z.string().min(8) });
    const { email, password } = bodySchema.parse(req.body);
    const { token, user } = await signIn(email, password);
    res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
  } catch (error) {
    handleControllerError("handleSignIn", error, res);
  }
}

export async function handleRequestPasswordReset(req: Request, res: Response): Promise<void> {
  try {
    const bodySchema = z.object({ email: emailSchema });
    const { email } = bodySchema.parse(req.body);
    await requestVerificationCode(email, "reset");
    res.json({ message: "Password reset code sent" });
  } catch (error) {
    handleControllerError("handleRequestPasswordReset", error, res);
  }
}

export async function handleVerifyResetCode(req: Request, res: Response): Promise<void> {
  try {
    const bodySchema = z.object({ email: emailSchema, code: z.string().min(6).max(6) });
    const { email, code } = bodySchema.parse(req.body);
    const result = await verifyCode(email, code, "reset");
    res.json({ verificationToken: result.verificationToken });
  } catch (error) {
    handleControllerError("handleVerifyResetCode", error, res);
  }
}

export async function handleResetPassword(req: Request, res: Response): Promise<void> {
  try {
    const bodySchema = z.object({
      email: emailSchema,
      password: z.string().min(8),
      verificationToken: z.string().min(10)
    });
    const { email, password, verificationToken } = bodySchema.parse(req.body);
    await resetPassword(email, password, verificationToken);
    res.json({ message: "Password updated" });
  } catch (error) {
    handleControllerError("handleResetPassword", error, res);
  }
}

export async function handleSetUsername(req: Request, res: Response): Promise<void> {
  try {
    const bodySchema = z.object({ username: z.string().min(3).max(32).regex(/^[a-z0-9_]+$/i) });
    const { username } = bodySchema.parse(req.body);
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }
    const user = await setUsername(userId, username);
    res.json({ username: user.username });
  } catch (error) {
    handleControllerError("handleSetUsername", error, res);
  }
}

function handleControllerError(context: string, err: unknown, res: Response) {
  if (err instanceof ApiError) {
    // eslint-disable-next-line no-console
    console.error(`[${context}]`, err);
    res.status(err.status).json({ message: err.message });
    return;
  }

  if (err instanceof Error) {
    // eslint-disable-next-line no-console
    console.error(`[${context}]`, err);
    res.status(500).json({ message: err.message });
  } else {
    // eslint-disable-next-line no-console
    console.error(`[${context}]`, err);
    res.status(500).json({ message: "Unexpected error" });
  }
}
