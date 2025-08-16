import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Barberia API',
      version: '1.0.0',
      description: 'Documentación de la API para el sistema de gestión de Barbería.',
    },
    servers: [
      {
        url: 'http://localhost:3000/api', // Local development server
        description: 'Servidor de desarrollo local',
      },
      {
        url: 'https://barberia-project-backend.onrender.com/api', // Render deployment server
        description: 'Servidor de producción en Render',
      },
    ],
    components: {
      securitySchemes: {
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
  apis: [
    './src/routes/*.ts', // Path to the API routes
    './src/controllers/*.ts', // Path to the API controllers (for JSDoc comments)
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;