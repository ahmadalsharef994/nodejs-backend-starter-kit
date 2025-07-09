import Razorpay from 'razorpay';
import crypto from 'crypto';
import config from '../config/config.js';
import logger from '../config/appLogger.js';

class PaymentService {
  constructor() {
    this.razorpay = null;
    this.isMockMode = false;
    this.initializeService();
  }

  initializeService() {
    try {
      // Check if Razorpay configuration is provided
      if (!config.razorpay?.keyId || !config.razorpay?.keySecret) {
        logger.warn('Razorpay configuration not provided. Using mock payment service.');
        this.isMockMode = true;
        return;
      }

      this.razorpay = new Razorpay({
        key_id: config.razorpay.keyId,
        key_secret: config.razorpay.keySecret,
      });

      logger.info('Payment service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize payment service, falling back to mock mode:', error);
      this.isMockMode = true;
    }
  }

  async createOrder(orderData) {
    try {
      if (this.isMockMode) {
        const mockOrder = {
          id: 'order_mock_' + Date.now(),
          entity: 'order',
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          receipt: orderData.receipt,
          status: 'created',
          created_at: Math.floor(Date.now() / 1000),
        };
        logger.info('Mock order created:', mockOrder);
        return {
          success: true,
          order: mockOrder,
        };
      }

      const options = {
        amount: orderData.amount * 100, // amount in paise
        currency: orderData.currency || 'INR',
        receipt: orderData.receipt,
      };

      const order = await this.razorpay.orders.create(options);
      logger.info('Order created successfully:', { orderId: order.id, amount: order.amount });
      return {
        success: true,
        order,
      };
    } catch (error) {
      logger.error('Failed to create order:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async verifyPayment(paymentData) {
    try {
      if (this.isMockMode) {
        logger.info('Mock payment verification:', paymentData);
        return {
          success: true,
          verified: true,
          message: 'Mock payment verified successfully',
        };
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', config.razorpay.keySecret)
        .update(body.toString())
        .digest('hex');

      const isAuthentic = expectedSignature === razorpay_signature;

      if (isAuthentic) {
        logger.info('Payment verified successfully:', { orderId: razorpay_order_id, paymentId: razorpay_payment_id });
        return {
          success: true,
          verified: true,
          message: 'Payment verified successfully',
        };
      } else {
        logger.error('Payment verification failed:', { orderId: razorpay_order_id, paymentId: razorpay_payment_id });
        return {
          success: false,
          verified: false,
          message: 'Payment verification failed',
        };
      }
    } catch (error) {
      logger.error('Failed to verify payment:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async getOrder(orderId) {
    try {
      if (this.isMockMode) {
        const mockOrder = {
          id: orderId,
          entity: 'order',
          amount: 100000,
          currency: 'INR',
          receipt: 'mock_receipt',
          status: 'created',
          created_at: Math.floor(Date.now() / 1000),
        };
        logger.info('Mock order fetched:', mockOrder);
        return {
          success: true,
          order: mockOrder,
        };
      }

      const order = await this.razorpay.orders.fetch(orderId);
      logger.info('Order fetched successfully:', { orderId: order.id });
      return {
        success: true,
        order,
      };
    } catch (error) {
      logger.error('Failed to fetch order:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async createRefund(refundData) {
    try {
      if (this.isMockMode) {
        const mockRefund = {
          id: 'rfnd_mock_' + Date.now(),
          entity: 'refund',
          amount: refundData.amount,
          currency: 'INR',
          payment_id: refundData.paymentId,
          status: 'processed',
          created_at: Math.floor(Date.now() / 1000),
        };
        logger.info('Mock refund created:', mockRefund);
        return {
          success: true,
          refund: mockRefund,
        };
      }

      const options = {
        amount: refundData.amount * 100, // amount in paise
        speed: 'normal',
        notes: {
          reason: refundData.reason,
        },
      };

      const refund = await this.razorpay.payments.refund(refundData.paymentId, options);
      logger.info('Refund created successfully:', { refundId: refund.id, amount: refund.amount });
      return {
        success: true,
        refund,
      };
    } catch (error) {
      logger.error('Failed to create refund:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async handleWebhook(payload, signature) {
    try {
      if (this.isMockMode) {
        logger.info('Mock webhook handled:', { payload, signature });
        return {
          success: true,
          message: 'Mock webhook handled successfully',
        };
      }

      const expectedSignature = crypto
        .createHmac('sha256', config.razorpay.webhookSecret || config.razorpay.keySecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (expectedSignature === signature) {
        logger.info('Webhook verified successfully:', { event: payload.event });
        // Handle different webhook events here
        return {
          success: true,
          message: 'Webhook handled successfully',
        };
      } else {
        logger.error('Webhook verification failed');
        return {
          success: false,
          message: 'Webhook verification failed',
        };
      }
    } catch (error) {
      logger.error('Failed to handle webhook:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async queryOrders(filter, options) {
    try {
      if (this.isMockMode) {
        logger.info('Mock query orders:', { filter, options });
        return {
          results: [],
          page: options.page || 1,
          limit: options.limit || 10,
          totalPages: 0,
          totalResults: 0,
        };
      }

      // Implement actual order querying logic
      return {
        results: [],
        page: options.page || 1,
        limit: options.limit || 10,
        totalPages: 0,
        totalResults: 0,
      };
    } catch (error) {
      logger.error('Failed to query orders:', error);
      return {
        results: [],
        page: options.page || 1,
        limit: options.limit || 10,
        totalPages: 0,
        totalResults: 0,
      };
    }
  }
}

export const paymentService = new PaymentService();
export default paymentService;
