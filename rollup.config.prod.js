'use strict'

const dev = require('./rollup.config.dev')
const uglify = require('rollup-plugin-uglify')


module.exports = Object.assign({}, dev, {
  plugins: dev.plugins.concat(uglify())
})
