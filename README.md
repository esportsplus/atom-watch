# Atom Watch 

## Description

Fork of [mvila's](https://github.com/mvila) very useful [on-save](https://github.com/mvila/on-save) utility.

Our latest projects store configuration within `package.json` files and all commands are now being managed through `npm scripts`.

To prevent any future laziness utilities like this are being stripped to bare minimum requirements.

In this package the configuration was removed and we are left with the following:

* Begin watching files on editor load
* Execute npm script on file change

## Install

apm install atom-watch

## Usage

Create an `atom-watch` key within the `package.json` file of a directory you would like to watch.

Specify the `files` to watch with the `command` to execute once the file changes. For Example:

```json
"atom-watch": [
  {
    "files": "**/*.js",
    "command": "npm run js:uglify"
  },
  {
    "files": "**/*.scss",
    "command": "npm run scss:compile"
  }
]
```

## Configuration file

`atom-watch` must be an array of objects with the following properties:

* `files`: The files you would like to watch. (Globs read by [minimatch](https://github.com/isaacs/minimatch))
* `command`: The command to execute.
* `alerts` _(default to `true`)_: A boolean indicating whether the error stream (stderr) and output stream (stdout) should be displayed or not.
