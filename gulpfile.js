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

var paths = {
    dist: 'dist',
    cssSrcArray: [
        '_src/scss/core/startup.scss',
        '_src/scss/**/*.scss'
    ],
    cssDist: 'dist/css/',
    tpls: '**/*.tpl'
};

/* Compile CSS styles using Sass and PostCSS */
gulp.task('css', function(){
    
    var processors = [
        autoprefixer({browsers: ['last 2 versions', 'ie > 8', '> 1%']}),
        //cssnano()
    ]

    return gulp.src(paths.cssSrcArray)
        .pipe(sourcemaps.init())
        .pipe(cached('css'))
        .pipe(debug())
        .pipe(sass().on('error', sass.logError))
        .pipe(remember('css'))
        .pipe(concat('final.min.css'))
        .pipe(postcss(processors))
        .pipe(sourcemaps.write('.'))
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
    
    /* Finding the name of third parent folder name. It's always project folder */
    var gulpFolderPath = process.cwd();
    var gulpFolderPathArr = gulpFolderPath.split(path.sep).reverse();
    var hostName = gulpFolderPathArr[2];
    
    browserSync.init({
        proxy: hostName
    });
    
    gulp.watch([paths.dist+'/**/*.*', paths.tpls]).on('change', browserSync.reload);

}));


/* Compile all final project files. Should be used before deploy */
gulp.task('build', gulp.series('clear', 'css'));