const Promise = require('bluebird');
const connect = require('./connect');

module.exports = function(){
  sails.log.info('NOTIFY');
  return true;
}