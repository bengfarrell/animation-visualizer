var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var buffer = require('vinyl-buffer');
var ghPages = require('gulp-gh-pages');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var runSequence = require('run-sequence');
var replace = require('gulp-replace');


/**
 * don't include module loading, let consumer use their own build process
 */
gulp.task('dependencies', function() {
    return gulp.src([
        './node_modules/macgyvr/macgyvr-full.js',
        './node_modules/@webcomponents/custom-elements/custom-elements.min.js',
        './src/components/aviz-nodes-list/aviz-nodes-list.js',
        './src/components/aviz-playback-controls/aviz-playback-controls.js',
        './src/components/aviz-sample-gltfs/aviz-sample-gltfs.js',
        './src/components/aviz-scene-info/aviz-scene-info.js',
        './src/components/aviz-timeline/aviz-timeline.js'
    ])
        .pipe(concat('libs.js'))
        .pipe(gulp.dest('./'));
});

gulp.task('css', function() {
    return gulp.src([
        './src/components/aviz-nodes-list/aviz-nodes-list.css',
        './src/components/aviz-playback-controls/aviz-playback-controls.css',
        './src/components/aviz-sample-gltfs/aviz-sample-gltfs.css',
        './src/components/aviz-scene-info/aviz-scene-info.css',
        './src/components/aviz-timeline/aviz-timeline.css',
        './src/main.css'
    ])
        .pipe(replace(/..\/..\/..\//g, './'))
        .pipe(concat('build.css'))
        .pipe(gulp.dest('./'));
});

gulp.task('app', function() {
    return browserify({
        entries: './src/app.js',
        standalone: 'App',
        cache: {},
        packageCache: {},
        extensions: ['es2015'], debug: true})
        .transform(babelify)
        .bundle()
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./'));
});

gulp.task('default', function() {
    runSequence( ['app', 'dependencies', 'css']);
});

