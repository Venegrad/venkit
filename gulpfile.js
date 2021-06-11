// Settings
const srcPath = "./src/";
const dstPath = "./dist/";





// Start Functions
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
const cssnano = require("gulp-cssnano");
const tinypngFree = require("gulp-tinypng-free");
const svgo = require("gulp-svgo");
const webpack = require("webpack");
const gutil = require("gulp-util");
const notifier = require("node-notifier");
const TerserPlugin = require("terser-webpack-plugin");
const path = require("path");

const isDev = process.env.NODE_ENV === "development";

const statsLog = {
  colors: true,
  reasons: true,
};

const optimization = function () {
  const config = {
    splitChunks: {
      chunks: "all",
      name: "vendor",
    },
  };
  if (!isDev) {
    config.minimizer = [new TerserPlugin()];
  }
  return config;
};

const webpackConfig = {
  devtool: isDev ? "eval-source-map" : false,
  mode: isDev ? "development" : "production",
  target: isDev ? "web" : "browserslist",
  entry: {
    main: ["@babel/polyfill", "./src/js/main.js"],
  },

  performance: {
    hints: false,
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist/js"),
  },
  optimization: optimization(),
  module: {
    rules: [
      {
        test: /\.(js)$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  plugins: [
    // new webpack.ProvidePlugin({
    //   $: "jquery",
    //   jQuery: "jquery",
    //   "window.jQuery": "jquery",
    // }),
  ],
};


if (isDev) {

  gulp.task("serve", function () {
    browserSync.init({
      ui: false,
      open: true,
      notify: false,
      server: dstPath
    });

    gulp.watch(
      [srcPath + "fonts/**/*"],
      gulp.series("copy:fonts", "reload")
    );

    gulp.watch(
      [srcPath + "styl/**/*", srcPath + "styl/node_vendors.json"],
      gulp.series("build:css")
    );

    gulp.watch(
      srcPath + "svg/**/*",
      gulp.series("build:icons", "build:css", "reload")
    );

    gulp.watch(
      [
        srcPath + "img/**/*.webp",
        srcPath + "img/**/*.gif",
        srcPath + "img/**/*.mp4",
      ],
      gulp.series("copy:assets", "reload")
    );

    gulp.watch(
      [srcPath + "img/**/*.jpg", srcPath + "img/**/*.png"],
      gulp.series("build:img", "reload")
    );

    gulp.watch(srcPath + "img/**/*.svg", gulp.series("build:svg", "reload"));
    gulp.watch(srcPath + "js/**/*.js", gulp.series("build:js", "reload"));
    gulp.watch(srcPath + "pug/**/*.pug", gulp.series("build:html", "reload"));
    gulp.watch(srcPath + "static/**/*", gulp.series("build:static", "reload"));
  });

  gulp.task("reload", function (done) {
    browserSync.reload();
    done();
  });
}

gulp.task("build:svg", function () {
  return gulp
    .src([srcPath + "img/**/*.svg"])
    .pipe(svgo())
    .pipe(gulp.dest(dstPath + "img"));
});

gulp.task("build:img", function () {
  return gulp
    .src([srcPath + "img/**/*.jpg", srcPath + "img/**/*.png"])
    .pipe(gulp.dest(dstPath + "img"));
});

gulp.task("copy:assets", function () {
  return gulp
    .src([
      srcPath + "img/**/*.webp",
      srcPath + "img/**/*.mp4",
      srcPath + "img/**/*.gif",
    ])
    .pipe(gulp.dest(dstPath + "img"));
});

gulp.task("copy:fonts", function () {
  return gulp
    .src(srcPath + "fonts/**/*")
    .pipe(gulp.dest(dstPath + "fonts"));
});

gulp.task("build:static", function () {
  return gulp.src(srcPath + "static/**/*").pipe(gulp.dest(dstPath + "static"));
});

gulp.task("build:js", function (done) {
  // run webpack
  webpack(webpackConfig, onComplete);
  function onComplete(error, stats) {
    if (error) {
      // кажется еще не сталкивался с этой ошибкой
      onError(error);
    } else if (stats.hasErrors()) {
      // ошибки в самой сборке, к примеру "не удалось найти модуль по заданному пути"
      onError(stats.toString(statsLog));
    } else {
      onSuccess(stats.toString(statsLog));
    }
  }
  function onError(error) {
    let formatedError = new gutil.PluginError("webpack", error);
    notifier.notify({
      // чисто чтобы сразу узнать об ошибке
      title: `Error: ${formatedError.plugin}`,
      message: formatedError.message,
    });
    done(formatedError);
  }
  function onSuccess(detailInfo) {
    gutil.log("[webpack]", detailInfo);
    done();
  }
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
        compress: !isDev,
      })
    )
    .pipe(
      isDev
        ? noop()
        : cssnano({
            discardComments: {
              removeAll: true,
            },
            autoprefixer: {
              remove: false,
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
        formats: ["woff", "woff2"],
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
    "copy:assets",
    "build:img",
    "build:svg",
    "build:static",
    "build:css",
    "build:html",
    "copy:fonts"
  )
);

// start
defaultTask = ["clean", "build"];
if (isDev) defaultTask.push("serve");
gulp.task("default", gulp.series(defaultTask));
