/* global it, describe */

'use strict'

var expect = require('chai').expect
var sails = require('sails')

var emittedWatching
var emittedInitializing
var emittedInitialized
var emittedCompiling
var emittedCompiled
var emittedConfiguring
var emittedConfigured

describe('Hook#validation', function () {
  it('should be loaded as installable hook', function (done) {
    expect(sails.hooks.postcss).to.not.be.null
    done()
  })
})

describe('Hook#emit', function () {
  this.timeout(11000)

  sails.on('hook:postcss:watching', function () {
    emittedWatching = true
  })

  sails.on('hook:postcss:initializing', function () {
    emittedInitializing = true
  })

  sails.on('hook:postcss:initialized', function () {
    emittedInitialized = true
  })

  sails.on('hook:postcss:compiling', function () {
    emittedCompiling = true
  })

  sails.on('hook:postcss:compiled', function () {
    emittedCompiled = true
  })

  sails.on('hook:postcss:configuring', function () {
    emittedConfiguring = true
  })

  sails.on('hook:postcss:configured', function () {
    emittedConfigured = true
  })

  it('watching', function (done) {
    expect(emittedWatching).to.be.true

    done()
  })

  it('init', function (done) {
    expect(emittedInitializing).to.be.true
    expect(emittedInitialized).to.be.true

    done()
  })

  it('compile', function (done) {
    expect(emittedCompiling).to.be.true
    expect(emittedCompiled).to.be.true

    done()
  })

  it('config', function (done) {
    expect(emittedConfiguring).to.be.true
    expect(emittedConfigured).to.be.true

    done()
  })
})
