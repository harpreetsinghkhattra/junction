/**
 * Created by erginus-hybrid on 25/5/17.
 */
var client = require('mongodb').MongoClient;

module.exports.connect = function(cb){
    var url = 'mongodb://localhost:27017/junction';

    client.connect(url, function(err, db){
        cb(err, db);
    })

}