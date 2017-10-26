var gulp = require('gulp'),
inject = require('gulp-inject'),
serve = require('gulp-webserver');
/**
 * Task to copy the file to debug folder
 */
gulp.task('copy',function(){
    return gulp.src("canvasFireworks.js").pipe("debug/");
});
/**
 * Task to inject the copied file into html file in debug directory
 */
gulp.task('inject',['copy'],function(){
    return gulp.src("debug/index.html")
    .pipe(inject("./debug/canvasFireworks.js",{relative:true}))
    .pipe(gulp.dest("/debug/index.html"));
});
/**
 * Set up webserver to debug the code
 */
gulp.task('serveLocally', ['inject'],function(){
    return gulp.src("/debug/")
    .pipe(webserver({
        port:8081,
        liveReload: true
    }));
});