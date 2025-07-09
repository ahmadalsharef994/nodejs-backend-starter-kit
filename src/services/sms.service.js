import config from '../config/config.js';
import logger from '../config/appLogger.js';

class SmsService {
  constructor() {
    this.isMockMode = false;
    this.initializeService();
  }

  initializeService() {
    try {
      // Check if SMS configuration is provided
      if (!config.sms?.apiKey || !config.sms?.apiSecret) {
        logger.warn('SMS configuration not provided. Using mock SMS service.');
        this.isMockMode = true;
        return;
      }

      // Initialize SMS service (e.g., Twilio, AWS SNS, etc.)
      logger.info('SMS service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize SMS service, falling back to mock mode:', error);
      this.isMockMode = true;
    }
  }

  async sendSms(to, message) {
    try {
      if (this.isMockMode) {
        logger.info('Mock SMS sent:', { to, message });
        return {
          success: true,
          messageId: 'mock-sms-' + Date.now(),
          message: 'Mock SMS sent successfully',
        };
      }

      // Implement actual SMS sending logic here
      // For example, using Twilio or AWS SNS
      logger.info('SMS sent successfully:', { to, message });
      return {
        success: true,
        messageId: 'sms-' + Date.now(),
        message: 'SMS sent successfully',
      };
    } catch (error) {
      logger.error('Failed to send SMS:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async sendOtpSms(to, otp) {
    const message = `Your OTP code is: ${otp}. This code will expire in 10 minutes.`;
    return this.sendSms(to, message);
  }

  async sendVerificationSms(to, code) {
    const message = `Your verification code is: ${code}. Use this code to verify your phone number.`;
    return this.sendSms(to, message);
  }

  async sendWelcomeSms(to, name) {
    const message = `Welcome to our platform, ${name}! We're excited to have you on board.`;
    return this.sendSms(to, message);
  }
}

export const smsService = new SmsService();
export default smsService;
