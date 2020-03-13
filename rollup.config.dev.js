'use strict'

const common = require('rollup-plugin-commonjs')
const replace = require('rollup-plugin-replace')
const resolve = require('rollup-plugin-node-resolve')

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
    'rimraf',
    'util'
  ],
  plugins: [
    // circumvent circular dependency by removing globSync
    replace({
      ['./sync.js']: '{}',
      delimiters: ['require(\'', '\')'],
      include: 'node_modules/glob/glob.js'
    }),
    resolve(),
    common()
  ]
}
