var config = require('./config'),
   request = require('request');

var User = function(token){
  this.id = 0;
  this.name = "";
  this.email ="";
  this.token = token;
  this.deviceId = "";
  this.signInCount = 0;
  this.workoutTakenCount = 0;
	this._options = {
      hostname: config.host_name,
      path: '/api/v3/users',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-3scale-Proxy-Secret-Token':'MPP-Allow-API-Call',
        'Authorization': 'Bearer '+token
      }
    };
};

User.prototype.get = function(){
	var self = this;

  return new Promise(function(resolve, reject) {
       console.log("USER PROMISE", self._options);
       var path = '/api/v3/users/';
       var options = {
            url: config.host + path,
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-3scale-Proxy-Secret-Token':config.api_secret,
              'Authorization': 'Bearer '+self.token
            },
            json:true
        };
        console.log("USER OPTIONS", options);       
        request(options, function(error, response, body){
            if(error) {
              //console.log("USER API REJECT", error);
              reject(error);
            }else{
              //console.log("USER API 200 RESPONSE", body);
              resolve(body);
            }
        });
    });

    // return new Promise(function(resolve, reject) {
    //    console.log("USER PROMISE", self._options);
    //     var req = https.get(self._options, function(res) {
    //         console.log('GET USER STATUS: ' + res.statusCode);
    //         res.setEncoding('utf8');
            
    //         if (res.statusCode < 200 || res.statusCode > 299) {
    //             console.log('GET USER STATUS CODE ERROR: ' + res.statusCode);
    //             reject(new Error('Failed to load page, status code: ' + res.statusCode));
    //         }

    //         var body = [];
    //         res.on('data', function (data){
    //             body.push(data);
    //         });
    //         res.on('end', function () {
    //           try{
    //               a=JSON.parse(body);
    //                console.log(" User get response",a);
    //               //this.hasUser = true;
    //           }catch(e){
    //               console.log("ERROR User get response",e);
    //               a = [];
    //           }
    //           resolve(a);
    //         });
    //     });
    //     req.on('error', function (err) {
    //         console.log('GET USER STATUS REJECT: ' + err);
    //         reject(err);
    //     });
    //     req.on('complete', function () {
    //         console.log('GET USER STATUS DONE: ');       
    //     });
    //});
};



module.exports = User;