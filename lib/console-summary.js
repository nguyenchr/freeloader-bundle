var _         = require('lodash');
var q         = require('q');
var util      = require('util');
var Stats     = require('fast-stats').Stats;
var FLS       = require('freeloader-stream');

function ConsoleSummary() {
  FLS.call(this);
  this.on('request', this.onRequest);
  this.on('finish', this.onFinish);
  this.responses = [];
  this.responseTimes = [];
}

util.inherits(ConsoleSummary, FLS);
ConsoleSummary.prototype.name = 'ConsoleSummary';

ConsoleSummary.prototype.onRequest = function(item) {
  var startTime = new Date();
  this.responses.push(item.response);
  item.response.then(function(res) {
    this.responseTimes.push(new Date() - startTime);
  }.bind(this)).done();
  this.push(item);
};

ConsoleSummary.prototype.onFinish = function() {
  q.all(this.responses).then(function() {
    var stats = new Stats().push(this.responseTimes);
    console.log('\n');
    console.log('Response count = ', this.responses.length);
    console.log('Response times');
    console.log('  min    = ', time(_.min(this.responseTimes)));
    console.log('  max    = ', time(_.max(this.responseTimes)));
    console.log('  mean   = ', time(stats.amean()));
    console.log('  median = ', time(stats.median()));
    console.log('  75th percentile = ', time(stats.percentile(75)));
    console.log('  90th percentile = ', time(stats.percentile(90)));
    console.log('');
  }.bind(this)).done();
};

function time(millis) {
  if (millis < 1000) {
    return Math.floor(millis) + 'ms';
  } else {
    var seconds = millis / 1000;
    return seconds.toFixed(2) + 's';
  }
}

module.exports = function() {
  return new ConsoleSummary();
};
