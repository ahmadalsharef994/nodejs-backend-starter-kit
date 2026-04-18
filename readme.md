# Node.js Backend Starter Kit

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen?logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/express-5.x-blue?logo=express" alt="Express">
  <img src="https://img.shields.io/badge/mongodb-mongoose%209-green?logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/ESM-native-yellow" alt="ESM">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
  <img src="https://img.shields.io/badge/docker-ready-blue?logo=docker" alt="Docker">
  <img src="https://img.shields.io/badge/kubernetes-ready-326CE5?logo=kubernetes" alt="Kubernetes">
</p>

A production-ready **Node.js REST API boilerplate** built with **Express 5**, **MongoDB**, **JWT authentication**, **Socket.IO**, and essential service integrations. Clone it, configure your `.env`, and ship.

---

## ✨ Features

### Core
- **Express 5** — latest stable with improved async error handling
- **MongoDB + Mongoose 9** — ODM with `toJSON` and `paginate` plugins
- **ES Modules** — native `import`/`export`, no transpile step
- **Node.js 20+** — uses built-in `crypto`, no extra date libraries

### Authentication & Security
- **JWT** — access + refresh token pattern with blacklisting
- **Role-based access control** — `user`, `admin` roles via Passport.js
- **OTP verification** — email and phone OTP with `crypto.randomInt()` (cryptographically secure)
- **Bcrypt** — password hashing at cost factor 12
- **Helmet** — HTTP security headers
- **Rate limiting** — `express-rate-limit` v8 on auth routes
- **MongoDB sanitization** — `express-mongo-sanitize`
- **CORS** — configurable per environment

### Real-time
- **Socket.IO 4** — WebSocket support for chat and live notifications

### Services (plug-and-play, mock mode when unconfigured)
- **Email** — Nodemailer with SMTP; auto-falls back to Ethereal Email in dev
- **SMS** — pluggable SMS service (mock by default)
- **File storage** — Cloudinary integration
- **Payments** — Razorpay integration
- **Search** — Elasticsearch 9 integration

