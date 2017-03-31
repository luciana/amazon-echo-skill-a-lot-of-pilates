var gulp = require('gulp'),
	zip = require('gulp-zip'),
	gutil = require('gulp-util'),
	deploy = require('gulp-deploy-git'),
	lambda = require('gulp-awslambda');

var localConfig = {
  src: './src',
  env: 'dev',
  func: 'ALOP-Pilates-Class-DEV',
  dest: './dist/dev',
  config: 'environment/dev/config.js',
  cwd: process.cwd() + '/src'
};

gulp.task('setup', function(){
	var env, i = process.argv.indexOf("--env");
	if(i>-1) {
		env = process.argv[i+1];

	}else {
		env = 'dev';
	}

	var branch, j = process.argv.indexOf("--branch");
	if(j>-1) {
		branch = process.argv[j+1];
	}else {
		branch = 'develop';
	}

	localConfig.env = env;
	localConfig.config = 'environment/'+env+'/config.js';
	localConfig.func = 'ALOP-Pilates-Class-DEV';
	localConfig.dest = './dist/'+env;
	localConfig.branch = branch;
	gutil.log('setup:', gutil.colors.magenta(localConfig.env));
});

gulp.task('copy', function () {
	gutil.log('copy config', gutil.colors.magenta(localConfig.config));
	gulp.src(localConfig.config)
        .pipe(gulp.dest('./src'));
});


gulp.task('zip', function(){
	gutil.log('zip package', localConfig.func);
	gulp.src('**/*', {cwd: localConfig.cwd})
		.pipe(zip(localConfig.src + '.zip'))
		.pipe(gulp.dest(localConfig.dest));
});

gulp.task('aws', ['setup'], function(){
	gutil.log('package to lambda', localConfig.func);
	gulp.src('**/*', {cwd: localConfig.cwd})		
		.pipe(zip(localConfig.src + '.zip'))
		.pipe(gulp.dest(localConfig.dest))
		.pipe(lambda(localConfig.func, {profile: 'default'}));
});

gulp.task('checkin', function() {
	gutil.log('check in to git branch', gutil.colors.magenta(localConfig.branch));
	return gulp.src('/src')
		.pipe(deploy({repository: 'https://github.com/luciana/amazon-echo-skill-a-lot-of-pilates.git',
						branches:   [localConfig.branch]}));
	
});

gulp.task('build', ['setup', 'copy']);
gulp.task('deploy', ['aws']);
