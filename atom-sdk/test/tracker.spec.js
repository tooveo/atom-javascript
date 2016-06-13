'use strict';

function setupServer(sinon, before, after) {
  var server;

  before(function() {
    server = sinon.fakeServer.create({
      autoRespond: true
    });

    server.respondWith(/endpoint(\?data=.*)?/, [
      200,
      {
        'Content-Type': 'application/json'
      },
      '{"success": "true"}'
    ]);

    server.respondWith(/err(\?data=.*)?/, [
      401,
      {
        'Content-Type': 'application/json'
      },
      '{"error": "No permission for this stream"}'
    ]);

    server.respondWith(/server-err(\?data=.*)?/, [
      500,
      {
        'Content-Type': 'application/json'
      },
      '{"error": "Server error"}'
    ])
  });

  after(function() {
    server.restore();
  });
}
global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

var Tracker = require('../../dist/sdk').Tracker;
var ISAtom = require('../../dist/sdk').IronSourceAtom;

var chai = require('chai');
var expect = require('chai').expect;
var sinon = require('sinon');

describe('Testing tracker class and methods', function() {
  setupServer(sinon, before, after);
  
  it('should check correct data on tracker constructor', function() {
    var t = new Tracker();

    expect(t.params).to.be.eql({
      flushInterval: 10000,
      bulkLen: 10000,
      bulkSize: 64 * 1024
    });

    var params = {
      flushInterval: 1,
      bulkLen: 100,
      bulkSize: 1
    };

    var p = new Tracker(params);
    expect(p.params).to.be.eql(
      {
        flushInterval: 1000,
        bulkLen: 100,
        bulkSize: 1024
      }
    )
  });

  it('should accumulate data in one arr before flush', function() {
    var t = new Tracker();
  
    t.track('stream', 'data1');
    t.track('stream', 'data2');
    expect(t.accumulated['stream']).to.be.eql(['data1', 'data2']);
  });
  
  it('should throw err when stream empty', function() {
    var t = new Tracker();
    
    expect(t.track()).to.be.eql(new Error('Stream or data empty'));
  });
  
  it('should check run flush after timeout len size',function() {
    var params = {
      flushInterval: 3,
      bulkLen: 2,
      bulkSize: 100
    };
  
    var clock = sinon.useFakeTimers();
    var t = new Tracker(params);
  
    t.track('stream', 'data');
  
    var flush =  sinon.spy(t, 'flush');
    clock.tick(4100);
    flush.restore();
    clock.restore();
    sinon.assert.calledTwice(flush);
  });

  it('should run flush with params', function() {
    var t = new Tracker();

    t.track('stream', 'data');
    expect(t.flush('stream')).to.be.not.null;

  });
});