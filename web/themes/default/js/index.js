(function(n, win){	
	n.View.PageFlipper = function(container, controller, model){
		n.View.apply(this, [container, controller, model]);
		this.controller.setView(this);
		this.model.subscribe('push', this.update.bind(this));
	};
	n.View.PageFlipper.prototype = {
		update: function(key, old, v){
			this.container.querySelector('h1').innerHTML = v.name;
			this.container.querySelector('img').src = v.avatar;
			this.container.querySelector('div').innerHTML = v.page;
			document.body.style['background-image'] = 'url("' + v.background + '");}';
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
		this.inerval = setInterval(function(){
			var username = null;
			if(self.model.length > 0) username = self.model.item(self.model.length-1).username;
			else username = null;
			self.fetchNext(username);
		}, 5000);
	};
	n.Controller.NextMemberGetter.prototype = {
		fetchNext: function(username){
			var xhr = new XMLHttpRequest();
			var self = this;
			var url = '/members/after/' + username + '.json'
			xhr.open("GET", url, true);
			xhr.onload = function(e){self.onload(e);};
			xhr.send();
		}
		, onload: function(e){
			var member = JSON.parse(e.target.responseText);
			if(member.username === null){
				return this.model.clear();
			}
			if(member.username === null){
				fectchNext(null);
			} else{
				this.model.push(member);
			}
		}
	};
	n.Controller.Mixin(n.Controller.NextMemberGetter.prototype);
	
	var app = (function(win, member){
		var menu = new n.Observable({});
		var members = new n.Observable.List([member]);
		var self = {
			views: []
		};
		new n.Controller.NextMemberGetter(self, members);
		self.views.push(new n.View.PageFlipper(document.getElementById('profile'), new n.Controller.PageFlipper(self, members), members));
		return self;
	})(win, member);
})(MM, window, member);
