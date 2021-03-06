/**
 * @author Barret Lee<http://barretlee.com/about/>
 * @license MIT
 *
 * @example
 *    load('http://www.barretlee.com/blog/2016/04/28/javascript-performance-tester/', {
 *       title: '.post-title',
 *       description: '.post-content',
 *       reg: function(data){
 *         return data.replace(/<div class="shit-spider"[\s\S]+?<\/div>/, '');
 *       }
 *     }).then(function(data){
 *       console.log(data.content);
 *     }).catch(function(err){
 *       console.log(err);
 *     });
 */

var Log = new require('log-color');
var path = require('path');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var mkdirp = require('mkdirp');
var util = require('./util');

var opt;
var cfg = util.getConfig();
var log = util.log;

var entry = path.join(__dirname, '../', cfg.entry.base);

module.exports = function(url, options) {
  opt = options;
  mkdirp.sync(entry);
  return new Promise(function(resolve, reject) {
    log.info('download uri: ' + url);
    request(url, function(err, response, body) {
      if (!err && response.statusCode == 200) {
        resolve(body);
      } else {
        reject(err);
      }
    });
  })
  .then(parser)
  .then(function(data){
    return util.saveFiles(data, entry);
  })
  .catch(function(err) {
    log.error(err);
  });
};

/**
 * parse content
 * @param  {DOMString} $ DOM String
 * @return {String}      html String
 */
function parser(body) {
  if (opt.reg && typeof opt.reg === 'function') {
    body = opt.reg(body);
  }
  var $ = cheerio.load(body, {
    xmlMode: true
  });
  return {
    title: $(opt.title).text(),
    description: $(opt.description).html()
  }
}
