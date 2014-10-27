var moment = require('moment');
var Observable = require('./observable');
var Member = function Member(obj){
	var self = Observable();
	var name = null;
	Object.defineProperty(this, 'name', {
		get: function(){return name;}
		, set: function(v){
			var old = name;
			self.changed('name', old, v);
			name = v;
		}
		, enumerable: true
	});

	var username = null;
	Object.defineProperty(this, 'username', {
		get: function(){return username;}
		, set: function(v){
			var old = username;
			self.changed('username', old, v);
			username = v;
		}
		, enumerable: true
	});


	var token = null;
	Object.defineProperty(this, 'token', {
		get: function(){return token;}
		, set: function(v){
			var old = token;
			self.changed('token', old, v);
			token = v;
		}
		, enumerable: true
	});

	var avatar = null;
	Object.defineProperty(this, 'avatar', {
		get: function(){return avatar;}
		, set: function(v){
			var old = avatar;
			self.changed('avatar', old, v);
			avatar = v;
		}
		, enumerable: true
	});

	var background = null;
	Object.defineProperty(this, 'background', {
		get: function(){return background;}
		, set: function(v){
			var old = background;
			self.changed('background', old, v);
			background = v;
		}
		, enumerable: true
	});


	var active = null;
	Object.defineProperty(this, 'active', {
		get: function(){return active;}
		, set: function(v){
			var old = active;
			self.changed('active', old, v);
			active = v;
		}
		, enumerable: true
	});

	var page = null;
	Object.defineProperty(this, 'page', {
		get: function(){return page;}
		, set: function(v){
			var old = page;
			self.changed('page', old, v);
			page = v;
		}
		, enumerable: true
	});

	var time = (new Date()).getTime();
	Object.defineProperty(this, 'time', {
		get: function(){return time;}
		, set: function(v){
			var old = time;
			self.changed('time', old, v);
			time = v;
		}
		, enumerable: true
	});
	for(var key in obj){
		this[key] = obj[key];
	}
	return this;
};
function byDate(a, b){
	if(a.time === b.time) return 0;
	if(a.time > b.time) return -1;
	return 1;
}
Member.prototype = {
	humanFriendlyDate: function(date){
		return moment(date).format("dddd, MMMM DD, YYYY");
	}
	, w3cFormat: function(date){
		return moment.utc(date).format();
	}
	, canEdit: function(user){
		return user._id === this._id;
	}
};
Member.sortByDate = function(list){
	return list.sort(byDate);
};

module.exports = Member;
