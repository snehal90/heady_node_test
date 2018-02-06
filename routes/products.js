var express = require('express');
var router = express.Router();
var product = require('../models/product');

/* Add new product
 * post params:
 *    name : name of new product - mandatory
 *    price : price of new product - mandatory
 *    sku : sku of new product - mandatory
 *    categories : "ids" of the categories that one wants to map to product - mandatory
 */
router.post('/', function(req, res) {
  product.addProduct(function(err, res_data) {
    if(err) {
      return res.status(err.responseHeaders.status).send(err.responseParams);
    }
    res.status(res_data.responseHeaders.status).send(res_data.responseParams);
  }, req.body);
});

/* Get all products by category
 * query params:
 *    category : category id - mandatory
 */
router.get('/', function(req, res) {
  product.getProductsByCategory(function(err, res_data) {
    if(err) {
      return res.status(err.responseHeaders.status).send(err.responseParams);
    }
    res.status(res_data.responseHeaders.status).send(res_data.responseParams);
  }, req.query);
});

/* update product by id
 * params:
 *    product_id : product id - mandatory
 */
router.put('/:product_id', function(req, res) {
  var product_id = req.params.product_id;
  product.updateProductById(function(err, res_data) {
    if(err) {
      return res.status(err.responseHeaders.status).send(err.responseParams);
    }
    res.status(res_data.responseHeaders.status).send(res_data.responseParams);
  }, product_id, req.body);
});

module.exports = router;