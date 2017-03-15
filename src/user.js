var config = require('./config'),
	https = require('https');

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
        'X-3scale-Proxy-Secret-Token':config.api_secret,
        'Authorization': 'Bearer '+token
      }
    };
};

User.prototype.get = function(){
	var self = this;
    return new Promise(function(resolve, reject) {
      // console.log("USER PROMISE", self._options);
        var req = https.get(self._options, function(res) {
            console.log('GET USER STATUS: ' + res.statusCode);
            res.setEncoding('utf8');
            
            if (res.statusCode < 200 || res.statusCode > 299) {
                reject(new Error('Failed to load page, status code: ' + res.statusCode));
            }

            var body = [];
            res.on('data', function (data){
                body.push(data);
            });
            res.on('end', function () {
              try{
                  a=JSON.parse(body);
                  this.hasUser = true;
              }catch(e){
                  console.log("ERROR User get response",e);
                  a = [];
              }
              resolve(a);
            });
        });
        req.on('error', function (err) {
            reject(err);
        });
    });
};



module.exports = User;