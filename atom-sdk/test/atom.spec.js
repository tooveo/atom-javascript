'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var mock = require("./mock/is.mock");
var ISAtom = require('../../dist/sdk').IronSourceAtom;
var test = require('tape');

test('should generate new IronSourceAtom object with default values', function(t) {
  t.plan(1);
  var atom = new ISAtom();
  
  t.same(atom.options, {
    endpoint: "https://track.atom-data.io/",
    apiVersion: "V1",
    auth: ""
  });
});

test('should generate new IronSourceAtom object with custom values', function(t) {
  t.plan(1);
  var opt = {
    endpoint: "/some-url",
    auth: "aM<dy2gchHsad07*hdACY",
    apiVersion: 'V1'
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

test('should throw error for putEvent/putEvents if no required params', function(t){
  t.plan(4);
  var atom = new ISAtom();
  
  t.throws(function() {
    atom.putEvent({table: "test"});
  }, Error, 'Data is required');

  t.throws(function() {
    atom.putEvent();
  }, Error, 'Stream is required');

  t.throws(function() {
    atom.putEvents({table: "test"});
  }, Error, 'Data (must be not empty array) is required');

  t.throws(function() {
    atom.putEvents({data: ['some data']});
  }, Error, 'Stream is required');
});

test('should generate right data for GET request', function(t) {
  t.plan(2);
  var atom = new mock.ISAtomMock();
  
  var param = {
    table: 'table',
    data: 'data',
    method: 'GET'
  };
  
  var param2 = {
    table: 'table',
    data: ['data'],
    method: 'GET'
  };

  t.same(atom.putEvent(param), 'eyJ0YWJsZSI6InRhYmxlIiwiZGF0YSI6ImRhdGEiLCJhcGlWZXJzaW9uIjoiVjEiLCJhdXRoIjoiYXV0aC1rZXkifQ==');
  t.same(atom.putEvents(param2), 'eyJ0YWJsZSI6InRhYmxlIiwiZGF0YSI6WyJkYXRhIl0sImFwaVZlcnNpb24iOiJWMSIsImF1dGgiOiJhdXRoLWtleSJ9');
});
