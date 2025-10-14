const axios = require('axios');
const config = require('./config');

//contructor
var Workout = function(token){
  this.id = this.getId();
  this.token = token || "";
};

Workout.prototype.getId = function(){
  var workoutAvailable = [124];
  return workoutAvailable[Math.floor(Math.random() * workoutAvailable.length)];
};

Workout.prototype.get = function(){
  const path = `/api/v1/workouts/${this.id}`;
  return axios
    .get(`${config.host}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-3scale-Proxy-Secret-Token': config.api_secret
      }
    })
    .then((response) => response.data);
};


Workout.prototype.postTracking = function(opts){
  const payload = {
    id: opts.workoutId,
    user_id: opts.userId,
    device_id: opts.deviceId,
    device_type: 'ECHO'
  };

    return axios
      .post(`${config.host}/api/v3/trackings`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-3scale-Proxy-Secret-Token': 'MPP-Allow-API-Call',
          Authorization: `Bearer ${opts.token}`
        }
      })
      .then((response) => {
        console.log("POST TRACKING SUCCESS", response.data);
        return response.data;
      });
};

Workout.prototype.postProgress = function(opts){
  console.log("STARTED WORKOUT PROGRESS PROMISE");
  const payload = {
    workout_id: opts.workoutId,
    user_id: opts.userId,
    watched: 1,
    total: null,
    device_id: opts.deviceId,
    device_type: 'ECHO'
  };

  if(opts.workoutId){
    console.log("WORKOUT PROGRESS PROMISE", payload);
    return axios
      .post(`${config.host}/api/v3/progress`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-3scale-Proxy-Secret-Token': 'MPP-Allow-API-Call',
          Authorization: `Bearer ${opts.token}`
        }
      })
      .then((response) => {
        console.log("POST PROGRESS SUCCESS", response.data);
        return response.data;
      });
  }else{
    console.log("ERR WORKOUT PROGRESS PROMISE - no workout ID provided", payload);
  }
};

Workout.prototype.getTrackings = function(token){
    console.log("TRACKING PROMISE");
    return axios
      .get(`${config.host}/api/v3/trackings`, {
        headers: {
          'Content-Type': 'application/json',
          'X-3scale-Proxy-Secret-Token': config.api_secret,
          Authorization: `Bearer ${token}`
        }
      })
      .then((response) => response.data);
};



module.exports = Workout;