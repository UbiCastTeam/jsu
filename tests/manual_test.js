/*******************************************
* jsu: Test script                         *
*******************************************/
/* globals jsu, PollingManager */
const host = 'http://localhost:8083';

function objectRepr (obj) {
    let repr = '';
    if (typeof obj == 'string') {
        repr = '\n  ' + obj;
    } else {
        let field;
        for (field in obj) {
            repr += '\n  ' + field + ': ' + obj[field];
        }
    }
    if (!repr) {
        repr = '\nempty object';
    }
    repr = '[' + (typeof obj) + ':' + repr + '\n]';
    return repr;
}

function assertEqual (valA, valB, message) {
    if (valA === valB) {
        return 'OK';
    } else {
        return 'FAIL: "' + valA + '" != "' + valB + '"' + (message ? ' ' + message : '');
    }
}

function displayUserAgent () {
    const repr = 'jsu.userAgent: ' + jsu.userAgent + '\n' +
        'jsu.userAgentData: ' + jsu.userAgentData + '\n' +
        'jsu.osName: ' + jsu.osName + '\n' +
        'jsu.osVersion: ' + jsu.osVersion + '\n' +
        'jsu.browserName: ' + jsu.browserName + '\n' +
        'jsu.browserVersion: ' + jsu.browserVersion + '\n' +
        'jsu.browserVersion (type): ' + (typeof jsu.browserVersion) + '\n' +
        'jsu.isMobile: ' + jsu.isMobile + '\n' +
        'jsu.isTactile: ' + jsu.isTactile + '\n' +
        '\n' +
        'window.navigator.platform: ' + (window.navigator && window.navigator.platform ? window.navigator.platform : 'none') + '\n' +
        'window.navigator.appVersion: ' + (window.navigator && window.navigator.appVersion ? window.navigator.appVersion : 'none') + '\n' +
        'window.navigator.userAgentData: ' + (window.navigator && window.navigator.userAgentData ? window.navigator.userAgentData : 'none') + '\n' +
        'window.navigator.userAgentData.mobile: ' + (window.navigator && window.navigator.userAgentData ? window.navigator.userAgentData.mobile : 'none') + '\n' +
        'window.navigator.userAgentData.brands: ' + (window.navigator && window.navigator.userAgentData ? objectRepr(window.navigator.userAgentData.brands) : 'none') + '\n' +
        '';
    if (window.navigator && window.navigator.userAgentData && window.navigator.getHighEntropyValues) {
        // Log the full user-agent data
        window.navigator.userAgentData.getHighEntropyValues(
            ['architecture', 'model', 'platform', 'platformVersion', 'uaFullVersion'])
            .then(ua => {
                console.log(ua);
            });
    }

    const ele = document.getElementById('user_agent_report');
    ele.innerHTML = '<p>' + jsu.escapeHTML(repr) + '</p>';
}

function testUserAgent () {
    // trigger internal user agent change
    const ua = document.getElementById('user_agent').value;
    if (ua) {
        jsu.userAgent = ua.toLowerCase();
        jsu._getBrowserInfo();
    }
    displayUserAgent();
    return false;
}

function testWebGL () {
    const repr = 'jsu.getWebglContext: ' + jsu.getWebglContext();

    const ele = document.getElementById('webgl_report');
    ele.innerHTML = '<p>' + jsu.escapeHTML(repr) + '</p>';
}

