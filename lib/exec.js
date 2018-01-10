const Promise = require('bluebird');
const connect = require('./connect');

module.exports = function exec(params){
  sails.log.info('EXEC');

  // return false to tell Gladys there is no feedback, and
  // that Gladys need to create a deviceState
 return false;
}