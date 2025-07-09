# Modern Node.js Backend Starter Kit

A streamlined, modern Node.js backend starter kit designed for rapid development of scalable APIs. Built with **ES Modules**, **authentication**, **real-time features**, and **service integrations**.

## 🚀 Features

### Core Backend
- **Modern JavaScript**: ES Modules (ESM) syntax
- **Express.js**: Fast, unopinionated web framework
- **MongoDB**: NoSQL database with Mongoose ODM
- **Node.js 18+**: Latest LTS support

### Authentication & Authorization
- **JWT Authentication**: Access and refresh tokens
- **Role-based Access Control**: User and Admin roles
- **Multi-factor Authentication**: Email and SMS OTP verification
- **Password Security**: Bcrypt hashing with strength validation

### Real-time Features
- **Socket.IO**: WebSocket support for chat and notifications
- **Live Notifications**: In-app notification system
- **Real-time Chat**: Instant messaging capabilities

### Service Integrations
- **Email Service**: Nodemailer with SMTP support (free tier compatible)
- **SMS Service**: Twilio integration (free tier)
- **File Storage**: Cloudinary integration (free tier)
- **Payment Processing**: Razorpay integration (free testing)
- **Search Engine**: Elasticsearch integration (free tier)

### Development Experience
- **ES Modules**: Modern import/export syntax
- **ESLint**: Code linting with modern rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit linting
- **Jest**: Testing framework with MongoDB memory server
- **Docker**: Containerization support
- **Kubernetes**: Production deployment configurations

### Security & Monitoring
- **Input Validation**: Joi schema validation
- **Security Headers**: Helmet.js integration
- **Rate Limiting**: Express rate limiter
- **CORS**: Cross-origin resource sharing
- **XSS Protection**: XSS filtering
- **MongoDB Injection**: Sanitization middleware
- **Request Logging**: Morgan HTTP logger
- **Application Logging**: Winston logger

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Authentication System](#-authentication-system)
- [API Endpoints](#-api-endpoints)
- [Service Integrations](#-service-integrations)
- [Socket.IO Implementation](#-socketio-implementation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)

---

## 🏃 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/nodejs-backend-starter-kit.git
cd nodejs-backend-starter-kit

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure your environment variables
# Edit .env file with your database and service credentials

# Start development server
npm run dev
```

### Scripts

```bash
# Development
npm run dev          # Start with nodemon
npm run start        # Start production server

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check formatting

# Docker
npm run docker:dev   # Start development environment
npm run docker:prod  # Start production environment
```

---

## 📁 Project Structure

```
src/
├── config/           # Configuration files
│   ├── config.js     # Environment configuration
│   ├── logger.js     # Winston logger setup
│   ├── httpLogger.js # Morgan HTTP logger
│   ├── jwtStrategy.js # Passport JWT strategy
│   └── roles.js      # User roles and permissions
├── controllers/      # Route controllers
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── event.controller.js
│   └── notification.controller.js
├── middlewares/      # Custom middlewares
│   ├── auth.js       # Authentication middleware
│   ├── validate.js   # Request validation
│   ├── error.js      # Error handling
│   └── rateLimiter.js # Rate limiting
├── models/           # Database models
│   ├── user.model.js
│   ├── token.model.js
│   ├── event.model.js
│   ├── notification.model.js
│   ├── otp.model.js
│   └── plugins/      # Mongoose plugins
├── routes/           # API routes
│   └── v1/
│       ├── index.js
│       ├── auth.route.js
│       ├── user.route.js
│       └── event.route.js
├── services/         # Business logic
│   ├── auth.service.js
│   ├── token.service.js
│   ├── email.service.js
│   ├── sms.service.js
│   ├── otp.service.js
│   ├── storage.service.js
│   ├── payment.service.js
│   └── search.service.js
├── utils/            # Utility functions
│   ├── ApiError.js
│   ├── catchAsync.js
│   └── pick.js
├── validations/      # Request validation schemas
│   ├── auth.validation.js
│   ├── user.validation.js
│   └── custom.validation.js
├── socket.js         # Socket.IO setup
├── app.js           # Express application
└── index.js         # Application entry point
```

---

## 🔐 Authentication System

### User Registration
```javascript
POST /v1/auth/register
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "StrongPass123",
  "role": "user"
}
```

### User Login
```javascript
POST /v1/auth/login
{
  "email": "john@example.com",
  "password": "StrongPass123"
}

// Response
{
  "user": { ... },
  "tokens": {
    "access": { "token": "...", "expires": "..." },
    "refresh": { "token": "...", "expires": "..." }
  }
}
```

### OTP Verification
```javascript
POST /v1/auth/send-otp
{
  "type": "email", // or "phone"
  "recipient": "john@example.com"
}

POST /v1/auth/verify-otp
{
  "otp": "123456",
  "type": "email"
}
```

---

## 🌐 Service Integrations

### Email Service (Nodemailer)
```javascript
import { emailService } from '../services/index.js';

// Send OTP email
await emailService.sendOTPEmail('user@example.com', '123456');

// Send welcome email
await emailService.sendVerificationEmail('user@example.com', 'token');
```

### SMS Service (Twilio)
```javascript
import { smsService } from '../services/index.js';

// Send OTP SMS
await smsService.sendOTPSMS('+1234567890', '123456');

// Send custom SMS
await smsService.sendSMS('+1234567890', 'Welcome to our platform!');
```

### File Storage (Cloudinary)
```javascript
import { storageService } from '../services/index.js';

// Upload image
const result = await storageService.uploadImage('./path/to/image.jpg');

// Upload avatar
const avatar = await storageService.uploadAvatar('./avatar.jpg', userId);
```

### Payment Processing (Razorpay)
```javascript
import { paymentService } from '../services/index.js';

// Create order
const order = await paymentService.createOrder(1000, 'INR');

// Verify payment
const isValid = paymentService.verifyPaymentSignature(
  orderId, paymentId, signature
);
```

### Search (Elasticsearch)
```javascript
import { searchService } from '../services/index.js';

// Full-text search
const results = await searchService.fullTextSearch(
  'users', 'john doe', ['fullName', 'email']
);

// Index document
await searchService.indexDocument('users', userData, userId);
```

---

## 🔌 Socket.IO Implementation

### Server Setup
```javascript
// src/socket.js
import { Server } from 'socket.io';
import { verifyToken } from './services/token.service.js';

export default function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = await verifyToken(token);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    // Join user-specific room
    socket.join(`user_${socket.user.id}`);
    
    // Handle chat messages
    socket.on('send_message', (data) => {
      socket.to(data.recipientId).emit('receive_message', {
        senderId: socket.user.id,
        message: data.message,
        timestamp: Date.now()
      });
    });
    
    // Handle notifications
    socket.on('mark_notification_read', async (notificationId) => {
      // Mark notification as read in database
      // Emit updated notification count
    });
  });

  return io;
}
```

### Client Usage
```javascript
// Frontend integration
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-token' }
});

