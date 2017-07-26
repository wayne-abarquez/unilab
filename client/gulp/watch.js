'use strict';

var gulp = require('gulp'),
    paths = gulp.paths;

var //browserSync = require('browser-sync'),
    runSequence = require('run-sequence');

//browserSync({
//    notify: true,
//    proxy: "127.0.0.1:80"
//});

gulp.task('watch', function(event) {
    // Watch HTML Files
    gulp.watch(paths.templates + '**/*.html',
        function (event) {
            //browserSync.reload(event.path);
        });

    // Watch App JS Files
    gulp.watch([
        paths.srcJs + 'app/*.js',
        paths.srcJs + 'app/**/*.js'
    ], function (event) {
        runSequence('app-scripts');
    });

    gulp.watch([
        paths.bower + '**/*.js',
        paths.srcLibJs + '*.js'
    ], function (event) {
        runSequence('vendor-scripts');
    });

    // Watch Sass Files
    gulp.watch(paths.srcSass + '**/*.scss',
        function (event) {
            runSequence('sass');
        });
});