// import { Express, Request, Response } from 'express';
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { version } = require('../../package.json');
// import log from './logger';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'REST API Docs',
      version,
    },
    components: {
      securitySchemas: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/v1/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app, port) {
  // Swagger page
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  // eslint-disable-next-line no-console
  console.log(`Docs available at http://localhost:${port}/docs`);
}

module.exports = { swaggerDocs };
