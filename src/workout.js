var config = require('./config'),
  Speech = require('./speech'),
  request = require('request'),
	https = require('https');

//contructor
var Workout = function(token){
  this.id = this.getId();
  this.token = token;
	this._options =  {
      hostname: config.host_name,
      path: '/api/v1/workouts/' + this.id,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-3scale-Proxy-Secret-Token':config.api_secret
      }
    };
};

Workout.prototype.getId = function(){
  var workoutAvailable = [530,126, 526, 656];
  //GOOD ONES: var workoutAvailable = [530, 124, 680, 126]; 7132, , 6792
  //ERROR with 638 ( 14 exercises ) - Speech with id null and length 8848 exceeds allowed size of 8000 characters
  //ERROR with 663 (12 exercises ) - 10265 exceeds 10321
  //ERROR with 681 ( 13 exercises ) - 11031 exceeds
  return workoutAvailable[Math.floor(Math.random() * workoutAvailable.length)];
   
};

Workout.prototype.get = function(){
	var self = this;

    return new Promise(function(resolve, reject) {
       console.log("WORKOUT PROMISE");
       var path = '/api/v1/workouts/' + self.id;
       var options = {
            url: config.host + path,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-3scale-Proxy-Secret-Token':config.api_secret
            },
            json:true
        };

        request(options, function(error, response, body){
            if(error) {
              reject(error);
            }else{
              resolve(body);
            }
        });
    });
};

Workout.prototype.getSequence = function(response, session) {
    console.log("WORKOUT GET SEQUENCE FOR", this.id);
    this.get()
        .then((data) => this.startClass(data, response, session))
        .catch((err) => Speech.startClassError(response, err));
       //.catch((err) => console.log("ERROR WORKOUT GET SEQUENCE", err));
};

Workout.prototype.startClass = function(data, response, session){
  if((data ) &&  (data.poses.length > 0)){
    session.attributes.stage = 1;
    Speech.teachClass(data, response);
  }else{
   Speech.startClassError(response);
  }
};

Workout.prototype.postTracking = function(opts){
    var post_data = JSON.stringify({
      'id' : opts.workoutId,
      'user_id': opts.userId,
      'device_id': opts.deviceId,
      'device_type' : 'ECHO'
    });

    var post_options = {
      hostname: config.host_name,
      path: '/api/v3/trackings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-3scale-Proxy-Secret-Token':'MPP-Allow-API-Call',
        'Content-Length':  Buffer.byteLength(post_data),
        'Authorization': 'Bearer '+opts.token
      }
    };

    return new Promise( function (resolve, reject){
      console.log("WORKOUT TRACKING PROMISE", post_data);
      //http://blog.modulus.io/node.js-tutorial-how-to-use-request-module
      var path = '/api/v3/trackings';
      var options = {
            url: config.host + path,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-3scale-Proxy-Secret-Token':'MPP-Allow-API-Call',
              'Content-Length':  Buffer.byteLength(post_data),
              'Authorization': 'Bearer '+opts.token
            },
            body: post_data
        };

      request(options, function(error, response, body){
          if(error) {
            reject(error);
          }else{
            console.log("POST TRACKING SUCCESS", body);
            resolve(body);
          }
      });
    });// end promise
};

Workout.prototype.getTrackings = function(token){
  var options1 = {
      hostname: config.host_name,
      path: '/api/v3/trackings',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-3scale-Proxy-Secret-Token':config.api_secret,
        'Authorization': 'Bearer '+token
      }
    };
    return new Promise(function(resolve, reject) {
      console.log("TRACKING PROMISE");

      var path = '/api/v3/trackings';
       var options = {
            url: config.host + path,
            method: 'GET',
             headers: {
              'Content-Type': 'application/json',
              'X-3scale-Proxy-Secret-Token':config.api_secret,
              'Authorization': 'Bearer '+token
            },
            json:true
        };

        request(options, function(error, response, body){
            if(error) {
              reject(error);
            }else{
              resolve(body);
            }
        });
    });
};



module.exports = Workout;