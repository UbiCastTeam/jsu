/* globals require, describe, it */
const assert = require('assert');
import { PollingManager } from '../src/lib/polling-manager.js';

const sleep = (time) => {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
};

describe('PollingManager', () => {
    it('should handle polling function', async () => {
        const start = new Date().getTime();
        const calls = [];
        const polling = new PollingManager(function (callback) {
            calls.push(new Date().getTime() - start);
            callback();
        }, 1000);

        // Test call after init
        await sleep(500);
        assert(calls.length == 1);
        assert(calls[0] < 100, `${calls[0]} ~= 0`);

        // Test call after interval
        await sleep(1000);
        assert(calls.length == 2);
        assert(Math.abs(calls[1] - 1000) < 100, `${calls[1]} ~= 1000`);

        // Test no call when disabled
        polling.disable();
        await sleep(1000);
        assert(calls.length == 2);

        // Test immediate call after enabling because interval is already reached
        polling.enable();
        await sleep(100);
        assert(calls.length == 3);
        assert(Math.abs(calls[2] - 2500) < 100, `${calls[2]} ~= 2500`);

        // Test no call after enabling because a too recent call was made
        polling.disable();
        polling.enable();
        await sleep(100);
        assert(calls.length == 3);

        // Cleanup test
        polling.disable();
    }).timeout(5000);
    it('should handle planNext in callback', async () => {
        const start = new Date().getTime();
        const calls = [];
        const polling = new PollingManager(function (callback) {
            calls.push(new Date().getTime() - start);
            callback(false);
        }, 1000);

        // Test call after init
        await sleep(500);
        assert(calls.length == 1);
        assert(calls[0] < 100, `${calls[0]} ~= 0`);

        // Test no call after first run because planNext=false
        await sleep(1000);
        assert(calls.length == 1);

        // Cleanup test
        polling.disable();
    }).timeout(2000);
});
