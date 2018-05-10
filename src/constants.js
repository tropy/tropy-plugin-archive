'use strict'

const TROPY = {
  PHOTO: 'https://tropy.org/v1/tropy#photo',
  PATH: 'https://tropy.org/v1/tropy#path'
}

const PLUGIN = {
  NAME: 'tropy-archive',
  IMAGES_DIR: 'images',
  ITEMS_FILE: 'items.jsonld',
  ARCHIVES: 'Zip Archives',
  COPY_PROCESSES: 64
}

module.exports = {
  TROPY,
  PLUGIN
}
