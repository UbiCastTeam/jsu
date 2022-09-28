/* globals require, describe, it */

const assert = require('assert');
require('./common.js');
require('../src/jsu.js');
const jsu = window.jsu;


describe('XHR', () => {
    it('should getHashFromRequest', () => {
        const formData = new FormData();
        formData.append('test', 3);
        const testDatas = [
            {'method': 'GET', 'url': 'http://localhost:9876', 'data': null, 'result': 'GEThttp://localhost:9876'},
            {'method': 'GET', 'url': 'http://localhost:9876?_=123356&test=1', 'data': null, 'result': 'GEThttp://localhost:9876?test=1'},
            {'method': 'GET', 'url': 'http://localhost:9876?test=1&_=123356', 'data': null, 'result': 'GEThttp://localhost:9876?test=1'},
            {'method': 'POST', 'url': 'http://localhost:9876?test=1&_=123356', 'data': {'test': 2}, 'result': 'POSThttp://localhost:9876?test=1{"test":2}'},
            {'method': 'POST', 'url': 'http://localhost:9876?test=1&_=123356', 'data': formData, 'result': 'POSThttp://localhost:9876?test=1{"test":"3"}'}
        ];
        for (const testData of testDatas) {
            assert(
                jsu.getHashFromRequest(testData.method, testData.url, testData.data) == testData.result,
                `${jsu.getHashFromRequest(testData.method, testData.url, testData.data)} == ${testData.result}`
            );
        }
    });
    it('should block identical request', async () => {
        const testDatas = [
            {'method': 'GET'},
            {'method': 'GET', 'params': {'test': 1}},
            {'method': 'POST', 'data': {'test': 1}},
            {'method': 'POST', 'params': {'test': 1}, 'data': {'test': 1}},
            {'method': 'POST', 'params': {'test': 1}, 'data': {'test': 1}}, // should be ignored
            {'method': 'PUT', 'data': {'test': 1}},
            {'method': 'DELETE', 'data': {'test': 1}},
            {'method': 'PATCH', 'data': {'test': 1}},
            {'method': 'HEAD'},
            {'method': 'OPTIONS'}
        ];
        const requestResults = [];
        for (const testData of testDatas) {
            jsu.httpRequest({
                url: 'http://localhost:9876',
                method: testData.method,
                params: testData.params,
                data: testData.data,
                'callback': function (req) {
                    requestResults.push(req.status);
                }
            });
        }
        await window.wait(() => {
            return requestResults.length != 9;
        }, 500);
        assert(requestResults.length == 9, `${requestResults.length} == 9`);
        assert(
            JSON.stringify(requestResults) == JSON.stringify([200, 200, 200, 200, 200, 200, 200, 200, 200]),
            `${JSON.stringify(requestResults)} == ${JSON.stringify([200, 200, 200, 200, 200, 200, 200, 200, 200])}`);
    });
});
