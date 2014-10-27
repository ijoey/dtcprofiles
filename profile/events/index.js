function Event(body){
	this.body = body;
	this.header = {
		id: (new Date()).getTime()
		, endpoint: {port: 8126, host: 'localhost'}
		, token: 'testing'
		, name: 'Event'
	};
	this.type = 'event';
}
function MemberWasUpdated(member){
	Event.apply(this, [member]);
	this.header.name = 'MemberWasUpdated';
}
MemberWasUpdated.prototype = new Event();

function MemberWasCreated(member){
	Event.apply(this, [member]);
	this.header.name = 'MemberWasCreated';
}
MemberWasCreated.prototype = new Event();

function MemberWasDeleted(member){
	Event.apply(this, [member]);
	this.header.name = 'MemberWasDeleted';
}
MemberWasDeleted.prototype = new Event();

function AvatarWasChanged(member){
	Event.apply(this, [member]);
	this.header.name = 'AvatarWasChanged';
}
AvatarWasChanged.prototype = new Event();

function BackgroundWasChanged(member){
	Event.apply(this, [member]);
	this.header.name = 'BackgroundWasChanged';
}
BackgroundWasChanged.prototype = new Event();

module.exports = {
	MemberWasUpdated: MemberWasUpdated
	, MemberWasCreated: MemberWasCreated
	, MemberWasDeleted: MemberWasDeleted
	, AvatarWasChanged: AvatarWasChanged
	, BackgroundWasChanged: BackgroundWasChanged
	, Event: Event
};
