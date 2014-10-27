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
var memberPath = './web/data/members/';
var signer = require('jws');
var Persistence = require('../boundaries/persistence')(config);
var Member = require('../profile/entities/member');
var Ejs = require('ejs');
var Https = require('https');
var QueryString = require('querystring');
var XmlToJson = require('xml2js');
function Resource(obj){
	this.layout = 'default';
	this.title = config.site.title;
	this.js = [];
	this.css = [];
	this.header = {};
	this.user = null;
	this.status = {code: 200, description: 'Ok'};
	this.posts = [];
	for(var key in obj) this[key] = obj[key];
}
var represent = require('represent').Represent({
	themeRoot: rootPath + '/web/themes/' + config.theme
	, appPath: rootPath + '/web'
});
express.response.represent = require('./withRepresent')(represent, config);

app.use(compression());
app.use("/public", staticServer(represent.themeRoot));
app.use("/uploads", staticServer(rootPath + '/uploads/'));
app.set("views", rootPath + "/themes/default/templates");
app.set("view engine", function(view, options, fn){ return fn(view, options);});
app.use(cookieParser());
app.use(multer({dest: './uploads/'}));
app.use(bodyParser.urlencoded());
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
passport.use(new PassportStrategy(
	function(username, password, done) {
		var body = QueryString.stringify({callingProgram: 'dtcprofiles', j_username: username, j_password: password, j_storenumber: 9100});
		var request = Https.request({hostname: 'hdapps.homedepot.com'
			, port: '443'
			, path: '/MYTHDPassport/rs/identity/auth'
			, method: 'POST'
			, headers: {
	          'Content-Type': 'application/x-www-form-urlencoded'
			  , 'Content-Length': body.length
	    	}
		}, function(response){
			response.setEncoding('utf8');
			response.on('data', function (chunk) {				
				XmlToJson.parseString(chunk, function(err, identity){
					if(err) return done(err);
					if(identity.Auth.Error){
						//console.log(identity.Auth.Error[0]);
						return done(null, null, {message: identity.Auth.Error[0]});
					}
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
				});
			});
		});
		request.write(body);
		request.end();
	}
));
app.get("/robots.txt", function(req, resp, next){
	resp.represent({
		view: 'robots/index'
		, resource: new Resource({
			posts: posts}
		)
		, model: {}});
});
app.get("/humans.txt", function(req, resp, next){
	resp.represent({
		view: 'humans/index'
		, resource: new Resource({
			posts: posts}
		)
		, model: {}});
});
app.get("/sitemap.:format", function(req, resp, next){
	resp.represent({
		view: 'sitemap/index'
		, resource: new Resource()
		, model: {}});
});
var members = [];
app.get(['/index.:format?', '/'], function(req, resp, next){
	fs.readFile(__dirname + '/data/index.json', null, function(err, data){
		if(err) console.log(err);
		var member = new Member(JSON.parse(data ? data.toString() : '{}'));
		member.page = Ejs.render(member.page ? member.page : '', {model: member, request: req});
		resp.represent({view: 'index/index'
			, resource: new Resource({
				members: members
				, css: ['member']
				, js: ['index']
			})
			, model: member});
	});
});
app.get('/login.:format?', function(req, resp, next){
	resp.represent({view: 'login/index'
		, resource: new Resource()
		, model: {}});
});
app.post('/login.:format?', passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login'}));

app.get("/members/after/:username.:format?", function(req, resp, next){
	var username = req.params.username;
	if(username === 'null') username = 'a';
	Persistence.member.find({username: {$gt: username}}, {username: 1}, function(err, docs){
		if(err){
			console.log(err);
			next(404);
		}
		var member = new Member(docs.length > 0 ? docs[0] : null);
		resp.represent({view: 'member/show'
			, resource: new Resource({title: member.name, css: ['member']})
			, model: member});
	});
});

app.get('/members/:member_name', function(req, resp, next){
	var member = null;
	var member_name = req.params.member_name;
	fs.readFile(__dirname + '/data/members/' + member_name + '.json', null, function(err, data){
		if(err){
			console.log(err);
			return next(404);
		}
		member = new Member(JSON.parse(data));
		resp.represent({view: 'index/index'
		, resource: new Resource({css: ['member']})
		, model: member});
	});
});

// authenticated endpoints
app.get("/member", function(req, resp, next){
	if(!req.isAuthenticated()) return next(401);
	next();
});
app.get("/member/:member_name.:format?", function(req, resp, next){
	if(!req.isAuthenticated()) return next(401);
	next();
});
app.delete('/members', function(req, resp, next){
	if(!req.isAuthenticated()) return next(401);
	next();
});
app.post("/members", function(req, resp, next){
	if(!req.isAuthenticated()) return next(401);
	next();
});
app.get('/logout', function(req, resp, next){
	req.logout();
	resp.redirect('/');
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
	var memberKey = null;
	var member = new Member();
	var id = req.params._id;
	Persistence.member.findOne({_id: id}, function(err, doc){
		if(!doc) return next(404);
		member._id = id;
		member.username = req.body.username;
		member.name = req.body.name;
		member.token = doc.token;
		member.avatar = doc.avatar;
		member.background = doc.background;
		member.page = req.body.page;
		client.send(new Commands.UpdateMember(member));
		resp.redirect('/members');
	});
});

app.post("/member.:format?", function(req, resp, next){
	var member = new Member();
	member.name = req.params.name;
	member.page = req.params.page;
	member.author = req.user;
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

function HttpStatus(code){
	this.code = code;
	var self = this;
	function messageFromCode(c){
		var message = 'Ok';
		switch(c){
			case(401):
				message = "Unauthorized";
				break;
			case(404):
				message = "Not Found";
				break;
		}
		return message;
	}
	Object.defineProperty(this, 'message', {
		get: function(){
			return messageFromCode(self.code);
		}
		, enumerable: true
	});
}
app.use(function(err, req, res, next){
	if(err !== 404 && err.code !== 404){
		return next(err.code);
	}
	var path = req._parsedUrl.pathname.replace(/^\//, '').replace(/\/$/, '');
	path += '/index';
	var file = represent.templatesRoot + path + represent.extensionViaContentNegotation(req);
	fs.exists(file, function(exists){
		if(!exists) return next(new HttpStatus(404));
		res.represent({view: path, resource: new Resource(), model: {}});
	});
});
app.use(function(err, req, res, next){
	res.status(typeof err === 'number' ? err : err.code);
	var status = new HttpStatus(typeof err != 'number' ? 404 : err);
	res.send(req.url + ' ' + status.message);
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

var Server = app.listen(config.port, function(){
	console.log('Server started, on port ', Server.address().port);
});

var Commands = require('../profile/commands');
var Events = require('../profile/events');
var Bus = require('../web/bus');
var bus = new Bus.AsA_Subscriber(8127);
var client = new Bus.AsA_Client();
bus.start();
console.log('starting subscriber');
bus.iSubscribeTo('MemberWasUpdated', {host: 'localhost', port: 8126}, {
	update: function(event){
		Persistence.refresh();
		var member = event.body;
		memberSyncher();
	}
});
bus.iSubscribeTo('MemberWasCreated', {host: 'localhost', port: 8126}, {
	update: function(event){
		Persistence.refresh();
		var member = event.body;
		memberSyncher();
	}
});
bus.iSubscribeTo('MemberWasDeleted', {host: 'localhost', port: 8126}, {
	update: function(event){
		Persistence.refresh();
		var post = event.body;
		memberSyncher();
	}
});
bus.iSubscribeTo('AvatarWasChanged', {host: 'localhost', port: 8126}, {
	update: function(event){
		Persistence.refresh();
		var post = event.body;
		memberSyncher();
	}
});
bus.iSubscribeTo('BackgroundWasChanged', {host: 'localhost', port: 8126}, {
	update: function(event){
		Persistence.refresh();
		var post = event.body;
		memberSyncher();
	}
});
function synchMostRecentMember(){
	Persistence.member.findMostRecentlyActive({active: {"$lt":(new Date()).getTime()}}, function(err, member){
		fs.writeFile(__dirname + '/data/index.json', JSON.stringify(member), function(err){
			if(err) console.log(err);
		});
	});
}
function memberSyncher(){
	var files = fs.readdirSync(memberPath);
	files.forEach(function(file){
		fs.unlinkSync(memberPath + file);
	});
	Persistence.member.findActive(function(err, docs){
		members = [];
		docs.forEach(function(doc){
			fs.writeFile(rootPath + '/web/data/members/' + doc.username + '.json', JSON.stringify(doc), function(err){
				if(err) console.log(err);
			});
			members.push(new Member(doc));
		});
		synchMostRecentMember();
	});
}
memberSyncher();
