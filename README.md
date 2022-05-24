<p align="center"><img src="icon.svg"></p>

<h1 align="center">Tropy Archive Plugin</h1>

Tropy plugin for exporting items into a single zip archive.
This includes all the metadata, as well as the photo files.

## Installation

- Download the `.zip` file from the [latest release](https://github.com/tropy/tropy-plugin-archive/releases.latest) on GitHub.
- In Tropy, navigate to _Preferences… > Plugins_
  and click _Install Plugin_ to select the downloaded ZIP file.

## Configuration

To configure the plugin, click its _Settings_ button in _Preferences > Plugins_:

In the plugin preferences,

- the `Name` parameter names the particular _instance_ of the plugin,
to make it easier to select that configuration from the Export menu.
- the `Root folder` parameter specifies the name of the folder
(inside the zip archive) where all the exported items will be placed.
- the `Image folder` parameter specifies the name of the subdirectory within the Root folder where image files will be saved.
By default this is `.`,
which means the Root directory itself rather than a subdirectory
- the `Save as` parameter specifies the default file name and location for the zip archive to be saved.
- `Always ask?` can be checked to make the file picker dialog always be shown,
even when the `Save as` parameter is set to specify a default location.

## Usage

To trigger the plugin, select the entry in the export sub-menu in Tropy.

## Development

See [the example plugin documentation](https://github.com/tropy/tropy-plugin-example/blob/main/README.md#developing-and-debugging) for development instructions.
