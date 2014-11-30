(function(n, win){
	n.CreatePageFlipper = function(container, model, delegate){
		var current = 0;
		var self = {
			container: container
			, model: model
			, divs: []
			, template: null
			, delegate: delegate
			, hide: function(){
				this.divs[current].style['display'] = 'none';
			}
			, show: function(){
				this.divs[current].style['display'] = 'block';
			}
			, flip: function(){
				if(this.model.length === 0) return;
				this.divs[current].style['display'] = 'none';
				current++;
				if(current >= this.model.length -1 ) current = 0;
				this.divs[current].style['display'] = 'block';
			}
			, update: function(key, old, v){
				var div = this.template.cloneNode(true);
				div.id = 'page_' + v.name;
				div.innerHTML = v.contents;			
				div.style['display'] = 'none';
				this.divs.push(div);
				this.container.parentNode.insertBefore(div, this.container);
			}
			, remove: function(key, old, v){
				var i = 0;
				var ubounds = this.divs.length;
				for(i; i < ubounds; i++){
					if(this.divs[i].id === 'page_' + v.name){
						this.divs.splice(i, 1);
						break;
					}
				}
			}
		};
		self.template = self.container.cloneNode(true);
		self.model.subscribe('push', self.update.bind(self));
		self.model.subscribe('remove', self.remove.bind(self));
		return self;
	};
	
	n.CreateMemberFlipper = function(container, model, delegate){
		var current = 0;
		var self = {
			container: container
			, model: model
			, divs: []
			, template: null
			, delegate: delegate
			, hide: function(){
				this.divs[current].style['display'] = 'none';
			}
			, show: function(){
				this.divs[current].style['display'] = 'block';
			}
			, flip: function(){
				if(this.model.length === 0) return;
				this.divs[current].style['display'] = 'none';
				current++;
				if(current >= this.model.length -1 ) current = 0;
				this.divs[current].style['display'] = 'block';
			}
			, update: function(key, old, v){
				var div = this.template.cloneNode(true);
				var name = div.querySelector('#name');
				var avatar = div.querySelector('#avatar');
				var username = div.querySelector('#username');
				var background = div.querySelector('#background');
				var page = div.querySelector('#page');
				div.id = 'profile_' + v.username;
				name.id = 'name_' + v.username;
				avatar.id = 'avatar_' + v.username;
				username.id = 'username_' + v.username;
				background.id = 'background_' + v.username;
				page.id = 'page_' + v.username;
				div.style['background-image'] = 'url("' + v.background + '")';
				
				if(v.background.length === 0){
					div.removeChild(background);
				}
				name.innerHTML = v.name;
				avatar.src = v.avatar;
				username.value = v.username;
				background.src = v.background;
				page.innerHTML = v.page;
				div.style['display'] = 'none';
				this.divs.push(div);
				this.container.parentNode.insertBefore(div, this.container);
			}
			, remove: function(key, old, v){
				var i = 0;
				var ubounds = this.divs.length;
				for(i; i < ubounds; i++){
					if(this.divs[i].id === 'profile_' + v.username){
						this.divs.splice(i, 1);
						break;
					}
				}
			}
		};
		self.template = self.container.cloneNode(true);
		self.model.subscribe('push', self.update.bind(self));
		self.model.subscribe('remove', self.remove.bind(self));
		return self;
	};
	n.CreateMemberGetter = function(delegate, model){
		var self = {
			delegate: delegate
			, model: model
			, fetch: function(callback){
				var xhr = new XMLHttpRequest();
				var self = this;
				var url = '/members.json';
				xhr.open("GET", url, true);
				xhr.onload = function(e){
					this.onload(e);
					if(callback) {
						callback(e.target);
					}
				}.bind(this);
				xhr.send();
			}
			, onload: function(e){
				var members = JSON.parse(e.target.responseText);
				members.forEach(function(member){
					this.model.push(member);
				}.bind(this));
			}
		};
		
		return self;
	};
	n.CreateNextMemberGetter = function(delegate, model){
		var self = {
			model: model
			, delegate: delegate
			, fetchNext: function(username, callback){
				var xhr = new XMLHttpRequest();
				var self = this;
				var url = '/members/after/' + username + '.phtml';
				if(username === null) url = '/members/first.phtml';
				console.log(url);
				xhr.open("GET", url, true);
				xhr.onload = function(e){
					self.onload(e);
					if(callback) {
						callback(e.target);
					}
				};
				xhr.send();
			}
			, onload: function(e){
				this.model.clear();
				this.model.push(e.target.responseText);
			}
			, start: function(){
				var self = this;
				this.interval = setInterval(function(){
					self.fetchNext(document.getElementById('username').value);					
				}, 11000);
			}
			, stop: function(){
				clearInterval(this.interval);
			}
			, restart: function(){
				this.stop();
				this.start();
			}
		};
		self.interval = null;
		return self;
	};
	
	n.CreatePageGetter = function(container, model, delegate){
		var xhr = new XMLHttpRequest();
		var counter = 0;
		var self = {
			model: model
			, container: container
			, fetchNext: function(callback){
				var file = this.model.next();
				var url = '/pages/' + file + '.json';
				var self = this;
				xhr.open("GET", url, true);
				xhr.onload = function(e){
					this.onload(e);
					if(callback) callback(e.target);
				}.bind(this);
				xhr.send();
			}
			, onload: function(e){
				if(e.target.status !== 200) return;
				var response = JSON.parse(e.target.responseText);
				this.container.innerHTML = response.page.contents;
			}
			, show: function(){
				this.container.style['display'] = 'block';
			}
			, hide: function(){
				this.container.style['display'] = 'none';
			}
			, fetch: function(callback){
				var url = '/pages.json';
				xhr.open("GET", url, true);
				xhr.onload = function(e){
					var response = JSON.parse(e.target.responseText);
					response.files.forEach(function(file){
						this.model.push(file);
					}.bind(this));
					if(callback){
						callback(response);						
					}
				}.bind(this);
				xhr.send();
			}
		};
		
		return self;
	};
	win.app = (function(win, member){
		var menu = new n.Observable({});
		var period = 10000;
		var member = {name: document.getElementById('name').innerHTML
			, avatar: document.getElementById('avatar').src
			, username: document.getElementById('username').value
			, background: document.getElementById('background').value};
		
		var members = new n.Observable.List([member]);
		var pages = new n.Observable.List([]);
		var counter = 0;
		var self = {
			views: []
			, interval: null
			, pageWasSelected: function(publisher, info){
				memberFlipperView.show();
				nextPageGetter.hide();
				this.stop();
				
				if(/\/(index)?$/.test(info.url)){
					this.start();
				}
			}
			, start: function(){
				this.interval = setInterval(function(){
					counter++;
					if(counter % 2 === 0){
						memberFlipperView.flip();						
						memberFlipperView.show();
						pageFlipperView.hide();
					}else{
						pageFlipperView.flip();
						memberFlipperView.hide();
						pageFlipperView.show();
					}
				}.bind(this), period);
			}
			, stop: function(){
				clearInterval(this.interval);
			}
			, member: member
			, members: members
			, pages: pages
		};
		var pageTemplate = document.createElement('div');
		pageTemplate.className = 'pages';
		document.getElementById('main').appendChild(pageTemplate);
		var memberFlipperView = n.CreateMemberFlipper(document.getElementById('profile'), members);
		var pageFlipperView = n.CreatePageFlipper(pageTemplate, pages);
		var memberGetter = n.CreateMemberGetter(self, members);
		var pageGetter = n.CreatePageGetter(document.getElementById('main'), pages, self);
		memberGetter.fetch();
		pageGetter.fetch();
		
		//var nextMemberGetter = n.CreateNextMemberGetter(self, members);
		//TODO: I want to handle swipes trying to slide the page, but I need to 
		// build teh chat app first.
		//var slider = n.CreateDocumentSlider(document.getElementById('main'), members, self);
		//self.views.push(memberFlipperView);
		
		n.NotificationCenter.subscribe('pageWasSelected', self, null);
		self.start();
		setTimeout(function(){
			memberFlipperView.container.style['display'] = 'none';			
		}, period);
		return self;
	})(win);
})(MM, window);
