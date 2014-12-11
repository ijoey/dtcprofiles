function Command(body){
	this.body = body;
	this.header = {
		tried: 0
		, endpoint: {port: 8126, host:'localhost'}
		, retries: 3
		, name: 'Message'
		, token: null
		, id: (new Date()).getTime()
	};
	this.type = 'command';
}
function AddMember(member){
	Command.apply(this, [member]);
	this.header.name = 'AddMember';
}
function UpdateMember(member){
	Command.apply(this, [member]);
	this.header.name = 'UpdateMember';
}

function DeleteMember(member){
	Command.apply(this, [member]);
	this.header.name = 'DeleteMember';
}
function ChangeAvatar(member){
	Command.apply(this, [member]);
	this.header.name = 'ChangeAvatar';
}

function ChangeBackground(member){
	Command.apply(this, [member]);
	this.header.name = 'ChangeBackground';
}
function NewMessage(message){
	Command.apply(this, [message]);
	this.header.name = 'NewMessage';
}
module.exports = {
	AddMember: AddMember
	, UpdateMember: UpdateMember
	, DeleteMember: DeleteMember
	, ChangeAvatar: ChangeAvatar
	, ChangeBackground: ChangeBackground
	, NewMessage: NewMessage
	, Command: Command
};
