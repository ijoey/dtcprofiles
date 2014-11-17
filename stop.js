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
var stopWeb = new Stop({message: "Stop the web server"});
var stopProcessor = new Stop({message: "Stop the processor"});
stopWeb.header.endpoint.port = 8128;
stopProcessor.header.endpoint.port = 8126;
client.send(stopWeb);
client.send(stopProcessor);
setTimeout(function(){
	process.exit(1);
}, 1000);