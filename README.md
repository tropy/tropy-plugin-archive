<p align="center"><img src="icon.svg"></p>

<h1 align="center">Tropy Archive Plugin</h1>

Tropy plugin for exporting items into a single zip archive. This includes all the metadata, as well as the photo files.

## Installation

Download the appropriate [release](https://github.com/tropy/tropy-archive/releases) for your platform and install via the _Plugins_ preferences pane.

Alternaively, navigate to the Tropy `plugins` folder (_Main menu -> Help -> Show plugins folder_) in the terminal and run

    npm install tropy-archive

or

    git clone https://github.com/tropy/tropy-archive

## Configuration

In the plugin preferences, the `Output` parameter needs to specify under which filename the archive will be saved.

## Development

Besides using libraries shipped with Tropy, this plugin includes an external dependency (node-archiver), and bundles it with `rollup`. To make a bundle build, run `npm run build` or `npm run watch` for continuous builds.

## Testing

`npm run test` will run a basic smoke test in the electron renderer.