### Developer Experience
- **ESLint 9 + Prettier** — enforced code style
- **Husky** — pre-commit linting via git hooks
- **Jest 29** — unit and integration tests with MongoDB Memory Server
- **Nodemon** — dev auto-restart
- **Swagger UI** — auto-generated API docs at `/v1/docs` (dev only)
- **Prometheus metrics** — `/api-metrics` endpoint (secret-protected in production)
- **Docker + Docker Compose** — dev and prod environments
- **Kubernetes** — full manifests with HPA, ingress, RBAC, network policies

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Authentication Flow](#-authentication-flow)
- [Service Integrations](#-service-integrations)
- [Socket.IO](#-socketio)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🏃 Quick Start

**Prerequisites:** Node.js 20+, MongoDB, Git

```bash
git clone https://github.com/ahmadalsharef994/nodejs-backend-starter-kit.git
cd nodejs-backend-starter-kit

npm install

cp .env.example .env
# Edit .env — only MONGODB_URL and JWT_SECRET are required to start

npm run dev
```

Server starts at `http://localhost:3000`.
- Health check: `GET /health`
- API docs: `GET /v1/docs` (development only)
- Metrics: `GET /api-metrics` (requires `x-metrics-secret` header in production)

### Scripts

```bash
npm run dev             # Development server with nodemon
npm start               # Production server
npm test                # Run Jest tests
npm run test:coverage   # Tests with coverage report
npm run lint            # ESLint
npm run lint:fix        # ESLint auto-fix
npm run format          # Prettier
npm run docker:dev      # Docker dev environment
npm run docker:prod     # Docker prod environment
```

---

## 📁 Project Structure

```
src/
├── config/
│   ├── config.js          # Joi-validated env config
│   ├── appLogger.js       # Winston logger
│   ├── httpLogger.js      # Morgan HTTP logger
│   ├── jwtStrategy.js     # Passport JWT strategy
│   └── roles.js           # Role definitions
├── controllers/           # Route handlers (thin layer)
├── middlewares/
│   ├── auth.js            # JWT auth middleware (Passport)
│   ├── validate.js        # Joi request validation
│   ├── error.js           # Centralised error handling
│   └── rateLimiter.js     # Auth + OTP rate limiters
├── models/
│   ├── user.model.js
│   ├── token.model.js
│   ├── otp.model.js
│   ├── notification.model.js
│   └── plugins/           # toJSON, paginate plugins
├── routes/v1/             # Versioned API routes
├── services/              # All business logic lives here
│   ├── auth.service.js
│   ├── token.service.js
│   ├── otp.service.js
│   ├── email.service.js
│   ├── sms.service.js
│   ├── storage.service.js
│   ├── payment.service.js
│   └── search.service.js
├── utils/
│   ├── ApiError.js        # Custom error class
│   ├── catchAsync.js      # Async error wrapper
│   └── pick.js            # Object key picker
├── validations/           # Joi schemas
├── app.js                 # Express app setup
└── index.js               # Entry point + Socket.IO
```

---

## 🔧 Environment Variables

Copy `.env.example` to `.env`. Only the starred variables are required to boot:

```env
# Server
NODE_ENV=development
PORT=3000

# Database ★
MONGODB_URL=mongodb://localhost:27017/starter-kit

# JWT ★
JWT_SECRET=your-secret-key-change-this
JWT_ACCESS_EXPIRATION_MINUTES=30
JWT_REFRESH_EXPIRATION_DAYS=30
JWT_RESET_PASSWORD_EXPIRATION_MINUTES=10
JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=10

# Email (optional — falls back to Ethereal Email in dev)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Razorpay (optional)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Elasticsearch (optional)
ELASTIC_URL=http://localhost:9200
ELASTIC_USERNAME=elastic
ELASTIC_PASSWORD=

# Metrics endpoint protection (production)
METRICS_SECRET=your-metrics-secret

# Client URL (for email links)
CLIENTURL=http://localhost:3001
```

---

## 🌐 API Endpoints

### Auth (`/v1/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | ❌ | Register a new user |
| `POST` | `/login` | ❌ | Login with email + password |
| `GET` | `/profile` | ✅ | Get current user profile |
| `POST` | `/logout` | ✅ | Logout (invalidates token) |
| `POST` | `/forgot-password` | ❌ | Send password reset OTP |
| `POST` | `/reset-password` | ❌ | Reset password with OTP |
| `POST` | `/change-password` | ✅ | Change password |

### Users (`/v1/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/` | ✅ Admin | List all users |
| `GET` | `/:userId` | ✅ | Get user by ID |
| `PATCH` | `/:userId` | ✅ | Update user |
| `DELETE` | `/:userId` | ✅ Admin | Delete user |

### System

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | ❌ | Health check |
| `GET` | `/api-metrics` | Header | Prometheus metrics |
| `GET` | `/v1/docs` | ❌ (dev) | Swagger UI |

---

## 🔐 Authentication Flow

```bash
# 1. Register
POST /v1/auth/register
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "1234567890",
  "password": "Secure123",
  "role": "user"
}

# 2. Login → get access token
POST /v1/auth/login
{
  "email": "jane@example.com",
  "password": "Secure123"
}
# Response: { user: {...}, token: { access: { token, expires }, refresh: { token, expires } } }

# 3. Use token in subsequent requests
GET /v1/auth/profile
Authorization: Bearer <access_token>

# 4. Forgot password
POST /v1/auth/forgot-password   { "email": "jane@example.com" }
POST /v1/auth/reset-password    { "email": "...", "otp": "123456", "newPassword": "..." }
```

Tokens are JWTs signed with `JWT_SECRET`. Refresh tokens are stored in MongoDB and can be revoked. OTPs are generated with `crypto.randomInt()` and expire in 10 minutes.

---

## 🔌 Service Integrations

All services run in **mock mode** when credentials are not set — the app boots without any external dependencies.

### Email
```javascript
import emailService from './services/email.service.js';

await emailService.sendOtpEmail('user@example.com', '123456');
await emailService.sendVerificationEmail('user@example.com', token);
await emailService.sendWelcomeEmail('user@example.com', 'Jane');
await emailService.sendResetPasswordEmail('user@example.com', token);
```

### File Storage (Cloudinary)
```javascript
import storageService from './services/storage.service.js';

const result = await storageService.uploadImage('./avatar.jpg');
```

### Payments (Razorpay)
```javascript
import paymentService from './services/payment.service.js';

const order = await paymentService.createOrder(1000, 'INR');
const isValid = paymentService.verifyPaymentSignature(orderId, paymentId, signature);
```

### Search (Elasticsearch)
```javascript
import searchService from './services/search.service.js';

await searchService.indexDocument('users', userData, userId);
const results = await searchService.fullTextSearch('users', 'jane doe', ['fullName', 'email']);
```

---

## 🔌 Socket.IO

Real-time events are configured in `src/index.js`.

| Event (client → server) | Description |
|---|---|
| `join_appointment` | Join a room by appointment ID |
| `send_message` | Send a chat message with optional attachments |

| Event (server → client) | Description |
|---|---|
| `receive_message` | Delivers a message to the recipient room |

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.emit('join_appointment', appointmentId);
socket.emit('send_message', { appointmentId, body: 'Hello!', senderId: userId });
socket.on('receive_message', (msg) => console.log(msg.body));
```

---

## 🧪 Testing

```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
npm test -- auth.test.js   # Run a specific file
```

Tests use **MongoDB Memory Server** — no real database needed.

```javascript
import request from 'supertest';
import app from '../../src/app.js';
import setupTestDB from '../utils/setupTestDB.js';

setupTestDB();

describe('POST /v1/auth/register', () => {
  test('registers a new user', async () => {
    const res = await request(app)
      .post('/v1/auth/register')
      .send({
        fullName: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'Password123',
        role: 'user',
      })
      .expect(201);

    expect(res.body.user.email).toBe('test@example.com');
  });
});
```

---

## 🚀 Deployment

### Docker

```bash
npm run docker:dev   # Dev with MongoDB included
npm run docker:prod  # Production
```

Production image uses `node:24-alpine` with PM2 process manager.

### Kubernetes

Full manifests are in `/k8s/` including HPA, ingress, RBAC, and network policies.

```bash
cd k8s && ./deploy.sh

kubectl get deployments,pods,services,hpa -l app=nodejs-backend
kubectl logs -l app=nodejs-backend -f
kubectl scale deployment nodejs-backend-deployment --replicas=3

./cleanup.sh
```

**Included manifests:** `deployment.yaml`, `hpa.yaml` (2–10 pods, CPU ≥ 70%), `service.yaml`, `ingress.yaml` (SSL via cert-manager), `network-policy.yaml`, `rbac.yaml`, `monitoring.yaml` (Prometheus `ServiceMonitor`).

See [`k8s/README.md`](k8s/README.md) for full instructions.

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit: `git commit -m 'feat: add my feature'`
4. Push and open a Pull Request

Run `npm run lint` and `npm test` before submitting.

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.

---

Built with ❤️ for the developer community.
