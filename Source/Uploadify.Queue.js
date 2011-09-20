if (!this.Uploadify) this.Uploadify = {};

Uploadify.Queue = new Class({
	Implements: [Events],
	
	initialize: function(element, uuidGenerator, autoStart, renderer) {
		this.autoStart   = autoStart;
		this.view        = (renderer)? new renderer(element, this) : new Uploadify.Renderer(element, this);
		this.uuid        = uuidGenerator;
		this.element     = element;
		this.requests    = {};
		this.info        = {};
		this.uploadsRunning = 0;
	},
	
	add: function(uuid, input) {
		var requests = [];
		input.files.each(function(file) {
			var file_uuid = this.totally_unique();
			
			this.info[file_uuid] = {position: 0, total: file.fileSize, status: 'intialize', perc: 0, 'file': file, added: (new Date).getTime()};
			
			var request = new Request.File({
					url: input.action,
					onRequest: this.create(file_uuid),
					onProgress: function(event) { this.progress(file_uuid, event); }.bind(this),
					onComplete: function(event) { this.complete(file_uuid, event); }.bind(this)
				});
			
			this.requests[file_uuid] = request;
			
			request.uuid = uuid;
			request.append(input.name, file);
			
			if(input.custom_fields) {
				Object.keys(input.custom_fields).each(function(key) {
					request.append(key, input.custom_fields[key]);
				}.bind(this));
			}

			if(this.autoStart) {
				request.send();
			}
			
			requests.push(request);
		}.bind(this));
		
		return requests;
	},
	
	totally_unique: function() {
		var uuid = this.uuid();
		return this.requests.hasOwnProperty(uuid)? this.totally_unique_id() : uuid;
	},
	
	create: function(file_uuid) {
		this.info[file_uuid].status = 'starting';
		this.fireEvent('add', [file_uuid, this.info[file_uuid]]);
		
		this.uploadsRunning++;
	},
	
	progress: function(file_uuid, event) {
		this.info[file_uuid].position = event.position;
		this.info[file_uuid].perc = parseInt(event.position / event.total * 100, 10).limit(0, 100);
		this.info[file_uuid].status = 'uploading';
		
		this.fireEvent('progress', [file_uuid, this.info[file_uuid]]);
	},
	
	complete: function(file_uuid) {
		this.info[file_uuid].status = 'complete';
		
		this.fireEvent('complete', [file_uuid, this.info[file_uuid]]);
		delete this.requests[file_uuid];
		
		this.uploadsRunning--;
		
		if(this.uploadsRunning < 1) {
			this.fireEvent('end');
		}
	},
	
	info: function() {
		var dataSet = {
			files: this.info,
			progress: this.calculateProgress()
		};
		
		return dataSet;
	},
	
	calculateProgress: function() {
		var total = 0, position = 0;
		Object.values(this.info).each(function(file) {
			total += file.total;
			position += file.position;
		}.bind(this));
		
		return {'total': total, 'position': position, 'perc': parseInt(position / total * 100, 10).limit(0, 100)};
	}
	
});