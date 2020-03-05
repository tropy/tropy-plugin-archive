'use strict'

const fs = require('fs')
const { promisify } = require('util')
const fsPromises = fs.promises
const { join, extname } = require('path')
const { tmpdir } = require('os')
const zip = promisify(require('cross-zip').zip)
const { hash } = require('./utils')
const { PLUGIN } = require('./constants')


class Plugin {
  constructor(config, context) {
    this.config = config
    this.context = context
    this.logger = context.logger

    const { require } = this.context
    const { Promise } = require('bluebird')

    this.Promise = Promise
    this.dialog = () => require('../dialog').save({
      filters: [{
        name: PLUGIN.ARCHIVES,
        extensions: ['zip']
      }]
    })
  }

  substitutePaths(jsonld) {
    for (let item of jsonld['@graph']) {
      if (!item.photo) continue
      for (let photo of item.photo) {
        photo.path = this.destination(photo.path, '.')
      }
    }
    return jsonld
  }

  async writeJson() {
    const data = this.substitutePaths(this.data)

    return fsPromises.writeFile(
      join(this.dir, PLUGIN.ITEMS_FILE),
      JSON.stringify(data, null, 2))
  }

  source(photo) {
    return photo.path
  }

  destination(src, dir = this.dir) {
    return join(dir, PLUGIN.IMAGES_DIR, hash(src)) + extname(src)
  }

  *getPhotoPath(item) {
    const photos = item.photo || []
    for (let photo of photos) {
      const src = this.source(photo)
      const dst = this.destination(src)
      yield { src, dst }
    }
  }

  *getPhotoPaths() {
    for (let item of this.data['@graph']) {
      yield* this.getPhotoPath(item)
    }
  }

  async export(data) {
    const { logger } = this.context
    const output = this.config.output || await this.dialog()
    if (!output) return

    try {
      this.data = data
      this.dir = await fsPromises.mkdtemp(join(tmpdir(), PLUGIN.NAME))
      await fsPromises.mkdir(join(this.dir, PLUGIN.IMAGES_DIR))

      await this.Promise.all([
        this.Promise.map(
          this.getPhotoPaths(),
          ({ src, dst }) => fsPromises.copyFile(src, dst),
          { concurrency: this.config.concurrency || PLUGIN.COPY_PROCESSES }
        )
      ])

      await this.writeJson()
      await zip(this.dir, output)
      await fsPromises.rmdir(this.dir, { recursive: true })
    } catch (e) {
      logger.error(e.message)
    }
  }
}

module.exports = Plugin
