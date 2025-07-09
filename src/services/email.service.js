import nodemailer from "nodemailer";
import config from "../config/config.js";
import logger from "../config/appLogger.js";

class EmailService {
  constructor() {
    this.transporter = null;
    this.isMockMode = false;
    this.initialized = false;
    this.initPromise = this.initializeTransporter();
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initPromise;
      this.initialized = true;
    }
  }

  async initializeTransporter() {
    try {
      // Check if email configuration is provided
      if (
        !config.email?.smtp?.host ||
        !config.email?.smtp?.auth?.user ||
        !config.email?.smtp?.auth?.pass
      ) {
        logger.warn(
          "Email configuration not provided. Using Ethereal Email for development.",
        );
        await this.createEtherealTransporter();
        return;
      }

      // Create transporter with provided configuration
      this.transporter = nodemailer.createTransport({
        host: config.email.smtp.host,
        port: config.email.smtp.port,
        secure: config.email.smtp.port === 465,
        auth: {
          user: config.email.smtp.auth.user,
          pass: config.email.smtp.auth.pass,
        },
      });

      // Verify the transporter configuration
      await this.transporter.verify();
      logger.info("Email service initialized successfully");
    } catch (error) {
      logger.error(
        "Failed to initialize email service, falling back to Ethereal Email:",
        error,
      );
      await this.createEtherealTransporter();
    }
  }

  async createEtherealTransporter() {
    try {
      // Generate test SMTP service account from ethereal.email
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      this.isMockMode = true;
      logger.info("Ethereal Email transporter created successfully");
      logger.info(`Preview URL: https://ethereal.email/messages`);
    } catch (error) {
      logger.error("Failed to create Ethereal Email transporter:", error);
      // Fallback to JSON transport
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      this.isMockMode = true;
    }
  }

  async sendEmail(to, subject, text, html) {
    try {
      await this.ensureInitialized();

      const msg = {
        from: config.email?.from || "noreply@yourapp.com",
        to,
        subject,
        text,
        html,
      };

      const info = await this.transporter.sendMail(msg);

      if (this.isMockMode) {
        logger.info("Development email sent:", { to, subject });
        logger.info("Preview URL:", nodemailer.getTestMessageUrl(info));
        return {
          success: true,
          messageId: info.messageId,
          previewUrl: nodemailer.getTestMessageUrl(info),
          message: "Development email sent successfully",
        };
      }

      logger.info("Email sent successfully:", {
        to,
        subject,
        messageId: info.messageId,
      });
      return {
        success: true,
        messageId: info.messageId,
        message: "Email sent successfully",
      };
    } catch (error) {
      logger.error("Failed to send email:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendResetPasswordEmail(to, token) {
    const subject = "Reset Password";
    const resetPasswordUrl = `${config.clientUrl || "http://localhost:3000"}/reset-password?token=${token}`;
    const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request this, please ignore this email.`;
    const html = `<div style="margin:30px auto;width:300px;text-align:center;">
      <h2>Reset Password</h2>
      <p>To reset your password, click on this link:</p>
      <a href="${resetPasswordUrl}" style="background-color:#007bff;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    </div>`;
    return this.sendEmail(to, subject, text, html);
  }

  async sendVerificationEmail(to, token) {
    const subject = "Email Verification";
    const verifyEmailUrl = `${config.clientUrl || "http://localhost:3000"}/verify-email?token=${token}`;
    const text = `Dear user,
To verify your email, click on this link: ${verifyEmailUrl}
If you did not create an account, please ignore this email.`;
    const html = `<div style="margin:30px auto;width:300px;text-align:center;">
      <h2>Email Verification</h2>
      <p>To verify your email, click on this link:</p>
      <a href="${verifyEmailUrl}" style="background-color:#28a745;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Verify Email</a>
      <p>If you did not create an account, please ignore this email.</p>
    </div>`;
    return this.sendEmail(to, subject, text, html);
  }

  async sendWelcomeEmail(to, name) {
    const subject = "Welcome to Our Platform!";
    const text = `Dear ${name},
Welcome to our platform! We're excited to have you on board.`;
    const html = `<div style="margin:30px auto;width:300px;text-align:center;">
      <h2>Welcome to Our Platform!</h2>
      <p>Dear ${name},</p>
      <p>Welcome to our platform! We're excited to have you on board.</p>
    </div>`;
    return this.sendEmail(to, subject, text, html);
  }

  async sendOtpEmail(to, otp) {
    const subject = "Your OTP Code";
    const text = `Dear user,
Your OTP code is: ${otp}
This code will expire in 10 minutes.`;
    const html = `<div style="margin:30px auto;width:300px;text-align:center;">
      <h2>Your OTP Code</h2>
      <p>Your OTP code is:</p>
      <h3 style="background-color:#f8f9fa;padding:20px;border-radius:5px;font-family:monospace;">${otp}</h3>
      <p>This code will expire in 10 minutes.</p>
    </div>`;
    return this.sendEmail(to, subject, text, html);
  }
}

export const emailService = new EmailService();
export default emailService;
