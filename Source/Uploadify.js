if (!this.Uploadify) this.Uploadify = {};

Uploadify.Register = new Class({
	
	Implements: [Options, Events],
	
	options: {
		inputs: 'input[type=file]',
		queue: '#file-list',
		autoStart: true,
		fallback: false,
		renderer: false,
		generateRequest: function() { return '#fallbackurl'; },
		forceGenerator: false
	},
	
	initialize: function(options) {
		this.setOptions(options);
		
		this.inputs = {};
		this.requests = {};
		this.inputElements = $$(this.options.inputs);
		this.queueElement = $$(this.options.queue);
		
		if(this.inputElements.length > 0 && this.queueElement.length > 0) {
			this.queue = new Uploadify.Queue(this.queueElement[0], this.uuid, this.options.autoStart, this.options.renderer);
			this.queue.addEvent('add', this.ensurePage.bind(this));
			this.queue.addEvent('end', this.canLeave.bind(this));
			this.queue.addEvent('progress', function(i,f) { this.fireEvent('progress', [i, f, this.queue])}.bind(this));
			this.queue.addEvent('complete', function(i,f) { this.fireEvent('complete', [i, f, this.queue])}.bind(this));
			this.createInputs();
		}
	},
	
	stillUploading: function() {
		return "There are still some files uploading, by leaving this page you will cancel all your uploads...";
	},
	
	ensurePage: function(id, file) {
		this.fireEvent('add', [id, file, this.queue]);
		window.onbeforeunload = this.stillUploading.bind(this);
	},
	
	canLeave: function(id, file) {
		this.fireEvent('end', [id, file, this.queue]);
		window.onbeforeunload = null;
	},
	
	createInputs: function() {
		this.inputElements.each(this.createInput.bind(this));
	},
	
	createInput: function(input) {
		if(input.get('tag') == 'input' && input.get('type') == 'file') {
			var uuid = this.totally_unique_id(),
				upload = this.inputs[uuid] = new Uploadify.Input(uuid, input, this.options.generateRequest, this.options.forceGenerator);
			
			upload.addEvent('start', this.startRequest.bind(this));
		}
	},
	
	startRequest: function(uuid) {
		this.requests[uuid] = this.queue.add(uuid, this.inputs[uuid]);
		this.inputs[uuid].reset();
	},
	
	uuid: function() {
		var S4 = function() {
			return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		};
		
		return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	},
	
	totally_unique_id: function() {
		var uuid = this.uuid();
		return this.inputs.hasOwnProperty(uuid)? this.totally_unique_id() : uuid;
	}
	
});
