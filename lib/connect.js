var LMS = require('squeezenode') ;
var Squeezebox;
// Xbmc
var shared = require('./shared');
const Promise = require('bluebird');


function getStatusPlayer(player){
    var sta = 0;

    Squeezebox.players[player.playerid].getStatus(function(response){
    if(response.ok)
    {
        sta = Number(response.result.power);
        on = (sta == 1)
     sails.log.info(`Status du player ${Squeezebox.players[player.playerid]} : ${on}`);
    }
    });

    // Mise à jour du status
    gladys.deviceState.createByDeviceTypeIdentifier(`${player.name}-connected`, 'lms', {value: sta})
                      .catch((err) => sails.log.warn(`LMS Module : Fail to save deviceState : ${err}`));

    return sta;
}


function addDevice(player){

    var newDevice = {
      device: {
          name: `Squeezebox ${player.name}`,
          protocol: 'lms',
          service: 'lms',
          identifier: player.playerId
      },
      types: [
        {
          name:'Connected',
          type: 'binary',
          //tag: '',
          sensor: false,
          //unit: '',
          min: 0,
          max:1,
          display: false,
          identifier: `${player.name}-connected`
        },
        {
          name:'status',
          type: 'status',
          //tag: '',
          sensor: false,
          //unit: '',
          min: 0,
          max:2,
          display: false,
          identifier: `${player.name}-status`
        }
      ]
    };
    // Create the device
    gladys.device.create(newDevice)
          // Then set connected value
          .then(() => gladys.deviceState.createByDeviceTypeIdentifier(`${player.name}-connected`, 'lms', {value: 1}))
          .catch((err) => sails.log.error(`LMS module : Error while creating device : ${err}`));
}

module.exports.setup = function(identifier){
  // Already connected
  if(typeof(shared.device[identifier]) !== 'undefined')
    return true;

  //var host, port;
  var identifiers = identifier.split(':');
  var host = identifiers[0];
  var port = identifiers[1];

  sails.log.info(`Squeeze module : Try connecting to ${host}:${port}`);

  Squeezebox = new LMS('http://'+host, port);

  Squeezebox.on('register', function(){
  		Squeezebox.getPlayers(function(response){
  			var players = [];
  			if (response.ok && response.result.length){
  				response.result.forEach(function(player){
  					sails.log.info(`Squeeze player found (setup) : ${player.name} - ${player.playerid}`);
  					shared.device[player.playerid] = player;
  					// TODO vérification du module avant d'appeler addDevice(player)
                    // addDevice(player)
  				});
  			}
  		});

  	});

  return true;

}
module.exports.install = function(identifier){

  // Already connected
  if(typeof(shared.device[identifier]) !== 'undefined')
    return true;

  //var host, port;
  var identifiers = identifier.split(':');
  var host = identifiers[0];
  var port = identifiers[1];

  sails.log.info(`Squeeze module : Try connecting to ${host}:${port}`);

  Squeezebox = new LMS('http://'+host, port);

  Squeezebox.on('register', function(){
  		Squeezebox.getPlayers(function(response){
  			var players = [];
  			if (response.ok && response.result.length){
  				response.result.forEach(function(player){
  					sails.log.info(`Squeeze player found (install) : ${player.name} - ${player.playerid}`);
  					shared.device[player.playerid] = player;
  					addDevice(player)

  				});
  			}
  		});

  	});

  return true;

};