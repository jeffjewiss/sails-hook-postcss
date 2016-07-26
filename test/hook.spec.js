/* global it, describe, sails */

'use strict'

// dependencies
var expect = require('chai').expect

describe('Hook#validation', function () {
  it('should be loaded as installable hook', function (done) {
    expect(sails.hooks.postcss).to.not.be.null
    done()
  })
})
