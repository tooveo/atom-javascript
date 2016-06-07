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
      apiVersion: "1.1.0",
      auth: ""
    })
  });

  it('should generate new IronSourceAtom object with custom values', function() {
    var opt = {
      endpoint: "/some-url",
      auth: "aM<dy2gchHsad07*hdACY",
      apiVersion: '1.1.0'
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

  it('should throw error for putEvent/putEvents if no required params', function(){
    var atom = new ISAtom();

      atom.putEvent({table: "test"}, function(err){
        expect(err).to.be.eql('Data is required');
      });

      atom.putEvent({}, function(err){
        expect(err).to.be.eql('Stream is required');
      });
    
      atom.putEvents({table: "test"}, function(err){
        expect(err).to.be.eql('Data (must be not empty array) is required');
      });
    
      atom.putEvents({data: ['some data']}, function(err){
        expect(err).to.be.eql('Stream is required');
      });
  });

  it('should generate right data for GET request', function() {
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

    expect(atom.putEvent(param)).to.be.equal('eyJ0YWJsZSI6InRhYmxlIiwiZGF0YSI6ImRhdGEiLCJhcGlWZXJzaW9uIjoiVjEiLCJhdXRoIjoiYXV0aC1rZXkifQ==');
    expect(atom.putEvents(param2)).to.be.equal('eyJ0YWJsZSI6InRhYmxlIiwiZGF0YSI6WyJkYXRhIl0sImFwaVZlcnNpb24iOiJWMSIsImF1dGgiOiJhdXRoLWtleSJ9');
  });

});