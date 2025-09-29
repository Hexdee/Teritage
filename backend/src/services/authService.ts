import { nanoid } from 'nanoid';

import { IUser, UserModel } from '../models/User.js';
import { VerificationCodeModel } from '../models/VerificationCode.js';
import { generateNumericCode } from '../utils/code.js';
import { sendEmail } from '../utils/email.js';
import { signAccessToken } from '../utils/jwt.js';
import {
  compareCode,
  comparePassword,
  hashCode,
  hashPassword,
} from '../utils/password.js';

const CODE_EXPIRY_MINUTES = 15;
const MAX_ATTEMPTS = 5;

interface VerificationResult {
  verificationToken: string;
  email: string;
}

export async function requestVerificationCode(
  email: string,
  purpose: 'signup' | 'reset'
): Promise<void> {
  if (purpose === 'reset') {
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new Error('No account found for this email');
    }
  }

  const code = generateNumericCode(6);
  const codeHash = await hashCode(code);
  const verificationToken = nanoid();
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

  console.log({ codeHash, verificationToken, expiresAt });

  await VerificationCodeModel.findOneAndUpdate(
    { email: email.toLowerCase(), purpose },
    { codeHash, verificationToken, expiresAt, attempts: 0 },
    { upsert: true, new: true }
  );

  console.log(`Verification code for ${email}: ${code}`);
  console.log('Sending email...');

  await sendEmail({
    to: email,
    subject: 'Your Teritage verification code',
    html: `<p>Your verification code is <strong>${code}</strong>. It expires in ${CODE_EXPIRY_MINUTES} minutes.</p>`,
  });

  console.log('Email sent');
}

export async function verifyCode(
  email: string,
  code: string,
  purpose: 'signup' | 'reset'
): Promise<VerificationResult> {
  const record = await VerificationCodeModel.findOne({
    email: email.toLowerCase(),
    purpose,
  });
  if (!record) {
    throw new Error('Verification code not found');
  }

  if (record.expiresAt.getTime() < Date.now()) {
    throw new Error('Verification code has expired');
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    throw new Error('Too many attempts. Please request a new code');
  }

  const isMatch = await compareCode(code, record.codeHash);
  if (!isMatch) {
    record.attempts += 1;
    await record.save();
    throw new Error('Invalid verification code');
  }

  record.attempts = 0;
  await record.save();

  return { verificationToken: record.verificationToken, email: record.email };
}

export async function setPassword(
  email: string,
  password: string,
  verificationToken: string
): Promise<IUser> {
  const record = await VerificationCodeModel.findOne({
    email: email.toLowerCase(),
    verificationToken,
    purpose: 'signup',
  });
  if (!record) {
    throw new Error('Invalid verification token');
  }

  const passwordHash = await hashPassword(password);

  const user = await UserModel.findOneAndUpdate(
    { email: email.toLowerCase() },
    {
      $set: { email: email.toLowerCase(), passwordHash, isEmailVerified: true },
    },
    { upsert: true, new: true }
  );

  await record.deleteOne();
  return user;
}

export async function signIn(
  email: string,
  password: string
): Promise<{ token: string; user: IUser }> {
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user || !user.passwordHash) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = signAccessToken({ sub: user.id, email: user.email });
  return { token, user };
}

export async function resetPassword(
  email: string,
  password: string,
  verificationToken: string
): Promise<void> {
  const record = await VerificationCodeModel.findOne({
    email: email.toLowerCase(),
    verificationToken,
    purpose: 'reset',
  });
  if (!record) {
    throw new Error('Invalid verification token');
  }

  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error('User not found');
  }

  user.passwordHash = await hashPassword(password);
  await user.save();
  await record.deleteOne();
}

export async function setUsername(
  userId: string,
  username: string
): Promise<IUser> {
  const existing = await UserModel.findOne({
    username: username.toLowerCase(),
  });
  if (existing && existing.id !== userId) {
    throw new Error('Username is already taken');
  }

  const user = await UserModel.findByIdAndUpdate(
    userId,
    { username: username.toLowerCase() },
    { new: true }
  );

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

export async function getUserById(id: string): Promise<IUser | null> {
  return UserModel.findById(id);
}
