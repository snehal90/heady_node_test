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
      var result_response = errorCodes.error_200.success;
      callback(null, result_response);
    });
  } else {
    products.save(data['insert_data'], function(err, insert_ret_data) {
      if(err) {
        var error = errorCodes.error_403.server_error;
        callback(error);
      }
      var result_response = errorCodes.error_200.success;
      callback(null, result_response);
    });
  }
}