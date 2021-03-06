/**
 * Express Pouchdb Replication Stream
 *
 * An express endpoint for streaming changes from a
 * couch database to the client in bulk.
 *
 * @author Conor Mac Aoidh <conormacaoidh@gmail.com>
 */
'use strict';
/*jshint camelcase: false */

var pouch = require('pouchdb');
var pouchRepStream = require('pouchdb-replication-stream');

// register pouch-replication-stream as a plugin
pouch.plugin(pouchRepStream.plugin);
pouch.adapter('writableStream', pouchRepStream.adapters.writableStream);

/**
 * ExpressPouchReplicationStream
 *
 * An express endpoint for streaming changes from a
 * couch database to the client in bulk.
 *
 * @param opts
 *          - url: full url of couch db location
 *          - replication: options to be passed to couchdb
 *              - filter
 *              - query_params
 *          see:
 *
 * http://wiki.apache.org/couchdb/Replication#Filtered_Replication
 */
var ExpressPouchReplicationStream = function(opts){
  // parse options
  var config = {
    url: typeof opts === 'string' ? opts : opts.url,
    dbReq: !!opts.dbReq,
    replicationOpts : opts.replication || {},
    error: opts.error || false
  };

  // return function that fulfills the request
  return function(req, res, next){  

    var url = config.url;
    // db is passed in the request
    if(config.dbReq){
      url += '/' + req.params.db;
    }

    // stream db to express response
    var db = new pouch(url);
    return db.dump(res, config.replicationOpts)
      .catch(function(err){
        // custom error handler
        if(typeof config.error === 'function'){
          return config.error(err);
        }
        res.status(500).send(err);
      });
  };
};

module.exports = ExpressPouchReplicationStream;
