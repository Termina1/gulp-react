'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var react = require('react-tools');
var reactDomPragma = require('react-dom-pragma');
var applySourceMap = require('vinyl-sourcemaps-apply');

module.exports = function (options) {
	if(typeof(options) === 'undefined') {
		options = {};
	}
	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			cb(null, file);
			return;
		}

		if (file.isStream()) {
			cb(new gutil.PluginError('gulp-react', 'Streaming not supported'));
			return;
		}

		var str = file.contents.toString();
		var filePath = file.path;

		if (path.extname(filePath) === '.jsx') {
			str = reactDomPragma(str);
		}

		try {
			if(file.sourceMap) {
				options.sourceMap = true;
				options.filename = file.relative;
				options.sourceName = file.relative;
				options.sourceContent = true;
			}
			var result = react.transformWithDetails(str, options);
			if(file.sourceMap) {
				applySourceMap(file, result.sourceMap);
			}
			file.contents = new Buffer(result.code);
			file.path = filePath;
			cb(null, file);
		} catch (err) {
			cb(new gutil.PluginError('gulp-react', err, {
				fileName: filePath
			}));
		}
	});
};
