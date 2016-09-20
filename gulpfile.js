'use strict';

var gulp = require('gulp'),
    debug = require('gulp-debug'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    clean = require('gulp-clean'),
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
    concat = require('gulp-concat'),
    rimraf = require('rimraf'),
    newer = require('gulp-newer'),
    remember = require('gulp-remember'),
    cache = require('gulp-cached'),
    notify = require("gulp-notify"),
    plumber = require('gulp-plumber');

var path = {
    build: {
        html: './build/',
        php: './build/',
        js: './build/js/',
        libs: './build/libs/',
        css: './build/css/',
        img: './build/img/',
        fonts: './build/fonts/'
    },
    src: {
        html: './src/*.html',
        php: './src/*.php',
        js: './src/js/main.js',
        libs: './src/libs/**/*.*',
        style: './src/style/main.scss',
        img: './src/img/**/*.*',
        fonts: './src/fonts/**/*.*'
    },
    watch: {
        html: './src/**/*.html',
        js: './src/js/**/*.js',
        style: './src/style/**/*.scss',
        img: './src/img/**/*.*',
        fonts: './src/fonts/**/*.*'
    },
    clean: './build'
};

var config = {
    server: {
        baseDir: "./build"
    },
    tunnel: false,
    host: 'localhost',
    port: 9000,
    logPrefix: "gorbuz9kin"
};

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('html:build', function () {
    return gulp.src(path.src.html)
        .pipe(newer(path.build.html))
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('php:build', function () {
    gulp.src(path.src.php)
        .pipe(newer(path.build.php))
        .pipe(gulp.dest(path.build.php))
        .pipe(reload({stream: true}));
});


gulp.task('js:build', function () {
    gulp.src(path.src.js) 
        .pipe(rigger())
        .pipe(uglify('main.min.js', {
                outSourceMap: true
            }))
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('libs:build', function () {
    gulp.src(path.src.libs)
        .pipe(newer(path.build.libs))
        .pipe(gulp.dest(path.build.libs))
        .pipe(reload({stream: true}));
});

gulp.task('style:build', function () {
    return gulp.src(path.src.style)
        /*.pipe(cache('style:build'))*/
	    .pipe(plumber({errorHandler:
		    notify.onError(function (err) {
			    return {
				    title: 'style:build',
				    message: err.message
			    };
		    })
	    }))
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: ['./src/style/'],
            outputStyle: 'compressed',
            sourceMap: true,
            errLogToConsole: true
        }))
        .pipe(prefixer())
        .pipe(remember('style:build'))
        .pipe(cssmin({
            keepSpecialComments: 0
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function () {
    gulp.src(path.src.img)
        .pipe(newer(path.build.img))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(reload({stream: true}));
});

gulp.task('fonts:build', function() {
    gulp.src(path.src.fonts)
        .pipe(newer(path.build.fonts))
        .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', [
    'html:build',
    'php:build',
    'js:build',
    'libs:build',
    'style:build',
    'fonts:build',
    'image:build'
]);


gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:build');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:build');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:build');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:build');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:build');
    });
});

gulp.task('clean', function () {
    return gulp.src('build', {read: false})
    .pipe(clean());
});
   

gulp.task('default', ['build', 'webserver', 'watch']);