function testTranslation () {
    const label = 'test label';
    const expected = 'test trad';
    const data = {};
    data[label] = expected;
    jsu.addTranslations(data);

    let repr = 'Test 1\n' +
        'Current lang: ' + jsu.getCurrentLang() + '\n' +
        jsu.translate(label) + '\n' +
        'Test lang: ' + assertEqual(jsu.getCurrentLang(), 'en') + '\n' +
        'Test trans: ' + assertEqual(jsu.translate(label), expected);

    const label2 = 'test label 2';
    const expected2 = 'test trad 2';
    const data2 = {};
    data2[label2] = expected2;
    data2[label] = ''; // should use defaut translation
    jsu.addTranslations(data2, 'fr');
    jsu.useLang('fr');

    repr += '\n\nTest 2\n' +
        'Current lang: ' + jsu.getCurrentLang() + '\n' +
        jsu.translate(label2) + '\n' +
        'Test lang: ' + assertEqual(jsu.getCurrentLang(), 'fr') + '\n' +
        'Test trans: ' + assertEqual(jsu.translate(label2), expected2) + '\n' +
        'Test last trans: ' + assertEqual(jsu.translate(label), expected);

    const label3 = 'test label 3';
    const expected3 = 'test trad 3';
    const data3 = {};
    data3['test context\u0004' + label3] = expected3;
    jsu.addTranslations(data3, 'fr');

    repr += '\n\nTest 3\n' +
        'Current lang: ' + jsu.getCurrentLang() + '\n' +
        jsu.translate(label3) + '\n' +
        'Test lang: ' + assertEqual(jsu.getCurrentLang(), 'fr') + '\n' +
        'Test trans with context: ' + assertEqual(jsu.translate(label3, 'test context'), expected3);

    const label4 = 'test label 4 <"test">';
    const data4 = {};
    data4[label4] = 'test trad 4 <"test">';
    const expected4a = jsu.escapeHTML(data4[label4]);
    const expected4b = 'test trad 4 <&quot;test&quot;>';
    jsu.useLang('en');
    jsu.addTranslations(data4, 'en');

    repr += '\n\nTest 4\n' +
        'Current lang: ' + jsu.getCurrentLang() + '\n' +
        jsu.translate(label4) + '\n' +
        'Test lang: ' + assertEqual(jsu.getCurrentLang(), 'en') + '\n' +
        'Test trans with HTML escape: ' + assertEqual(jsu.translateHTML(label4), expected4a) + '\n' +
        'Test trans with attribute escape: ' + assertEqual(jsu.translateAttribute(label4), expected4b);

    repr += '\n\nDate display, EN\n' +
        'Current lang: ' + jsu.getCurrentLang() + '\n' +
        '\nValid date:\n' + jsu.getDateDisplay('2022-06-20 12:23:45') +
        '\n' + assertEqual(jsu.getDateDisplay('2022-06-20 12:23:45'), '20 June 2022 at 12:23 PM') + '\n' +
        '\nOther valid date:\n' + jsu.getDateDisplay('2021-12-30 00:12:14') +
        '\n' + assertEqual(jsu.getDateDisplay('2021-12-30 00:12:14'), '30 December 2021 at 12:12 AM') + '\n' +
        '\nInvalid numbers in date:\n' + jsu.getDateDisplay('2021-19-57 69:98:84') +
        '\n' + assertEqual(jsu.getDateDisplay('2021-19-57 69:98:84'), '2021-19-57 69:98:84') + '\n' +
        '\nInvalid date value:\n' + jsu.getDateDisplay('Invalid') +
        '\n' + assertEqual(jsu.getDateDisplay('Invalid'), 'Invalid') + '\n';

    jsu.useLang('fr');
    jsu.addTranslations({'at': 'à', 'June': 'juin', 'December': 'décembre'});
    repr += '\n\nDate display, FR\n' +
        'Current lang: ' + jsu.getCurrentLang() + '\n' +
        '\nValid date:\n' + jsu.getDateDisplay('2022-06-20 12:23:45') +
        '\n' + assertEqual(jsu.getDateDisplay('2022-06-20 12:23:45'), '20 juin 2022 à 12:23') + '\n' +
        '\nOther valid date:\n' + jsu.getDateDisplay('2021-12-30 00:12:14') +
        '\n' + assertEqual(jsu.getDateDisplay('2021-12-30 00:12:14'), '30 décembre 2021 à 00:12') + '\n' +
        '\nInvalid numbers in date:\n' + jsu.getDateDisplay('2021-19-57 69:98:84') +
        '\n' + assertEqual(jsu.getDateDisplay('2021-19-57 69:98:84'), '2021-19-57 69:98:84') + '\n' +
        '\nInvalid date value:\n' + jsu.getDateDisplay('Invalid') +
        '\n' + assertEqual(jsu.getDateDisplay('Invalid'), 'Invalid') + '\n';

    jsu.useLang('en');
    repr += '\n\nSize display, EN\n' +
        'Current lang: ' + jsu.getCurrentLang() + '\n' +
        '\nValid size:\n' + jsu.getSizeDisplay('123456789') +
        '\n' + assertEqual(jsu.getSizeDisplay('123456789'), '123.5 MB') + '\n' +
        '\nInvalid size:\n' + jsu.getSizeDisplay('abc') +
        '\n' + assertEqual(jsu.getSizeDisplay('abc'), '0 B') + '\n';

    jsu.useLang('fr');
    jsu.addTranslations({'B': 'o'});
    repr += '\n\nSize display, FR\n' +
        'Current lang: ' + jsu.getCurrentLang() + '\n' +
        '\nValid size:\n' + jsu.getSizeDisplay('123456789') +
        '\n' + assertEqual(jsu.getSizeDisplay('123456789'), '123.5 Mo') + '\n' +
        '\nInvalid size:\n' + jsu.getSizeDisplay('abc') +
        '\n' + assertEqual(jsu.getSizeDisplay('abc'), '0 o') + '\n';

    const ele = document.getElementById('translations_report');
    ele.innerHTML = '<p>' + jsu.escapeHTML(repr) + '</p>';
}

