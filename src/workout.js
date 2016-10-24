var config = require('./config'),
  Speech = require('./speech'),
	https = require('https');

//contructor
var Workout = function(token){
  this.id = this.getWorkoutId();
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




Workout.prototype.startClass = function(alopAPIResponse, response, session){    
    if(alopAPIResponse.poses.length > 0){
        session.attributes.stage = 1;
        Speech.teachClass(alopAPIResponse, response, session);
    }else{
       Speech.startClassError(response);
    }
};


Workout.prototype.getWorkoutId = function(){
  //var workoutAvailable = [530,109, 116, 94, 122,680]; // having a problem with 638 663
  var workoutAvailable = [530];
  return workoutAvailable[Math.floor(Math.random() * workoutAvailable.length)];
   
};

Workout.prototype.get = function(){
	var self = this;

    return new Promise(function(resolve, reject) {
       console.log("WORKOUT PROMISE", self._options);
        var req = https.get(self._options, function(res) {
            //console.log('Get Workout Method STATUS: ' + res.statusCode);
            res.setEncoding('utf8');
            
            if (res.statusCode < 200 || res.statusCode > 299) {
                reject(new Error('Failed to load page, status code: ' + res.statusCode));
            }

            var body = [];
            res.on('data', function (data){
                body.push(data);
            });
            res.on('end', function () {
                console.log('WORKOUT BODY: ' + body);
                try{
                   resolve(JSON.parse(body));
                 }catch(err){
                   reject(err);
                 }
            });
        });
        req.on('error', function (err) {
            reject(err);
        });
    });
};

Workout.prototype.getSequence = function(response, session) {
    console.log("WORKOUT MODEL ID ", this.id);
    session.attributes.workoutId = this.id;
    this.get()
        .then((data) => this.startClass(data, response, session))
        .catch((err) => Speech.startClassError(response));
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
      console.log("WORKOUT TRACKING PROMISE", post_options);
        var req = https.request(post_options, function(res) {
          res.setEncoding('utf8');
          console.log('POST TRACKING STATUS: ' + res.statusCode);
          if (res.statusCode < 200 || res.statusCode > 299) {
              reject(new Error('Failed to load page, status code: ' + res.statusCode));
          }
          var body = [];
          res.on('data', function (data){
              body.push(data);
          });
          res.on('end', function () {
              resolve(JSON.parse(body));
          });

        }); //end request
        req.on('error', function (err) {
            console.error("ERR",err);
            reject(err);
        });
        req.write(post_data);
        req.end();
    });// end promise
};



module.exports = Workout;