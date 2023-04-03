/*******************************************
* jsu: JavaScript Utilities                *
*******************************************/

/* ---- Polyfill definitions ---- */

// Add console functions for old browsers
if (!window.console) {
    window.console = {};
}
if (!window.console.log) {
    window.console.log = function () {};
}
if (!window.console.error) {
    window.console.error = window.console.log;
}
if (!window.console.debug) {
    window.console.debug = window.console.log;
}
if (!window.console.info) {
    window.console.info = window.console.log;
}
if (!window.console.warn) {
    window.console.warn = window.console.log;
}

/* ---- jsu object definition ---- */
const VERSION = 7;
const jsu = window.jsu ? window.jsu : {version: VERSION};
window.jsu = jsu;
const shouldBeDefined = function (attribute) {
    // Function to handle other versions of jsu objects
    const allow = VERSION > jsu.version || !(attribute in jsu);
    return allow;
};
if (VERSION != jsu.version) {
    console.warn('Another version of jsu.js was already imported, all attributes will be set by most recent version. Version: "' + VERSION + '", other version: "' + jsu.version + '".');
    if (VERSION > jsu.version) {
        jsu.version = VERSION;
    }
}

if (shouldBeDefined('getCookie')) {
    jsu.getCookie = function (name, defaultValue) {
        if (document.cookie.length > 0) {
            let cStart = document.cookie.indexOf(name + '=');
            if (cStart != -1) {
                cStart = cStart + name.length + 1;
                let cEnd = document.cookie.indexOf(';', cStart);
                if (cEnd == -1) {
                    cEnd = document.cookie.length;
                }
                return window.unescape(document.cookie.substring(cStart, cEnd));
            }
        }
        return defaultValue !== undefined ? defaultValue : '';
    };
    jsu.setCookie = function (name, value, expireDays) {
        const exDate = new Date();
        exDate.setDate(exDate.getDate() + (expireDays ? expireDays : 360));
        const secure = window.location.href.indexOf('https://') === 0 ? '; secure; samesite=none' : '';
        document.cookie = name + '=' + window.escape(value) + '; expires=' + exDate.toUTCString() + '; path=/' + secure;
    };
}

if (shouldBeDefined('strip')) {
    jsu.strip = function (str, characters) {
        if (!str) {
            return str;
        }
        const crs = characters !== undefined ? characters : ' \n\r\t '; // the last space is a non secable space
        let start = 0;
        while (start < str.length && crs.indexOf(str[start]) != -1) {
            start++;
        }
        let end = str.length - 1;
        while (end >= 0 && crs.indexOf(str[end]) != -1) {
            end--;
        }
        return str.substring(start, end + 1);
    };
}

if (shouldBeDefined('slugify')) {
    jsu.slugify = function (text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-') // Replace spaces with -
            .replace(/[^-\w]+/g, '') // Remove all non-word chars
            .replace(/-+/g, '-') // Replace multiple - with single -
            .replace(/^-+/, '') // Trim - from start of text
            .replace(/-+$/, ''); // Trim - from end of text
    };
}

