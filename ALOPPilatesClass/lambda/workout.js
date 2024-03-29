var config = require('./config'),
  //Speech = require('./speech'),
  request = require('request');
	//https = require('https');

//contructor
var Workout = function(token){
  this.id = this.getId();
  this.token = token || "";
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
  var workoutAvailable = [124];
  return workoutAvailable[Math.floor(Math.random() * workoutAvailable.length)];
};

Workout.prototype.get = function(){
	var self = this;

    return new Promise(function(resolve, reject) {
       //console.log("WORKOUT PROMISE" , self.id);
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
        //console.log("WORKOUT OPTIONS", options);   
        request(options, function(error, response, body){
            if(error) {
              //console.log("WORKOUT API REJECT");
              reject(error);
            }else{
             // console.log("WORKOUT API 200 RESPONSE", body);
              resolve(body);
            }
        });
    });
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
      //console.log("WORKOUT TRACKING PROMISE", post_data);
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

Workout.prototype.postProgress = function(opts){
  console.log("STARTED WORKOUT PROGRESS PROMISE");
  var post_data = JSON.stringify({
    'workout_id' : opts.workoutId,
    'user_id': opts.userId,
    'watched': 1,
    "total":null,   
    'device_id': opts.deviceId,
    'device_type' : 'ECHO'
  });

  if(opts.workoutId){
    var post_options = {
      hostname: config.host_name,
      path: '/api/v3/workouts'+opts.workoutId+'/progress',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-3scale-Proxy-Secret-Token':'MPP-Allow-API-Call',
        'Content-Length':  Buffer.byteLength(post_data),
        'Authorization': 'Bearer '+opts.token
      }
    };

    return new Promise( function (resolve, reject){
      console.log("WORKOUT PROGRESS PROMISE", post_data);
      //http://blog.modulus.io/node.js-tutorial-how-to-use-request-module
      var path = '/api/v3/progress';
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
            console.log("POST PROGRESS SUCCESS", body);
            resolve(body);
          }
      });
    });// end promise
  }else{
    console.log("ERR WORKOUT PROGRESS PROMISE - no workout ID provided", post_data);
  }
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