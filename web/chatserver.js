var signer = require('jws');
var messages = [];
var Commands = require('../profile/commands');
var Events = require('../profile/events');

setInterval(function(){
	var message = messages.shift();
}, 3000);
module.exports = function(server){
	var io = require('socket.io')(server.server);
	var nicknames = {};
	var cookieParserFunction = server.cookieParser();
	var cookieSessionFunction = server.cookieSession({ keys: [server.config.cookie.key, ':blah:'], secret: server.config.cookie.secret});
	var Persistence = server.Persistence;
	
	io.use(function(socket, next){
		cookieParserFunction(socket.request, socket.request.res, function(){
			cookieSessionFunction(socket.request, socket.request.res, function(){
				var decodedSignature = signer.decode(socket.request.session.passport.user);
				if(!decodedSignature){
					return next(new Error("Unauthorized"));
				}
				Persistence.member.findOne({username: socket.request._query.username}, function(err, doc){
					if(doc){
						nicknames[doc.username] = doc;						
						next();
					}else{
						next(401);						
					}
				});
			});
		});
	});

	io.on('connection', function (socket) {
		socket.on('message', function (msg) {
			var message = {text: msg, time: (new Date()).getTime(), from: nicknames[socket.nickname]};
			socket.broadcast.emit('message', message);
			messages.push(message);
			server.client.send(new Commands.NewMessage(message));
		});
		socket.on('send previous messages', function(msg, ack){
			return ack([]);
		});
		socket.on('nickname', function (nick, fn) {
			socket.nickname = nick;
			if (nicknames[nick]) {
				socket.broadcast.emit('joined', nicknames[nick]);
				io.sockets.emit('nicknames', nicknames);
				return fn(true);
			}
			nicknames[nick] = {username: nick};
			socket.broadcast.emit('joined', nicknames[nick]);
			io.sockets.emit('nicknames', nicknames);
			return fn(true);
		
		});
		socket.on('left', function(nick){
			//console.log(nick, ' has left');
		});
		socket.on('disconnect', function () {
			if (!socket.nickname) return;
			delete nicknames[socket.nickname];
			socket.broadcast.emit('left', socket.nickname);
			socket.broadcast.emit('nicknames', nicknames);
		});
		socket.emit('connected', nicknames);
	});
	return io;
};
