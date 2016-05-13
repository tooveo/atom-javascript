var test = require('tape');
var ISAtom = require('../../dist/sdk').IronSourceAtom;
var expect = require('chai').expect;
var sinon = require('sinon');
var mock = require("./mock/is.mock");

test('should generate new IronSourceAtom object with default values', function (t) {
  t.plan(1);
  var atom = new ISAtom();

  t.same(atom.options, {
    endpoint: "https://track.atom-data.io/",
    apiVersion: "V1",
    auth: ""
  });
  
  test('should generate new IronSourceAtom object with custom values', function(t) {
    "use strict";
    t.plan(1);
    var opt = {
      endpoint: "/some-url",
      apiVersion: "V1",
      auth: "aM<dy2gchHsad07*hdACY"
    };
    var atom = new ISAtom(opt);

    t.same(atom.options, opt);
  });
  
  test('should generate right data for POST request', function(t) {
    t.plan(1);
    var atom = new mock.ISAtomMock();
    var param = {
      table: 'table',
      data: 'data'
    };

    t.same(atom.putEvent(param), {
      apiVersion: "V1",
      auth: "auth-key",
      table: "table",
      data: "data"
    });
  });

  test('should throw error for putEvent if no required params', function(t) {
    t.plan(1);
    try {
      var atom = new ISAtom();

      atom.putEvent();
      t.fail()
    } catch (e) {
      t.pass('Data and table is required');
    } t.end();
  });

  test('should generate right data for GET request', function(t) {
    t.plan(1);
    var atom = new mock.ISAtomMock();

    var param = {
      table: 'table',
      data: 'data',
      method: 'GET'
    };

    t.same(atom.putEvent(param), 'eyJ0YWJsZSI6InRhYmxlIiwiZGF0YSI6ImRhdGEiLCJhcGlWZXJzaW9uIjoiVjEiLCJhdXRoIjoiYXV0aC1rZXkifQ==');
  });
  
});
