/*
---

name: Request.File
description: Uploading files with FormData
license: MIT-style license.
authors: [Arian Stolwijk, Djamil Legato]
requires: [Request]
provides: Request.File
credits: https://gist.github.com/a77b537e729aff97429c

...
*/

(function(){

var progressSupport = ('onprogress' in new Browser.Request);

Request.File = new Class({
	
	Extends: Request,
	
	options: {
		emulation: false,
		urlEncoded: false		
	},
	
	initialize: function(options){
		this.xhr = new Browser.Request();
		this.formData = new FormData();
		this.setOptions(options);
		this.headers = this.options.headers;
	},
	
	append: function(key, value){
		if (typeof key == 'object'){
			if (key.constructor == File) return this.append('Filedata', key);
			for (var val in key) return this.append(val, key[val]);
		}

		this.formData.append(key, value);
		return this.formData;
	},
	
	reset: function(){
		this.formData = new FormData();
	},
	
	send: function(options){
		if (!this.check(options)) return this;
		
		console.log(this.formData);
		this.options.isSuccess = this.options.isSuccess || this.isSuccess;
		this.running = true;

		var type = typeOf(options);
		if (type == 'string' || type == 'element') options = {data: options};

		var old = this.options;
		options = Object.append({data: old.data, url: old.url, method: old.method}, options);
		var data = this.formData, url = String(options.url), method = options.method.toLowerCase();

		if (this.options.format){
			data.append('format', this.options.format);
		}
		
		if (this.options.emulation && !['get', 'post'].contains(method)){
			data.append('_method', method);
		}
		
		if (this.options.urlEncoded && ['post', 'put'].contains(method)){
			var encoding = (this.options.encoding) ? '; charset=' + this.options.encoding : '';
			this.headers['Content-type'] = 'application/x-www-form-urlencoded' + encoding;
		}

		if (!url) url = document.location.pathname;
		
		var trimPosition = url.lastIndexOf('/');
		if (trimPosition > -1 && (trimPosition = url.indexOf('#')) > -1) url = url.substr(0, trimPosition);

		if (this.options.noCache)
			url += (url.contains('?') ? '&' : '?') + String.uniqueID();

		if (data && method == 'get'){
			url += (url.contains('?') ? '&' : '?') + data;
			data = null;
		}

		var xhr = this.xhr;
		if (progressSupport){
			xhr.onloadstart = this.loadstart.bind(this);
			xhr.onprogress = this.progress.bind(this);
			xhr.upload.onprogress = this.progress.bind(this);
		}

		xhr.open(method.toUpperCase(), url, this.options.async, this.options.user, this.options.password);
		if (this.options.user && 'withCredentials' in xhr) xhr.withCredentials = true;
		
		xhr.onreadystatechange = this.onStateChange.bind(this);

		Object.each(this.headers, function(value, key){
			try {
				xhr.setRequestHeader(key, value);
			} catch (e){
				this.fireEvent('exception', [key, value]);
			}
		}, this);

		this.fireEvent('request');
		xhr.send(data);
		if (!this.options.async) this.onStateChange();
		if (this.options.timeout) this.timer = this.timeout.delay(this.options.timeout, this);
		return this;
	}
	
});


})();