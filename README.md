# wsrv: micro web server for development purposes

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

```sh
./node_modules/.bin/wsrv ./www -p 3000 -s -o
```

*Your default browser should automatically open at http://localhost:3000 address.*

## Available options

`-a` or `--address` Address to use (defaults to `localhost`)

`-p` or `--port` Port to use (free available port selected by default)

`-d` or `--dir` Working directory

`-s` or `--spa` Enable SPA (Single Page Application) support (defaults to `false`)

`-o` or `--open` Open browser window after starting the server (defaults to `false`)

`-l` or `--livereload` Enable live reload support
