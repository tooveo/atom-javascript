"use strict";

var gulp = require('gulp');
var concat = require('gulp-concat');
var minify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('js', function () {
  return gulp.src('atom-sdk/src/*.js')
    .pipe(concat('sdk.js'))
    .pipe(gulp.dest('dist/'))
    .pipe(rename('sdk.min.js'))
    .pipe(minify())
    .pipe(gulp.dest('dist/'))
});

gulp.task('default', ['js'], function () {
});