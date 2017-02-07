'use strict';

var reflexContext = function() {};

reflexContext.access = function(_opt){
	
	var getOption = function(_op){
		var o = {};
		if (_op.headers) o.headers = _op.headers;
		if (_op.data) o.body = _op.data;
		return o;
	};
	var option = getOption(_opt);

	return new Promise(function(resolve, reject){
		fetch(_opt.url, option).then(function(response) {
			if (response.ok) {
				return response.json();
			} else {
				reject(response);
			}
		}).then(function(json) {
			resolve(json);
		});
	});

};

reflexContext.get = function(_opt){
	_opt.method = 'GET';
	return reflexContext.access(_opt);
};
reflexContext.post = function(_opt){
	_opt.method = 'POST';
	return reflexContext.access(_opt);
};
reflexContext.put = function(_opt){
	_opt.method = 'PUT';
	return reflexContext.access(_opt);
};
reflexContext.delete = function(_opt){
	_opt.method = 'DELETE';
	return reflexContext.access(_opt);
};

module.exports = reflexContext; 
