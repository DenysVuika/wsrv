'use strict';

const path = require('path');
const Hapi = require('hapi');
const Inert = require('inert');
const Good = require('good');
const opn = require('opn');
const fs = require('fs');
const tinylr = require('tiny-lr');
const chokidar = require('chokidar');
const _ = require('lodash');

class Server {

    defaultSettings () {
        return {
            host: 'localhost',
            dir: process.cwd(),
            spa: false,
            open: false,
            openUrl: null,
            livereload: false,
            lrPort: 35729,
            watch: [],
            verbose: false,
            silent: false,
            ext: []
        };
    }

    constructor (options) {
        let config = this.defaultSettings();
        if (options) {
            _.merge(config, options);
        }
        this.config = config;

        // Create a server with a host and port
        let server = new Hapi.Server({
            connections: {
                routes: {
                    // cors: true,
                    files: {
                        relativeTo: this.config.dir
                    }
                }
            }
        });

        server.connection({
            host: config.host,
            port: config.port
        });

        server.register(Inert, () => {});

        if (config.livereload) {
            server.route({
                method: 'GET',
                path: '/index.html',
                handler: (request, reply) => {
                    return this.serveLiveReloadedIndex(request, reply);
                }
            });
        }

        server.route({
            method: 'GET',
            path: '/{param*}',
            handler: {
                directory: {
                    path: '.',
                    listing: true,
                    index: true
                }
            }
        });

        server.ext('onPreResponse', (request, reply) => {
            const response = request.response;

            if (config.livereload &&
                !response.isBoom &&
                response.source &&
                response.source.path) {
                let fileName = path.basename(response.source.path);
                if (fileName === 'index.html') {
                    return this.serveLiveReloadedIndex(request, reply);
                }
            }

            // SPA mode
            if (config.spa &&
                response.isBoom &&
                response.output.statusCode === 404) {
                if (config.livereload) {
                    return this.serveLiveReloadedIndex(request, reply);
                } else {
                    return reply.file('index.html');
                }
            }

            return reply.continue();
        });

        let logOptions = {};
        if (config.verbose) {
            logOptions = {
                reporters: {
                    console: [{
                        module: 'good-squeeze',
                        name: 'Squeeze',
                        args: [{
                            response: '*',
                            log: '*'
                        }]
                    }, {
                        module: 'good-console'
                    }, 'stdout']
                }
            };
        }

        if (config.ext && config.ext.length > 0) {
            let plugins = config.ext.map(plugin => {
                return {
                    register: require(path.resolve(plugin)),
                    options: {}
                };
            });
            server.register(
                plugins,
                (err) => {
                    if (err) {
                        throw err;
                    }
                }
            );
        }

        this.logOptions = logOptions;
        this.server = server;
    }

    serveLiveReloadedIndex (request, reply) {
        let fileName = path.join(this.config.dir, 'index.html');
        fs.readFile(fileName, 'utf8', function (err, data) {
            if (err) {
                this.log(err);
                return reply(err, null);
            }
            var body = data;
            var snippet = `
                <script>document.write(
                    '<script src="http://'
                    + (location.host || 'localhost').split(':')[0]
                    + ':35729/livereload.js?snipver=1"></'
                    + 'script>')
                </script>
            `;
            body = body.replace(/<\/body>/, function (w) {
                return snippet + w;
            });
            reply(body);
        });
    }

    openUrl (url) {
        if (url) {
            opn(url);
        }
    }

    start (cb) {
        this.log(`Serving directory: ${this.config.dir}`);

        this.server.register({
            register: Good,
            options: this.logOptions
        }, (err) => {
            if (err) {
                throw err; // something bad happened loading the plugin
            }

            this.server.start((err) => {
                if (err) {
                    throw err;
                }

                if (this.config && !this.config.silent) {
                    console.log(`Server running at: ${this.server.info.uri}`);
                }

                let url = null;

                if (this.config.open) {
                    url = this.server.info.uri;
                }

                if (this.config.openUrl) {
                    url = this.config.openUrl;
                }

                if (url) {
                    if (!this.config.silent) {
                        console.log(`Opening start page: ${url}`);
                    }
                    this.openUrl(url);
                }

                if (cb && typeof cb === 'function') {
                    cb();
                }
            });
        });

        if (this.config.livereload) {
            tinylr().listen(this.config.lrPort, () => {
                this.log(`Live reload listening on ${this.config.lrPort} port`);
            });

            let watcher = chokidar.watch('file, dir, glob, or array', {
                ignored: [/node_modules/, /bower_components/],
                persistent: true
            });
            this.setupWatcher(watcher);
            watcher.add(this.config.dir);

            if (this.config.watch && this.config.watch.length > 0) {
                // setup additonal watcher with no 'ignored' presets
                let extraWatcher = chokidar.watch('file, dir, glob, or array', {
                    persistent: true
                });

                this.setupWatcher(extraWatcher);

                for (let i = 0; i < this.config.watch.length; i++) {
                    extraWatcher.add(this.config.watch[i]);
                }
            }
        }
    }

    setupWatcher (watcher) {
        watcher
            .on('add', path => this.log(`File ${path} has been added`))
            .on('change', path => this.log(`File ${path} has been changed`))
            .on('unlink', path => this.log(`File ${path} has been removed`));

        watcher.on('change', _.throttle(path => {
            tinylr.changed(path);
        }, 200));
    }

    log (message) {
        if (this.config &&
            !this.config.silent &&
            this.config.verbose &&
            message) {
            console.log(message);
            return true;
        }
        return false;
    }

};

module.exports = Server;
