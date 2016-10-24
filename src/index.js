
/**
 * A Lot Of Pilates Alexa Skills
 *
 * Start a pilates class from Amazon Echo. This code communicates with A Lot Of Pilates(ALOP) API to start a pilates class. One slot is available where you can specify the duration of the class. Get fit with Amazon Alexa!
 *
 * Author: Luciana Bruscino
 * Copywrite 2016 ALotOfPilates.com
 *
 * Example:
 * One-shot model:
 *  User:  "Alexa, start a pilates class"
 *  Alexa: "Welcome to A Lot Of Pilates! Ready to feel great? say start class ...""
 */

/**
 * App ID for the skill
 * Find it at : https://console.aws.amazon.com/lambda/home
 */
var APP_ID = ''; //get an APP ID - i.e amzn1.echo-sdk-ams.app.xxxxxx

var querystring = require('querystring'),
    User = require('./user'),
    Speech = require('./speech'),
    exercises = require('./exercises'),
    AlexaSkill = require('./AlexaSkill'),
    Handler = require('./handler'),
    Workout = require('./workout');

/**
 * ALotOfPilates is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var ALotOfPilates = function () {
    AlexaSkill.call(this, 'amzn1.echo-sdk-ams.app.ef7b5d42-f176-4806-9ea3-6ef6d041c2aa'); //I store the APP_ID in a config file instead of global variable (APP_ID)
    var user;
    var workout;
};

// Extend AlexaSkill
ALotOfPilates.prototype = Object.create(AlexaSkill.prototype);
ALotOfPilates.prototype.constructor = ALotOfPilates;

// ----------------------- Override AlexaSkill request and intent handlers -----------------------

ALotOfPilates.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId + ", token: " + session.user.accessToken);
    console.log("session.user.accessToken" , session.user.accessToken);
    user = new User(session.user.accessToken);
    workout = new Workout(session.user.accessToken);
};

ALotOfPilates.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId );
    session.attributes.stage = 0;

    Handler.launchAction(user, session, response);
};

ALotOfPilates.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    var sessionAttributes = session.attributes;
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);
    //handleExit({ name: 'AMAZON.NoIntent' }, session, null);
};

/**
 * override intentHandlers to map intent handling functions.
 */
ALotOfPilates.prototype.intentHandlers = {
    "OneshotStartPilatesClassIntent": function (intent, session, response) {
        //workout = new Workout(session.user.accessToken);
        Handler.oneShotAction(workout, session, response);
    },

    "AMAZON.StartOverIntent": function (intent, session, response) {
        Speech.startOver(response);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        Speech.stopClass(response);
    },

    "AMAZON.NoIntent": function (intent, session, response) {
        Handler.noAction(workout, session, response);
    },

    "AMAZON.YesIntent": function (intent, session, response) {
        Handler.yesAction(workout, intent, session, response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        Speech.help(session.attributes.stage, response);
    },
    
    
    "AMAZON.CancelIntent": function (intent, session, response) {
       Speech.cancelClass(response);
           
    }
};


function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    var alop = new ALotOfPilates();
    alop.execute(event, context);
};
