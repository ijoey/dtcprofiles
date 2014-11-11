(function(n, win){
	n.View.Menu = function(container, controller, model){
		n.View.apply(this, [container, controller, model]);
		var self = this;
		this.controller.setView(this);
		Object.defineProperty(this, 'isHidden', {
			get: function(){
				return parseInt(self.container.style['left'].replace('px', '')) !== 0;;
			}
			, enumerable: true
		});
	};
	n.View.Menu.prototype = {
		show: function(){
			this.container.style['left'] = '0px';
		}
		, hide: function(){
			this.container.style['left'] = '-100px';
		}
	};
	n.View.Mixin(n.View.Menu.prototype);
	n.Controller.Menu = function(delegate, model){
		n.Controller.apply(this, [delegate, model]);
	};
	n.Controller.Menu.prototype = {
		setView: function(v){
			n.Controller.prototype.setView.call(this, v);
			this.view.container.addEventListener('click', this, true);
			this.view.container.addEventListener('touchend', this, true);
		}
		, handleEvent: function(e){
			if(!e.target.href) return;
			e.preventDefault();
			this.delegate.wasSelected(e.target);
		}
	};
	n.Controller.Mixin(n.Controller.Menu.prototype);
	
	n.View.MenuButton = function(container, controller, model){
		n.View.apply(this, [container, controller, model]);
		var self = this;
		this.views.push(new n.View.Menu(this.container.parentNode.querySelector('nav'), new n.Controller.Menu(this.controller, this.model), this.model));
		this.controller.setView(this);
		this.defaultLeft = this.container.getBoundingClientRect().left;
		Object.defineProperty(this, 'isOpened', {
			get: function(){
				return self.container.getBoundingClientRect().left !== self.defaultLeft;
			}
			, enumerable: true
		});
	};
	n.View.MenuButton.prototype = {
		toggle: function(){
			this.views.forEach(function(v){
				if(v.isHidden){
					v.show();
				}else{
					v.hide();
				}
			});
			if(this.isOpened) this.close();
			else this.open();
		}
		, close: function(){
			this.container.style['left'] = this.defaultLeft + 'px';
		}
		, open: function(){
			this.container.style['left'] = '100px';
		}
	};
	n.View.Mixin(n.View.MenuButton.prototype);
	
	n.Controller.MenuButton = function(delegate, model){
		n.Controller.apply(this, [delegate, model]);
	};
	n.Controller.MenuButton.prototype = {
		setView: function(v){
			n.Controller.prototype.setView.call(this, v);
			this.view.container.addEventListener('mouseup', this, true);
			this.view.container.addEventListener('touchend', this, true);
		}
		, handleEvent: function(e){
			if(this[e.type]) this[e.type](e);
		}
		, mouseup: function(e){
			this.view.toggle();
		}
		, touchend: function(e){
			
		}
		, wasSelected: function(link){
			this.delegate.wasSelected(link);
		}
	};
	n.Controller.Mixin(n.Controller.MenuButton.prototype);
	
	n.View.Document = function(container, controller, model){
		n.View.apply(this, [container, controller, model]);
		this.controller.setView(this);
	};
	n.View.Mixin(n.View.Document.prototype);
	
	n.Controller.Document = function(delegate, model){
		n.Controller.apply(this, [delegate, model]);
	};
	n.Controller.Document.prototype = {
		setView: function(v){
			n.Controller.prototype.setView.call(this, v);
			this.view.container.addEventListener('click', this, true);
			this.view.container.addEventListener('touchend', this, true);
		}
		, handleEvent: function(e){
			var link = e.target;
			if(link === null) return;
			while(link && !link.href){
				link = link.parentNode;
			}
			if(!link || !link.href) return;
			e.preventDefault();
			this.delegate.wasSelected(link);
		}
	};

	n.Controller.UrlListener = function(delegate, model){
		n.Controller.apply(this, [delegate, model]);
		this.model.subscribe('url', this.update.bind(this));
	};
	n.Controller.UrlListener.prototype = {
		update: function(key, old, v){
			var xhr = new XMLHttpRequest();
			var self = this;
			var url = this.addExtension(v, 'phtml');
			xhr.open("GET", url, true);
			xhr.onload = function(e){self.onload(e);};
			xhr.send();
		}
		, onload: function(e){
			this.delegate.pageWasRequested(this.model, e.target.responseText);
		}
		, addExtension: function(url, ext){
			var parts = url.split('/');
			var last = parts[parts.length-1];
			if(last.length === 0) url = 'index';
			if(!/\.(.*)$/.test(last)){
				url += '.{ext}'.replace(/{ext}/, ext);
			}
			return url;
		}
	};
	n.Controller.Mixin(n.Controller.UrlListener.prototype);
	
	var app = (function(win){
		var menu = new n.Observable({});
		var page = new n.Observable({url: window.location.href});
		var self = {
			views: []
			, wasSelected: function(link){
				if(link.href.indexOf('logout') > -1) return window.location = link.href;
				if(link.href.indexOf('/page') > -1) return window.location = link.href;
				window.history.pushState(null, link.title, link.href);
				page.url = link.href;
				n.NotificationCenter.publish('pageWasSelected', this, page);
			}
			, pageWasRequested: function(p, response){
				var main = document.getElementById('main');
				main.innerHTML = response;
				var background = main.querySelector('#background');
				if(background){
					document.body.style['backgroundImage'] = 'url("' + background.value + '")';	
				}
			}
		};
		new n.Controller.UrlListener(self, page);
		self.views.push(new n.View.MenuButton(document.getElementById('menuButton'), new n.Controller.MenuButton(self, menu), menu));
		self.views.push(new n.View.Document(document.getElementById('main'), new n.Controller.Document(self, page), page));
		window.addEventListener('popstate', function(e){
			console.log('popstate', e);
		}, true);
		
		return self;
	})(win);
})(MM, window);
