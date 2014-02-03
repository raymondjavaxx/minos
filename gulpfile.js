var pkg     = require('./package.json');
var gulp    = require('gulp');
var gutil   = require('gulp-util');
var uglify  = require('gulp-uglify');
var rename  = require("gulp-rename");
var header  = require('gulp-header');
var jshint  = require('gulp-jshint');
var stylish = require('jshint-stylish');

gulp.task('lint', function () {
  gulp.src('./src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish));
});

gulp.task('build', function () {
  gulp.src('./src/*.js')
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(header('/*! <%= pkg.name %> v<%= pkg.version %> */\n', {pkg: pkg}))
    .pipe(gulp.dest('./dist'));
});

gulp.task('watch', function () {
  gulp.watch('./src/**/*.js', ['lint', 'build']);
});

gulp.task('default', function () {
  gulp.start('lint', 'build');
});
