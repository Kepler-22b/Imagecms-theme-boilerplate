'use strict';

var gulp = require('gulp');
var del = require('del');
var sass = require('gulp-sass');
var debug = require('gulp-debug');
var concat = require('gulp-concat');
var remember = require('gulp-remember-history');
var path = require('path');
var cached = require('gulp-cached');
var browserSync = require('browser-sync');
var sourcemaps = require('gulp-sourcemaps');

/* PostCSS plugins */
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var stylelint = require('stylelint');
var reporter = require('postcss-browser-reporter');

var paths = {
    dist: '../dist',
    cssSrcArray: [
        'scss/core/startup.scss',
        'scss/**/*.scss'
    ],
    cssDist: '../dist/css/',
    tpls: '../**/*.tpl'
};

/* Compile CSS styles using Sass and PostCSS */
gulp.task('css', function(){
    
    var processors = {
        stream: [
            stylelint,
            reporter
        ],
        final: [
            autoprefixer({browsers: ['last 4 versions', 'ie > 8', '> 1%']}),
            cssnano
        ]
    };

    return gulp.src(paths.cssSrcArray)
        .pipe(sourcemaps.init())
        .pipe(cached('css'))
        .pipe(debug())
        .pipe(postcss(processors.stream))
        .pipe(sass().on('error', sass.logError))
        .pipe(remember('css'))
        .pipe(concat('final.min.css'))
        .pipe(postcss(processors.final))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.cssDist));
});


/* Deleting destination folder. Use before build task */
gulp.task('clear', function () {
    return del(paths.dist, {force: true});
});


/* Watcher */
gulp.task('watch', function () {

    gulp.watch(paths.cssSrcArray, gulp.series('css'))
        .on('unlink', function (filepath) {
            
            /* Remove deleted file from history to clear it styles */
            remember.forget('css', path.resolve(filepath));

        })
        .on('change', function(filepath){
            
            /* Files starting with "_" rebuild all styles without caching */
            var fileName = path.basename(filepath);
            
            if(fileName[0] == '_'){
                remember.forgetAll('css');
                delete cached.caches['css'];
            }

        });

});


/* Browser Sync with Watcher */
gulp.task('sync', gulp.parallel('watch', function () {
    
    /* Finding the name of fourth parent folder name. It's always project folder */
    var gulpFolderPath = process.cwd();
    var gulpFolderPathArr = gulpFolderPath.split(path.sep).reverse();
    var hostName = gulpFolderPathArr[3];
    
    browserSync.init({
        proxy: hostName
    });
    
    gulp.watch([paths.dist+'/**/*.*', paths.tpls]).on('change', browserSync.reload);

}));


/* Compile all final project files. Should be used before deploy */
gulp.task('build', gulp.series('clear', 'css'));