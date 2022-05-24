'use strict'

const { expect } = require('chai')
const {
  resolveFixturePaths,
  defaultContext,
  defaultOptions
} = require('./helpers')
const Plugin = require('../src/plugin')

describe('Plugin', () => {
  it('exists', () => {
    expect(typeof Plugin).to.equal('function')
  })

  it('responds to export hook', () => {
    expect(new Plugin({}, defaultContext)).to.respondTo('export')
  })

  it('does not respond to import hook', () => {
    expect(new Plugin({}, defaultContext)).to.not.respondTo('import')
  })

  it('smoke test', async () => {
    let data = require('./fixtures/items.json')[0]
    resolveFixturePaths(data)
    const plugin = new Plugin(defaultOptions, defaultContext)
    expect(await plugin.export(data)).to.be.undefined
  })
})
