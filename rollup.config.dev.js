'use strict'

const common = require('@rollup/plugin-commonjs')
const resolve = require('@rollup/plugin-node-resolve').default

module.exports = {
  input: './src/index.js',
  output: {
    file: 'bundle.js',
    format: 'cjs'
  },
  external: [
    'assert',
    'child_process',
    'events',
    'fs',
    'os',
    'path',
    'util'
  ],
  plugins: [
    resolve(),
    common()
  ]
}
