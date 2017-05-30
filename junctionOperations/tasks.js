/**
 * Created by erginus-hybrid on 25/5/17.
 */
var connection = require('./mongoDbConnection');

module.exports.saveSong = function(){
    connection.connect(function(err, db){
        if(err) throw err;
        if(db){
            var collection = db.collection('albums');
            collection.insert({hi : 'hello world'});
        }
    })
}

module.exports.register = function(info, image, cb){
    console.log('info', info);
    connection.connect(function(err, db){
        if(err) throw err;
        if(db){
            var collection = db.collection('users');
            collection.find({"info.email" : { $in : [info.email]}}).toArray(function(err, data){
                if(err) throw err;
                console.log('here is data', data.length);
                if(data && data.length === 0 || data.length === undefined){
                    collection.insertOne({
                        info : info,
                        profilePic : image,
                        createdTime : new Date().toDateString(),
                        status : 0,
                        delete_status : 0,
                        followers : 0,
                        albums : 0
                    }).then(function(res){
                        console.log('ok');
                        cb('ok');
                    }, function (rej) {
                        cb('not_ok');
                    });
                }else{
                    cb('not_ok');
                }
            })
        }
    })
}