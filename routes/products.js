const express = require('express');
const router = express.Router();

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()


/* GET products listing. */
// write openapi docs

router.get('/', async function(req, res, next) {
  // get limit and offset from query string
  const { limit, skip } = req.query
  // limit and offset
  let products = await prisma.product.findMany(
    {
        take: parseInt(limit) || 10,
        skip: parseInt(skip) || 0
        }
  )

  let totalProducts = await prisma.product.count()

  products = {
    products,
    total: totalProducts,
    limit: parseInt(limit) || 10,
    skip: parseInt(skip) || 0
  }


  res.json(products)
});

/* GET single product. */
router.get('/:id', async function(req, res, next) {
  const { id } = req.params
  const product = await prisma.product.findUnique({
    where: {
      id: id
    }
  })
  res.json(product)
});

/* POST create product. */

router.post('/', async function(req, res, next) {
  const { title, description, price, discountPercentage, rating, stock, brand, category, thumbnail, images } = req.body
  const product = await prisma.product.create({
    data: {
      title,
      description,
      price: parseFloat(price),
      discountPercentage: parseFloat(discountPercentage),
      rating: parseFloat(rating),
      stock: parseInt(stock),
      brand,
      category,
      thumbnail,
      images
    }
  })
  res.json(product)
});




module.exports = router;