// Listen for messages
socket.on('receive_message', (data) => {
  console.log('New message:', data);
});

// Send message
socket.emit('send_message', {
  recipientId: 'user123',
  message: 'Hello!'
});
```

---

## 🧪 Testing

### Test Structure
```
tests/
├── integration/
│   ├── auth.test.js
│   ├── user.test.js
│   └── event.test.js
├── unit/
│   ├── services/
│   └── utils/
└── utils/
    └── setupTestDB.js
```

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.js

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Example Test
```javascript
import request from 'supertest';
import app from '../src/app.js';
import setupTestDB from './utils/setupTestDB.js';

setupTestDB();

describe('Auth routes', () => {
  test('Should register a new user', async () => {
    const userData = {
      fullName: 'Test User',
      email: 'test@example.com',
      phone: '+1234567890',
      password: 'Password123',
      role: 'user'
    };

    const res = await request(app)
      .post('/v1/auth/register')
      .send(userData)
      .expect(201);

    expect(res.body.user).toMatchObject({
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role
    });
  });
});
```

---

## 🚀 Deployment

### Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"]
```

### Kubernetes Configuration

The project includes comprehensive Kubernetes manifests for production deployment with:

- **2 Node.js API instances** (with horizontal pod autoscaling)
- **Load balancer** for external access
- **MongoDB** for development/testing
- **Ingress controller** support with SSL
- **Resource limits** and health checks
- **Security policies** and RBAC

```yaml
# k8s/deployment.yaml - Main application deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodejs-backend-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nodejs-backend
  template:
    spec:
      containers:
      - name: nodejs-backend
        image: nodejs-backend:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
```

### Horizontal Pod Autoscaler
```yaml
# k8s/hpa.yaml - Auto-scaling configuration
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: nodejs-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nodejs-backend-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### Load Balancer Service
```yaml
# k8s/service.yaml - Load balancer configuration
apiVersion: v1
kind: Service
metadata:
  name: nodejs-backend-lb
spec:
  selector:
    app: nodejs-backend
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

### Deploy to Kubernetes
```bash
# Quick deployment using script
cd k8s
./deploy.sh

# Or manual deployment
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/rbac.yaml
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/ingress.yaml

# Check deployment status
kubectl get deployments,pods,services,hpa -l app=nodejs-backend

# View logs
kubectl logs -l app=nodejs-backend -f

# Scale manually
kubectl scale deployment nodejs-backend-deployment --replicas=3

# Clean up
./cleanup.sh
```

### Kubernetes Features

- **Auto-scaling**: HPA scales pods based on CPU/memory usage
- **Health checks**: Liveness and readiness probes
- **Resource limits**: CPU and memory constraints
- **Security**: RBAC, Network policies, Pod disruption budgets
- **Monitoring**: Prometheus metrics support
- **SSL termination**: Ingress with cert-manager support

See the complete Kubernetes documentation in `/k8s/README.md`.

---

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
MONGODB_URL=mongodb://localhost:27017/starter-kit

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=30
JWT_RESET_PASSWORD_EXPIRATION_MINUTES=10
JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=10

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Payment (Razorpay)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Search (Elasticsearch)
ELASTICSEARCH_URL=http://localhost:9200
ELASTICSEARCH_USERNAME=elastic
ELASTICSEARCH_PASSWORD=your-password

# Client URL (for email links)
CLIENT_URL=http://localhost:3001
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Follow ESLint configuration
- Use Prettier for formatting
- Write tests for new features
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support

- Create an [Issue](https://github.com/your-username/nodejs-backend-starter-kit/issues) for bug reports
- Start a [Discussion](https://github.com/your-username/nodejs-backend-starter-kit/discussions) for questions
- Check [Documentation](https://your-docs-site.com) for detailed guides

---

## 🙏 Acknowledgments

- Express.js team for the amazing framework
- MongoDB team for the database
- Socket.IO team for real-time capabilities
- All open-source contributors who make this possible

Built with ❤️ for the developer community
