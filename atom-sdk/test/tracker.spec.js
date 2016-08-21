'use strict';

var Tracker = require('../../dist/sdk').Tracker;
var ISAtomMock = require('./mock/mock').ISAtomMock;
var chai = require('chai');
var expect = require('chai').expect;
var sinon = require('sinon');

describe('Tracker class and methods', function () {

  this.timeout(5000);

  describe('Constructor tests', function () {

    it('should generate new Tracker object with default values', function () {
      var tracker = new Tracker();

      expect(tracker.params).to.be.eql({
        flushInterval: 30000,
        bulkLen: 20,
        bulkSize: 40 * 1024,
        auth: ''
      });

    });

    it('should generate new Tracker objects with custom values', function () {
      var params = {
        flushInterval: 1,
        bulkLen: 100,
        bulkSize: 1
      };

      var tracker = new Tracker(params);
      expect(tracker.params).to.be.eql(
        {
          flushInterval: 1000,
          bulkLen: 100,
          bulkSize: 1024,
          auth: ''
        });
    });

  });

  describe('Track method tests', function () {

    it('should accumulate data in a backlog before flush', function () {
      var tracker = new Tracker();
      tracker.track('stream', 'data1');
      tracker.track('stream', 'data2');
      expect(tracker.accumulated['stream']).to.be.eql(['data1', 'data2']);
    });

    it('should throw an error when stream is empty', function () {
      var tracker = new Tracker();
      expect(tracker.track).to.throw('Stream name and data are required parameters');
    });

    it('should flush each time when reaching the interval', function () {

      var params = {
        flushInterval: 3,
        status: 200
      };

      var clock = sinon.useFakeTimers();
      var tracker = new Tracker(params);

      tracker.atom = new ISAtomMock(tracker.params);
      var flush = sinon.spy(tracker, 'flush');
      tracker.track('stream', 'data');

      clock.tick(7000);
      flush.restore();
      clock.restore();
      sinon.assert.calledTwice(flush);

    });

    it('should flush after a certain bulk length has been reached', function () {
      var params = {
        bulkLen: 1,
        status: 200
      };

      var tracker = new Tracker(params);
      tracker.atom = new ISAtomMock(tracker.params);
      var flush = sinon.spy(tracker, 'flush');
      tracker.track('stream', 'data');

      flush.restore();
      sinon.assert.calledOnce(flush);
    });

    it('should flush after a certain bulk size has been reached', function () {
      var params = {
        bulkSize: 1,
        status: 200
      };

      var tracker = new Tracker(params);
      tracker.atom = new ISAtomMock(tracker.params);
      var flush = sinon.spy(tracker, 'flush');
      var event = require('./mock/event.json');
      tracker.track('stream', event);

      flush.restore();
      sinon.assert.calledOnce(flush);
    });

    it('should run flush with params', function () {
      var tracker = new Tracker();
      tracker.atom = new ISAtomMock({"status": 200});
      tracker.track('stream', 'data');
      tracker.flush('stream', function (results) {
        expect(results[0]).to.be.eql({err: null, data: '{ "Status": "OK" }', status: 200});
      })
    });

    it('should handle bad auth - 401', function () {
      var params = {
        status: 401
      };
      var tracker = new Tracker(params);
      tracker.atom = new ISAtomMock(tracker.params);
      tracker.track("test", "test");
      tracker.flush('test', function (results) {
        expect(results[0]).to.be.eql({err: '"Auth Error test', data: null, status: 401});
      })
    });

    it('should retry to flush on 500', function (done) {
      var params = {
        status: 500
      };
      var tracker = new Tracker(params);
      tracker.retryTimeout = 100;
      tracker.atom = new ISAtomMock(tracker.params);

      tracker.track("test", "test");
      var flush = sinon.spy(tracker.atom, 'putEvents');

      tracker.flush('test', function (results) {
        expect(results[0]).to.be.eql({err: null, data: '{ "Status": "OK" }', status: 200});
        flush.restore();
        sinon.assert.calledThrice(flush);
        done();
      });
    });

    it('should get a timeout on too long retry time', function (done) {
      var params = {
        status: 500
      };

      var tracker = new Tracker(params);
      tracker.retryTimeout = 1200001;
      tracker.atom = new ISAtomMock(tracker.params);

      tracker.track("test", "test");
      var flush = sinon.spy(tracker.atom, 'putEvents');

      tracker.flush('test', function (results) {
        expect(results[0]).to.be.eql({err: 'Timeout - No response from server', data: null, status: 408});
        flush.restore();
        done();
      });
    });

  });
});