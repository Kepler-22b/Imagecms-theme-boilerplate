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
var cached = require('gulp-cached');

var paths = {
    dist: 'dist',
    cssSrcArray: [
        '_src/scss/core/startup.scss',
        '_src/scss/**/*.scss'
    ],
    cssWorkWatch: [
        '_src/scss/blocks/**/*.scss',
        '_src/scss/globals/**/*.scss',
        '_src/scss/layout/**/*.scss'
    ],
    cssCoreWatch: '_src/scss/core/**/*.scss',
    cssDist: 'dist/css/'
};

gulp.task('css', function(){
    return gulp.src(paths.cssSrcArray)
        .pipe(cached('css'))
        .pipe(debug())
        .pipe(sass().on('error', sass.logError))
        .pipe(remember('css'))
        .pipe(concat('final.min.css'))
        /*
        .pipe(autoprefixer({
            browsers: ['last 2 versions', 'ie > 9', '> 2%']
        }))
        .pipe(cssnano())
        */
        .pipe(gulp.dest(paths.cssDist));
});

/* Deleting destination folder. Use before build task */
gulp.task('clear', function () {
    return del(paths.dist);
});

/* Watchers. Remove from cache deleted files */
gulp.task('watch', function () {
    gulp.watch(paths.cssWorkWatch, gulp.series('css')).on('unlink', function (filepath) {
        remember.forget('css', path.resolve(filepath));
    });
    gulp.watch(paths.cssCoreWatch, gulp.series('css')).on('change', function(){
        remember.forgetAll('css');
        delete cached.caches['css'];
    });
});