var gulp = require('gulp'),
	zip = require('gulp-zip');

gulp.task('zipit', function(){
	var model = '/src';
	var path = process.cwd() + model;
	console.log(path);
	gulp.src('**/*', {cwd: path})
		.pipe(zip(model + '.zip'))
		.pipe(gulp.dest('./dist'));
});