# wsrv: micro web server

[![npm](https://img.shields.io/npm/v/wsrv.svg)](https://www.npmjs.com/package/wsrv)
[![Build Status](https://travis-ci.org/DenisVuyka/wsrv.svg?branch=master)](https://travis-ci.org/DenisVuyka/wsrv)

Features:

- Dynamic port allocation on startup
- SPA (Single Page Application) support
- Live reload and file watchers
- Open browser upon startup
- Directory listing, automatic index
- Custom port and host settings
- Custom server extensions

## [Documentation](http://denisvuyka.github.io/wsrv/)

## Installing

### As a global tool

```sh
npm install -g wsrv
```

Now you can serve any directory like following:

```sh
cd my-proj
wsrv -o
```

### As a project dependency

```sh
npm install --save-dev wsrv
```

## Usage

```sh
./wsrv [path] [options]
```

## Example

Serve the content of the `www` subdirectory with SPA support and open browser
instance at the root:

```sh
wsrv -p 3000 -s -o
```

or

```sh
./node_modules/.bin/wsrv ./www -p 3000 -s -o
```

## More details

You can get more details and examples in the official [documentation](http://denisvuyka.github.io/wsrv/).