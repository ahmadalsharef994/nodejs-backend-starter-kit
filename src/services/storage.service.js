import { v2 as cloudinary } from 'cloudinary';
import config from '../config/config.js';
import logger from '../config/appLogger.js';

class StorageService {
  constructor() {
    this.isMockMode = false;
    this.initializeService();
  }

  initializeService() {
    try {
      // Check if Cloudinary configuration is provided
      if (!config.cloudinary?.cloudName || !config.cloudinary?.apiKey || !config.cloudinary?.apiSecret) {
        logger.warn('Cloudinary configuration not provided. Using mock storage service.');
        this.isMockMode = true;
        return;
      }

      cloudinary.config({
        cloud_name: config.cloudinary.cloudName,
        api_key: config.cloudinary.apiKey,
        api_secret: config.cloudinary.apiSecret,
      });

      logger.info('Storage service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize storage service, falling back to mock mode:', error);
      this.isMockMode = true;
    }
  }

  async uploadFile(file, folder = 'uploads') {
    try {
      if (this.isMockMode) {
        const mockUrl = `https://via.placeholder.com/300x300.png?text=Mock+Image`;
        logger.info('Mock file uploaded:', { folder, mockUrl });
        return {
          success: true,
          url: mockUrl,
          publicId: 'mock-' + Date.now(),
          message: 'Mock file uploaded successfully',
        };
      }

      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: 'auto',
      });

      logger.info('File uploaded successfully:', { publicId: result.public_id, url: result.secure_url });
      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        message: 'File uploaded successfully',
      };
    } catch (error) {
      logger.error('Failed to upload file:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async uploadBuffer(buffer, folder = 'uploads', filename) {
    try {
      if (this.isMockMode) {
        const mockUrl = `https://via.placeholder.com/300x300.png?text=Mock+Image`;
        logger.info('Mock buffer uploaded:', { folder, filename, mockUrl });
        return {
          success: true,
          url: mockUrl,
          publicId: 'mock-' + Date.now(),
          message: 'Mock buffer uploaded successfully',
        };
      }

      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'auto',
            public_id: filename,
          },
          (error, result) => {
            if (error) {
              logger.error('Failed to upload buffer:', error);
              reject(error);
            } else {
              logger.info('Buffer uploaded successfully:', { publicId: result.public_id, url: result.secure_url });
              resolve({
                success: true,
                url: result.secure_url,
                publicId: result.public_id,
                message: 'Buffer uploaded successfully',
              });
            }
          }
        );
        stream.end(buffer);
      });
    } catch (error) {
      logger.error('Failed to upload buffer:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async deleteFile(publicId) {
    try {
      if (this.isMockMode) {
        logger.info('Mock file deleted:', { publicId });
        return {
          success: true,
          message: 'Mock file deleted successfully',
        };
      }

      const result = await cloudinary.uploader.destroy(publicId);
      logger.info('File deleted successfully:', { publicId, result });
      return {
        success: true,
        result,
        message: 'File deleted successfully',
      };
    } catch (error) {
      logger.error('Failed to delete file:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async generateSignedUrl(publicId, options = {}) {
    try {
      if (this.isMockMode) {
        const mockUrl = `https://via.placeholder.com/300x300.png?text=Mock+Signed+URL`;
        logger.info('Mock signed URL generated:', { publicId, mockUrl });
        return {
          success: true,
          url: mockUrl,
          message: 'Mock signed URL generated successfully',
        };
      }

      const url = cloudinary.utils.private_download_url(publicId, 'image', options);
      logger.info('Signed URL generated successfully:', { publicId, url });
      return {
        success: true,
        url,
        message: 'Signed URL generated successfully',
      };
    } catch (error) {
      logger.error('Failed to generate signed URL:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export const storageService = new StorageService();
export default storageService;
