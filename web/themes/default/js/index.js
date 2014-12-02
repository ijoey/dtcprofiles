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
				var member = v;
				member.backgroundStyle = member.background.length > 0 ? 'background-image: url("' + member.background + '")' : '';
				member.avatarImage = member.avatar.length > 0 ? '<img class="img-circle avatar" src="' + member.avatar + '" />' : '';
				var template = Hogan.compile(this.template.outerHTML);
				var div = document.createElement('div');
				div.id = member.username;
				div.innerHTML = template.render(member);
				div.firstChild.style['display'] = 'none';
				this.divs.push(div.firstChild);
				this.container.parentNode.insertBefore(div.firstChild, this.container);
			}
			, remove: function(key, old, v){
				var i = 0;
				var ubounds = this.divs.length;
				for(i; i < ubounds; i++){
					if(this.divs[i].id === v.username){
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
				this.delegate.finishedGettingMembers(this);
			}
		};
		
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
		var members = new n.Observable.List([]);
		var pages = new n.Observable.List([]);
		var counter = 0;
		var self = {
			views: []
			, interval: null
			, pageWasSelected: function(publisher, info){
				memberFlipperView.show();
				pageFlipperView.hide();
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
			, finishedGettingMembers: function(){
				memberFlipperView.show();
			}
			, member: null
			, members: members
			, pages: pages
		};
		var pageTemplate = document.createElement('div');
		pageTemplate.className = 'pages';
		document.getElementById('main').appendChild(pageTemplate);
		var memberFlipperView = n.CreateMemberFlipper(document.getElementById('{{username}}'), members);
		var pageFlipperView = n.CreatePageFlipper(pageTemplate, pages);
		var memberGetter = n.CreateMemberGetter(self, members);
		var pageGetter = n.CreatePageGetter(document.getElementById('main'), pages, self);
		memberGetter.fetch();
		pageGetter.fetch();
		
		//TODO: I want to handle swipes trying to slide the page, but I need to 
		// build teh chat app first.
		//var slider = n.CreateDocumentSlider(document.getElementById('main'), members, self);
		//self.views.push(memberFlipperView);
		
		n.NotificationCenter.subscribe('pageWasSelected', self, null);
		self.start();
		return self;
	})(win);
})(MM, window);
