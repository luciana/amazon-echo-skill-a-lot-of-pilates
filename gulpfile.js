var gulp = require('gulp'),
	zip = require('gulp-zip');

gulp.task('zipit', function(){
	var model = '/src';
	gulp.src('**/*', {cwd: process.cwd() + model})
		.pipe(zip(model + '.zip'))
		.pipe(gulp.dest('./'));
});