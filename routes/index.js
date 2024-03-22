const express = require('express');
const router = express.Router();

const ProductsRouter = require('./products')

const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'A simple Express API',
    },
  },
  apis: ['./routes/*.js'], // path to the API docs
};

const specs = swaggerJsdoc(options);

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(specs));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({ message: 'Welcome to the API' });
});

router.use('/products', ProductsRouter)



module.exports = router;
