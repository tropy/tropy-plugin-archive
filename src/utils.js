'use strict'

const crypto = require('crypto')

const { createReadStream, createWriteStream } = require('fs')

// Replace this method with native one after Tropy moves to Node >= v8.5.0
function copyFile(source, target) {
  var rd = createReadStream(source)
  var wr = createWriteStream(target)
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

function hash(str) {
  return crypto.createHash('sha256').update(str).digest('hex')
}


module.exports = {
  copyFile,
  hash
}
