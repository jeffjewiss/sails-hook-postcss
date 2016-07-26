sails-hook-postcss
==================

[![Build Status](https://travis-ci.org/jeffjewiss/sails-hook-postcss.svg?branch=master)](https://travis-ci.org/jeffjewiss/sails-hook-postcss)
[![npm version](https://badge.fury.io/js/sails-hook-postcss.svg)](http://badge.fury.io/js/sails-hook-postcss)
[![Coverage Status](https://coveralls.io/repos/github/jeffjewiss/sails-hook-postcss/badge.svg?branch=master)](https://coveralls.io/github/jeffjewiss/sails-hook-postcss?branch=master)

A Sails hook for processing your Sails application’s CSS with Postcss.

Postcss will attempt to compile your CSS once when your application lifts and will then watch your assets directory for changes to CSS files and recompile. When the `NODE_ENV` is set to “production”, the hook will only compile the CSS once when the application is lifted.


Installation
------------

Add `sails-hook-postcss` to your `devDependencies` in your `package.json` and Sails will load it when lifting your application.

Create a configuration file `config/postcss.js` to specify the plugins you’d like to use. It should look something like the following:

```javascript
var cssnext = require(‘cssnext’);

module.exports.postcss = {
  plugins: [
    cssnext(),
  ]
};
```
