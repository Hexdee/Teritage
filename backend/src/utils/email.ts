import nodemailer from "nodemailer";

import { env } from "../config/env.js";
import { logger } from "./logger.js";

const hasCredentials = Boolean(env.smtpHost && env.smtpUser && env.smtpPass);

const transporter = hasCredentials
  ? nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass
      }
    })
  : null;

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<void> {
  if (transporter) {
    await transporter.sendMail({
      from: env.emailFrom,
      to: options.to,
      subject: options.subject,
      html: options.html
    });
  } else {
    logger.info("[Email placeholder]", { ...options, from: env.emailFrom });
  }
}
