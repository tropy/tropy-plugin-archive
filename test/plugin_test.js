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

const output = resolve(__dirname, 'output.zip')

describe('Plugin', () => {

  var data = require('./fixtures/items.json')
  data[0]['@graph'][0]['photo'][0]['path'] =
    resolve(__dirname, 'fixtures', 'items.json')

  it('smoke test', async () => {
    const Plugin = require('../src/plugin')

    const plugin = new Plugin({ output }, context)
    expect(await plugin.export(data)).to.be.undefined
  })
})

