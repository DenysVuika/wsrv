'use strict';

const path = require('path');
const chai = require('chai');
const expect = chai.expect;
const Server = require('../lib/server');
const EventEmitter = require('events').EventEmitter;
const tinylr = require('tiny-lr');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const chaiHttp = require('chai-http');

chai.use(sinonChai);
chai.use(chaiHttp);

describe('Server', () => {
    let server;
    let clock;

    beforeEach(() => {
        server = new Server();
        clock = sinon.useFakeTimers(Date.now());
    });

    afterEach(() => {
        clock.restore();
    });

    it('should create defaults', () => {
        let settings = server.defaultSettings();
        expect(settings).to.not.be.undefined;
    });

    it('should override defaults', () => {
        let custom = {
            host: '192.168.0.1',
            dir: '/tmp',
            spa: true,
            open: true,
            openUrl: '127.0.0.1',
            livereload: true,
            watch: [
                '/tmp/f1/**/*.js'
            ],
            verbose: true
        };

        server = new Server(custom);
        let config = server.config;

        expect(config.host).to.equal(custom.host);
        expect(config.dir).to.equal(custom.dir);
        expect(config.spa).to.equal(custom.spa);
        expect(config.open).to.equal(custom.open);
        expect(config.openUrl).to.equal(custom.openUrl);
        expect(config.livereload).to.equal(custom.livereload);
        expect(config.watch).to.eql(custom.watch);
        expect(config.verbose).to.equal(custom.verbose);
    });

    it('should log on watched file added', () => {
        let emitter = new EventEmitter();
        let spy = sinon.spy(server, 'log');
        server.setupWatcher(emitter);
        emitter.emit('add');
        expect(spy).to.have.been.called;
    });

    it('should log on watched file changed', () => {
        let emitter = new EventEmitter();
        let spy = sinon.spy(server, 'log');
        server.setupWatcher(emitter);
        emitter.emit('change');
        expect(spy).to.have.been.called;
    });

    it('should log on watched file unlinked', () => {
        let emitter = new EventEmitter();
        let spy = sinon.spy(server, 'log');
        server.setupWatcher(emitter);
        emitter.emit('unlink');
        expect(spy).to.have.been.called;
    });

    it('should require config to log', () => {
        expect(server.log('message')).to.be.false;
    });

    it('should require verbose mode to log', () => {
        let stub = sinon.stub(console, 'log');

        server.config.verbose = false;
        expect(server.log('message')).to.be.false;
        expect(console.log).to.not.be.called;

        server.config.verbose = true;
        expect(server.log('message')).to.be.true;
        expect(console.log).to.be.called;

        stub.restore();
    });

    it('should require message to log', () => {
        let stub = sinon.stub(console, 'log');

        server.config.verbose = true;
        expect(server.log('message')).to.be.true;
        expect(server.log(null)).to.be.false;
        expect(console.log).to.have.been.calledOnce;

        stub.restore();
    });

    it('should raise live reload for path', () => {
        let stub = sinon.stub(tinylr, 'changed');
        let watcher = new EventEmitter();
        server.setupWatcher(watcher);

        let path = 'some/path';
        clock.tick(200);
        watcher.emit('change', path);

        expect(tinylr.changed).to.have.been.calledWith(path);
        stub.restore();
    });

    it('should throttle live reload events', () => {
        let stub = sinon.stub(tinylr, 'changed');
        let watcher = new EventEmitter();
        server.setupWatcher(watcher);

        let path = 'some/path';
        clock.tick(200);
        watcher.emit('change', path);
        watcher.emit('change', path);
        watcher.emit('change', path);

        expect(tinylr.changed).to.have.been.calledOnce;
        expect(tinylr.changed).to.have.been.calledWith(path);
        stub.restore();
    });

    it('should register custom index route for livereload', (done) => {
        server = new Server({
            port: 3000,
            livereload: true,
            dir: path.resolve(path.join(__dirname, 'assets')),
            silent: true
        });
        var spy = sinon.spy(server, 'serveLiveReloadedIndex');

        server.start(() => {
            chai
                .request('http://localhost:3000')
                .get('/')
                .end(function (err, res) {
                    expect(err).to.be.null;
                    expect(res).to.have.status(200);
                    expect(spy).to.have.been.called;
                    server.serveLiveReloadedIndex.restore();
                    done();
                });
        });
    });

    it('should open url on start', (done) => {
        server = new Server({
            port: 3001,
            open: true,
            silent: true
        });

        var stub = sinon.stub(server, 'openUrl');
        server.start(() => {
            expect(stub).to.have.been.calledWith('http://localhost:3001');
            stub.restore();
            done();
        });
    });

    it('should open at custom url on start', (done) => {
        const targetUrl = 'http://localhost:3333';

        server = new Server({
            port: 3002,
            open: false,
            openUrl: targetUrl,
            silent: true
        });

        var stub = sinon.stub(server, 'openUrl');
        server.start(() => {
            expect(stub).to.have.been.calledWith(targetUrl);
            stub.restore();
            done();
        });
    });

    it('should open custom url even if open switch enabled', (done) => {
        const targetUrl = 'http://localhost:3333';

        server = new Server({
            port: 3003,
            open: true,
            openUrl: targetUrl,
            silent: true
        });

        var stub = sinon.stub(server, 'openUrl');
        server.start(() => {
            expect(stub).to.have.been.calledWith(targetUrl);
            stub.restore();
            done();
        });
    });
});
