var express = require('express');
var app = express();
var fs = require('fs');
var rootPath = __dirname.replace('/web', '');
var staticServer = require('serve-static');
var compression = require('compression');
var multer = require('multer');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var config = require('../config');
var passport = require('passport');
var PassportStrategy = require('passport-local').Strategy;
var Datastore = require('nedb');
var membersDbFilePath = config.dataPath + '/members.db';
var signer = require('jws');
var Persistence = require('../boundaries/persistence')(config);
var Member = require('../profile/entities/member');
var Ejs = require('ejs');
var Https = require('https');
var Http = require('http');
var QueryString = require('querystring');
var XmlToJson = require('xml2js');
var uploadsFolder = rootPath + '/uploads/';
var imagesFolder = rootPath + '/uploads/images/';
var members = [];
var webDataFolder = rootPath + '/web/data';
var membersFolder = webDataFolder + '/members';
var pagesFolder = webDataFolder + '/pages';
var httpImageRoot = "/uploads/images/";
var Moment = require('moment');
var Folder = require('../profile/entities/folder');
var Page = require('../profile/entities/page');
var HttpStatus = require('./httpstatus');
var packageFile = require('../package.json');
function Resource(obj){
	this.layout = 'default';
	this.title = config.site.title;
	this.js = [];
	this.css = [];
	this.header = {};
	this.user = null;
	this.status = {code: 200, description: 'Ok'};
	this.posts = [];
	this.author = "Joey Guerra";
	this.description = "profiles app";
	for(var key in obj) this[key] = obj[key];
}
var represent = require('chilla').Chilla({
	themeRoot: rootPath + '/web/themes/' + config.theme
	, appPath: rootPath + '/web'
});
function createFolderIfDoesntExist(folder){
	if(!fs.existsSync(folder)){
		fs.mkdirSync(folder);
	}
}
function findFirstMember(resp){
	Persistence.member.findFirst(function(err, member){
		resp.represent({view: 'index/index'
			, resource: new Resource({title: member.name, css: ['member']})
			, model: member});
	});
}

