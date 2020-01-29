'use strict'

const fs = require('fs')
const archiver = require('archiver')


module.exports = (src, dst) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(dst)
    const archive = archiver('zip', {
      zlib: { level: 9 }
    })
    archive.on('warning', reject)
    archive.on('error', reject)
    output.on('close', () => resolve({
      bytes: archive.pointer()
    }))

    archive.pipe(output)
    archive.glob('**/*', { cwd: src, nodir: true })
    archive.finalize()
  })
}
