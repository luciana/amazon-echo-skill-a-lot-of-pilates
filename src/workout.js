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
  var workoutAvailable = [530]; // having a problem with 638 663 122 109 680
  //DEBUG: var workoutAvailable = [530];
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
        .catch((err) => Speech.startClassError1(response, err));
       //.catch((err) => console.log("ERROR WORKOUT GET SEQUENCE", err));
};

Workout.prototype.startClass = function(data, response, session){
  // console.log("START CLASS DATA.POSES", data.poses);
  // b = JSON.stringify(data);
  // console.log("START CLASS DATA STRING", b);
  // console.log("START CLASS DATA STRING.POSES", b.poses);
  // a = JSON.parse(b);
  // console.log("START CLASS DATA JSON", a);
  // console.log("START CLASS DATA JSON POSES", a.poses);

  if((data ) &&  (data.poses.length > 0)){
    console.log("START CLASS");
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
        // var req = https.request(post_options, function(res) {
        //   res.setEncoding('utf8');
        //   console.log('POST TRACKING STATUS: ' + res.statusCode);
        //   if (res.statusCode < 200 || res.statusCode > 299) {
        //       reject(new Error('Failed to load page, status code: ' + res.statusCode));
        //   }
        //   var body = [];
        //   res.on('data', function (data){
        //       body.push(data);
        //   });
        //   res.on('end', function () {
        //       resolve(JSON.parse(body));
        //   });

        // }); //end request
        // req.on('error', function (err) {
        //     console.error("ERR",err);
        //     reject(err);
        // });
        // req.write(post_data);
        // req.end();
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

        // var req = https.get(options, function(res) {
        //     console.log('GET Tracking STATUS: ' + res.statusCode);
        //     res.setEncoding('utf8');
            
        //     if (res.statusCode < 200 || res.statusCode > 299) {
        //         reject(new Error('Failed to load page, status code: ' + res.statusCode));
        //     }

        //     var body = [];
        //     res.on('data', function (data){
        //         body.push(data);
        //     });
        //     res.on('end', function () {
        //       try{
        //           a=JSON.parse(body);
        //       }catch(e){
        //           console.log("ERROR Tracking get response",e);
        //           a = [];
        //       }
        //       resolve(a);
        //     });
        // });
        // req.on('error', function (err) {
        //     reject(err);
        // });
    });
};



module.exports = Workout;