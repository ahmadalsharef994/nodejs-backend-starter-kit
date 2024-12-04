# Reusable Node.js Backend StarterKit

This project is a reusable StarterKit code for backend development, built as a **Proof of Concept (POC)** for creating scalable and modular backend systems. The POC uses **Express.js** as the API framework and **MongoDB** as the database. It integrates additional features like **socket.io**, validation, sanitization, folder structure, dockerization, ESLint, Prettier, logging, authentication, authorization, JWT, device-based authentication, and more.

The StarterKit also supports **file uploads**, **Email and SMS OTPs**, **real-time chat with WebSocket**, and **payment integration using RazorPay**. It enforces **linting pre-commit checks** using Husky.

This project is designed to ensure **minimal third-party library integration**, **reusability**, **modularity**, **clean code**, and **portability**.

---

## Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Dockerization](#dockerization)
- [Logging](#logging)
- [Linting](#linting)
- [Environment Setup](#environment-setup)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Core Backend Framework**: Node.js with Express.js
- **Database**: MongoDB
- **Authentication & Authorization**: Passport.js with JWT (including JWT strategy)
- **Validation & Sanitization**: Data validation using Joi and sanitization for security
- **Real-Time Communication**: WebSocket live chat using Socket.IO
- **Notifications**: Email and SMS OTP capabilities
- **File Uploads**: Supports file handling
- **Payment Integration**: RazorPay for seamless payment processing
- **Logging**: Application logging with Winston and HTTP logging with Morgan
- **Environment Management**: `.env` for configuration
- **Containerization**: Dockerized setup for development and production
- **Pre-commit Checks**: Husky for linting enforcement
- **Code Quality**: ESLint and Prettier integration

---

## Quick Start

To run the project locally, follow these steps:

```bash
# Install Yarn (if not installed)
npm install -g yarn

# Install dependencies
yarn install

# Start the development server
yarn run dev
