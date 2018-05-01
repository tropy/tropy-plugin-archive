'use strict'

const common = require('rollup-plugin-commonjs')
const replace = require('rollup-plugin-replace')
const resolve = require('rollup-plugin-node-resolve')

module.exports = {
  input: './src/plugin.js',
  output: {
    file: 'bundle.js',
    format: 'cjs'
  },
  external: [
    'assert',
    'buffer',
    'constants',
    'crypto',
    'events',
    'fs',
    'os',
    'path',
    'stream',
    'string_decoder',
    'util',
    'zlib'
  ],
  plugins: [
    // replace `readable-stream` package dependency with node built-in `stream`
    replace({
      ['readable-stream']: "require('stream')",
      ['readable-stream/passthrough']: "require('stream').PassThrough",
      ['readable-stream/duplex']: "require('stream').Duplex",
      delimiters: ['require(\'', '\')']
    }),
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
