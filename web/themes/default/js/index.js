(function(n, win){	
	n.View.PageFlipper = function(container, controller, model){
		n.View.apply(this, [container, controller, model]);
		this.controller.setView(this);
		this.model.subscribe('push', this.update.bind(this));
	};
	n.View.PageFlipper.prototype = {
		update: function(key, old, v){
			this.container.innerHTML = v;
			document.body.style['backgroundImage'] = 'url("' + this.container.querySelector('#background').value + '")';
		}
	};
	n.View.Mixin(n.View.PageFlipper.prototype);
	
	n.Controller.PageFlipper = function(delegate, model){
		n.Controller.apply(this, [delegate, model]);
	};
	n.Controller.Mixin(n.Controller.PageFlipper.prototype);
	
	n.Controller.NextMemberGetter = function(delegate, model){
		n.Controller.apply(this, [delegate, model]);
		var self = this;
		this.interval = null;
		this.start();
		this.container = document.createElement('div');
	};
	n.Controller.NextMemberGetter.prototype = {
		fetchNext: function(username){
			var xhr = new XMLHttpRequest();
			var self = this;
			console.trace(username);
			if(username === null) username = 'null';
			var url = '/members/after/' + username + '.phtml'
			xhr.open("GET", url, true);
			xhr.onload = function(e){self.onload(e);};
			xhr.send();
		}
		, onload: function(e){
			this.container.innerHTML = '';
			if(e.target.status === 404){
				this.model.clear();
				this.fetchNext(null);
			}else{
				this.container.innerHTML = e.target.responseText;
				this.model.push(e.target.responseText);
			}
			/*var member = JSON.parse(e.target.responseText);
			if(member.username === null){
				return this.model.clear();
			}
			if(member.username === null){
				fetchNext(null);
			} else{
				this.model.push(member);
			}*/
		}
		, start: function(){
			var self = this;
			this.interval = setInterval(function(){
				if(self.container.innerHTML.length === 0){
					self.fetchNext(null);
				}else{
					self.fetchNext(self.container.querySelector('#username').value);					
				}
			}, 5000);
		}
		, stop: function(){
			clearInterval(this.interval);
		}
		, restart: function(){
			this.stop();
			this.start();
		}
	};
	n.Controller.Mixin(n.Controller.NextMemberGetter.prototype);
	
	var app = (function(win, member){
		var menu = new n.Observable({});
		var member = {name: document.getElementById('name').innerHTML
			, avatar: document.getElementById('avatar').src
			, username: document.getElementById('username').value
			, background: document.getElementById('background').value};
		
		document.body.style['backgroundImage'] = 'url("' + member.background + '")';	
		var members = new n.Observable.List([member]);
		var self = {
			views: []
			, pageWasSelected: function(publisher, info){
				console.log(info.url);
				if(!/\/(index)?$/.test(info.url)){
					nextMemberGetter.stop();
				}else{
					window.location.href = '/';
					//nextMemberGetter.restart();
				}
			}
		};
		var nextMemberGetter = new n.Controller.NextMemberGetter(self, members);
		self.views.push(new n.View.PageFlipper(document.getElementById('main'), new n.Controller.PageFlipper(self, members), members));
		n.NotificationCenter.subscribe('pageWasSelected', self, null);
		return self;
	})(win);
})(MM, window);
