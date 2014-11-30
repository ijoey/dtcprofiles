var Bus = require('./bus');
var Events = require('../profile/events');
var Commands = require('../profile/commands');
var config = require('../config');
var Persistence = require('../boundaries/persistence')(config);
var bus = new Bus.AsA_Publisher(8126);
bus.start();
bus.iHandle('NewMessage', {
	handle: function(command){
		Persistence.message.save(command.body, function(err, doc){
			bus.publish(new Events.MessageWasSent(command.body));
		});
	}
});

bus.iHandle('Stop', {
	handle: function(command){
		console.log('processor received stop command', command);
		process.exit(1);
	}
});
bus.iHandle('AddMember', {
	handle: function(command){
		Persistence.newMemberWasSubmitted(command.body, function(err, doc){
			if(!err){
				bus.publish(new Events.MemberWasCreated(command.body));
			}else{
				console.log('error from AddMember handle:', err);
			}
		});
	}
});
bus.iHandle('UpdateMember', {
	handle: function(command){
		Persistence.memberWasUpdated(command.body._id, command.body, function(err, doc){
			if(!err){
				bus.publish(new Events.MemberWasUpdated(command.body));
			}else{
				console.log('error from UpdateMember handle:', err);
			}
		});
	}
});
bus.iHandle('DeleteMember', {
	handle: function(command){
		Persistence.memberWasDeleted(command.body._id, function(err, count){
			if(!err){
				bus.publish(new Events.MemberWasDeleted(command.body));
			}else{
				console.log('error from DeleteMember: ', err);
			}
		});
	}
});
bus.iHandle('ChangeAvatar', {
	handle: function(command){
		Persistence.updateAvatar(command.body.id, command.body.avatar, function(err, count){
			if(!err){
				bus.publish(new Events.AvatarWasChanged(command.body));
			}else{
				console.log('error from ChangeAvatar: ', err);
			}
		});
	}
});
bus.iHandle('ChangeBackground', {
	handle: function(command){
		Persistence.updateBackground(command.body.id, command.body.background, function(err, count){
			if(!err){
				bus.publish(new Events.BackgroundWasChanged(command.body));
			}else{
				console.log('error from ChangeBackground: ', err);
			}
		});
	}
});
