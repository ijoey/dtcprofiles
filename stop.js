var Bus = require('./web/bus');
var client = new Bus.AsA_Client();
function Stop(message){
	this.body = message;
	this.header = {
		tried: 0
		, endpoint: {port: 8128, host:'localhost'}
		, retries: 3
		, name: 'Stop'
		, token: null
		, id: (new Date()).getTime()
	};
	this.type = 'command';
}
client.send(new Stop(null));
setTimeout(function(){
	process.exit(1);
}, 500);