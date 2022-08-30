/* globals tinymce */
// Custom initialization script for Tiny MCE
var tinymce_custom_global_options = {};
function tinymce_custom_init(options) {
    $(document).ready(function () {
        var opt = options ? options : {};
        for (var key in tinymce_custom_global_options) {
            opt[key] = tinymce_custom_global_options[key];
        }
        if (!opt.selector)
            opt.mode = 'textareas';
        opt.menubar = false;
        opt.contextmenu = false;
        opt.convert_urls = false;
        opt.paste_data_images = true;
        opt.plugins = ['code codesample link lists paste help'];
        opt.fontsize_formats = '0.8em 0.9em 1em 1.2em 1.5em 2em 2.5em 3em';
        opt.valid_elements = 'div[*],p[*],span[*],br[*],b[*],strong[*],i[*],em[*],u[*],sub[*],sup[*],a[*],ul[*],ol[*],li[*],h1[*],h2[*],h3[*],h4[*],table[*],thead[*],tbody[*],tr[*],td[*],th[*],img[*],fieldset[*],legend[*],pre[*],code[*],blockquote[*],video[*],source[*]';
        opt.toolbar = 'paste undo redo | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | link unlink | bullist numlist | outdent indent codesample | fontsizeselect | code removeformat | help';
        opt.browser_spellcheck = true;
        opt.setup = function (editor) {
            this.on('init', function () {
                this.targetElm.required = false;
                $('#' + this.id + '_ifr').removeAttr('frameborder').removeAttr('allowtransparency');
                var current_title = $('#' + this.id + '_ifr').attr("title");
                var label = $("label[for="+this.id+"]")[0];
                if (label) {
                    $('#' + this.id + '_ifr').attr("title", label.textContent + " " + current_title);
                }
            });
        };
        opt.images_upload_handler = function (blobInfo, success) {
            const base64URI = 'data:' + blobInfo.blob().type + ';base64,' + blobInfo.base64();
            console.log(base64URI);
            success(base64URI);
        };
        tinymce.init(opt);
    });
}
