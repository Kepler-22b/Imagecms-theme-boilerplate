'use strict';

var gulp = require('gulp');
var del = require('del');
var sass = require('gulp-sass');
var debug = require('gulp-debug');
var concat = require('gulp-concat');
var remember = require('gulp-remember-history');
var path = require('path');
var cached = require('gulp-cached');

/* PostCSS plugins */
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');

var paths = {
    dist: 'dist',
    cssSrcArray: [
        '_src/scss/core/startup.scss',
        '_src/scss/**/*.scss'
    ],
    cssDist: 'dist/css/'
};



/* Compile CSS styles using Sass and PostCSS */
gulp.task('css', function(){
    
    var processors = [
        autoprefixer({browsers: ['last 2 versions', 'ie > 8', '> 1%']}),
        //cssnano()
    ]

    return gulp.src(paths.cssSrcArray)
        .pipe(cached('css'))
        .pipe(debug())
        .pipe(sass().on('error', sass.logError))
        .pipe(remember('css'))
        .pipe(concat('final.min.css'))
        .pipe(postcss(processors))
        .pipe(gulp.dest(paths.cssDist));
});



/* Deleting destination folder. Use before build task */
gulp.task('clear', function () {
    return del(paths.dist);
});



/* Watcher */
gulp.task('watch', function () {
    gulp.watch(paths.cssSrcArray, gulp.series('css'))
    .on('unlink', function (filepath) {
        /* Remove deleted file from history to clear it styles */
        remember.forget('css', path.resolve(filepath));
    })
    .on('change', function(filepath){
        var unixPath = filepath.split('\\').join('/');
        var fileNamePosition = unixPath.lastIndexOf('/');
        
        /* 
         * Clear history and cache if included file was changed
         * All Sass files starting with "_" included to other files
         * And we should rebuild styles to apply changes
         */
        if(unixPath[fileNamePosition+1] == '_'){
            remember.forgetAll('css');
            delete cached.caches['css'];
        }
    });
});