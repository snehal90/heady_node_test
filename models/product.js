var checkit = require('checkit');
var errorCodes = require('../config/error.json');
var products = db.collection('products');

//add new product
exports.addProduct = function(callback, data) {
  var rules = {
    name : {
      rule : 'required',
      message : 'Please provide product name'
    },
    price : {
      rule : 'required',
      message : 'Please provide product price'
    },
    sku : {
      rule : 'required',
      message : 'Please provide product sku'
    },
    categories : {
      rule : 'required',
      message : 'Please provide product category ids'
    }
  };

  var checkit_rule = new checkit(rules);
  //validation check
  checkit_rule.run(data).then(function() {
    data.id = new Date().getTime();
    var product_data = {'insert_data' : data};

    //insert new product
    saveProduct(function(err, product_res) {
      if(err) {
        callback(err);
      }
      callback(null, product_res);
    }, product_data);
    
  }).catch(checkit.Error, function(err) {
    var error = errorCodes.error_400.invalid_params;
    error.responseParams.message = err.toJSON();
    callback(error);
  })
}

//add or update product
function saveProduct(callback, data, is_update) {
  if(is_update == 1) {
    products.update(data['cond'], data['update_cond'], function(err, update_data) {
      if(err) {
        var error = errorCodes.error_403.server_error;
        callback(error);
      }
      var update_response = errorCodes.error_200.success;
      callback(null, update_response);
    });
  } else {
    products.save(data['insert_data'], function(err, insert_ret_data) {
      if(err) {
        var error = errorCodes.error_403.server_error;
        callback(error);
      }
      var add_response = errorCodes.error_200.success;
      callback(null, add_response);
    });
  }
}

//get products by passing condition
function getProductsByCondition(callback, cond, limit, offset) {
  limit = limit == undefined || isNaN(limit) || limit <= 0 ? 20 : parseInt(limit, 10);
  offset = offset == undefined || isNaN(offset) || offset <= 0 ? 0 : (parseInt(offset, 10) * limit);
  products.find(cond, {}).limit(limit).skip(offset).toArray(function(err, cat_data) {
    if(err) {
      var error = errorCodes.error_403.server_error;
      callback(error);
    }
    callback(null, cat_data);
  });
}

//get products by category
exports.getProductsByCategory = function(callback, data) {
  var rules = {
    category : {
      rule : 'required',
      message : 'Please provide category id'
    }
  };

  var checkit_rule = new checkit(rules);
  //validation check
  checkit_rule.run(data).then(function() {
    var cond = {};
    var limit = data['limit'] != undefined ? data['limit'] : 20;
    var offset = data['offset'] != undefined ? data['offset'] : 0;
    cond['categories'] = parseInt(data['category']);
    getProductsByCondition(function(err, ret_data) {
      if(err) {
        callback(err);
      }

      var get_response = {};
      if(ret_data.length == 0) {
        get_response = errorCodes.error_200.no_result;
      } else {
        get_response = errorCodes.error_200.success;
        delete get_response.responseParams.message;
      }
      delete get_response.responseParams.error_code;
      get_response.responseParams.data = ret_data;
      callback(null, get_response);
    }, cond, limit, offset);
  }).catch(checkit.Error, function(err) {
    var error = errorCodes.error_400.invalid_params;
    error.responseParams.message = err.toJSON();
    callback(error);
  })
}

//update product by id
exports.updateProductById = function(callback, product_id, data) {
  var rules = {
    product_id : {
      rule : 'required',
      message : 'Please provide product id'
    }
  };

  var checkit_rule = new checkit(rules);
  //validation check
  checkit_rule.run({'product_id' : product_id}).then(function() {
    var cond = {'id' : parseInt(product_id)};
    //check whether product exists or no
    getProductsByCondition(function(err, prod_data) {
      if(err) {
        callback(err);
      }

      if(prod_data.length == 0) {
        var prod_response = errorCodes.error_200.no_result;
        delete prod_response.responseParams.error_code;
        prod_response.responseParams.status = 'error';
        prod_response.responseParams.message = 'Product not found';
        callback(null, prod_response);
      }

      if(data['sku'] !== undefined) {
        delete data['sku'];
      }
      if(data['id'] !== undefined) {
        delete data['id'];
      }
      var update_data = data;
      var product_update = {};
      product_update['cond'] = cond;
      product_update['update_cond'] = {'$set' : update_data};

      saveProduct(function(err, res_dt) {
        if(err) {
          callback(err);
        }
        callback(null, res_dt);
      }, product_update, 1);

    }, cond);
  }).catch(checkit.Error, function(err) {
    var error = errorCodes.error_400.invalid_params;
    error.responseParams.message = err.toJSON();
    callback(error);
  })
}