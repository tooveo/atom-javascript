'use strict';

var ISAtom = require('../../dist/sdk').IronSourceAtom;
var expect = require('chai').expect;
var sinon = require('sinon');

describe('Check Atom class methods', function() {
    var opt = {};
    var atom = new ISAtom(opt);

    it('should generate new class instance', function(){
        expect(atom.options.endpoint).to.be.equal("https://track.atom-data.io/");
        expect(atom.options.apiVersion).to.be.equal("V2");
        expect(atom.options.auth).to.be.equal("");
    });

    describe('requests', function(){
        var param = {
            table: 'staging.ic.ic_pixel_logs',
            data: "{\"name\": \"iron\", \"last_name\": \"Beast\"}",
        };
        
        beforeEach(function() {
            this.xhr = sinon.useFakeXMLHttpRequest();

            this.requests = [];
            this.xhr.onCreate = function(xhr) {
                this.requests.push(xhr);
            }.bind(this);
        });

        // afterEach(function() {
        //     this.xhr.restore();
        // });
        
        it('should send POST request with putEvent method', function() {
            expect(atom.putEvent(param, function(){})).to.be.equal(""); 
        });

        it('should send send GET request with putEvent method', function() {});

    });

    it('should take err response after xhr request', function() {});

    it('should take data from response after xhr request', function() {});

    it('should send health request', function() {})
});