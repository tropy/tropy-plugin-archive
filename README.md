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

<details>
  <summary>
    <h2>How to work on the code</h2>
  </summary>

### Developing and debugging

For development,
we suggest to symlink your project into your `<userData>/plugins/tropy-plugin-archive` directory,
specifically the `index.js` and `package.json` files from the root of your plugin repository.
Generate `index.js` using Rollup with the command `npm run watch`
for live updates to the file while you are developing.

You will be able to see the output of `console.log()` statements in DevTools,
as well as access information from Tropy's state
by typing `tropy.state()` at the console.

You can also include `debugger` in your code,
and execution will pause,
allowing you to inspect the scope.

Alternatively, you can use Tropy's logger,
which is passed into your plugin via the `context` parameter.
Use `this.context.logger('message')` to write to the _tropy.log_ file in the Tropy logs folder.

### Testing

`npm run test` will run a basic smoke test in the electron renderer.

### Releasing and Distributing

When you are ready to share the plugin with other users,
create a tag in your git repository and push it to GitHub,
for example

```sh
git tag v1.0.0
git push origin v1.0.0
```

The `release.yml` workflow provided with this template will create a release in GitHub,
consisting of a zip file with your plugin's name and version number,
and source code archives.
Users should download the named zip file,
not the source code archives -
these are added to a release automatically for debugging purposes.

When you have a release ready to distribute,
you can edit the release in GitHub to write some release notes and remove the `pre-release` flag.
The release will then be shown to users as the "latest" release on the repository's homepage.

</details>