if (shouldBeDefined('stripHTML')) {
    jsu.stripHTML = function (html) {
        if (!html) {
            return html;
        }
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent;
    };
}
if (shouldBeDefined('decodeHTML')) {
    jsu.decodeHTML = function (html) {
        if (!html) {
            return '';
        }
        const div = document.createElement('div');
        div.innerHTML = html;
        // handle case of empty input
        return div.childNodes.length === 0 ? '' : div.childNodes[0].nodeValue;
    };
}
if (shouldBeDefined('escapeHTML')) {
    jsu.escapeHTML = function (text) {
        if (!text) {
            return text;
        }
        let result = text.toString();
        result = result.replace(/(<)/g, '&lt;');
        result = result.replace(/(>)/g, '&gt;');
        result = result.replace(/(\n)/g, '<br/>');
        result = result.replace(/(")/g, '&quot;');
        return result;
    };
}
if (shouldBeDefined('escapeAttribute')) {
    jsu.escapeAttribute = function (attr) {
        if (!attr) {
            return attr;
        }
        let result = attr.toString();
        result = result.replace(/(\n)/g, '&#13;&#10;');
        result = result.replace(/(")/g, '&quot;');
        return result;
    };
}

if (shouldBeDefined('getClickPosition')) {
    jsu.getClickPosition = function (evt, dom) {
        let element = dom, xOffset = 0, yOffset = 0;
        // get canvas offset
        while (element !== null && element !== undefined) {
            xOffset += element.offsetLeft;
            yOffset += element.offsetTop;
            element = element.offsetParent;
        }
        return { x: evt.pageX - xOffset, y: evt.pageY - yOffset };
    };
}

if (shouldBeDefined('onDOMLoad')) {
    jsu.onDOMLoad = function (callback) {
        // see if DOM is already available
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            // call on next available tick
            setTimeout(callback, 1);
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    };
}

if (shouldBeDefined('httpRequest')) {
    jsu.httpRequest = function (args) {
        /* args = {
            method: 'GET',
            url: '',
            headers: {},
            params: {},
            data: {},
            cache: false,
            synchronous: false,
            json: false,
            jsonData: false,
            progress: function (event) {},
            callback: function (xhr, response) {}, // response is decoded JSON if json else response text.
        } */
        const params = args.params ? args.params : {};
        if (!args.cache) {
            params._ = (new Date()).getTime();
        }
        const method = args.method ? args.method.toUpperCase() : 'GET';
        let url = args.url ? args.url : '';
        const headers = args.headers ? args.headers : {};
        const noCSRF = (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
        if (!noCSRF) {
            const csrftoken = jsu.getCookie('csrftoken');
            if (csrftoken) {
                headers['X-CSRFToken'] = csrftoken;
            }
        }
        const urlParams = [];
        for (const field in params) {
            if (params[field] instanceof Array) {
                for (const value of params[field]) {
                    urlParams.push(encodeURIComponent(field) + '=' + encodeURIComponent(value));
                }
            } else {
                urlParams.push(encodeURIComponent(field) + '=' + encodeURIComponent(params[field]));
            }
        }
        if (urlParams.length > 0) {
            url += (url.indexOf('?') === -1 ? '?' : '&') + urlParams.join('&');
        }
        let formData;
        if (args.jsonData) {
            headers['Content-Type'] = 'application/json; charset=UTF-8';
            formData = args.data;
        } else if (args.data instanceof FormData) {
            formData = args.data;
        } else if (args.data) {
            formData = new FormData();
            for (const field in args.data) {
                if (args.data[field] instanceof Array) {
                    for (const value of args.data[field]) {
                        formData.append(field + '[]', value);
                    }
                } else {
                    formData.append(field, args.data[field]);
                }
            }
        } else {
            formData = null;
        }
        const xhr = new XMLHttpRequest();
        if (args.progress && xhr.upload) {
            xhr.upload.addEventListener('progress', args.progress, false);
        }
        if (args.callback) {
            xhr.addEventListener('readystatechange', function () {
                if (this.readyState !== XMLHttpRequest.DONE) {
                    return;
                }
                if (xhr._callbackCalled) {
                    return;
                }
                xhr._callbackCalled = true;
                let response;
                if (args.json) {
                    if (this.responseText === '') {
                        response = {
                            error: 'No response.',
                            empty: true,
                            raw: this.responseText
                        };
                    } else {
                        try {
                            response = JSON.parse(this.responseText);
                        } catch (e) {
                            response = {
                                error: 'Failed to parse json response: ' + e,
                                raw: this.responseText
                            };
                        }
                    }
                } else {
                    response = this.responseText;
                }
                args.callback(this, response);
            });
            xhr.addEventListener('error', function (event) {
                if (xhr._callbackCalled) {
                    return;
                }
                xhr._callbackCalled = true;
                const errorMessage = event.error ||
                    event.message ||
                    (event.detail ? event.detail.error || event.detail.message : 'Unknown error');
                args.callback(this, {
                    error: errorMessage
                });
            });
        }
        xhr.open(method, url, !args.synchronous);
        for (const field in headers) {
            if (headers[field] instanceof Array) {
                for (const value of headers[field]) {
                    xhr.setRequestHeader(field, value);
                }
            } else {
                xhr.setRequestHeader(field, headers[field]);
            }
        }
        xhr.send(formData);
        return xhr;
    };
}

if (shouldBeDefined('compareVersions')) {
    jsu.compareVersions = function (v1, comparator, v2) {
        // Function to compare versions like "4.5.6"
        comparator = comparator == '=' ? '==' : comparator;
        const v1parts = v1.split('.'), v2parts = v2.split('.');
        const maxLen = Math.max(v1parts.length, v2parts.length);
        for (let i = 0; i < maxLen; i++) {
            const part1 = Number(v1parts[i]);
            const part2 = Number(v2parts[i]);
            if (part1 < part2) {
                return 1;
            } else if (part1 > part2) {
                return -1;
            }
        }
        return 0;
    };
}

if (shouldBeDefined('setObjectAttributes')) {
    jsu.setObjectAttributes = function (obj, data, allowedAttributes) {
        if (!data) {
            return;
        }
        if ('translations' in data) {
            // Update translations
            jsu.addTranslations(data.translations);
            delete data.translations;
        }
        // Override fields
        for (const attr in data) {
            if (!allowedAttributes || allowedAttributes.indexOf(attr) != -1) {
                obj[attr] = data[attr];
            }
        }
    };
}

if (shouldBeDefined('computeMD5')) {
    jsu.computeMD5 = function (file, callback, progressCallback) {
        // MD5 sum computation (requires the SparkMD5 library)
        if (!window.File) {
            return callback('unsupported');
        }
        if (!window.SparkMD5) {
            console.warn('MD5 computation failed because SparkMD5 is not available.');
            return callback('unsupported');
        }
        const blobSlice = window.File.prototype.slice || window.File.prototype.mozSlice || window.File.prototype.webkitSlice;
        const spark = new window.SparkMD5.ArrayBuffer();
        const fileReader = new FileReader();
        const chunkSize = 2097152; // Read in chunks of 2MB
        const chunks = Math.ceil(file.size / chunkSize);
        let currentChunk = 0;
        const loadNext = function () {
            const start = currentChunk * chunkSize;
            const end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;
            fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
        };
        fileReader.onload = function (e) {
            spark.append(e.target.result); // Append array buffer
            currentChunk++;
            if (progressCallback) {
                progressCallback(Math.min(currentChunk * chunkSize, file.size) / file.size);
            }
            if (currentChunk < chunks) {
                loadNext();
            } else {
                callback(spark.end());
            }
        };
        fileReader.onerror = function () {
            console.warn('MD5 computation failed');
        };
        loadNext();
    };
}

if (shouldBeDefined('getWebglContext')) {
    jsu.getWebglContext = function (canvas, options, browserName) {
        if (window.WebGLRenderingContext) {
            try {
                let webglContext;
                if (browserName === 'safari') {
                    webglContext = canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options);
                } else {
                    webglContext = canvas.getContext('webgl2', options) || canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options);
                }
                if (!webglContext) {
                    console.log('Failed to initialize WebGL context. Your browser does not support Webgl context.');
                    return null;
                }
                return webglContext;
            } catch (e) {
                console.log('WebGL context is supported but may be disable, please check your browser configuration.');
                return null;
            }
        }
        console.log('Your browser does not support Webgl context');
        return null;
    };
}

if (shouldBeDefined('isInIframe')) {
    jsu.isInIframe = function () {
        if (window.frameElement && window.frameElement.nodeName == 'IFRAME') {
            return true;
        }
        return false;
    };
}


/* Focus related functions */
if (shouldBeDefined('ignoreUntilFocusChanges')) {
    jsu.ignoreUntilFocusChanges = false;
    jsu.attemptFocus = function (element) {
        if (!this.isFocusable(element)) {
            return false;
        }
        jsu.ignoreUntilFocusChanges = true;
        try {
            element.focus();
        } catch (e) {
            console.log('Failed to focus element.', element, e);
        }
        jsu.ignoreUntilFocusChanges = false;
        return (document.activeElement === element);
    };
    jsu.isFocusable = function (element) {
        if (element.tabIndex > 0 || (element.tabIndex === 0 && element.getAttribute('tabIndex') !== null)) {
            return true;
        }

        if (element.disabled) {
            return false;
        }

        switch (element.nodeName) {
            case 'A':
                return !!element.href && element.rel != 'ignore';
            case 'INPUT':
                return element.type != 'hidden' && element.type != 'file';
            case 'BUTTON':
            case 'SELECT':
            case 'TEXTAREA':
                return true;
            default:
                return false;
        }
    };
    jsu.focusFirstDescendant = function (element) {
        for (let i = 0; i < element.childNodes.length; i++) {
            const child = element.childNodes[i];
            if (jsu.attemptFocus(child) ||
                jsu.focusFirstDescendant(child)) {
                return true;
            }
        }
        return false;
    };
    jsu.focusLastDescendant = function (element) {
        for (let i = element.childNodes.length - 1; i >= 0; i--) {
            const child = element.childNodes[i];
            if (jsu.attemptFocus(child) || jsu.focusLastDescendant(child)) {
                return true;
            }
        }
        return false;
    };
}


/* User agent and platform related functions */
if (shouldBeDefined('userAgent')) {
    jsu.userAgent = window.navigator && window.navigator.userAgent ? window.navigator.userAgent.toLowerCase() : 'unknown';
    jsu.userAgentData = null;

    jsu._getOSInfo = function () {
        let name;
        let version;
        /* TODO: Find a synchronous way to get platform.
        if (window.navigator && window.navigator.userAgentData) {
            window.navigator.userAgentData.getHighEntropyValues(['platform']).then(function (data) {
                if (data.platform) {
                    name = data.platform.toLowerCase();
                    if (data.platform == 'Mac OS X') {
                        name = 'macos';
                    }
                    jsu.userAgentPlatform = name;
                }
            });
        }
        */
        if (!name && window.navigator && window.navigator.platform) {
            const platform = window.navigator.platform.toLowerCase();
            if (platform.indexOf('ipad') != -1 || platform.indexOf('iphone') != -1 || platform.indexOf('ipod') != -1) {
                name = 'ios';
                version = parseFloat(('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0,''])[1]).replace('undefined', '3_2').replace('_', '.').replace('_', '')) || false;
            }
        }
        if (!name && window.navigator && window.navigator.appVersion) {
            const appVersion = window.navigator.appVersion.toLowerCase();
            if (appVersion.indexOf('win') != -1) {
                name = 'windows';
            } else if (appVersion.indexOf('mac') != -1) {
                name = 'macos';
            } else if (appVersion.indexOf('x11') != -1 || appVersion.indexOf('linux') != -1) {
                name = 'linux';
            }
        }
        jsu.osName = name ? name : 'unknown';
        jsu.osVersion = version ? version : 0;
    };
    jsu._getOSInfo();

    jsu._getBrowserInfo = function () {
        // get browser name and version
        let name;
        let version = 0.0;
        if (window.navigator && window.navigator.userAgentData && window.navigator.userAgentData.brands) {
            for (let i = 0; i < window.navigator.userAgentData.brands.length; i++) {
                const bd = window.navigator.userAgentData.brands[i];
                if (bd) {
                    name = bd.brand.toLowerCase();
                    if (name.indexOf('brand') != -1) {
                        continue;
                    }
                    version = parseFloat(bd.version);
                    if (name == 'google chrome' || name == 'chromium') {
                        name = 'chrome';
                    } else if (name == 'microsoft edge') {
                        name = 'edge';
                    }
                    jsu.userAgentData = window.navigator.userAgentData;
                    break;
                }
            }
        }
        if (!name && jsu.userAgent) {
            const extractVersion = function (ua, re) {
                const matches = ua.match(re);
                if (matches && !isNaN(parseInt(matches[1], 10))) {
                    let vNumb = '';
                    if (!isNaN(parseInt(matches[2], 10))) {
                        vNumb = matches[2];
                        while (vNumb.length < 10) {
                            // zero padding to be able to compare versions
                            vNumb = '0' + vNumb;
                        }
                    }
                    vNumb = matches[1] + '.' + vNumb;
                    return parseFloat(vNumb);
                }
                return 0.0;
            };
            const ua = jsu.userAgent;
            if (ua.indexOf('firefox') != -1) {
                name = 'firefox';
                version = extractVersion(ua, /firefox\/(\d+)\.(\d+)/);
                if (!version) {
                    version = extractVersion(ua, /rv:(\d+)\.(\d+)/);
                }
            } else if (ua.indexOf('edge') != -1) {
                name = 'edge';
                version = extractVersion(ua, /edge\/(\d+)\.(\d+)/);
            } else if (ua.indexOf('chromium') != -1) {
                name = 'chromium';
                version = extractVersion(ua, /chromium\/(\d+)\.(\d+)/);
            } else if (ua.indexOf('chrome') != -1) {
                name = 'chrome';
                version = extractVersion(ua, /chrome\/(\d+)\.(\d+)/);
            } else if (ua.indexOf('iemobile') != -1) {
                name = 'iemobile';
                version = extractVersion(ua, /iemobile\/(\d+)\.(\d+)/);
            } else if (ua.indexOf('msie') != -1) {
                name = 'ie';
                version = extractVersion(ua, /msie (\d+)\.(\d+)/);
            } else if (ua.indexOf('trident') != -1) {
                name = 'ie';
                version = extractVersion(ua, /rv.{1}(\d+)\.(\d+)/);
            } else if (ua.indexOf('opera') != -1) {
                name = 'opera';
                version = extractVersion(ua, /opera\/(\d+)\.(\d+)/);
            } else if (ua.indexOf('konqueror') != -1) {
                name = 'konqueror';
                version = extractVersion(ua, /konqueror\/(\d+)\.(\d+)/);
            } else if (ua.indexOf('mobile safari') != -1) {
                name = 'mobile_safari';
                version = extractVersion(ua, /mobile safari\/(\d+)\.(\d+)/);
            } else if (ua.indexOf('safari') != -1) {
                name = 'safari';
                version = extractVersion(ua, /version\/(\d+)\.(\d+)/);
            }
        }
        // detect type of device
        if (window.navigator && window.navigator.userAgentData) {
            jsu.isMobile = Boolean(window.navigator.userAgentData.mobile);
        } else {
            const ua = jsu.userAgent;
            jsu.isMobile = ua.indexOf('iphone') != -1 || ua.indexOf('ipod') != -1 || ua.indexOf('android') != -1 || ua.indexOf('iemobile') != -1 || ua.indexOf('opera mobi') != -1 || ua.indexOf('opera mini') != -1 || ua.indexOf('windows ce') != -1 || ua.indexOf('fennec') != -1 || ua.indexOf('series60') != -1 || ua.indexOf('symbian') != -1 || ua.indexOf('blackberry') != -1 || window.orientation !== undefined || (window.navigator && window.navigator.platform == 'iPad');
        }
        jsu.isTactile = document.documentElement && 'ontouchstart' in document.documentElement;

        jsu.browserName = name ? name : 'unknown';
        jsu.browserVersion = version;
    };
    jsu._getBrowserInfo();
}

if (shouldBeDefined('isRecordingAvailable')) {
    jsu.isRecordingAvailable = function () {
        const isFirefoxCompat = jsu.browserName === 'firefox' && jsu.browserVersion >= 45;
        const isChromeCompat = (jsu.browserName === 'chrome' || jsu.browserName === 'chromium') && jsu.browserVersion >= 57;
        const isEdgeCompat = jsu.browserName === 'edge' && jsu.browserVersion >= 79;
        return isFirefoxCompat ||
               isChromeCompat ||
               isEdgeCompat;
    };
}

/* Translations related functions */
if (shouldBeDefined('translate')) {
    jsu._translations = { en: {} };
    jsu._currentLang = 'en';
    jsu._currentCatalog = jsu._translations.en;
    jsu.useLang = function (lang) {
        jsu._currentLang = lang;
        if (!jsu._translations[lang]) {
            jsu._translations[lang] = {};
        }
        jsu._currentCatalog = jsu._translations[lang];
    };
    jsu.getCurrentLang = function () {
        return jsu._currentLang;
    };
    jsu.getCurrentCatalog = function () {
        return jsu._currentCatalog;
    };
    jsu.addTranslations = function (translations, lang) {
        // translations keys must be text or context + '\u0004' + text
        // example for translations:
        // {'text source 1': 'translated text 1', 'context\u0004text source 2': 'translated text 2'}
        let catalog;
        if (lang) {
            if (!jsu._translations[lang]) {
                jsu._translations[lang] = {};
            }
            catalog = jsu._translations[lang];
        } else {
            catalog = jsu._currentCatalog;
        }
        for (const text of Object.keys(translations)) {
            if (translations[text]) {
                // empty texts are ignored to use default texts
                catalog[text] = translations[text];
            }
        }
    };
    jsu.translate = function (text, context) {
        const key = (context ? context + '\u0004' : '') + text;
        if (key in jsu._currentCatalog) {
            return jsu._currentCatalog[key];
        } else if (jsu._currentLang != 'en' && key in jsu._translations.en) {
            return jsu._translations.en[key];
        }
        return text;
    };
    jsu.translateHTML = function (text, context) {
        // translate and escape text for HTML usage
        const trans = jsu.translate(text, context);
        return jsu.escapeHTML(trans);
    };
    jsu.translateAttribute = function (text, context) {
        // translate and escape text for HTML attribute usage
        const trans = jsu.translate(text, context);
        return jsu.escapeAttribute(trans);
    };
    jsu.getDateDisplay = function (date) {
        // date formats: "YYYY-MM-DDTHH:MM:SS" or "YYYY-MM-DD HH:MM:SS"
        if (!date) {
            return '';
        }
        const arr = (/^(\d+)-(\d+)-(\d+)(?: |T)(\d+):(\d+):(\d+)$/).exec(date);
        if (!arr) {
            return date;
        }
        // year
        const year = arr[1];
        // month
        let month = null;
        switch (arr[2]) {
            case '01': month = jsu.translate('January'); break;
            case '02': month = jsu.translate('February'); break;
            case '03': month = jsu.translate('March'); break;
            case '04': month = jsu.translate('April'); break;
            case '05': month = jsu.translate('May'); break;
            case '06': month = jsu.translate('June'); break;
            case '07': month = jsu.translate('July'); break;
            case '08': month = jsu.translate('August'); break;
            case '09': month = jsu.translate('September'); break;
            case '10': month = jsu.translate('October'); break;
            case '11': month = jsu.translate('November'); break;
            case '12': month = jsu.translate('December'); break;
        }
        // day
        const day = arr[3];
        // hour
        let hour = parseInt(arr[4], 10);
        // minute
        let minute = parseInt(arr[5], 10);
        // do not process invalid date
        if (!month || isNaN(hour) || isNaN(minute)) {
            return date;
        }
        // time
        if (minute < 10) {
            minute = '0' + minute;
        }
        let time;
        if (jsu._currentLang !== 'en') {
            // 24 hours time format
            if (hour < 10) {
                hour = '0' + hour;
            }
            time = hour + ':' + minute;
        } else {
            // 12 hours time format
            let moment;
            if (hour < 12) {
                moment = 'AM';
                if (!hour) {
                    hour = 12;
                }
            } else {
                moment = 'PM';
                if (hour > 12) {
                    hour -= 12;
                }
            }
            time = hour + ':' + minute + ' ' + moment;
        }
        return day + ' ' + month + ' ' + year + ' ' + jsu.translate('at') + ' ' + time;
    };
    jsu.getSizeDisplay = function (value) {
        if (!value || isNaN(value)) {
            return '0 ' + jsu.translate('B');
        }
        let unit = '';
        if (value > 1000) {
            value /= 1000;
            unit = 'k';
            if (value > 1000) {
                value /= 1000;
                unit = 'M';
                if (value > 1000) {
                    value /= 1000;
                    unit = 'G';
                    if (value > 1000) {
                        value /= 1000;
                        unit = 'T';
                    }
                }
            }
        }
        return value.toFixed(1) + ' ' + unit + jsu.translate('B');
    };
}
if (shouldBeDefined('getHashFromRequest')) {
    jsu.getHashFromRequest = function (method, url, data, headers) {
        let hash = method + url;
        if (hash && hash.includes('_=')) {
            hash = hash.replace(/_=[0-9]+&?/g, '');
            if (hash.endsWith('?') || hash.endsWith('&')) {
                hash = hash.substring(0, hash.length - 1);
            }
        }
        if (data instanceof FormData || data instanceof URLSearchParams) {
            hash += JSON.stringify(Object.fromEntries(data));
        } else if (data instanceof Blob) {
            hash += 'blob-' + data.size;
        } else if (data instanceof ArrayBuffer) {
            hash += 'arraybuffer-' + data.byteLength;
        } else if (data) {
            try {
                hash += JSON.stringify(data);
            } catch (e) {
                hash += JSON.stringify(new Date());
            }
        }
        if (headers) {
            hash += JSON.stringify(headers);
        }
        return hash;
    };
}
if (shouldBeDefined('xhrOverride')) {
    jsu.xhrOverride = true;
    // Avoid same ajax call if server doesn't respond yet

    const lastsXHRCalls = [];
    XMLHttpRequest.noIntercept = false;

    const open = XMLHttpRequest.prototype.open;

    XMLHttpRequest.prototype.open = function (method, url) {
        this._method = method;
        this._url = url;
        return open.apply(this, arguments);
    };

    const setRequestHeader = XMLHttpRequest.prototype.setRequestHeader;

    XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
        const returnData = setRequestHeader.apply(this, arguments);

        if (!this._headers) {
            this._headers = {};
        }

        if (!this._headers[header]) {
            this._headers[header] = [];
        }
        this._headers[header].push(value);
        return returnData;
    };
    const send = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.send = function (data) {
        const hash = jsu.getHashFromRequest(this._method, this._url, data, this._headers);
        if (lastsXHRCalls.includes(hash)) {
            const message = 'Duplicated request aborted';
            Object.defineProperty(this, 'statusText', {
                value: message,
                writable: false
            });
            return this.dispatchEvent(new CustomEvent('error', {'detail': {'error': message, 'message': message}}));
        } else {
            lastsXHRCalls.push(hash);
        }
        function onReadyStateChange () {
            if (this.readyState === XMLHttpRequest.DONE) {
                lastsXHRCalls.splice(lastsXHRCalls.indexOf(hash), 1);
            }
        }
        if (!this.noIntercept) {
            if (this.addEventListener) {
                this.addEventListener('readystatechange', onReadyStateChange, false);
            }
        }
        return send.apply(this, arguments);
    };
}
