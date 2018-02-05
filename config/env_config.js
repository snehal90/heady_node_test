var config = {
  local: {
    db_host: 'localhost',
    db_port: 27017,
    db_name: 'heady_node'
  },
  staging: {
    db_host: 'localhost',
    db_port: 27017,
    db_name: 'heady_node'
  },
  production: {
    db_host: 'localhost',
    db_port: 27017,
    db_name: 'heady_node'
  }
};

module.exports = function(mode) {
        return config[mode || process.argv[2] || 'local'] || config.local;
};