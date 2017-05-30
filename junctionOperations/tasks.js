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

module.exports.registerSongs = function(info, songStuff, cb){
    console.log('info', info, '=========================================>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', info.singer);
    connection.connect(function(err, db){
        if(err) throw err;
        if(db){
            var collection = db.collection('albums');
            collection.find({"info.singer" : { $in : [info.singer]}}).toArray(function(err, data){
                if(err) throw err;
                console.log('here is data', data.length);
                if(data && data.length === 0 || data.length === undefined){
                    collection.insertOne({
                        info : info,
                        songAndBanner : songStuff,
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
                    cb('already');
                }
            })
        }
    })
}

module.exports.registerTypes = function( type, cb ){
    console.log('info', type);
    connection.connect(function(err, db){
        if(err) throw err;
        if(db){
            var songTypes = db.collection('songTypes');
            songTypes.find({"type" : type.gType}).toArray(function(err, data){
                if(err) throw err;
                console.log('here is data', data.length);
                if(data && data.length === 0 || data.length === undefined){
                    songTypes.insertOne({
                        type : type.gType,
                        createdTime : new Date().toDateString(),
                        status : 0,
                        delete_status : 0
                    }).then(function(res){
                        console.log('ok');
                        cb('ok');
                    }, function (rej) {
                        cb('not_ok');
                    });
                }else{
                    cb('already');
                }
            })
        }
    })
}

module.exports.getTypes = function(cb){

    connection.connect(function(err, db){
        if(err) throw err;
        if(db){
            var songTypes = db.collection('songTypes');
            songTypes.find({}).toArray(function(err, data){
                if(err) throw err;
                console.log('here is data', data.length);
                if(data && data.length !== 0 || data.length !== undefined){

                    var tempArray = [];
                    data.forEach(function(value){
                        tempArray.push(value.type);
                    })

                    if(tempArray.length !== 0){
                        cb(tempArray);
                    }
                }else{
                    cb('not_ok');
                }
            })
        }
    })
}