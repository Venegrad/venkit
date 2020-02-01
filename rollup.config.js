const isDev = process.env.NODE_ENV === 'development'
const isModern = process.env.BROWSERSLIST_ENV === 'modern'

const VuePlugin = require('rollup-plugin-vue')
const uglify = require('rollup-plugin-terser').terser
const nodeResolve = require('rollup-plugin-node-resolve')
const json = require('rollup-plugin-json')
const commonJs = require('rollup-plugin-commonjs')
const babel = require('rollup-plugin-babel')
const postcss = require('rollup-plugin-postcss')
const replace = require('rollup-plugin-replace')

module.exports = {
    input: './src/js/main.js',
    allowRealFiles: true,
    output: {
        file: isModern ? './dist/js/main.js' : './dist/js/main.legacy.js',
        format: 'iife',
        allowRealFiles: true
    },
    plugins: [
        replace({
            'process.env.NODE_ENV': JSON.stringify('development'),
            'process.env.VUE_ENV': JSON.stringify('browser')
        }), 
        commonJs({
            include: 'node_modules/**'
        }),
        VuePlugin(),
        nodeResolve({
            mainFields: ['module', 'main', 'jsnext:main']
        }),
        json(),
        postcss()
    ]
}

module.exports.plugins.push(
    babel({
        exclude: 'node_modules/**',
        externalHelpers: true,
        runtimeHelpers: true
    })
)

if ( ! isDev ) {
    module.exports.plugins = module.exports.plugins.concat([
        uglify()
    ])
}