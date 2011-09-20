// moet passen startUpload als hij gestart wordt
if (!this.Uploadify) this.Uploadify = {};

Uploadify.Input = new Class({
	Implements: [Events],
	
	initialize: function(uuid, input, generate, force) {
		this.generator = generate;
		this.files = [];
		this.uuid  = uuid;
		this.input = input;
		var action = input.getParent('form');
		if(action) {
			this.isForm = true;
			this.form = action;
			if(!force) {
				action = action.get('action');
			} else {
				action = this.generate(input);
			}
		} else {
			this.isForm = false;
			action = this.generate(input);
		}
		
		if(action) {
			this.action = action;
			this.create();
		}
	},
	
	generate: function(input) {
		var info = this.generator(input);
		if(typeof info == "object") {
			if(info.hasOwnProperty('url')) {
				var url = info.url;
				delete info.url;
				this.custom_fields = info;
				return url;
			}
		} else if(typeof info == "string") {
			return info;
		}
		
		return false;
	},
	
	create: function() {
		if(this.input.get('multiple')) {
			var name = this.input.get('name');
			if(name.slice(-2) != '[]') this.input.set('name', name + '[]');
			this.input.set('multiple', true); // ensure
			this.name = this.input.get('name');
		}
		
		if(this.isForm) {
			this.form.addEvent('submit', this.start.bind(this));
		} else {
			this.input.addEvent('change', this.start.bind(this));
		}
	},
	
	start: function(event) {
		event.preventDefault();
		
		Array.each(this.input.files, this.add, this);
		this.name = this.input.get('name');
		this.fireEvent('start', [this.uuid]);
	},
	
	reset: function() {
		this.files.length = 0;
		this.input.value = null;
	},
	
	add: function(file) {
		this.files.push(file);
	}
});