// Custom initialization script for TinyMCE
/* globals tinymce */

window.tinymceCustomGlobalOptions = {};

window.tinymceCustomInit = function (options) {
    const onDOMReady = function () {
        // Allowed elements must match the list from Django web utils (html_utils)
        const ALLOWED_TAGS = ['div', 'p', 'span', 'br', 'b', 'strong', 'i', 'em', 'u', 'sub', 'sup', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'img', 'fieldset', 'legend', 'pre', 'code', 'blockquote', 'video', 'source'];
        const ALLOWED_ATTRS = {
            '*': ['class', 'style'],
            'a': ['href', 'target', 'title'],
            'img': ['alt', 'src', 'title'],
            'td': ['rowspan', 'colspan'],
            'th': ['rowspan', 'colspan'],
            'source': ['src', 'type'],
            'video': ['src', 'poster', 'loop', 'autoplay', 'muted', 'controls', 'playsinline', 'preload']
        };
        const ALLOWED_CSS = ['margin', 'padding', 'color', 'background', 'vertical-align', 'font-weight', 'font-size', 'font-style', 'text-decoration', 'text-align', 'text-shadow', 'border', 'border-radius', 'box-shadow', 'width', 'height', 'overflow'];

        // Format valid elements for TinyMCE
        const validElements = [];
        for (const tag of ALLOWED_TAGS) {
            let attrs = ALLOWED_ATTRS['*'].join('|');
            if (tag in ALLOWED_ATTRS) {
                for (const attr of ALLOWED_ATTRS[tag]) {
                    attrs += '|' + attr;
                }
            }
            validElements.push(tag + '[' + attrs + ']');
        }

        const imageUploadHandler = (blobInfo) => new Promise((resolve) => {
            const base64URI = 'data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64();
            resolve(base64URI);
        });

        // Build default options
        const opt = {
            'valid_elements': validElements.join(','),
            'valid_styles': {'*': ALLOWED_CSS.join(',')},
            'menubar': false,
            'contextmenu': false,
            'convert_urls': false,
            'paste_data_images': true,
            'plugins': ['code', 'codesample', 'link', 'lists', 'help'],
            'font_size_formats': '80%=0.8em 100%=1em 120%=1.2em 150%=1.5em 200%=2em 250%=2.5em 300%=3em',
            'toolbar': 'paste undo redo | fontsize bold italic underline strikethrough | link unlink | bullist numlist | alignleft aligncenter alignright alignjustify | outdent indent codesample | fontsizeselect | code removeformat | help',
            'browser_spellcheck': true,
            'setup': function (editor) {
                editor.on('init', function () {
                    this.targetElm.required = false;
                    const elm = document.getElementById(this.id + '_ifr');
                    if (elm) {
                        elm.removeAttribute('frameborder');
                        elm.removeAttribute('allowtransparency');
                        const label = document.querySelector('label[for=' + this.id + ']');
                        if (label) {
                            elm.setAttribute('title', label.textContent + ' ' + elm.getAttribute('title'));
                        }
                    }
                });
            },
            'images_upload_handler': imageUploadHandler
        };

        // Override custom options
        for (const key in window.tinymceCustomGlobalOptions) {
            opt[key] = window.tinymceCustomGlobalOptions[key];
        }
        if (options) {
            for (const key in options) {
                opt[key] = options[key];
            }
        }
        if (!opt.selector) {
            opt.mode = 'textareas';
        }
        tinymce.init(opt);
    };

    // See if DOM is already available
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // Call on next available tick
        setTimeout(onDOMReady, 1);
    } else {
        // Call when ready
        document.addEventListener('DOMContentLoaded', onDOMReady);
    }
};
