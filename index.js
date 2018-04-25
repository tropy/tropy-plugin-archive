'use strict'

const fs = require('fs')
const crypto = require('crypto')
const { join, extname } = require('path')
const { tmpdir } = require('os')
const archive = require('./src/archive')

const TROPY = {
  NS: 'https://tropy.org/v1/tropy#',
  PHOTO: 'https://tropy.org/v1/tropy#photo',
  ITEM: 'https://tropy.org/v1/tropy#Item',
  PATH: 'https://tropy.org/v1/tropy#path',
  SELECTION: 'https://tropy.org/v1/tropy#selection'
}


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

  // Replace this method with native one after Tropy moves to Node >= v8.5.0
  copyFile(source, target) {
    var rd = fs.createReadStream(source)
    var wr = fs.createWriteStream(target)
    return new Promise((resolve, reject) => {
      rd.on('error', reject)
      wr.on('error', reject)
      wr.on('finish', resolve)
      rd.pipe(wr)
    }).catch(error => {
      rd.destroy()
      wr.end()
      throw error
    })
  }

  substitutePaths(data) {
    data = data.slice()
    for (let items of data) {
      for (let item of items['@graph']) {
        for (let photo of item.photo) {
          photo.path = this.destination(photo.path, '.')
        }
      }
    }
    return data
  }

  async writeJson() {
    const data = this.substitutePaths(this.data)

    return this.writeFile(
      join(this.dir, 'items.jsonld'),
      JSON.stringify(data, null, 2))
  }

  hash(str) {
    return crypto.createHash('sha256').update(str).digest('hex')
  }

  source(photo) {
    return photo[TROPY.PATH][0]['@value']
  }

  destination(src, dir = this.dir) {
    return join(dir, 'images', this.hash(src)) + extname(src)
  }

  *writeItem(item) {
    const photos = item[TROPY.PHOTO][0]['@list']
    for (let photo of photos) {
      const src = this.source(photo)
      const dst = this.destination(src)
      yield this.copyFile(src, dst)
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

    try {
      this.data = data

      this.expanded = await this.jsonld.expand(data)

      this.dir = await this.mkdtemp(join(tmpdir(), 'tropy-archive'))
      await this.mkdir(join(this.dir, 'images'))

      await this.Promise.all(this.writeItems())
      await this.writeJson()

      const result = await archive(this.dir, this.config.output)
      this.logger.info(
        `tropy-archive wrote ${result.bytes} bytes to ${this.config.output}`)
      await this.rm(this.dir)

    } catch (e) {
      logger.error(e.message)
    }
  }
}

module.exports = Plugin
