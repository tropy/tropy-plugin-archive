'use strict'
const { resolve } = require('path')

const defaultContext = {
  logger: {
    info: () => {},
    error: (err) => {
      throw err
    }
  },
  dialog: { save: () => {} }
}

const zipFile = resolve(__dirname, 'output.zip')

const defaultOptions = { zipFile }

function resolveFixturePaths(data) {
  data['@graph'].forEach((item) => {
    item['photo'].forEach(
      (photo) => (photo['path'] = resolve(__dirname, 'fixtures', photo['path']))
    )
  })
  return data
}

module.exports = { resolveFixturePaths, defaultContext, defaultOptions }