createFolderIfDoesntExist(config.dataPath);
createFolderIfDoesntExist(webDataFolder);
createFolderIfDoesntExist(uploadsFolder);
createFolderIfDoesntExist(imagesFolder);
createFolderIfDoesntExist(membersFolder);
createFolderIfDoesntExist(pagesFolder);
express.response.represent = require('./configurerepresent')(represent, config);
app.use(compression());
app.use("/public", staticServer(represent.themeRoot));
app.use("/uploads", staticServer(rootPath + '/uploads/'));
app.set("views", rootPath + "/themes/default/templates");
app.set("view engine", function(view, options, fn){ return fn(view, options);});
app.use(cookieParser());
app.use(multer({dest: './uploads/'}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride(function(req, res){
	if(req.body._method) return req.body._method;
	return req.method;
}));
app.use(cookieSession({ keys: [config.cookie.key, ':blah:'], secret: config.cookie.secret}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(member, done) {
	var signature = signer.sign({
		header: {alg: 'HS256'}
		, payload: member.username
		, secret: config.secret
	});
	done(null, signature);
});
passport.deserializeUser(function deserializeUser(token, done) {
	var decodedSignature = signer.decode(token);
	if(!decodedSignature) return done(null, null);
	Persistence.member.findOne({username: decodedSignature.payload}, function(err, member) {
		if(err) console.log(err);
		done(err, member);
	});
});
var Authentication = (function(){
	var self = {
		login: function(username, password, callback){
			var body = QueryString.stringify({callingProgram: 'dtcprofiles', j_username: username, j_password: password, j_storenumber: 9100});
			var request = Https.request({hostname: config.auth.host
				, port: config.auth.port
				, path: config.auth.path
				, method: config.auth.method
				, headers: {
		          'Content-Type': 'application/x-www-form-urlencoded'
				  , 'Content-Length': body.length
		    	}
			}, function(response){
				response.setEncoding('utf8');
				response.on('data', function (chunk) {				
					XmlToJson.parseString(chunk, function(err, identity){
						if(err) return callback(err);
						if(identity.Auth.Error){
							//console.log(identity.Auth.Error[0]);
							return callback(null, null, {message: identity.Auth.Error[0]});
						}
						return callback(null, new Member({username: username}));
					});
				});
			});
			request.write(body);
			request.end();
		}
	};
	return self;
})();

passport.use(new PassportStrategy(
	function(username, password, done) {
		Authentication.login(username, password, function(err, member, response){
			if(err) return done(err);
			if(member !== null){
				Persistence.member.findOne({username: username}, function(err, member){
					if(err) return done(err);
					if(member) return done(null, member);
					var member = new Member({
						username: username
						, background: ''
						, name: username
						, avatar: ''
						, page: ''
						, active: (new Date()).getTime()
					});
					client.send(new Commands.AddMember(member));
					done(null, member);
				});
			}else{
				done(null, null, response);
			}
		});
	}
));

app.get("/robots.txt", function(req, resp, next){
	resp.represent({
		view: 'robots/index'
		, resource: new Resource({})
		, model: {}});
});
app.get("/humans.txt", function(req, resp, next){
	resp.represent({
		view: 'humans/index'
		, resource: new Resource({})
		, model: {}});
});
app.get("/sitemap.:format", function(req, resp, next){
	resp.represent({
		view: 'sitemap/index'
		, resource: new Resource()
		, model: {}});
});

app.get(['/index.:format?', '/'], function(req, resp, next){
	resp.represent({view: 'index/index'
		, resource: new Resource({
			members: members
			, css: ['member']
			, js: ['index']
		})
		, model: null});
});
app.get('/login.:format?', function(req, resp, next){
	resp.represent({view: 'login/index'
		, resource: new Resource()
		, model: {}});
});
app.post('/login.:format?', passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login'}));

app.get('/members/first.:format?', function(req, resp, next){
	return findFirstMember(resp);
});
app.get("/members/after/:username.:format?", function(req, resp, next){
	var username = req.params.username;
	Persistence.member.find({username: {$gt: username}}, {username: 1}, function(err, docs){
		if(err){
			next(404);
		}
		if(docs.length === 0){
			return findFirstMember(resp);
		}
		var member = new Member(docs[0]);
		member.next = docs[1];
		resp.represent({view: 'index/index'
			, resource: new Resource({title: member.name, css: ['member']})
			, model: member});
	});
});

app.get('/members/:member_name.:format?', function(req, resp, next){
	var member = null;
	var member_name = req.params.member_name;
	fs.readFile(__dirname + '/data/members/' + member_name + '.json', null, function(err, data){
		if(err){
			//console.log(req.url, err);
			return next(404);
		}
		member = new Member(JSON.parse(data));
		resp.represent({view: 'index/index'
		, resource: new Resource({js: ['members'], css: ['member']})
		, model: member});
	});
});
app.get('/pages.:format?', function(req, resp, next){
	var files = fs.readdir(pagesFolder, function(err, files){
		if(err){
			console.log(err);
			return next(err);
		}
		var f = null;
		var pages = [];
		while(f = files.shift()){
			var data = fs.readFileSync(pagesFolder + '/' + f);
			pages.push(new Page(f, data.toString()));
		}
		resp.represent({
			view: 'pages/index'
			, resource: new Resource({})
			, model: new Folder(pages)});					
		
	});
});

// authenticated endpoints
app.get(['/page', '/chat', '/member', 'member/:member_name'], function(req, resp, next){
	if(!req.isAuthenticated()) return next(401);
	next();
});
app.put('/page', function(req, resp, next){
	if(!req.isAuthenticated()) return next(401);
	next();
});
app.post(['/page', '/members'], function(req, resp, next){
	if(!req.isAuthenticated()) return next(401);
	next();
});
app.delete(['/page', '/members'], function(req, resp, next){
	if(!req.isAuthenticated()) return next(401);
	next();
});


app.get('/logout.:format?', function(req, resp, next){
	req.logout();
	resp.redirect('/index');
});

app.get('/page/', function(req, resp, next){
	fs.readdir(imagesFolder, function(err, images){
		images = images.map(function(image){
			return httpImageRoot + image;
		});
		resp.represent({
			view: 'pages/edit'
			, resource: new Resource({title: "New Page", js: ['page']})
			, model: {page: new Page(null, null), images: images}});
	});
});
app.get('/page/:file.:format?', function(req, resp, next){
	var file = req.params.file + '.html';
	if(!Folder.isValid(file)){
		return next(new HttpStatus(404));
	}
	fs.readFile(pagesFolder + '/' + file, function(err, data){
		if(err){
			return next(new HttpStatus(500));
		}
		fs.readdir(imagesFolder, function(err, images){
			images = images.map(function(image){
				return httpImageRoot + image;
			});
			resp.represent({
				view: 'pages/edit'
				, resource: new Resource({title: "Page", js: ['page']})
				, model: {page: new Page(file, data.toString()), images: images}});
		});
	});
});
app.delete('/pages/:file.:format?', function(req, resp, next){
	var fileName = req.params.file + '.html';
	fs.unlink(pagesFolder + '/' + fileName, function(err){
		var files = fs.readdir(pagesFolder, function(err, files){
			if(err){
				console.log(err);
				return next(err);
			}
		
			var extensionStripped = files.map(function(f){
				return f.replace(/\.\w+$/, '');
			});
			resp.redirect('/pages');
		});
	});
});
app.get('/pages/:file.:format?', function(req, resp, next){
	var file = req.params.file + '.html';
	if(!Folder.isValid(file)){
		return next(new HttpStatus(404));
	}
	fs.readFile(pagesFolder + '/' + file, function(err, data){
		if(err){
			return next(new HttpStatus(500));
		}
		resp.represent({
			view: 'pages/show'
			, resource: new Resource({title: "Page", js: ['page']})
			, model: {page: new Page(file, data.toString())}});
	});
});
app.post('/page/images.:format?', function(req, resp, next){
	var images = [];
	for(var key in req.files){
		images.push(req.files[key]);
	}
	images.forEach(function(image){
		fs.renameSync(rootPath + '/' + image.path, imagesFolder + image.originalname
			, function(err){
				if(err) console.log(err);
		});
	});
	var files = images.map(function(image){
		return imagesFolder.replace(uploadsFolder, '/uploads/') + image.originalname;
	});
	resp.represent({view: 'images/show', resource: new Resource({title: "Upload Images", js: ['page']}), model: {files: files}});
});
app.delete('/page/images.:format?', function(req, resp, next){
	var file = req.body.image.replace(httpImageRoot, '');
	fs.unlink(imagesFolder + file, function(err){
		resp.represent({view: 'images/show', resource: new Resource({title: "Delete Images", js: ['page']}), model: {files: [file]}});
	});
});

app.put('/page/:file', function(req, resp, next){
	var file = req.params.file + '.html';
	var path = pagesFolder + '/' + file;
	var contents = req.body.contents;
	fs.exists(path, function(exists){
		if(!exists) return next(new HttpStatus(404));
		fs.writeFile(path, contents, function(err){
			if(err) console.log(err);
			resp.redirect('/pages');
		});
	});
});
app.post('/page/', function(req, resp, next){
	var fileName = req.body.fileName;
	if(!fileName) return next(404);
	var path = pagesFolder + '/' + fileName + '.html';
	var contents = req.body.contents;
	fs.exists(path, function(exists){
		if(exists) return next(new HttpStatus(405));
		fs.writeFile(path, contents, function(err){
			if(err) console.log(err);
			resp.redirect('/pages');
		});
	});
});
app.delete("/members.:format?", function(req, resp, next){
	var id = req.body._id;
	Persistence.member.findOne({_id: id}, function(err, member){
		if(err) console.log(err);
		if(member && member._id !== null){
			client.send(new Commands.DeleteMember(member));
		}
	});
	resp.redirect('/members');
});
app.get("/members.:format?", function(req, resp, next){
	var docs = [];
	Persistence.member.find({}, {public: -1}, function(err, docs){
		if(err){
			console.log(err);
			next(500);
		}
		resp.represent({view: 'member/index'
			, resource: new Resource({title: "List of Members"
			, members: members, css: ['members']})
			, model: docs});
	});
});
app.get('/members/:_id.:format?', function(req, resp, next){
	Persistence.member.findOne({_id: req.params._id}, function(err, doc){
		if(err) return next(500);
		if(doc === null) return next(404);
		resp.represent({view: 'member/show'
			, resource: new Resource({members: members, css: ['member'], js: ['member']})
			, model: doc});
	});
});
app.get("/member/:_id.:format?", function getMemberById(req, resp, next){
	Persistence.member.findOne({_id: req.params._id}, function(err, doc){
		if(err) return next(500);
		if(doc === null) return next(404);
		resp.represent({view: 'member/edit'
			, resource: new Resource({members: members, css: ['member'], js: ['member']})
			, model: doc});
	});
});
app.get("/member.:format?", function getMemberEditForm(req, resp, next){
	resp.represent({view: 'member/edit'
		, resource: new Resource({title: "New Member", members: members
			, css: ['member']
			, js: ['member']
		})
		, model: new Member()
	});
});
app.put("/member/:_id.:format?", function updateMemberById(req, resp, next){
	Persistence.member.findOne({_id: req.params._id}, function(err, doc){
		if(!doc) return next(404);
		doc.page = req.body.page;
		doc.name = req.body.name;
		client.send(new Commands.UpdateMember(doc));
		resp.redirect('/members');
	});
});

app.post("/member.:format?", function(req, resp, next){
	var member = new Member();
	member.name = req.params.name;
	member.page = req.params.page;
	member.active = (new Date()).getTime();
	client.send(new Commands.AddMember(member));
	resp.redirect('/members');
});
app.post('/member/:_id/backgrounds.:format?', function(req, resp, next){
	var file = req.files['newBackground'];
	var folder = rootPath + '/uploads/' + req.user.username;
	var id = req.params._id;
	fs.exists(folder, function(exists){
		if(!exists) fs.mkdirSync(folder);
		fs.rename(rootPath + '/' + file.path, folder + '/' + file.originalname
			, function(err){
				if(err) console.log(err);
				var newBackground = '/uploads/' + req.user.username + '/' + file.originalname;
				client.send(new Commands.ChangeBackground({id: req.user._id, background: newBackground}));
				Persistence.member.findOne({_id: id}, function(err, doc){
					doc.background = newBackground;
					resp.represent({view: 'member/show', resource: new Resource(), model: new Member(doc)});
				});
		});
	})
});
app.post('/member/:_id/avatars.:format?', function(req, resp, next){
	var file = req.files['newAvatar'];
	var folder = rootPath + '/uploads/' + req.user.username;
	var id = req.params._id;
	fs.exists(folder, function(exists){
		if(!exists) fs.mkdirSync(folder);
		fs.rename(rootPath + '/' + file.path, folder + '/' + file.originalname
			, function(err){
				if(err) console.log(err);
				var newAvatar = '/uploads/' + req.user.username + '/' + file.originalname;
				client.send(new Commands.ChangeAvatar({id: req.user._id, avatar: newAvatar}));
				Persistence.member.findOne({_id: id}, function(err, doc){
					doc.avatar = newAvatar;
					resp.represent({view: 'member/show', resource: new Resource(), model: new Member(doc)});
				});
		});
	})
});

app.get('/chat.:format?', function(req, resp, next){
	Persistence.message.findToday(function(err, doc){
		resp.represent({view: 'chat/index', resource: new Resource({js: ['chat']}), model: doc});
	});
});

app.use(function(err, req, resp, next){
	if(err instanceof HttpStatus){
		return resp.status(err.code).send(err.message);
	}
	next(err);		
});

process.argv.forEach(function(value, fileName, args){
	if(/as:/.test(value)) config.runAsUser = /as\:([a-zA-Z-]+)/.exec(value)[1];
	if(/port:/.test(value)) config.port = /port:(\d+)/.exec(value)[1];
});
process.on('exit', function() {
	console.log('web server exited.');
});
process.on('SIGTERM', function(){
	console.log('SIGTERM.');
	process.exit(1);
});
process.on('SIGINT', function(){
	console.log('SIGINT.');
	process.exit(1);
});
var webServer = app.listen(config.port, function(){
	console.log('Server started, on port ', webServer.address());
	console.log('version ' + packageFile.version);
});

var Commands = require('../profile/commands');
var Events = require('../profile/events');
var Bus = require('../boundaries/bus');
var bus = new Bus.AsA_Subscriber(8127);
var client = new Bus.AsA_Client();
bus.start();
console.log('starting subscriber');
var stopBus = new Bus.AsA_Publisher(8128);
var chatServer = require('../chat')({server: webServer
	, config: config
	, cookieParser: cookieParser
	, cookieSession: cookieSession
	, bus: bus
	, client: client
	, Persistence: Persistence
});
stopBus.start();
stopBus.iHandle('Stop', {
	handle: function(command){
		console.log('received stop command', command);
		process.exit(1);
	}
});
bus.iSubscribeTo('CustomerSignedUpForEmail', {host: 'localhost', port: 8129}, {
	update: function(event){
		var message = {from: hubot, time: (new Date()).getTime(), text: event.body + ' just signed up for the SBOTD email'};
		client.send(new Commands.NewMessage(message));
		chatServer.sockets.emit('message', message);
	}
});

bus.iSubscribeTo('MemberWasUpdated', {host: 'localhost', port: 8126}, {
	update: function(event){
		Persistence.refresh();
		var member = event.body;
		memberSyncher();
		chatServer.sockets.emit('MemberWasUpdated', event.body)
	}
});
bus.iSubscribeTo('MemberWasCreated', {host: 'localhost', port: 8126}, {
	update: function(event){
		Persistence.refresh();
		var member = event.body;
		memberSyncher();
		chatServer.sockets.emit('MemberWasCreated', event.body)
	}
});
bus.iSubscribeTo('MemberWasDeleted', {host: 'localhost', port: 8126}, {
	update: function(event){
		Persistence.refresh();
		var member = event.body;
		memberSyncher();
	}
});
bus.iSubscribeTo('AvatarWasChanged', {host: 'localhost', port: 8126}, {
	update: function(event){
		Persistence.refresh();
		var member = event.body;
		memberSyncher();
		chatServer.sockets.emit('AvatarWasChanged', event.body)
	}
});
bus.iSubscribeTo('BackgroundWasChanged', {host: 'localhost', port: 8126}, {
	update: function(event){
		Persistence.refresh();
		var member = event.body;
		memberSyncher();
		chatServer.sockets.emit('BackgroundWasChanged', event.body)
	}
});
bus.iSubscribeTo('MessageWasSent', {host: 'localhost', port: 8126}, {
	update: function(event){
		if(event.body.text.indexOf('hubot') > -1){
			var hubotCommand = /^hubot\s(.*)/ig.exec(event.body.text)[1];
			bots.forEach(function(bot){
				if(bot.doesUnderstand(hubotCommand)){
					bot.execute(hubotCommand, chatServer.sockets);
				}
			})
		}
		Persistence.message.refresh();
	}
});

var bots = [];
var hubot = {username: 'hubot', avatar: '/public/images/hubot.png'};
bots.push(
	{
		doesUnderstand: function(command){
			return /^time/.test(command);
		}
		, execute: function(command, socket){
			socket.emit('message', {from: hubot, text: Moment(new Date()).format("dddd, MMMM DD, YYYY hh:mm:ss a")});
		}
	}
);
bots.push(
	{
		doesUnderstand: function(command){
			if(/^google images /i.test(command)) return true;
			if(/(?:mo?u)?sta(?:s|c)he?(?: me)? (.*)/i.test(command)) return true;
			return false;
		}
		, execute: function(command, socket){
			if(/^google images /i.test(command)) return this.google(command, socket);
			if(/(?:mo?u)?sta(?:s|c)he?(?: me)? (.*)/i.test(command)) return this.moustache(command, socket);
		}
		, moustache: function(command, socket){
			var type = /(\d)$/.exec(command);
			if(type) type = type[1];
			else type = Math.floor(Math.random() * 6);
			var url = 'http://mustachify.me/' + type + '?src=';
			var target = /(?:mo?u)?sta(?:s|c)he?(?: me)? (.*)/i.exec(command)[1];
			this.queryGoogle(target, 'face', function(err, data){
				var result = JSON.parse(data);
				var img = result.responseData.results[0];
				socket.emit('message', {from: hubot, text: '<img width="200" src="' + url + encodeURIComponent(img.unescapedUrl) + '" />'});
			});
		}
		, google: function(command, socket){
			var query = /^google images [animated]?(.*)/i.exec(command)[1];
			var type = /animated/.test(command) ? 'animated' : 'face';
			this.queryGoogle(query, type, function(err, data){
				socket.emit('message', {from: hubot, text: data});
			});
		}
		, queryGoogle: function(query, type, callback){
			var url = 'http://ajax.googleapis.com/ajax/services/search/images?';
			var q = {
				imgtype: type
				, q: query
				, v: '1.0'
				, rsz: '8'
			};
			Http.get(url + QueryString.stringify(q), function(res){
				var data = '';
				res.on('data', function(chunk){
					data += chunk.toString();
				});
				res.on('end', function(){
					callback(null, data);
				});
			}).on('error', function(e){
				console.log('got an error from google', e);
			});
		}
	}
);

function synchMostRecentMember(){
	Persistence.member.findMostRecentlyActive({active: {"$lt":(new Date()).getTime()}}, function(err, member){
		fs.writeFile(__dirname + '/data/index.json', JSON.stringify(member), function(err){
			if(err) console.log(err);
		});
	});
}
function memberSyncher(){
	var files = fs.readdirSync(membersFolder);
	files.forEach(function(file){
		fs.unlinkSync(membersFolder + '/' + file);
	});
	Persistence.member.findActive(function(err, docs){
		members = [];
		docs.forEach(function(doc){
			fs.writeFile(membersFolder + '/' + doc.username + '.json', JSON.stringify(doc), function(err){
				if(err) console.log(err);
			});
			members.push(new Member(doc));
		});
		synchMostRecentMember();
	});
}
memberSyncher();
