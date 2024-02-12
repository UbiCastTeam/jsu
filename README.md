# JSU (JavaScript Utilities)

This project main module is `jsu.js`, a collection of common utilities and polyfills.

Some other common JavaScript modules are shipped with this project. Use the `minimal` branch if you don't need them.

## Development

Please use `eslint` to clean the code using the guidelines specified in the `.eslintrc.json` file.

Use the `make lint` command to check your code before pushing it.

## Usage

### As script

Add to your page:

```html
<script type="text/javascript" src="dist/jsu.min.js"></script>
```

You can then use the library:

```js
jsu.translate('test');
```

### As module

Import the module:

```js
import JavaScriptUtilities from 'dist/jsu.min.mjs';
```

You can then use the library:

```js
const jsu = new JavaScriptUtilities();
jsu.translate('test');
```

## History

This project is a refactoring of utils.js:
https://github.com/UbiCastTeam/utils-js
