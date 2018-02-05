var mongojs = require('mongojs');

exports.connectToServer = function( callback ) {
	var db_str = "mongodb://" + CONFIG.db_host + ":" + CONFIG.db_port + "/" + CONFIG.db_name;
    return mongojs(db_str);
};