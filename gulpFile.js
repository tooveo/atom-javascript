"use strict";

var gulp = require('gulp');
var concat = require('gulp-concat');
var minify = require('gulp-uglify');
var rename = require('gulp-rename');
var selfExecute = require('gulp-self-execute');
// var insert = require('gulp-insert');

gulp.task('js', function () {
  return gulp.src(['atom-sdk/src/*class.js', 'atom-sdk/src/lib/*.js'])
    .pipe(concat('sdk.js'))    
    .pipe(selfExecute())
    .pipe(gulp.dest('dist/'))
    .pipe(rename('sdk.min.js'))
    .pipe(minify())
    .pipe(gulp.dest('dist/'))
});

gulp.task('default', ['js'], function () {});
