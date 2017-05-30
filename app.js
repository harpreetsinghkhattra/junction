/**
 * Created by erginus-hybrid on 17/5/17.
 */

    // external libraries
var http = require('http');
var fs = require('fs');
var BusBoy = require('busboy');
var path = require('path');
var url  = require('url');
var query = require('querystring');
var session = require('./node_modules/sesh/lib/core').session;

// manually operations here
var mail = require('./junctionOperations/junctionMailSender');
var task = require('./junctionOperations/tasks');

/*
* http server for listening client requests
* stat will confirm which type of request
 */
var server = http.createServer(function(req, res){

    var uri = url.parse(req.url);
    var mType = path.parse(req.url);
    //console.log(uri);

    var mimeType = {
        '.html' : 'text/html',
        '.jpg' : 'image/*',
        '.jpeg' : 'image/*',
        '.gif' : 'image/*',
        '.css' : 'text/css',
        '.js' : 'text/javascript',
        '.mp3' : 'audio/mp3'
    }
    var path_url = path.join (__dirname, '/client'+req.url);
    fs.lstat(path_url, function (err, stat){
        console.log(path_url);
        if(err){

            if(/\.(js|map|html|css|jpg|jpeg|gif|png|ico)$/i.test(req.url)){
                path_url = path.join (__dirname, '/client'+req.url);
            }else if (/\.(module)$/i.test(req.url)){
                path_url = path.join (__dirname, '/client'+req.url+'.js');
            }else{
                path_url = path.join (__dirname, '/client'+req.url+'.js');
            }

            console.log('=>',path_url);
            isFilePresent(path_url, function (info) {
                console.log(info);
                if(info === 'ok'){
                    res.writeHead(200, {'Content-Type': mimeType[mType.ext]});
                    var stream = fs.createReadStream(path_url, {encoding: 'utf-8'}).pipe(res)
                    stream.on('end', function(){
                        res.end();
                    });
                }else{

                    /*
                    * REST APIs HERE
                    * UNDER SESSION.JS FILE
                     */
                    session(req, res, function(req, res){
                        switch(uri.pathname){
                            case '/upload':
                                if (req.method === 'GET'){
                                    console.log('Hi I am in get method')
                                    res.end('get');
                                }else if (req.method === 'POST'){
                                    console.log('Hi I am in post method',req.headers,  query.parse(uri.query));

                                    res.writeHead(200, { 'Content-Type' : 'application/json'});
                                    res.write(JSON.stringify({ok : 'ok'}));
                                    res.end();
                                }
                                break;
                            case '/home' :
                                if (req.method === 'GET'){
                                    console.log('Hi I am in get method');
                                    req.session.data.username = 'hell man';
                                    res.writeHead(200, {'Content-Type': String.valueOf(mimeType[mType.ext])})
                                    var stream = fs.createReadStream(path.join(__dirname, '/client/src/index.html'), {encoding: 'utf-8'}).pipe(res);
                                    stream.on('end', function(){
                                        res.end();
                                    });
                                }
                                break;
                            case '/send' :
                                if (req.method === 'GET'){
                                    console.log('Hi I am in get method');
                                    //mail.sendYourMail();
                                    res.writeHead(200, {'Content-Type': String.valueOf(mimeType[mType.ext])})
                                    res.end(req.session.get('username'));
                                }
                                break;
                            case '/userProfile' :
                                if (req.method === 'GET'){
                                    console.log('Hi I am in get method')
                                    res.writeHead(200, {'Content-Type': String.valueOf(mimeType[mType.ext])})
                                    var stream = fs.createReadStream(path.join(__dirname, '/client/src/index.html')).pipe(res);
                                    stream.on('end', function(){
                                        res.end();
                                    });
                                }
                                break;
                            case '/uploadNewSongs' :
                                if (req.method === 'GET'){
                                    res.writeHead(200, {'Content-Type': String.valueOf(mimeType[mType.ext])})
                                    var stream = fs.createReadStream(path.join(__dirname, '/client/src/index.html')).pipe(res);
                                    stream.on('end', function(){
                                        res.end();
                                    });
                                }else if(req.method === 'POST'){
                                    console.log('here i am in post request', req.headers);

                                    //--------------------------------------------- UPLOAD FILE --------------------------

                                    var busBoy = new BusBoy({headers : req.headers});

                                    busBoy.on('file', function(fieldname, file, filename, encoding, mimetype) {
                                        console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
                                        var tempFile = filename.split('.');
                                        var uploadedFileName = path.join(__dirname, '/client/src/public/images/albumsAndSongs/'+Math.random().toString().split('.')[1]+'(Junction.com)'+path.extname(filename));
                                        file.pipe(fs.createWriteStream(uploadedFileName));
                                        req.session.data.uploadedSong = uploadedFileName;
                                    });
                                    busBoy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
                                        console.log('Field [' + fieldname + ']: value: '+ query.stringify(val), fieldnameTruncated, valTruncated);
                                    });
                                    busBoy.on('finish', function() {
                                        console.log('Done parsing form!');
                                        res.writeHead(200, { 'Content-Type' : 'application/json'});
                                        res.write(JSON.stringify({ok : 'ok'}));
                                        res.end();
                                    });
                                    req.pipe(busBoy);
                                }
                                break;
                            case '/registerUser':
                                if (req.method === 'GET'){
                                    res.writeHead(200, {'Content-Type': String.valueOf(mimeType[mType.ext])})
                                    var stream = fs.createReadStream(path.join(__dirname, '/client/src/index.html')).pipe(res);
                                    stream.on('end', function(){
                                        res.end();
                                    });
                                }else if (req.method === 'POST'){
                                    var body = '';
                                    req
                                        .on('data', function (data){
                                       if(data){
                                           body +=data;
                                       }
                                    })
                                        .on('end', function(){

                                            task.register(JSON.parse(body) , req.session.data.profileImage, function(response){
                                                if(response === 'ok'){
                                                    res.writeHead(200, { 'Content-Type' : 'application/json'});
                                                    res.write(JSON.stringify({response : 'ok'}));
                                                    res.end();
                                                }else if(response === 'not_ok'){
                                                    res.writeHead(500, { 'Content-Type' : 'application/json'});
                                                    res.write(JSON.stringify({response : 'Server Error'}));
                                                    res.end();
                                                }else{
                                                    res.writeHead(500, { 'Content-Type' : 'application/json'});
                                                    res.write(JSON.stringify({response : 'Server Error'}));
                                                    res.end();
                                                }
                                            });
                                    })
                                }
                                break;
                            case '/uploadProfileImage':
                                if (req.method === 'POST'){
                                    var busBoy = new BusBoy({headers : req.headers});

                                    busBoy.on('file', function(fieldname, file, filename, encoding, mimetype) {
                                        console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
                                        var tempFile = filename.split('.');
                                        var originalImage = path.join(__dirname, '/client/src/public/images/profileFiles/'+Math.random().toString().split('.')[1]+'(Junction.com)'+path.extname(filename));
                                        file.pipe(fs.createWriteStream(originalImage));
                                        req.session.data.profileImage = originalImage.split('client')[1];
                                    });
                                    busBoy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
                                        console.log('Field [' + fieldname + ']: value: '+ query.stringify(val), fieldnameTruncated, valTruncated);
                                    });
                                    busBoy.on('finish', function() {
                                        console.log('Done parsing form!');
                                        res.writeHead(200, { 'Content-Type' : 'application/json'});
                                        res.write(JSON.stringify({ok : 'ok'}));
                                        res.end();
                                    });
                                    req.pipe(busBoy);
                                }
                                break;
                            case '/play':
                                if(req.method = 'GET'){
                                    res.writeHead(200, {'Content-Type': String.valueOf(mimeType[mType.ext])})
                                    var stream = fs.createReadStream(path.join(__dirname, '/client/src/index.html')).pipe(res);
                                    stream.on('end', function(){
                                        res.end();
                                    });
                                }
                                break;
                            case '/test':
                                if(req.method = 'GET'){
                                    res.writeHead(200, {'Content-Type': String.valueOf(mimeType[mType.ext])})
                                    var stream = fs.createReadStream(path.join(__dirname, '/client/src/index.html')).pipe(res);
                                    stream.on('end', function(){
                                        res.end();
                                    });
                                }
                                break;
                        }
                    })
                }
            });

        }else {
            /*
            * ALL STATIC PLUS DYNAMIC FILES WHICH IS PRESENT IN FOLDER WILL BE HANDLED HERE
            * ALSO DIRECTIVES
             */
            if (stat.isFile()) {
                console.log('file', path.join(__dirname, uri.path));

                if(mimeType[mType.ext] !== undefined){
                    res.writeHead(200, {'Content-Type': mimeType[mType.ext]})
                    var stream = fs.createReadStream(path.join(__dirname, '/client'+uri.path)).pipe(res);
                    stream.on('end', function(){
                        res.end();
                    });

                } else{
                    //res.writeHead(200, {'Content-Type': mimeType[uri.ext]})
                    var stream = fs.createReadStream(path.join(__dirname, '/client'+uri.path), {encoding: 'utf-8'}).pipe(res)
                    stream.on('end', function(){
                        res.end();
                    });
                }
            } else if (stat.isDirectory()) {
                var fileName = (uri.path === '/') ? '/src/index.html' : uri.path+'.js';
                console.log('directory', fileName);
                if (fileName !== '') {
                    res.writeHead(200, {'Content-Type': 'text/html'});
                    var stream = fs.createReadStream(path.join(__dirname, '/client'+fileName), {encoding: 'utf-8'}).pipe(res)
                    stream.on('end', function(){
                        res.end();
                    });

                } else {
                    console.log('not_ok');
                }
            }else{
                console.log('iam here')
            }
        }
    });
});
server.listen(3000, function(){
    console.log('Server is listening on 3000');
})

function isFilePresent(fp, cb){
    fs.lstat(fp,function(err, stat){
        if(err){ cb('not_ok') }
        else if (stat.isFile()){ cb('ok') }
    })
}