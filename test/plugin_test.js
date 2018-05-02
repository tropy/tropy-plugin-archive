'use strict'

const { expect } = require('chai')
const { resolve } = require('path')

const context = {
  logger: {
    info: () => {},
    error: (err) => { throw err }
  },
  require
}

describe('Plugin', () => {
  const Plugin = require('../src/plugin')

  var data = require('./fixtures/items.json')
  data[0]['@graph'][0]['photo'][0]['path'] =
    resolve(__dirname, 'fixtures', 'items.json')

  it('with `config.output`', async () => {
    const config = {
      output: resolve(__dirname, 'output.zip')
    }
    const plugin = new Plugin(config, context)
    expect(await plugin.export(data)).to.be.undefined
  })
})

