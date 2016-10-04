var config = require('./config'),
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

Workout.prototype.getWorkoutId = function(){
  var workoutAvailable = [530,94,663,122,680,109, 116]; //having a problem with 638
  return workoutAvailable[Math.floor(Math.random() * workoutAvailable.length)];
   
};

Workout.prototype.get = function(){
	var self = this;

    return new Promise(function(resolve, reject) {
       console.log("WORKOUT PROMISE", self._options);
        var req = https.get(self._options, function(res) {
            console.log('Get Workout Method STATUS: ' + res.statusCode);
            res.setEncoding('utf8');
            
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
        });
        req.on('error', function (err) {
            reject(err);
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
        'X-3scale-Proxy-Secret-Token':config.api_secret,
        'X-User-Email':opts.userEmail,
        'X-User-Token': opts.token,
        'Content-Length':  Buffer.byteLength(post_data)
      }
    };

    return new Promise( function (resolve, reject){
        var req = https.request(post_options, function(res) {
          res.setEncoding('utf8');
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
            reject(err);
        });
    });// end promise
};



module.exports = Workout;