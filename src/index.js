'use strict'

const { join, extname, relative } = require('path')
const { tmpdir } = require('os')
const { promisify } = require('util')
const zip = promisify(require('cross-zip').zip)

const {
  copyFile, mkdir, mkdtemp, rmdir, writeFile, unlink
} = require('fs').promises


class ArchivePlugin {
  constructor(options, context) {
    this.options = {
      ...ArchivePlugin.defaults,
      ...options
    }

    this.logger = context.logger
    this.dialog = context.require('../dialog').save
    this.Bluebird = context.require('bluebird')
  }

  *processPhotoPaths(data, root, images) {
    for (let item of data['@graph']) {
      if (!item.photo) continue

      for (let photo of item.photo) {
        if (photo.protocol !== 'file') continue

        let src = photo.path
        let dst = `${photo.checksum}${extname(src)}`

        photo.path = join(images, dst)

        yield {
          src,
          dst: join(root, images, dst)
        }
      }
    }
  }

  async export(data) {
    try {
      let { zipFile, filters, concurrency, images } = this.options

      if (!zipFile || this.options.prompt) {
        zipFile = await this.dialog({ defaultPath: zipFile, filters })
      }

      if (!zipFile) return

      // Ensure zip file looks like a zip file!
      if (extname(zipFile) !== '.zip') {
        throw new Error(`not a zip file: ${zipFile}`)
      }

      let tmp = await mkdtemp(join(tmpdir(), 'tropy-archive-'))
      let root = join(tmp, this.options.root)

      // Sanity check that root is still in tmp!
      if (relative(root, tmp) !== '..') {
        throw new Error(`root "${root}" outside of tmp folder!`)
      }

      await mkdir(join(root, images), { recursive: true })

      await this.Bluebird.map(
        this.processPhotoPaths(data, root, images),
        ({ src, dst }) => copyFile(src, dst),
        { concurrency })

      await writeFile(
        join(root, this.options.json),
        JSON.stringify(data, null, 2))

      await unlink(join(zipFile)).catch()

      await zip(root, zipFile)
      await rmdir(tmp, { recursive: true })

    } catch (e) {
      this.logger.error({ stack: e.stack }, 'archive export failed')
    }
  }
}

ArchivePlugin.defaults = {
  concurrency: 64,
  filters: [{
    name: 'Zip Files',
    extensions: ['zip']
  }],
  images: 'images',
  json: 'items.json',
  prompt: false,
  root: 'tropy'
}

module.exports = ArchivePlugin
