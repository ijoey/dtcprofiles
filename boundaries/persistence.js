var Datastore = require('nedb');
var Member = require('../profile/entities/member');
var config = null;

function replaceLastMember(id, member){
	lastMemberDb.remove({}, {multi: true}, function(err, numRemoved){
		if(err) console.log('error replaceLastMember: ', err, id);
	});
	member.id = id;
	lastMemberDb.insert(member, function(err, docs){
		if(err) console.log('error replaceLastMember inserting: ', err, id);
	});
}
var Db = {
	memberWasDeleted: function memberWasDeleted(id, callback){
		db.remove({_id: id}, {multi:false}, function(err, numRemoved){
			if(callback) callback(err, numRemoved);
		});
		lastMemberDb.remove({id: id}, {multi:false}, function(err, numRemoved){});
	}
	, member:{
		findOne: function findOne(query, callback){
			db.findOne(query, function(err, doc){
				if(err) return callback(err, doc);
				if(!doc) return callback(null, null);
				callback(err, new Member(doc));
			});
		}
		, find: function find(query, sortBy, callback){
			if(sortBy){
				db.find(query).sort(sortBy).exec(function(err, docs){
					if(err) return callback(err, null);
					var list = [];
					for(var i = 0; i < docs.length; i++){
						list.push(new Member(docs[i]));
					}
					callback(null, list);
				});
			}else{
				db.find(query, function(err, docs){
					if(err) return callback(err, null);
					var list = [];
					for(var i = 0; i < docs.length; i++){
						list.push(new Member(docs[i]));
					}
					callback(null, list);
				});
			}
		}
		, findFirst: function(callback){
			db.find({}).sort({username: 1}).limit(1).exec(function(err, docs){
				if(err) return callback(err, null);
				if(docs.length === 0) return callback(null, null);
				callback(null, new Member(docs[0]));
			});
		}
		, findMostRecentlyActive: function(query, callback){
			db.find(query).sort({active: -1}).limit(1).exec(function(err, docs){
				if(err) return callback(err, null);
				if(docs.length === 0) return callback(null, null);
				callback(null, new Member(docs[0]));
			});
		}
		, findActive: function(callback){
			var today = new Date();
			today.setMonth(today.getMonth()-1);
			db.find({active: {"$gt": today.getTime()}}).sort({active: -1}).exec(function(err, docs){
				if(err) return callback(err, null);
				var list = [];
				for(var i = 0; i < docs.length; i++){
					list.push(new Member(docs[i]));
				}
				callback(null, list);
			});
		}
	}
	, lastMemberWasDeleted: function lastMemberWasDeleted(member){
		var member = null;
		var monthAgo = new Date();
		monthAgo.setMonth(monthAgo.getMonth()-1);
		db.find({"active >=":monthAgo.getTime()}, function(err, docs){
			if(err) throw err;
			if(docs.length === 0) return;
			var list = [];
			for(var i = 0; i < docs.length; i++){
				list.push(new Member(docs[i]));
			}
			member = member[0];
			member.id = member._id;
			lastMemberDb.insert(member, function(err, doc){
				if(err) throw err;
			});
		});
	}
	, memberWasUpdated: function memberWasUpdated(id, member, callback){
		db.update({_id: id}, {name: member.name, page: member.page, active: (new Date()).getTime()
				, time: (new Date()).getTime(), token: member.token, username: member.username, avatar: member.avatar
				, background: member.background}, function(err, updated){
			if(err) console.log('error during memberWasUpdated: ', id, err, updated);
			if(callback) callback(err, updated);
		});
		replaceLastMember(id, member);
	}
	, updateAvatar: function(id, avatar, callback){
		db.update({_id: id}, {$set: {avatar: avatar}}, {}, function(err, updated){
			if(err) console.log('error during updateAvatar: ', id, err, updated);
			console.log('updated avatar', updated);
			if(callback) callback(err, {id: id, avatar: avatar, updated: updated});
		});
	}
	, updateBackground: function(id, background, callback){
		db.update({_id: id}, {$set: {background: background}}, {}, function(err, updated){
			if(err) console.log('error during updatedBackground: ', id, err, updated);
			console.log('updated background', updated);
			if(callback) callback(err, {id: id, background: background, updated: updated});
		});
	}
	, newMemberWasSubmitted: function newMemberWasSubmitted(member, callback){
		db.insert(member, function(err, doc){
			if(err) console.log('newMemberWasSubmitted error:', err);
			lastMemberDb.remove({}, {multi: true}, function(err, numRemoved){
				doc.id = doc._id;
				lastMemberDb.insert(doc, function(err, docs){
					if(err) console.log('newMemberWasSubmitted error inserting last member:', err);
				});
			});
			if(callback) callback(err, doc);
		});
	}
	, getLastMember: function getLastMember(callback){
		lastMemberDb.findOne({}, function(err, doc){
			callback(new Member(doc));
		});
	}
	, refresh: function(){
		db.loadDatabase();
		lastMemberDb.loadDatabase();
	}
};
var db = null;
var lastMemberDb = null;
module.exports = function(c){
	config = c;
	db = new Datastore({filename: config.dataPath + '/members.db', autoload: true});
	lastMemberDb = new Datastore({filename: config.dataPath + '/lastmember.db', autoload: true});
	return Db;
};
