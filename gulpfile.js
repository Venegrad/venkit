const gulp = require('gulp')
const clean = require('gulp-clean')
const plumber = require('gulp-plumber')
const noop = require('gulp-noop')
const stylus = require('gulp-stylus')
const nib = require('nib')
const browserSync = require('browser-sync').create()
const pug = require('gulp-pug')
const prettyHtml = require('gulp-pretty-html')
const iconfont = require('gulp-iconfont')
const consolidate = require('gulp-consolidate')
const concat = require('gulp-concat')
const cssnano = require('gulp-cssnano')
const uglify = require('gulp-uglifyjs')
const imagemin = require('gulp-imagemin')
const tinypng = require('gulp-tinypng')
const log = require('fancy-log')
const isDev = process.env.NODE_ENV === 'development'

const srcPath = './src/'
const dstPath = './dist/'

const jsonSettings = 'C:/Users/Venegrad/OneDrive/Work-cloud/settings.json';
let checkJson = 1;
let jsonSet = 0;


try {
  let fileJson = require(jsonSettings);
} catch (error) {
  console.log('file with ftp setting is empty or not exist');
  checkJson = 0;
}

if(checkJson == 1) {
  jsonSet = require(jsonSettings);
}



if ( isDev ) {
  gulp.task('serve',  function() {

    browserSync.init({
      ui: false,
      open: true,
      notify: false,
      server: dstPath
    })

    gulp.watch(srcPath+'fonts/**/*', gulp.series('build:fonts', 'reload'))
    gulp.watch(srcPath+'styl/**/*', gulp.series('build:css'))
    gulp.watch(srcPath+'svg/**/*', gulp.series('build:icons', 'build:css', 'reload'))
    gulp.watch(srcPath+'img/**/*', gulp.series('build:img', 'reload'))
    gulp.watch(srcPath+'js/**/*.js', gulp.series('build:js', 'reload'))
    gulp.watch(srcPath+'php/**/*.php', gulp.series('build:php', 'reload'))
    gulp.watch(srcPath+'pug/**/*.pug', gulp.series('build:html', 'reload'))
    gulp.watch(srcPath+'vendor/**/*', gulp.series('build:js', 'build:css', 'reload'))
    gulp.watch(srcPath+'static/**/*', gulp.series('build:static', 'reload'))

  })

  gulp.task('reload', function(done) { browserSync.reload(); done() })
}


const imageminOptions = {
  verbose: true,
  interlaced: true,
  progressive: true,
  optimizationLevel: 5,
  plugins: [
    imagemin.gifsicle({interlaced: true}),
    imagemin.jpegtran({progressive: true}),
    imagemin.optipng({optimizationLevel: 5}),
    imagemin.svgo({plugins: [{removeViewBox: true},{cleanupIDs: false}]})
  ]
}

gulp.task('build:img', function() {
  return gulp.src(srcPath+'img/**/*')
    .pipe( isDev ? noop() : imagemin(imageminOptions))
    .pipe( gulp.dest(dstPath+'img'))
})



gulp.task('tinypng', function () {
  return gulp.src(srcPath+'img/**/*')
      .pipe(tinypng(jsonSet.tinypngkey))
      .pipe(gulp.dest(srcPath+'img'));
});

gulp.task('build:php', function() {
  return gulp.src(srcPath+'php/**/*')
    .pipe( gulp.dest(dstPath))
})

gulp.task('build:fonts', function() {
  return gulp.src(srcPath+'fonts/**/*')
  .pipe( gulp.dest(dstPath+'fonts'))
})

gulp.task('build:static', function() {
  return gulp.src(srcPath+'static/**/*')
  .pipe( gulp.dest(dstPath+'static'))
})

gulp.task('build:js', function(){
  return gulp.src([srcPath+'vendor/**/*.js', srcPath+'js/*.js'])
    .pipe( plumber() )
    .pipe(concat('main.js'))
    .pipe( isDev ? noop() : uglify() )
    .pipe( gulp.dest(dstPath+'js') )
})

gulp.task('build:css', function(){
  return gulp.src(srcPath+'styl/framework/main.styl')
    .pipe( plumber() )
    .pipe( stylus({ use: nib(), 'include css': true, import: ['nib'], compress: false }) )
    .pipe( isDev ? noop() : cssnano({discardComments: {removeAll: true}}) )
    .pipe( gulp.dest(dstPath+'css') )
    .pipe( isDev ? browserSync.stream() : noop() )
})

gulp.task('build:html', function(){
  return gulp.src(srcPath+'pug/*.pug')
    .pipe( plumber() )
    .pipe( pug() )
    .pipe( prettyHtml() )
    .pipe( gulp.dest(dstPath) )
})

gulp.task('build:icons', function(){
    return gulp.src(srcPath+'svg/*.svg')
      .pipe(iconfont({
        fontName: 'icons',
        prependUnicode: false,
        formats: ['ttf', 'eot', 'woff'],
        normalize: true,
        fontHeight: 1000,
        timestamp: Math.round(Date.now()/1000)
    }))
    .on('glyphs', function(glyphs, options) {
      gulp.src(srcPath+'svg/template/icons.styl')
        .pipe( consolidate('lodash', {
          glyphs: glyphs,
          fontName: options.fontName,
          fontHeight: 1000,
          fontPath: '../fonts/',
          className: 'i'
        }) )
        .pipe( gulp.dest(srcPath+'styl/framework/') )
    })
    .pipe(gulp.dest(dstPath+'fonts/'));
})


gulp.task('clean', function(){
  return gulp.src(dstPath, { read: false, allowEmpty: true })
    .pipe( clean() )
})

gulp.task('build', gulp.series('clean', 'build:icons', 'build:js', 'build:img', 'build:php', 'build:static', 'build:css', 'build:html', 'build:fonts') )
gulp.task('build:final', gulp.series('tinypng', 'build'))


// start
defaultTask = ['clean', 'build']
if ( isDev ) defaultTask.push('serve')
gulp.task('default', gulp.series(defaultTask) )
