'use strict'

const dev = require('./rollup.config.dev')
const { terser } = require('rollup-plugin-terser')


module.exports = {
  ...dev,
  plugins: [...dev.plugins, terser()]
}
