var checkit = require('checkit');
var errorCodes = require('../config/error.json');
var category = db.collection('category');

//add new category
exports.addCategory = function(callback, data) {
  var rules = {
    name : {
      rule : 'required',
      message : 'Please provide category name'
    },
    level : {
      rule : 'required',
      message : 'Please provide category level'
    }
  };

  var checkit_rule = new checkit(rules);
  //validation check
  checkit_rule.run(data).then(function() {
    data.id = new Date().getTime();

    //check whether new category is main category of child category
    if(data.level != 0 || (data.parent != '' && data.parent != undefined)) {
      var cond = {};
      var parent_id = data.parent;
      if(data.level == 1) {
        cond = {'id' : parent_id};
      } else if(data.level == 2) {
        cond = {'child_categories.id' : parent_id};
      }
      //if new category is child category then check whether its parent exists
      getCategoryByCondition(function(err, get_data) {
        if(err) {
          var error = errorCodes.error_403.server_error;
          return callback(error);
        }
        if(get_data.length == 0) {
          var error = errorCodes.error_400.invalid_params;
          error.responseParams.message = 'Parent category not found';
          return callback(error);
        }
        var update_cond = {};
        delete data.parent;
        if(data.level == 1) {
          update_cond['$push'] = {'child_categories' : data};
        } else if(data.level == 2) {
          update_cond = {'$push' : {'child_categories.$.child_categories' : data}};
        }
        var update_req_data = {};
        update_req_data['cond'] = cond;
        update_req_data['update_cond'] = update_cond;

        //add new category in respective parent category
        save(function(err, ret_data) {
          if(err) {
            callback(err);
          }
          callback(null, ret_data);
        }, update_req_data, 1);
      }, cond);
    } else {
      delete data.parent;
      data.child_categories = [];

      //if new category is parent category then directly add it with empty child_categories array
      save(function(err, ret_data) {
        if(err) {
          callback(err);
        }
        callback(null, ret_data);
      }, {'insert_data' : data});
    }
  }).catch(checkit.Error, function(err) {
    var error = errorCodes.error_400.invalid_params;
    error.responseParams.message = err.toJSON();
    callback(error);
  })
}

//get category by passing condition
function getCategoryByCondition(callback, cond) {
  category.find(cond, {}).toArray(function(err, cat_data) {
    if(err) {
      var error = errorCodes.error_403.server_error;
      callback(error);
    }
    callback(null, cat_data);
  });
}

//add or update category
function save(callback, data, is_update) {
  if(is_update == 1) {
    category.update(data['cond'], data['update_cond'], function(err, update_data) {
      if(err) {
        var error = errorCodes.error_403.server_error;
        callback(error);
      }
      var result_response = errorCodes.error_200.success;
      callback(null, result_response);
    });
  } else {
    category.save(data['insert_data'], function(err, insert_ret_data) {
      if(err) {
        var error = errorCodes.error_403.server_error;
        callback(error);
      }
      var result_response = errorCodes.error_200.success;
      callback(null, result_response);
    });
  }
}