'use strict';

var ISAtom = require('../../dist/sdk').IronSourceAtom;
var expect = require('chai').expect;
var sinon = require('sinon');
var mock = require("./mock/is.mock");

describe('Atom class test', function() {
  
  it('should generate new IronSourceAtom object with default values', function() {
    var atom = new ISAtom();
    
    expect(atom.options).to.eql({
      endpoint: "https://track.atom-data.io/",
      apiVersion: "V1",
      auth: ""
    })
  });

  it('should generate new IronSourceAtom object with custom values', function() {
    var opt = {
      endpoint: "/some-url",
      apiVersion: "V1.1",
      auth: "aM<dy2gchHsad07*hdACY"
    };
    var atom = new ISAtom(opt);
    
    expect(atom.options).to.eql(opt);
  });
  
  it('should generate right data for POST request', function() {
    var atom = new mock.ISAtomMock();
    var param = {
      table: 'table',
      data: 'data'
    };
    
    expect(atom.putEvent(param)).to.be.eql({
      apiVersion: "V1",
      auth: "auth-key",
      table: "table",
      data: "data"
    });
  });
  
  it('should throw error for putEvent if no required params', function(){
    var atom = new ISAtom();
    expect(function(){
      atom.putEvent();
    }).to.throw('Data and table is required');
  });

  it('should generate right data for GET request', function() {
    var atom = new mock.ISAtomMock();
    var param = {
      table: 'table',
      data: 'data',
      method: 'GET'
    };

    expect(atom.putEvent(param)).to.be.equal('eyJ0YWJsZSI6InRhYmxlIiwiZGF0YSI6ImRhdGEiLCJhcGlWZXJzaW9uIjoiVjEiLCJhdXRoIjoiYXV0aC1rZXkifQ==');
  });
  
});
