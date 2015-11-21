/**
 * Config used for running jenkins and staging
 */
console.info('Captag production datasource');
module.exports = {
  'captag-db': {
    'name': 'captag-db',
    'url': process.env.MONGO_URL,
    'defaultForType': 'mongodb',
    'connector': 'mongodb',
    'server': {
      'auto_reconnect': true,
      'reconnectTries': 10,
      'reconnectInterval': 100
    },
    'connectionTimeout': 1000000
  }
};
