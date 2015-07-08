'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');

var server = require('./server/server');
var app = server.app;

gulp.task('lint', function() {
  return gulp.src(['server/*.js', 'server/*/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('serve', function(cb) {
  app.listen(8080, function(){
    console.log('Server running on 8080');
  });
});