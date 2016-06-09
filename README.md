# wsrv: micro web server for development purposes

[![npm](https://img.shields.io/npm/v/wsrv.svg?maxAge=2592000)](https://www.npmjs.com/package/wsrv)

Features:

- Dynamic port allocation on startup
- SPA (Single Page Application) support
- Live reload and file watchers
- Open browser upon startup
- Directory listing, automatic index
- Custom port and host settings

## Installing

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
./node_modules/.bin/wsrv ./www -p 3000 -s -o
```

## Start script

Alternatively you can configure start script in your `package.json` to serve
content of the `www` folder like following:

```json
{
    "scripts": {
        "start": "wsrv ./www -p 3000 -s -o -l",
    }
}
```

This will automatically start server and open browser page on `npm start`.

*Your default browser should automatically open at http://localhost:3000 address.*

## Available options

`-a` or `--address` Address to use (defaults to `localhost`).

`-p` or `--port` Port to use (free available port selected by default).

`-d` or `--dir` Set working directory.

`-s` or `--spa` Enable SPA (Single Page Application) support (defaults to `false`).

`-o` or `--open` Open browser window after starting the server (defaults to `false`).

`-l` or `--livereload` Enable live reload support (defaults to `false`).

`-V` or `--verbose` Enable verbose output (defalts to `false`).

`-v` or `--version` Show version information.
