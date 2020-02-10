'use strict'

const fs = require('fs')
const fsPromises = fs.promises
const { join, extname } = require('path')
const { tmpdir } = require('os')
const zip = require('cross-zip')
const { hash } = require('./utils')
const { TROPY, PLUGIN } = require('./constants')


class Plugin {
  constructor(config, context) {
    this.config = config
    this.context = context
    this.logger = context.logger

    const { require } = this.context
    const { Promise } = require('bluebird')
    this.Promise = Promise
    this.jsonld = require('jsonld')
    this.dialog = () => require('../dialog').save({
      filters: [{
        name: PLUGIN.ARCHIVES,
        extensions: ['zip']
      }]
    })
  }

  substitutePaths(jsonld) {
    jsonld = jsonld.slice()
    for (let items of jsonld) {
      for (let item of items['@graph']) {
        if (!item.photo) continue
        for (let photo of item.photo) {
          photo.path = this.destination(photo.path, '.')
        }
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
    return photo[TROPY.PATH][0]['@value']
  }

  destination(src, dir = this.dir) {
    return join(dir, PLUGIN.IMAGES_DIR, hash(src)) + extname(src)
  }

  *getPhotoPath(item) {
    const photos = item[TROPY.PHOTO] ? item[TROPY.PHOTO][0]['@list'] : []
    for (let photo of photos) {
      const src = this.source(photo)
      const dst = this.destination(src)
      yield { src, dst }
    }
  }

  *getPhotoPaths() {
    for (let items of this.expanded) {
      for (let item of items['@graph']) {
        yield* this.getPhotoPath(item)
      }
    }
  }

  async export(data) {
    const { logger } = this.context
    const output = this.config.output || await this.dialog()
    if (!output) return

    try {
      this.data = data

      this.expanded = await this.jsonld.expand(data)

      this.dir = await fsPromises.mkdtemp(join(tmpdir(), PLUGIN.NAME))
      await fsPromises.mkdir(join(this.dir, PLUGIN.IMAGES_DIR))

      await this.Promise.all([
        this.Promise.map(
          this.getPhotoPaths(),
          ({ src, dst }) => fsPromises.copyFile(src, dst),
          { concurrency: this.config.concurrency || PLUGIN.COPY_PROCESSES }
        ),
        this.writeJson()
      ])

      await zip.zip(this.dir, output,
        () => fsPromises.rmdir(this.dir, { recursive: true })
      )

    } catch (e) {
      logger.error(e.message)
    }
  }
}

module.exports = Plugin
