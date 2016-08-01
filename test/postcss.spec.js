/* global it, describe */

'use strict'

var fs = require('fs')
var expect = require('chai').expect

describe('Postcss', function () {
  it('should write from source to destination directories', function (done) {
    var css = fs.readFileSync('./tmp/styles.css', 'utf8').trim()

    expect('a:before { content: "test"; }').to.equal(css)
    done()
  })
})
