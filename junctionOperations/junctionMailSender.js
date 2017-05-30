/**
 * Created by erginus-hybrid on 24/5/17.
 */
var nodeMailer = require('nodemailer');

module.exports.sendYourMail = function(){
    var smtp = nodeMailer.createTransport({
        service : 'Gmail',
        auth : {
            user : 'harpreetsinghkhattra@gmail.com',
            pass : '872909066'
        }
    });

    var options = {
        from : 'harpreetsinghkhattra@gmail.com',
        to : 'harpreetsinghkhattra@gmail.com',
        subject : 'info from junction',
        text : 'hello world'
    }

    smtp.sendMail(options, function(err, res){
        if(err) throw err;
        if(res){
            console.log(res);
        }
    })
}