function testPolling () {
    const ele = document.getElementById('polling_report');
    const calls = [];
    let count = 0;
    const polling = new PollingManager(function (callback) {
        count += 1;
        calls.push('Call #' + count + ' at ' + (new Date()).toTimeString());
        if (calls.length > 10) {
            calls.shift();
        }
        ele.innerHTML = calls.join('<br/>');
        callback();
    }, 10000);
    document.getElementById('test_polling_disable').addEventListener('click', function () {
        polling.disable();
    });
    document.getElementById('test_polling_enable').addEventListener('click', function () {
        polling.enable();
    });
}

function testRequest ({method, url, json, params, data, append, noText}) {
    jsu.httpRequest({
        url: url,
        method: method,
        params: params,
        data: data,
        json: json,
        callback: function (req, response) {
            const repr = 'req: ' + url + '\n' +
                'status: ' + req.status + '\n' +
                (!noText ? 'response: ' + objectRepr(response) : '');

            const ele = document.getElementById('requests_report');
            if (append) {
                ele.innerHTML += '<p>' + jsu.escapeHTML(repr) + '</p>';
            } else {
                ele.innerHTML = '<p>' + jsu.escapeHTML(repr) + '</p>';
            }
        }
    });
}

jsu.onDOMLoad(function () {
    document.getElementById('version').innerHTML = jsu.version;
    document.getElementById('test_user_agent').addEventListener('click', function () {
        testUserAgent();
    });
    displayUserAgent();
    testWebGL();
    testTranslation();
    testPolling();
    document.getElementById('test_request_localhost_json').addEventListener('click', function () {
        testRequest({'url': host, 'json': true});
    });
    document.getElementById('test_request_localhost_html').addEventListener('click', function () {
        testRequest({'url': host, 'json': false});
    });
    document.getElementById('test_request_nope_json').addEventListener('click', function () {
        testRequest({'url': 'nope', 'json': true});
    });
    document.getElementById('test_request_nope_html').addEventListener('click', function () {
        testRequest({'url': 'nope', 'json': false});
    });
    document.getElementById('test_xhr').addEventListener('click', function () {
        testRequest({
            'url': host,
            'json': true,
            'noText': true
        });
        testRequest({
            'url': host,
            'params': {'test': 1},
            'json': true,
            'append': true,
            'noText': true
        });
        testRequest({
            'url': host + '?test=1&test=2',
            'json': true,
            'append': true,
            'noText': true
        });
        testRequest({
            'url': host + '?test=1&test=2',
            'method': 'HEAD',
            'json': true,
            'append': true,
            'noText': true
        });
        testRequest({
            'url': host + '?test=1&test=2',
            'method': 'PUT',
            'json': true,
            'append': true,
            'noText': true
        });
        testRequest({
            'url': host + '?test=1&test=2',
            'method': 'POST',
            'data': {'test': 3},
            'json': true,
            'append': true,
            'noText': true
        });
        testRequest({
            'url': host + '?test=1&test=2',
            'json': true,
            'append': true,
            'noText': true
        });
    });
});
