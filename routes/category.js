var express = require('express');
var router = express.Router();
var category = require('../models/category');

/* Add new category
 * post params:
 *    name : name of new category - mandatory
 *    level : level of new category - mandatory
 *    parent : "id" of new category's parent category
 */
router.post('/', function(req, res) {
  console.log(req.body, ":::::req.body");
  console.log(req.params, ":::::req.params");

  category.addCategory(function(err, res_data) {
    if(err) {
      return res.status(err.responseHeaders.status).send(err.responseParams);
    }
    res.status(res_data.responseHeaders.status).send(res_data.responseParams);
  }, req.body);
});

module.exports = router;
