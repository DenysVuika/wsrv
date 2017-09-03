# wsrv: micro web server

[![npm](https://img.shields.io/npm/v/wsrv.svg)](https://www.npmjs.com/package/wsrv)
[![Build Status](https://travis-ci.org/DenisVuyka/wsrv.svg?branch=master)](https://travis-ci.org/DenisVuyka/wsrv)

## Features

- SPA (Single Page Application) support
- Proxy settings for particular routes
- Live reload and file watchers
- Open browser upon startup
- Directory listing, automatic index
- Custom port and host settings
- Custom server extensions
- Dynamic port allocation on startup
- Command line options and configuration file suppport

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

<p class="tip">
Your default browser should automatically open at http://localhost:3000 address.
The server also enables SPA (`-s`) and live reload (`-l`) modes.
</p>

You can also define custom start page url:

```json
{
    "scripts": {
        "start": "wsrv ./www -p 3000 -s -l -O http://localhost:3000/about",
    }
}
```

## Configuration file

You can also create a separate configuration file to store all settings.
Just create a `wsrv-config.json` file in your working directory:

```json
{
    "host": "localhost",
    "dir": "<your directory>",
    "spa": false,
    "open": false,
    "openUrl": null,
    "livereload": false,
    "lrPort": 35729,
    "watch": [],
    "verbose": false,
    "proxy": null,
    "ext": []
}
```

<p class="tip">
You do not need enumerating all the settings in the file, just set the values you want to override or define.
</p>

### Dynamic configuration

The `wsrv` also supports dynamic configurations. Create a new `wsrv-config.js` file and declare a function as a module export. The function must return a JSON object with configuration settings.

For example:

```js
module.exports = function () {
    return {
        "proxy": {
            "/ecm/{p*}": {
                "options": {
                    "uri": "http://0.0.0.0:8080/{p}"
                }
            }
        }
    }
}
```

## Options

`-a` or `--address=` Address to use (defaults to `localhost`).

`-p` or `--port=` Port to use (free available port selected by default).

`-d` or `--dir=` Set working directory.

`-s` or `--spa` Enable SPA (Single Page Application) support (defaults to `false`).

`-o` or `--open` Open browser window after starting the server (defaults to `false`).

`-O` or `--open-url=` Opens browser window at specific url after starting the server.

`-l` or `--livereload` Enable live reload support (defaults to `false`).

`-V` or `--verbose` Enable verbose output (defalts to `false`).

`-v` or `--version` Show version information.

`-w` or `--watch=` Additional files to watch for live reload.

`-c` or `--config=` Path to custom configuration file.

`-x` or `--ext=` Additonal server extensions to load.

`-h` Show help screen.

## Proxy

It is also possible to generate and configure a reverse proxy handlers for particular routes.

<p class="tip">
Please note that this feature is available for configuration files only.
</p>

Let's update the `wsrv-config.json` file to enable proxy for all the routes that start with `/ecm` and forward requests to `http://0.0.0.0:8080` instead:

```json
{
    "proxy": {
        "/ecm/{p*}": {
            "options": {
                "uri": "http://0.0.0.0:8080/{p}"
            }
        }
    }
}
```

The server provides reasonable defaults, but you can customise or fine-tune proxy settings like in the example below:

```json
{
    "proxy": {
        "/ecm/{p*}": {
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "options": {
                "uri": "http://0.0.0.0:8080/{p}",
                "passThrough": true,
                "redirects": 9999,
                "xforward": true
            }
        }
    }
}
```

<p class="tip">
For a full list of available options refer to the h2o2 plugin [documentation](https://github.com/hapijs/h2o2#options).
</p>

## Plugins

Besides serving static content, **wsrv** provides support for external
[hapijs plugins](http://hapijs.com/tutorials/plugins).

Example:

**ext1.js**:

```js
'use strict';

exports.register = function (server, options, next) {

    server.route({
        method: 'GET',
        path: '/test',
        handler: function (request, reply) {
            reply('test passed');
        }
    });

    next();
};

exports.register.attributes = {
    name: 'custom routes 1',
    version: '1.0.0'
};
```

You can now run this plugin together with static content similar to the following:

```sh
wsrv -o -x ext1.js
```

Newly introduced dynamic content is available at `/test` path.

## Using from code

You can also embed `wsrv` into your node.js applications.

```javascript
const Server = require('wsrv');

let config = {
    open: true
};

new Server(config).start();
```

## How it works

The server is a simple node app that serves the working directory and its subdirectories.

It also watches the files for changes, and when that happens,
it sends a message through a web socket connection to the browser instructing it to reload.
For the client side to support this, the server injects a small piece of JavaScript code to each requested HTML file.
This script establishes the web socket connection and listens to the reload requests.
CSS files can be refreshed without a full page reload by finding the referenced stylesheets from the DOM
and tricking the browser to fetch and parse them again.
