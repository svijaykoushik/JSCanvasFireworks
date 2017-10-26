var gulp = require('gulp'),
inject = require('gulp-inject'),
serve = require('gulp-webserver');
/**
 * Task to copy the file to debug folder
 */
gulp.task('copy',function(){
    return gulp.src("canvasFireworks.js").pipe(gulp.dest("debug/"));
});
/**
 * Task to inject the copied file into html file in debug directory
 */
gulp.task('inject',['copy'],function(){
    return gulp.src("./debug/index.html")
    .pipe(inject(gulp.src("./debug/canvasFireworks.js"),{relative:true}))
    .pipe(gulp.dest("./debug"));
});
/**
 * Set up webserver to debug the code
 */
gulp.task('serveLocally', ['inject'],function(){
    return gulp.src("./debug")
    .pipe(serve({
        port:3000,
        liveReload: true
    }));
});