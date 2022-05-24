'use strict'

const { expect } = require('chai')
const {
  resolveFixturePaths,
  defaultContext,
  defaultOptions
} = require('./helpers')
const sinon = require('sinon')
const fs = require('fs')

describe('Plugin export function', async () => {
  const copyFileSpy = sinon.spy(fs.promises, 'copyFile')
  const writeFileSpy = sinon.spy(fs.promises, 'writeFile')

  let data
  const Plugin = require('../src/plugin')
  const plugin = new Plugin(defaultOptions, defaultContext)

  beforeEach(async () => {
    const input = require('./fixtures/items.json')[0]
    data = JSON.parse(JSON.stringify(input))
    // ^^ otherwise things get mutated between tests
    resolveFixturePaths(data)
    writeFileSpy.resetHistory()
    copyFileSpy.resetHistory()
  })

  it('copies each referenced file exactly once', async () => {
    await plugin.export(data)

    expect(copyFileSpy.calledThrice).to.be.true
  })

  it('copies files with the correct names', async () => {
    await plugin.export(data)

    expect(copyFileSpy.getCall(0).args[0]).to.have.string(
      data['@graph'][0]['photo'][0]['path']
    )
    expect(copyFileSpy.getCall(1).args[0]).to.have.string(
      data['@graph'][1]['photo'][0]['path']
    )
  })

  it('handles files with the same name but different contents', async () => {
    const originalFileName = data['@graph'][2]['photo'][0]['filename']
    const checksum = data['@graph'][2]['photo'][0]['checksum']

    await plugin.export(data)
    const sourceArg = copyFileSpy.getCall(2).args[0]
    const destinationArg = copyFileSpy.getCall(2).args[1]

    expect(sourceArg).to.have.string(originalFileName)
    expect(destinationArg).to.not.have.string(originalFileName)
    expect(destinationArg).to.have.string(checksum)
  })

  it('writes updated file path into output json file', async () => {
    const originalFileName = data['@graph'][2]['photo'][0]['filename']
    const checksum = data['@graph'][2]['photo'][0]['checksum']

    await plugin.export(data)
    const jsonWritten = JSON.parse(writeFileSpy.getCall(0).args[1])
    const renamedPhoto = jsonWritten['@graph'][2]['photo'][0]

    expect(renamedPhoto['path']).to.have.string(checksum)
    // but doesn't change the filename
    expect(renamedPhoto['filename']).to.equal(originalFileName)
  })

  it('path is just filename when no images dir specified', async () => {
    const originalFileName = data['@graph'][1]['photo'][0]['filename']

    await plugin.export(data)
    const jsonWritten = JSON.parse(writeFileSpy.getCall(0).args[1])
    const photo = jsonWritten['@graph'][1]['photo'][0]

    expect(photo['path']).to.equal(originalFileName)
  })

  it('path includes image dir in output json file when specified', async () => {
    const imagesDir = 'photos'
    const optionsPlugin = new Plugin(
      { ...defaultOptions, images: imagesDir },
      defaultContext
    )
    const originalFileName = data['@graph'][1]['photo'][0]['filename']

    await optionsPlugin.export(data)
    const jsonWritten = JSON.parse(writeFileSpy.getCall(0).args[1])
    const photo = jsonWritten['@graph'][1]['photo'][0]

    expect(photo['path']).to.equal(`${imagesDir}/${originalFileName}`)
  })
})
