'use strict'

const { expect } = require('chai')
const { resolve } = require('path')


const context = {
  logger: {
    info: () => {},
    error: (err) => { throw err }
  },
  dialog: { save: () => { } }
}

const zipFile = resolve(__dirname, 'output.zip')

describe('Plugin', () => {

  var data = require('./fixtures/items.json')[0]
  data['@graph'][0]['photo'][0]['path'] =
    resolve(__dirname, 'fixtures', 'items.json')

  it('smoke test', async () => {
    const Plugin = require('../src/plugin')
    const plugin = new Plugin({ zipFile }, context)
    expect(await plugin.export(data)).to.be.undefined
  })
})
