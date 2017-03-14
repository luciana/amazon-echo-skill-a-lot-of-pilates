var gulp = require('gulp'),
	zip = require('gulp-zip'),
	lambda = require('gulp-awslambda');


gulp.task('deploy', function(){
	var model = '/src';
	var path = process.cwd() + model;
	var type = "ALOP-Pilates-Class-DEV";
	var env, i = process.argv.indexOf("--env");
	if(i>-1) {
		env = process.argv[i+1];

	}else {
		env = 'prod';
	}
	process.env.NODE_ENV = env;	
	gulp.src('./enviroment/'+env+'.js')
        .pipe(gulp.dest('./src/config.js'));

	gulp.src('**/*', {cwd: path})
		.pipe(zip(model + '.zip'))	
		.pipe(gulp.dest('./dist/'+env))
		.pipe(lambda(type, {profile: 'default'}));
});


gulp.task('prod-deploy', function(){
	var model = '/src';
	var path = process.cwd() + model;	
	gulp.src('**/*', {cwd: path})
		.pipe(zip(model + '.zip'))
		.pipe(gulp.dest('./dist/prod'))
		.pipe(lambda("ALOP-Pilates-Class-DEV", {profile: 'default'}));
});

