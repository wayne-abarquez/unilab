'use strict';

var path = require('path'),
    gulp = require('gulp'),
    args = require('yargs').argv;

var paths = gulp.paths,
    $ = require('gulp-load-plugins')();

gulp.task('vendor-scripts', function () {
    return gulp.src([
        paths.bower + 'jquery/dist/jquery.min.js',
        paths.bower + 'underscore/underscore-min.js',
        paths.bower + 'angular/angular.min.js',
        paths.bower + 'restangular/dist/restangular.min.js',
        paths.bower + 'angular-local-storage/dist/angular-local-storage.min.js',
        paths.bower + 'angular-animate/angular-animate.min.js',
        paths.bower + 'angular-aria/angular-aria.min.js',
        paths.bower + 'angular-cookies/angular-cookies.min.js',
        paths.bower + 'angular-sanitize/angular-sanitize.min.js',
        paths.bower + 'angular-material/angular-material.js',
        paths.bower + 'sweetalert/dist/sweetalert.min.js',
        paths.bower + 'ngSweetAlert/SweetAlert.min.js',
        paths.bower + 'v-accordion/dist/v-accordion.min.js',
        paths.bower + 'ng-file-upload/ng-file-upload.min.js',
        paths.bower + 'map-icons/dist/js/map-icons.js',
        paths.bower + 'angular-material-data-table/dist/md-data-table.min.js'
    ])
        .pipe($.plumber())
        .pipe($.concat('vendor.min.js'))
        .pipe($.if(args.production, $.uglify({mangle: false})))
        .pipe(gulp.dest(paths.destJs))
        .pipe($.size());
});

gulp.task('app-scripts', function () {
    return gulp.src([
        paths.srcJs + 'app/*.js',
        paths.srcJs + 'app/**/*.js'
    ])
        .pipe($.plumber())
        .pipe($.eslint())
        .pipe($.eslint.format())
        // Brick on failure to be super strict
        .pipe($.eslint.failOnError())
        .pipe($.ngAnnotate())
        .pipe($.angularFilesort())
        .pipe($.concat('app.min.js'))
        .pipe($.if(args.production, $.uglify()))
        .pipe($.if(args.production, $.jsObfuscator()))
        .pipe($.chmod(774))
        .pipe(gulp.dest(paths.destJs))
        .pipe($.size());
});

gulp.task('login-scripts', function () {
    return gulp.src([paths.srcLibJs + 'login.js',])
        .pipe($.eslint())
        .pipe($.eslint.format())
        .pipe($.ngAnnotate())
        .pipe($.concat('login.min.js'))
        .pipe($.uglify({mangle: true}).on('error', $.util.log))
        .pipe(gulp.dest(paths.destJs))
        .pipe($.size());
});

gulp.task('scripts', ['vendor-scripts', 'app-scripts', 'login-scripts']);
