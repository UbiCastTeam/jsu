const assert = require('assert');
window.SparkMD5 = require('spark-md5');
require('../src/jsu.js');
const jsu = window.jsu;

async function wait (waitFunction, ms) {
  let retry = 0;
  while (waitFunction() && retry < 10) {
    await new Promise((r) => setTimeout(r, ms));
    retry++;
  }
}

describe('JSU', () => {
  it('should return a version', () => {
    assert(jsu.version == 6);
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
    const text = '>@)(#<!test?/"\'][{}=+&^`%$'
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
    jsu.onDOMLoad(() => { load = true; });
    await wait(() => {
      return !load;
    }, 100);
    assert(load);
  });
  it('should do a httpRequest', async () => {
    const requestStatuses = [];
    const testsDatas = [
      {'method': 'GET', 'params': {'test': 1}},
      {'method': 'POST', 'data': {'test': 1}},
      {'method': 'PUT', 'data': {'test': 1}},
      {'method': 'DELETE', 'data': {'test': 1}},
      {'method': 'PATCH', 'data': {'test': 1}},
      {'method': 'HEAD'},
      {'method': 'OPTIONS'}
    ];
    for (const testData of testsDatas)
    jsu.httpRequest({
        'url': 'http://localhost:9876', // karma server
        'method': testData.method,
        'params': testData.params,
        'data': testData.data,
        callback: function (req, response) {
          requestStatuses.push(req.status);
        }
    });
    await wait(() => {
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
    const data = {'a': 1, 'b': 1, 'translations': {'a': 'a'}};
    const allowedAttributes = ['b'];
    jsu.setObjectAttributes(obj, data, allowedAttributes);
    // clean translations
    jsu._translations = { en: {} };
    assert(!obj.a);
    assert(!obj.translations);
    assert(obj.b);
  });
  it('should computeMD5', async () => {
    let md5 = null;
    const file = new File(["md5"], "md5.txt", {
      type: "text/plain",
    });
    jsu.computeMD5(file, (md5Computed) => md5 = md5Computed);
    await wait(() => { return !md5 }, 500);
    assert(md5 == '1bc29b36f623ba82aaf6724fd3b16718');
  });
  it('should getWebglContext', () => {
    const testsDatas = [
      {'options': {}, 'browserName': 'chrome'},
      {'options': {}, 'browserName': 'safari'}
    ]
    for (const data of testsDatas) {
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
        'lang': 'fr'
      },
      'en': {
        'lang': 'en'
      }
    };
    jsu.addTranslations(translations['en'], 'en');
    jsu.addTranslations(translations['fr'], 'fr');
    assert(jsu.getCurrentLang() == 'en');
    jsu.useLang('fr');
    assert(jsu.getCurrentLang() == 'fr');
    assert(JSON.stringify(jsu.getCurrentCatalog()) == JSON.stringify({'lang': 'fr'}));
    assert(jsu.translate('lang') == 'fr');
    jsu.useLang('en');
    assert(jsu.getCurrentLang() == 'en');
    assert(JSON.stringify(jsu.getCurrentCatalog()) == JSON.stringify({'lang': 'en'}));
    assert(jsu.translate('lang') == 'en');
    /*jsu.translateHTML
    jsu.translateAttribute
    jsu.getDateDisplay
    jsu.getSizeDisplay*/
  });
});