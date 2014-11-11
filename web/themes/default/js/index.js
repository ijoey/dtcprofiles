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
		, hide: function(){
			this.container.style["display"] = 'none';
		}
		, show: function(){
			this.container.style["display"] = 'block';
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
		this.container = document.createElement('div');
	};
	n.Controller.NextMemberGetter.prototype = {
		fetchNext: function(username){
			var xhr = new XMLHttpRequest();
			var self = this;
			var url = '/members/after/' + username + '.phtml'
			if(username === null) url = '/members/first.phtml';
			xhr.open("GET", url, true);
			xhr.onload = function(e){self.onload(e);};
			xhr.send();
		}
		, onload: function(e){
			this.model.clear();
			this.container.innerHTML = e.target.responseText;
			this.model.push(e.target.responseText);
		}
		, start: function(){
			var self = this;
			this.interval = setInterval(function(){
				self.fetchNext(document.getElementById('username').value);					
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
	var nextPageGetter = (function(){
		var xhr = new XMLHttpRequest();
		var counter = 0;
		var self = {
			model: new n.Observable.List([])
			, container: document.getElementById('pageContainer')
			, fetchNext: function(){
				var file = this.model.next();
				var url = '/pages/' + file + '.json';
				xhr.open("GET", url, true);
				xhr.onload = this.onload.bind(this);
				xhr.send();
			}
			, onload: function(e){
				if(e.target.status !== 200) return;
				var response = JSON.parse(e.target.responseText);
				var div = document.createElement('div');
				this.container.innerHTML = response.page.contents;
			}
			, show: function(){
				this.container.style['display'] = 'block';
			}
			, hide: function(){
				this.container.style['display'] = 'none';
			}
		};
		var url = '/pages.json';
		xhr.open("GET", url, true);
		xhr.onload = function(e){
			var response = JSON.parse(e.target.responseText);
			response.files.forEach(function(file){
				self.model.push(file);
			});
		};
		xhr.send();
		return self;
	})();
	
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
			, interval: null
			, pageWasSelected: function(publisher, info){
				pageFlipperView.show();
				nextPageGetter.hide();
				if(!/\/(index)?$/.test(info.url)){
					this.stop();
				}else{
					window.location.href = '/';
					//nextMemberGetter.restart();
				}
			}
			, start: function(){
				var counter = 0;
				this.interval = setInterval(function(){
					if(counter > 10) counter = 0;
					counter++;
					if(counter % 2 === 0){
						pageFlipperView.show();
						nextPageGetter.hide();
						nextMemberGetter.fetchNext(document.getElementById('username').value);
					}else{
						nextPageGetter.fetchNext();
						pageFlipperView.hide();
						nextPageGetter.show();
					}
				}, 5000);
			}
			, stop: function(){
				clearInterval(this.interval);
			}
		};
		var nextMemberGetter = new n.Controller.NextMemberGetter(self, members);
		var pageFlipperView = new n.View.PageFlipper(document.getElementById('main'), new n.Controller.PageFlipper(self, members), members);
		self.views.push(pageFlipperView);
		n.NotificationCenter.subscribe('pageWasSelected', self, null);
		self.start();
		return self;
	})(win);
})(MM, window);
