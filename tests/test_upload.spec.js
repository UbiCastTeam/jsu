/* globals require, describe, it */

const assert = require('assert');
require('./common.js');
require('../src/jsu.js');
import { ChunkedUpload } from '../src/lib/chunked-upload.js';

describe('ChunkedUpload', () => {
    it('should handle success', async () => {
        const blob = new Blob(['Test file content'], {
            type: 'application/json',
        });
        blob.name = 'test-name.txt';
        let progress = null;
        let retries = 0;
        let success = null;
        let msg = null;
        new ChunkedUpload({
            inTest: true,
            file: blob,
            uploadURL: 'http://localhost:9876/base/tests/mocking/upload-chunk-ok.json',
            completeURL: 'http://localhost:9876/base/tests/mocking/upload-complete-ok.json',
            maxRetry: 2,
            retryDelay: 10,
            progressCallback: function (value) {
                progress = value;
            },
            retryCallback: function () {
                retries++;
            },
            successCallback: function (uploadId) {
                success = true;
                msg = uploadId;
            },
            failureCallback: function (message) {
                success = false;
                msg = message;
            }
        });
        await window.wait(() => {
            return success === null;
        }, 100);
        assert(success === true);
        assert(msg === 'abcd0123');
        assert(progress === 100);
        assert(retries === 0);
    });
    it('should handle retry', async () => {
        const blob = new Blob(['Test file content'], {
            type: 'application/json',
        });
        blob.name = 'test no extension';
        let progress = null;
        let retries = 0;
        let success = null;
        let msg = null;
        new ChunkedUpload({
            inTest: true,
            file: blob,
            uploadURL: 'http://localhost:9876?upload',
            completeURL: 'http://localhost:9876?complete',
            fileNameSuffix: '_suffix',
            extraHeaders: {'X-Test': 'true'},
            extraData: {'Test': 'yes'},
            chunkSize: 10,
            progressCallback: function (value) {
                progress = value;
            },
            retryCallback: function () {
                retries++;
                const uploader = this;
                return new Promise(function (resolve) {
                    setTimeout(function () {
                        // replace URLs to make the call pass the second time
                        if (retries === 1) {
                            uploader.uploadURL = 'http://localhost:9876/base/tests/mocking/upload-chunk-ok.json';
                        } else {
                            uploader.completeURL = 'http://localhost:9876/base/tests/mocking/upload-complete-ok.json';
                        }
                        resolve();
                    }, 10);
                });
            },
            successCallback: function (uploadId) {
                success = true;
                msg = uploadId;
            },
            failureCallback: function (message) {
                success = false;
                msg = message;
            }
        });
        await window.wait(() => {
            return success === null;
        }, 100);
        assert(success === true);
        assert(msg === 'abcd0123');
        assert(progress === 100);
        assert(retries === 2);
    });
    it('should handle error on chunk upload', async () => {
        const blob = new Blob(['Test file content'], {
            type: 'application/json',
        });
        blob.name = 'test-name.txt';
        let progress = null;
        let retries = 0;
        let success = null;
        let msg = null;
        new ChunkedUpload({
            inTest: true,
            file: blob,
            uploadURL: 'http://localhost:9876?upload',
            completeURL: 'http://localhost:9876?complete',
            fileNameSuffix: '_original',
            maxRetry: 2,
            retryDelay: 10,
            progressCallback: function (value) {
                progress = value;
            },
            retryCallback: function () {
                retries++;
            },
            successCallback: function (uploadId) {
                success = true;
                msg = uploadId;
            },
            failureCallback: function (message) {
                success = false;
                msg = message;
            }
        });
        await window.wait(() => {
            return success === null;
        }, 100);
        assert(success === false);
        assert(msg.indexOf('Failed to parse json response:') === 0);
        assert(progress === 95);
        assert(retries === 2);
    });
    it('should handle error on complete', async () => {
        const blob = new Blob(['Test file content'], {
            type: 'application/json',
        });
        blob.name = 'test-name.txt';
        let progress = null;
        let retries = 0;
        let success = null;
        let msg = null;
        new ChunkedUpload({
            inTest: true,
            file: blob,
            uploadURL: 'http://localhost:9876/base/tests/mocking/upload-chunk-ok.json',
            completeURL: 'http://localhost:9876?complete',
            fileNameSuffix: '_original',
            maxRetry: 2,
            retryDelay: 10,
            progressCallback: function (value) {
                progress = value;
            },
            retryCallback: function () {
                retries++;
            },
            successCallback: function (uploadId) {
                success = true;
                msg = uploadId;
            },
            failureCallback: function (message) {
                success = false;
                msg = message;
            }
        });
        await window.wait(() => {
            return success === null;
        }, 100);
        assert(success === false);
        assert(msg.indexOf('Failed to parse json response:') === 0);
        assert(progress === 95);
        assert(retries === 2);
    });
});
