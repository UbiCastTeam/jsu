/* globals require, describe, it */
const assert = require('assert');
window.SparkMD5 = require('spark-md5');
require('./common.js');
require('../src/jsu.js');
const jsu = window.jsu;

describe('JSU', () => {
    it('should return a version', () => {
        assert(jsu.version == 7);
    });
    it('should set/get cookies', () => {
        jsu.setCookie('a', '1');
        const value = jsu.getCookie('a');
        assert(value == '1');
    });
    it('should strip', () => {
        const text = '     test     \n  test      \n test  \n  test     ';
        const value = jsu.strip(text);
        assert(value == 'test     \n  test      \n test  \n  test');
    });
    it('should slugify', () => {
        const text = '>@)(#<!test?/"\'][{}=+&^`%$';
        const value = jsu.slugify(text);
        assert(value == 'test');
    });
    it('should stripHTML', () => {
        const text = '<div><div class="test">test</div></div>';
        const value = jsu.stripHTML(text);
        assert(value == 'test');
    });
    it('should escapeHTML and decodeHTML', () => {
        const html = '<div class="test">test</div>';
        const encodedHTML = jsu.escapeHTML(html);
        assert(encodedHTML == '&lt;div class=&quot;test&quot;&gt;test&lt;/div&gt;');
        const decodedHTML = jsu.decodeHTML(encodedHTML);
        assert(decodedHTML == html);
    });
    it('should escapeHTML and decodeHTML', () => {
        const html = '<div class="test">test</div>';
        const encodedHTML = jsu.escapeAttribute(html);
        assert(encodedHTML == '<div class=&quot;test&quot;>test</div>');
    });
    it('should getClickPosition', () => {
        const evt = {'pageX': 10, 'pageY': 10};
        const positions = jsu.getClickPosition(evt, document.body);
        assert(JSON.stringify(positions) == JSON.stringify({'x': 10, 'y': 10}));
    });
    it('should onDOMLoad', async () => {
        let load = false;
        jsu.onDOMLoad(() => {
            load = true;
        });
        await window.wait(() => {
            return !load;
        }, 100);
        assert(load);
    });
    it('should do a httpRequest', async () => {
        const requestStatuses = [];
        const testDatas = [
            {'method': 'GET', 'params': {'test': 1}},
            {'method': 'POST', 'data': {'test': 1}},
            {'method': 'PUT', 'data': {'test': 1}},
            {'method': 'DELETE', 'data': {'test': 1}},
            {'method': 'PATCH', 'data': {'test': 1}},
            {'method': 'HEAD'},
            {'method': 'OPTIONS'}
        ];
        for (const testData of testDatas) {
            jsu.httpRequest({
                'url': 'http://localhost:9876', // karma server
                'method': testData.method,
                'params': testData.params,
                'data': testData.data,
                'callback': function (req) {
                    requestStatuses.push(req.status);
                }
            });
        }
        await window.wait(() => {
            return requestStatuses.length != 7;
        }, 500);
        assert(JSON.stringify(requestStatuses) == JSON.stringify([200, 200, 200, 200, 200, 200, 200]));
    }).timeout(5000);
    it('should compareVersions', () => {
        let result = jsu.compareVersions('1.1.1', '=', '1.1.1');
        assert(result == 0);
        result = jsu.compareVersions('1.1.0', '=', '1.1.1');
        assert(result == 1);
        result = jsu.compareVersions('1.1.2', '=', '1.1.1');
        assert(result == -1);
    });
    it('should setObjectAttributes', () => {
        const obj = {};
        const data = {'a': 1, 'b': 1, 'translations': {'en': {'a': 'a'}}};
        const allowedAttributes = ['b'];
        jsu.setObjectAttributes(obj, data, allowedAttributes);
        // clean translations
        jsu._translations = {'en': {}};
        jsu._currentCatalog = jsu._translations.en;
        assert(!obj.a);
        assert(!obj.translations);
        assert(obj.b);
    });
    it('should computeMD5', async () => {
        let md5 = null;
        const file = new File(['md5'], 'md5.txt', {
            type: 'text/plain'
        });
        jsu.computeMD5(file, (md5Computed) => md5 = md5Computed);
        await window.wait(() => {
            return !md5;
        }, 500);
        assert(md5 == '1bc29b36f623ba82aaf6724fd3b16718');
    });
    it('should getWebglContext', () => {
        const testDatas = [
            {'options': {}, 'browserName': 'chrome'},
            {'options': {}, 'browserName': 'safari'}
        ];
        for (const data of testDatas) {
            const canvas = document.createElement('canvas');
            assert(jsu.getWebglContext(canvas, data.options, data.browserName));
        }
    });
    it('should test isInIframe', () => {
        // karma window is in an iframe <iframe id="context" src="context.html" width="100%" height="100%"></iframe>
        assert(jsu.isInIframe());
    });
    it('should attemptFocus', () => {
        const focusableElement = document.createElement('input');
        document.body.appendChild(focusableElement);
        assert(jsu.isFocusable(focusableElement));
        assert(jsu.attemptFocus(focusableElement));
    });
    it('should focusFirstDescendant and focusLastDescendant', () => {
        const focusableElementOne = document.createElement('input');
        focusableElementOne.id = '1';
        const focusableElementTwo = document.createElement('button');
        focusableElementTwo.id = '2';
        document.body.prepend(focusableElementOne);
        document.body.appendChild(focusableElementTwo);
        assert(jsu.focusFirstDescendant(document.body));
        assert(document.activeElement == focusableElementOne);
        assert(jsu.focusLastDescendant(document.body));
        assert(document.activeElement == focusableElementTwo);
    });
    it('should test UA', () => {
        assert(jsu.userAgent);
        assert(jsu.osName);
        assert(jsu.osVersion !== undefined);
        assert(jsu.isMobile !== undefined);
        assert(jsu.isTactile !== undefined);
        assert(jsu.browserName);
        assert(jsu.browserVersion);
    });
    it('should manage translations', () => {
        const translations = {
            'fr': {
                'lang': 'fr',
                'June': 'juin',
                'December': 'décembre',
                'at': 'à',
                'B': 'o'
            },
            'en': {
                'lang': 'en',
                '<p>lang</p>': '<p>en</p>',
                '"lang': '"en'
            }
        };
        jsu.addTranslations(translations['en'], 'en');
        jsu.addTranslations(translations['fr'], 'fr');
        //jsu.useLang('en');
        assert(jsu.getCurrentLang() == 'en');
        assert(JSON.stringify(jsu.getCurrentCatalog()) == JSON.stringify(translations['en']), `${JSON.stringify(jsu.getCurrentCatalog())} == ${JSON.stringify(translations['en'])}`);
        assert(jsu.translate('lang') == 'en');
        assert(jsu.translateHTML('<p>lang</p>') == '&lt;p&gt;en&lt;/p&gt;', `${jsu.translateHTML('<p>lang</p>')} == '&lt;p&gt;en&lt;/p&gt;'`);
        assert(jsu.translateAttribute('"lang') == '&quot;en', `${jsu.translateAttribute('"lang')} == '&quot;en'`);
        assert(jsu.getDateDisplay('2022-06-20 12:23:45') == '20 June 2022 at 12:23 PM', `${jsu.getDateDisplay('2022-06-20 12:23:45')} == '20 June 2022 at 12:23 PM'`);
        assert(jsu.getDateDisplay('2021-12-30 00:12:14') == '30 December 2021 at 12:12 AM', `${jsu.getDateDisplay('2021-12-30 00:12:14')} == '30 December 2021 at 12:12 AM'`);
        assert(jsu.getDateDisplay('2021-19-57 69:98:84') == '2021-19-57 69:98:84', `${jsu.getDateDisplay('2021-19-57 69:98:84')} == '2021-19-57 69:98:84'`);
        assert(jsu.getDateDisplay('Invalid date') == 'Invalid date', `${jsu.getDateDisplay('Invalid date')} == 'Invalid date'`);
        assert(jsu.getSizeDisplay('123456789') == '123.5 MB', `${jsu.getSizeDisplay('123456789')} ==  '123.5 MB'`);
        jsu.useLang('fr');
        assert(jsu.getCurrentLang() == 'fr');
        assert(JSON.stringify(jsu.getCurrentCatalog()) == JSON.stringify(translations['fr']));
        assert(jsu.translate('lang') == 'fr');
        assert(jsu.getDateDisplay('2022-06-20 12:23:45') == '20 juin 2022 à 12:23', `${jsu.getDateDisplay('2022-06-20 12:23:45')} == '20 juin 2022 à 12:23'`);
        assert(jsu.getDateDisplay('2021-12-30 00:12:14') == '30 décembre 2021 à 00:12', `${jsu.getDateDisplay('2021-12-30 00:12:14')} == '30 décembre 2021 à 00:12'`);
        assert(jsu.getDateDisplay('2021-19-57 69:98:84') == '2021-19-57 69:98:84', `${jsu.getDateDisplay('2021-19-57 69:98:84')} == '2021-19-57 69:98:84'`);
        assert(jsu.getDateDisplay('Invalid date') == 'Invalid date', `${jsu.getDateDisplay('Invalid date')} == 'Invalid date'`);
        assert(jsu.getSizeDisplay('123456789') == '123.5 Mo', `${jsu.getSizeDisplay('123456789')} ==  '123.5 Mo'`);
    });
});
