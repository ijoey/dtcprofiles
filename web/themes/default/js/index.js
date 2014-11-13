(function(n, win){
	n.CreatePageFlipper = function(container, model){
		var self = {
			container: container
			, model: model
			, hidden: document.createElement('div')
			, update: function(key, old, v){
				this.hidden.innerHTML = v;
				var image = new Image();
				this.container.innerHTML = '';
				image.onload = function(e){
					document.body.style['backgroundImage'] = 'url("' + image.src + '")';
					this.container.innerHTML = this.hidden.innerHTML;					
				}.bind(this);
				image.src = this.hidden.querySelector('#background').value;
			}
			, hide: function(){
				document.body.style['backgroundImage'] = null;
				this.container.style["display"] = 'none';
			}
			, show: function(){
				this.container.style["display"] = 'block';
			}
		};
		self.model.subscribe('push', self.update.bind(self));
		self.hidden.style['display'] = 'none';
		document.body.appendChild(self.hidden);
		return self;
	};
	n.CreateNextMemberGetter = function(delegate, model){
		var self = {
			model: model
			, delegate: delegate
			, fetchNext: function(username, callback){
				var xhr = new XMLHttpRequest();
				var self = this;
				var url = '/members/after/' + username + '.phtml'
				if(username === null) url = '/members/first.phtml';
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
	
	n.CreateNextPageGetter = function(container, model, delegate){
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
			, loadAllThePages: function(callback){
				var url = '/pages.json';
				xhr.open("GET", url, true);
				xhr.onload = function(e){
					var response = JSON.parse(e.target.responseText);
					callback(response);
				};
				xhr.send();
			}
		};
		self.loadAllThePages(function(response){
			response.files.forEach(function(file){
				this.model.push(file);
			}.bind(this));
		}.bind(self));
		
		return self;
	};
	n.CreateDocumentSlider = function(container, model, delegate){
		var isMouseDown = false;
		var defaults = {
			position: container.style['position']
			, left: container.style['left']
			, top: container.style['top']
		};
		var self = {
			container: container
			, model: model
			, delegate: delegate
			, mouseDown: function(e){
				e.preventDefault();
				isMouseDown = true;
			}
			, mouseUp: function(e){
				e.preventDefault();
				isMouseDown = false;
			}
			, mouseMove: function(e){
				if(isMouseDown){
					this.container.style['position'] = 'absolute';	
					this.container.style['left'] = e.clientX + 'px';
					this.container.style['top'] = 0;			
				}
			}
		};
		self.container.addEventListener('mousedown', self.mouseDown.bind(self), true);
		self.container.addEventListener('mouseup', self.mouseUp.bind(self), true);
		self.container.addEventListener('mousemove', self.mouseMove.bind(self), true);
		return self;
	};
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
				this.stop();
				
				if(/\/(index)?$/.test(info.url)){
					this.start();
				}
			}
			, start: function(){
				var counter = 0;
				this.interval = setInterval(function(){
					if(counter > 10) counter = 0;
					counter++;
					if(counter % 2 === 0){
						nextMemberGetter.fetchNext(document.getElementById('username').value, function(){
							pageFlipperView.show();
							nextPageGetter.hide();
						});
					}else{
						nextPageGetter.fetchNext(function(){
							pageFlipperView.hide();
							nextPageGetter.show();
						});
					}
				}, 11000);
			}
			, stop: function(){
				clearInterval(this.interval);
			}
		};
		var nextPageGetter = n.CreateNextPageGetter(document.getElementById('next'), new n.Observable.List(), self);
		var nextMemberGetter = n.CreateNextMemberGetter(self, members);
		var pageFlipperView = n.CreatePageFlipper(document.getElementById('main'), members);
		var slider = n.CreateDocumentSlider(document.getElementById('main'), members, self);
		self.views.push(pageFlipperView);
		n.NotificationCenter.subscribe('pageWasSelected', self, null);
		self.start();
		return self;
	})(win);
})(MM, window);
