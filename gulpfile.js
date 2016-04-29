'use strict';

var gulp = require('gulp');
var del = require('del');
var sass = require('gulp-sass');
var debug = require('gulp-debug');
var concat = require('gulp-concat');
var autoprefixer = require('gulp-autoprefixer');
var cssnano = require('gulp-cssnano');
var remember = require('gulp-remember-history');
var path = require('path');

var paths = {
    dist: 'dist',
    cssSrcArray: [
        '_src/scss/**/reset.scss',
        '_src/scss/**/base.scss',
        '_src/scss/**/*.scss'
    ],
    cssSrcWatch: '_src/scss/**/*.scss',
    cssDist: 'dist/css/'
};

gulp.task('css', function(){
    return gulp.src(paths.cssSrcArray, {since: gulp.lastRun('css')})
        .pipe(debug())
        .pipe(sass().on('error', sass.logError))
        .pipe(remember('css'))
        .pipe(concat('final.min.css'))
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ie > 9', '> 2%']
        }))
        .pipe(cssnano())
        .pipe(gulp.dest(paths.cssDist));
});

/* Deleting destination folder. Use before build task */
gulp.task('clear', function () {
    return del(paths.dist);
});

/* Watchers. Remove from cache deleted files */
gulp.task('watch', function () {
    gulp.watch(paths.cssSrcWatch, gulp.series('css')).on('unlink', function (filepath) {
        remember.forget('css', path.resolve(filepath));
    });
});