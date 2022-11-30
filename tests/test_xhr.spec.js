/* globals require, describe, it, BigUint64Array, BigInt64Array */

const assert = require('assert');
require('./common.js');
require('../src/jsu.js');
const jsu = window.jsu;


describe('XHR', () => {
    it('should getHashFromRequest', () => {
        const formData = new FormData();
        formData.append('test', 3);
        const blob = new Blob([JSON.stringify({'test': 1})], {
            type: 'application/json',
        });
        const testDatas = [
            {'method': 'GET', 'url': 'http://localhost:9876', 'data': null, 'result': 'GEThttp://localhost:9876'},
            {'method': 'GET', 'url': 'http://localhost:9876?_=123356&test=1', 'data': null, 'result': 'GEThttp://localhost:9876?test=1'},
            {'method': 'GET', 'url': 'http://localhost:9876?test=1&_=123356', 'data': null, 'result': 'GEThttp://localhost:9876?test=1'},
            {'method': 'GET', 'url': 'http://localhost:9876?test=1&_=123356', 'data': null, 'headers': {test: [2]}, 'result': 'GEThttp://localhost:9876?test=1{"test":[2]}'},
            {'method': 'POST', 'url': 'http://localhost:9876?test=1&_=123356', 'data': {'test': 2}, 'result': 'POSThttp://localhost:9876?test=1{"test":2}'},
            {'method': 'POST', 'url': 'http://localhost:9876?test=1&_=123356', 'data': formData, 'result': 'POSThttp://localhost:9876?test=1{"test":"3"}'},
            {'method': 'POST', 'url': 'http://localhost:9876?test=1&_=123356', 'data': blob, 'result': 'POSThttp://localhost:9876?test=1blob-10'},
            {'method': 'POST', 'url': 'http://localhost:9876?test=1&_=123356', 'data': new ArrayBuffer(1), 'result': 'POSThttp://localhost:9876?test=1arraybuffer-1'},
            {'method': 'POST', 'url': 'http://localhost:9876?test=1&_=123356', 'data': new Int8Array(1), 'result': 'POSThttp://localhost:9876?test=1{"0":0}'},
            {'method': 'POST', 'url': 'http://localhost:9876?test=1&_=123356', 'data': new Uint8Array(1), 'result': 'POSThttp://localhost:9876?test=1{"0":0}'},
            {'method': 'POST', 'url': 'http://localhost:9876?test=1&_=123356', 'data': new Uint8ClampedArray(1), 'result': 'POSThttp://localhost:9876?test=1{"0":0}'},
            {'method': 'POST', 'url': 'http://localhost:9876?test=1&_=123356', 'data': new Int16Array(1), 'result': 'POSThttp://localhost:9876?test=1{"0":0}'},
            {'method': 'POST', 'url': 'http://localhost:9876?test=1&_=123356', 'data': new Uint16Array(1), 'result': 'POSThttp://localhost:9876?test=1{"0":0}'},
            {'method': 'POST', 'url': 'http://localhost:9876?test=1&_=123356', 'data': new Int32Array(1), 'result': 'POSThttp://localhost:9876?test=1{"0":0}'},
            {'method': 'POST', 'url': 'http://localhost:9876?test=1&_=123356', 'data': new Uint32Array(1), 'result': 'POSThttp://localhost:9876?test=1{"0":0}'},
            {'method': 'POST', 'url': 'http://localhost:9876?test=1&_=123356', 'data': new Float32Array(1), 'result': 'POSThttp://localhost:9876?test=1{"0":0}'},
            {'method': 'POST', 'url': 'http://localhost:9876?test=1&_=123356', 'data': new Float64Array(1), 'result': 'POSThttp://localhost:9876?test=1{"0":0}'},
            {'method': 'POST', 'url': 'http://localhost:9876?test=1&_=123356', 'data': new BigUint64Array(1)}, // not serializable
            {'method': 'POST', 'url': 'http://localhost:9876?test=1&_=123356', 'data': new BigInt64Array(1)}, // not serializable
            {'method': 'POST', 'url': 'http://localhost:9876?test=1&_=123356', 'data': new URLSearchParams({'test': '4'}), 'result': 'POSThttp://localhost:9876?test=1{"test":"4"}'}
        ];
        for (const testData of testDatas) {
            if (testData.result) {
                assert(
                    jsu.getHashFromRequest(testData.method, testData.url, testData.data, testData.headers) == testData.result,
                    `${jsu.getHashFromRequest(testData.method, testData.url, testData.data, testData.headers)} == ${testData.result}`
                );
            } else {
                assert(jsu.getHashFromRequest(testData.method, testData.url, testData.data));
            }
        }
    });
    it('should block identical request', async () => {
        const testDatas = [
            {'method': 'GET'},
            {'method': 'GET'},
            {'method': 'GET', 'params': {'test': 1}},
            {'method': 'GET', 'params': {'test': 1}},
            {'method': 'GET', 'params': {'test': 1}, 'headers': {'test': 2}},
            {'method': 'GET', 'params': {'test': 1}, 'headers': {'test': 2}},
            {'method': 'POST', 'data': {'test': 1}},
            {'method': 'POST', 'data': {'test': 1}},
            {'method': 'POST', 'params': {'test': 1}, 'data': {'test': 1}},
            {'method': 'POST', 'params': {'test': 1}, 'data': {'test': 1}}, // should be ignored
            {'method': 'PUT', 'data': {'test': 1}},
            {'method': 'PUT', 'data': {'test': 1}},
            {'method': 'DELETE', 'data': {'test': 1}},
            {'method': 'DELETE', 'data': {'test': 1}},
            {'method': 'PATCH', 'data': {'test': 1}},
            {'method': 'PATCH', 'data': {'test': 1}},
            {'method': 'HEAD'},
            {'method': 'HEAD'},
            {'method': 'OPTIONS'},
            {'method': 'OPTIONS'}
        ];
        const requestResults = [];
        const errorResults = [];
        for (const testData of testDatas) {
            jsu.httpRequest({
                'url': 'http://localhost:9876',
                'method': testData.method,
                'params': testData.params,
                'data': testData.data,
                'headers': testData.headers,
                'callback': function (xhr) {
                    if (xhr.status !== 0) {
                        requestResults.push(xhr.status);
                    } else {
                        errorResults.push(xhr.status);
                    }
                }
            });
        }
        await window.wait(() => {
            return requestResults.length != 10;
        }, 500);
        assert(requestResults.length == 10, `${requestResults.length} == 10`);
        const correctResults = [200, 200, 200, 200, 200, 200, 200, 200, 200, 200];
        const correctErrorResults = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        assert(
            JSON.stringify(requestResults) == JSON.stringify(correctResults),
            `${JSON.stringify(requestResults)} == ${JSON.stringify(correctResults)}`);
        assert(
            JSON.stringify(errorResults) == JSON.stringify(correctErrorResults),
            `${JSON.stringify(errorResults)} == ${JSON.stringify(correctErrorResults)}`);
    }).timeout(5000);
    it('should trigger on abort', async () => {
        const requestResults = [];
        const xhrRequest = jsu.httpRequest({
            'url': 'http://localhost:9876',
            'callback': function (xhr) {
                requestResults.push(xhr.status);
            }
        });
        xhrRequest.abort();
        await window.wait(() => {
            return requestResults.length != 1;
        }, 500);
        const correctResults = [0];
        assert(
            JSON.stringify(requestResults) == JSON.stringify(correctResults),
            `${JSON.stringify(requestResults)} == ${JSON.stringify(correctResults)}`);
    }).timeout(5000);

});
