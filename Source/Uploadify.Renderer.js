if (!this.Uploadify) this.Uploadify = {};

Uploadify.Renderer = new Class({
	
	initialize: function(element, queue) {
		this.queue = queue;
		this.element = this.correct(element);
		this.files = {};
		this.order = [];
		
		this.queue.addEvent('add', this.addFile.bind(this));
		this.queue.addEvent('progress', this.progressFile.bind(this));
		this.queue.addEvent('complete', this.completeFile.bind(this));
	},
	
	correct: function(el) {
		if(el.get('tag') != "ul") {
			var nel = new Element('ul', {'class': 'upload-list'});
			el.grab(nel);
		} else {
			var nel = new Element('div'),
				cl = el.clone();
			nel.grab(cl).replaces(el);
		
			el = nel;
		}
		
		this.progressBar(el);
		return el;
	},
	
	addFile: function(uuid, info) {
		this.order.push(uuid);
		this.files[uuid] = info;
		
		this.render();
	},
	
	progressFile: function(uuid, info) {
		this.files[uuid] = info;		
		
		this.render();
	},
	
	completeFile: function(uuid, info) {
		this.files[uuid] = info;		

		this.render();
	},
	
	render: function() {
		this.order.each(function(key) {
			if(this.files.hasOwnProperty(key)) {
				this.renderOrUpdateFile(key);
			}
		}.bind(this));
	},
	
	renderOrUpdateFile: function(uuid) {
		var el = this.element.getElement('li[data-id="' + uuid +'"]');
		if(el) {
			this.update(uuid, el);
		} else {
			this.create(uuid);
		}
	},
	
	update: function(uuid, el) {
		el.getElement('.filename').set('text', this.files[uuid].file.fileName);
		el.getElement('.size').set('text', this.prettySize(this.files[uuid].total));
		el.className = this.files[uuid].status;
		
		this.updateProgress();
	},
	
	updateProgress: function() {
		var progress = this.queue.calculateProgress(),
			remaining = this.prettySize(progress.total-progress.position),
			size = this.element.getElement('div.upload-bar-wrapper').getSize(),
			wrapper = this.element.getElement('div.upload-progress');
			
		wrapper.getElement('div.upload-bar').set('tween', {duration: 200});
		wrapper.getElement('div.upload-bar').tween('width', ((size.x/100) * progress.perc) + 'px');
		wrapper.getElement('h3').set('html', remaining + ' remaining <span class="data">' + progress.perc + '%</span>');
		
		if(progress.perc === 100 && !wrapper.hasClass('idle')) {
			console.log('close-progress');
			wrapper.addClass('idle').fade('out');
		} else if(wrapper.hasClass('idle') && progress.perc < 100) {
			console.log('open-progress');
			wrapper.removeClass('idle').fade('in')
		}
	},
	
	progressBar: function(el) {
		if(!el.getElement('div.upload-progress')) {
			var progress = new Element('div', {
				'class': 'upload-progress idle',
				'html': '<h3><span class="data"></span></h3><div class="upload-bar-wrapper"><div class="upload-bar" style="width:0px;"></div></div>',
				'styles': {
					'overflow': 'hidden'
				}
			});
			progress.fade('hide');
			
			el.grab(progress);
		}
	},
	
	create: function(uuid) {
		var newEl = new Element('li', {
			'html': '<span class="type"></span><span class="filename"></span><span class="size"></span>',
			'data-id': uuid
		});
		
		this.update(uuid, newEl);
		this.element.getElement('ul').grab(newEl);
	},
	
	prettySize: function(bytes) {
		var s = ['b', 'kb', 'MB', 'GB', 'TB', 'PB'],
			e = Math.floor(Math.log(bytes)/Math.log(1024));
		
		if(isNaN(e)) {
			return '0b';
		} else {
			return (bytes/Math.pow(1024, Math.floor(e))).toFixed(0)+" "+s[e];
		}
	}
	
});