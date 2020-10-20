const gulp = require("gulp");
const clean = require("gulp-clean");
const plumber = require("gulp-plumber");
const noop = require("gulp-noop");
const stylus = require("gulp-stylus");
const nib = require("nib");
const browserSync = require("browser-sync").create();
const pug = require("gulp-pug");
const prettyHtml = require("gulp-pretty-html");
const iconfont = require("gulp-iconfont");
const consolidate = require("gulp-consolidate");
const concat = require("gulp-concat");
const cssnano = require("gulp-cssnano");
const webp = require("gulp-webp");
const uglify = require("gulp-uglifyjs");
const tinypng = require("gulp-tinypng");
const tinypngFree = require("gulp-tinypng-free");
const svgo = require("gulp-svgo");
const webpack = require("webpack");
const webpackStream = require("webpack-stream");
const webpackConfig = require("./webpack.config");
const babel = require("gulp-babel");

const isDev = process.env.NODE_ENV === "development";

const srcPath = "./src/";
const dstPath = "./dist/";

const jsonSettings = "C:/Users/Venegrad/OneDrive/Work-cloud/settings.json";
let checkJson = 1;
let jsonSet = 0;

try {
  let fileJson = require(jsonSettings);
} catch (error) {
  console.log("file with ftp setting is empty or not exist");
  checkJson = 0;
}

if (checkJson == 1) {
  jsonSet = require(jsonSettings);
}

if (isDev) {
  gulp.task("serve", function () {
    browserSync.init({
      ui: false,
      open: true,
      notify: false,
      server: dstPath,
    });

    gulp.watch(srcPath + "fonts/**/*", gulp.series("build:fonts", "reload"));
    gulp.watch(srcPath + "styl/**/*", gulp.series("build:css"));
    gulp.watch(
      srcPath + "svg/**/*",
      gulp.series("build:icons", "build:css", "reload")
    );

    gulp.watch(
      [srcPath + "img/**/*.jpg", srcPath + "img/**/*.png"],
      gulp.series("build:webp", "reload")
    );
    gulp.watch(
      [
        srcPath + "img/**/*.webp",
        srcPath + "img/**/*.jpg",
        srcPath + "img/**/*.png",
        srcPath + "img/**/*.gif",
        srcPath + "img/**/*.mp4",
      ],
      gulp.series("build:img", "reload")
    );
    gulp.watch(srcPath + "img/**/*.svg", gulp.series("build:svg", "reload"));
    gulp.watch(srcPath + "js/**/*.js", gulp.series("build:js", "reload"));
    gulp.watch(srcPath + "php/**/*.php", gulp.series("build:php", "reload"));
    gulp.watch(srcPath + "pug/**/*.pug", gulp.series("build:html", "reload"));
    gulp.watch(
      srcPath + "vendor/**/*",
      gulp.series("build:js", "build:css", "reload")
    );
    gulp.watch(srcPath + "static/**/*", gulp.series("build:static", "reload"));
  });

  gulp.task("reload", function (done) {
    browserSync.reload();
    done();
  });
}

gulp.task("build:img", function () {
  return gulp
    .src([
      srcPath + "img/**/*.webp",
      srcPath + "img/**/*.jpg",
      srcPath + "img/**/*.png",
      srcPath + "img/**/*.gif",
      srcPath + "img/**/*.mp4",
    ])
    .pipe(gulp.dest(dstPath + "img"));
});

gulp.task("build:svg", function () {
  return gulp
    .src([srcPath + "img/**/*.svg"])
    .pipe(svgo())
    .pipe(gulp.dest(dstPath + "img"));
});

gulp.task("build:webp", function () {
  return gulp
    .src([srcPath + "img/**/*.jpg", srcPath + "img/**/*.png"])
    .pipe(webp())
    .pipe(gulp.dest(dstPath + "img"));
});

gulp.task("tinypng", function () {
  return gulp
    .src([srcPath + "img/**/*.jpg", srcPath + "img/**/*.png"])
    .pipe(tinypng("Qeef9DZ7IRt3B-vtrOWCZBPqT8eN6ciE"))
    .pipe(gulp.dest(srcPath + "img"));
});

gulp.task("tinypngfree", function (cb) {
  return gulp
    .src([srcPath + "img/**/*.jpg", srcPath + "img/**/*.png"])
    .pipe(tinypngFree({}))
    .pipe(gulp.dest(srcPath + "img"));
});

gulp.task("build:php", function () {
  return gulp.src(srcPath + "php/**/*").pipe(gulp.dest(dstPath));
});

gulp.task("build:fonts", function () {
  return gulp.src(srcPath + "fonts/**/*").pipe(gulp.dest(dstPath + "fonts"));
});

gulp.task("build:static", function () {
  return gulp.src(srcPath + "static/**/*").pipe(gulp.dest(dstPath + "static"));
});

gulp.task("build:js", function () {
  return gulp
    .src(srcPath + "js/main.js")
    .pipe(plumber())
    .pipe(webpackStream(webpackConfig, webpack))
    .on("error", function handleError() {
      this.emit("end"); // Recover from errors
    })
    .pipe(babel())
    .pipe(isDev ? noop() : uglify())
    .pipe(gulp.dest(dstPath + "js"));
});

gulp.task("build:css", function () {
  return gulp
    .src(srcPath + "styl/framework/main.styl")
    .pipe(plumber())
    .pipe(
      stylus({
        use: nib(),
        "include css": true,
        import: ["nib"],
        compress: false,
      })
    )
    .pipe(
      isDev
        ? noop()
        : cssnano({
            discardComments: {
              removeAll: true,
            },
          })
    )
    .pipe(gulp.dest(dstPath + "css"))
    .pipe(isDev ? browserSync.stream() : noop());
});

gulp.task("build:html", function () {
  return gulp
    .src(srcPath + "pug/*.pug")
    .pipe(plumber())
    .pipe(pug())
    .pipe(prettyHtml())
    .pipe(gulp.dest(dstPath));
});

gulp.task("build:icons", function () {
  return gulp
    .src(srcPath + "svg/*.svg")
    .pipe(
      iconfont({
        fontName: "icons",
        prependUnicode: false,
        formats: ["ttf", "eot", "woff"],
        normalize: true,
        fontHeight: 1000,
        timestamp: Math.round(Date.now() / 1000),
      })
    )
    .on("glyphs", function (glyphs, options) {
      gulp
        .src(srcPath + "svg/template/icons.styl")
        .pipe(
          consolidate("lodash", {
            glyphs: glyphs,
            fontName: options.fontName,
            fontHeight: 1000,
            fontPath: "../fonts/",
            className: "i",
          })
        )
        .pipe(gulp.dest(srcPath + "styl/framework/"));
    })
    .pipe(gulp.dest(dstPath + "fonts/"));
});

gulp.task("clean", function () {
  return gulp
    .src(dstPath, {
      read: false,
      allowEmpty: true,
    })
    .pipe(clean());
});

gulp.task(
  "build",
  gulp.series(
    "clean",
    "build:icons",
    "build:js",
    "tinypngfree",
    "build:img",
    "build:webp",
    "build:svg",
    "build:php",
    "build:static",
    "build:css",
    "build:html",
    "build:fonts"
  )
);

// start
defaultTask = ["clean", "build"];
if (isDev) defaultTask.push("serve");
gulp.task("default", gulp.series(defaultTask));
