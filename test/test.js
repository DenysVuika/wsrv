'use strict';

const expect = require('expect.js');
const Server = require('../lib/server');

describe('Server', () => {
    it('should create defaults', () => {
        let server = new Server(null);
        let settings = server.defaultSettings();
        expect(settings).not.to.be(undefined);
    });
});
