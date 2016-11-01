
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
var User = require('./user'),
    Speech = require('./speech'),
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
    console.log("onSessionStarted session.user.accessToken" , session.user.accessToken);
    //Initiate User
    user = new User(session.user.accessToken);
    user.token = session.user.accessToken;
    user.deviceId = session.user.userId;
    console.log("onSessionStarted user" , user);

    //Initiate Workout
    workout = new Workout(session.user.accessToken);
    console.log("onSessionStarted workout" , workout);
};

ALotOfPilates.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId );
    Handler.launchAction(user, session, response);
};

ALotOfPilates.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);
    //handleExit({ name: 'AMAZON.NoIntent' }, session, null);
};

/**
 * override intentHandlers to map intent handling functions.
 */
ALotOfPilates.prototype.intentHandlers = {
    "OneshotStartPilatesClassIntent": function (intent, session, response) {
        Handler.oneShotAction(user, workout, session, response);
    },

    "AMAZON.StartOverIntent": function (intent, session, response) {
        Speech.startOver(response);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        Speech.stopClass(response);
    },

    "AMAZON.NoIntent": function (intent, session, response) {
        Handler.noAction(user, workout, intent, session, response);
    },

    "AMAZON.YesIntent": function (intent, session, response) {
        Handler.yesAction(user, workout, intent, session, response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        Speech.help(session.attributes.stage, response);
    },

    "AMAZON.CancelIntent": function (intent, session, response) {
       Speech.cancelClass(response);
           
    }
};

// Create the handler that responds to the Alexa Request.
exports.handler = function (event, context) {
    var alop = new ALotOfPilates();
    alop.execute(event, context);
};
