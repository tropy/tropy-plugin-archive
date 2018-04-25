'use strict'

const fs = require('fs')
const { join, extname } = require('path')
const { tmpdir } = require('os')
const archive = require('./archive')
const { copyFile, hash } = require('./utils')
const { TROPY, PLUGIN } = require('./constants')


class Plugin {
  constructor(config, context) {
    this.config = config
    this.context = context
    this.logger = context.logger

    const { require } = this.context
    const { promisify, Promise } = require('bluebird')
    this.Promise = Promise
    this.mkdir = promisify(fs.mkdir)
    this.rm = promisify(require('rimraf'))
    this.mkdtemp = promisify(fs.mkdtemp)
    this.writeFile = promisify(fs.writeFile)
    this.jsonld = require('jsonld').promises
  }

  substitutePaths(jsonld) {
    jsonld = jsonld.slice()
    for (let items of jsonld) {
      for (let item of items['@graph']) {
        for (let photo of item.photo) {
          photo.path = this.destination(photo.path, '.')
        }
      }
    }
    return jsonld
  }

  async writeJson() {
    const data = this.substitutePaths(this.data)

    return this.writeFile(
      join(this.dir, PLUGIN.ITEMS_FILE),
      JSON.stringify(data, null, 2))
  }

  source(photo) {
    return photo[TROPY.PATH][0]['@value']
  }

  destination(src, dir = this.dir) {
    return join(dir, PLUGIN.IMAGES_DIR, hash(src)) + extname(src)
  }

  *writeItem(item) {
    const photos = item[TROPY.PHOTO][0]['@list']
    for (let photo of photos) {
      const src = this.source(photo)
      const dst = this.destination(src)
      yield copyFile(src, dst)
    }
  }

  *writeItems() {
    for (let items of this.expanded) {
      for (let item of items['@graph']) {
        yield* this.writeItem(item)
      }
    }
  }

  async export(data) {
    const { logger } = this.context
    const { output } = this.config

    try {
      this.data = data

      this.expanded = await this.jsonld.expand(data)

      this.dir = await this.mkdtemp(join(tmpdir(), PLUGIN.NAME))
      await this.mkdir(join(this.dir, PLUGIN.IMAGES_DIR))

      await this.Promise.all(this.writeItems())
      await this.writeJson()

      const result = await archive(this.dir, output)
      logger.info(`${PLUGIN.NAME} wrote ${result.bytes} bytes to ${output}`)

      await this.rm(this.dir)
    } catch (e) {
      logger.error(e.message)
    }
  }
}

module.exports = Plugin
