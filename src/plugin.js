'use strict'

const { join, extname, relative, basename } = require('path')
const { tmpdir } = require('os')
const { promisify } = require('util')
const zip = promisify(require('cross-zip').zip)
const pMap = require('p-map')

const {
  copyFile, mkdir, mkdtemp, rm, writeFile, unlink
} = require('fs').promises


class ArchivePlugin {
  constructor(options, context) {
    this.options = {
      ...ArchivePlugin.defaults,
      ...options
    }

    this.logger = context.logger
    this.dialog = context.dialog.save
  }

  *processPhotoPaths(data, root, images) {
    let files = {}
    for (let item of data['@graph']) {
      if (!item.photo) continue

      for (let photo of item.photo) {
        if (photo.protocol !== 'file') continue

        let src = photo.path
        let ext = extname(src)
        let dst = basename(src)

        if (dst in files && photo.checksum !== files[dst]) {
          dst = `${photo.checksum}${ext}`
        }

        if (!(dst in files)) {
        files[dst] = photo.checksum
        photo.path = join(images, dst)
        yield {
          src,
          dst: join(root, images, dst)
        }
      }
        photo.path = join(images, dst)
      }
    }
  }

  async export(data) {
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

    await pMap(
      this.processPhotoPaths(data, root, images),
      ({ src, dst }) => copyFile(src, dst),
      { concurrency })

    await writeFile(
      join(root, this.options.json),
      JSON.stringify(data, null, 2))

    try {
      await unlink(zipFile)
    } catch (e) {
      // ignore
    }

    await zip(root, zipFile)
    await rm(tmp, { recursive: true })
  }
}

ArchivePlugin.defaults = {
  concurrency: 64,
  filters: [{
    name: 'Zip Files',
    extensions: ['zip']
  }],
  images: '.',
  json: 'items.json',
  prompt: false,
  root: 'tropy'
}

module.exports = ArchivePlugin
