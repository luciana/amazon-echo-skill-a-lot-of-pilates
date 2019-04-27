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
       //console.log("USER PROMISE", self._options);
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
        //console.log("USER OPTIONS", options);       
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
};



module.exports = User;