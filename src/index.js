
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

var exerciseCount = 0;
var exerciseTotal = 10;

var https = require('https'),
    config = require('./config'),
    querystring = require('querystring'),
    exercises = require('./exercises');


/**
 * The AlexaSkill prototype and helper functions
 */
var AlexaSkill = require('./AlexaSkill');

/**
 * ALotOfPilates is a child of AlexaSkill.
 * To read more about inheritance in JavaScript, see the link below.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Introduction_to_Object-Oriented_JavaScript#Inheritance
 */
var ALotOfPilates = function () {
    AlexaSkill.call(this, config.app_id); //I store the APP_ID in a config file instead of global variable (APP_ID)
};

// Extend AlexaSkill
ALotOfPilates.prototype = Object.create(AlexaSkill.prototype);
ALotOfPilates.prototype.constructor = ALotOfPilates;

// ----------------------- Override AlexaSkill request and intent handlers -----------------------

ALotOfPilates.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);
    // any initialization logic goes here
};

ALotOfPilates.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId );
    session.attributes.stage = 0;
    token = session.user.accessToken;
    handleWelcomeRequest(response, token);
};

ALotOfPilates.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    var sessionAttributes = session.attributes;
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);
    if(sessionAttributes){
       // handleExit(session);
    }else{
        console.log("session attributes not defined");
    }
};

/**
 * override intentHandlers to map intent handling functions.
 */
ALotOfPilates.prototype.intentHandlers = {
    "OneshotStartPilatesClassIntent": function (intent, session, response) {  
        handleOneshotStartPilatesClassRequest(intent, session, response);
    },

    "AMAZON.StartOverIntent": function (intent, session, response) {
        handleStartOverRequest(response);
    },

    "AMAZON.StopIntent": function (intent, session, response) {
        //handleExit(session);
        var speechOutput = "It is ok that you could not finish the class today. Maybe next time. Good-bye";

        response.tell(speechOutput);
        shouldEndSession = false;
    },

    "AMAZON.NoIntent": function (intent, session, response) {
        var sessionAttributes = session.attributes;
        var speechOutput = "Ok. Hope you find a better time to start the class. Goodbye!";
        shouldEndSession = false;
        response.tell(speechOutput);
        
    },

    "AMAZON.YesIntent": function (intent, session, response) {
        handleOneshotStartPilatesClassRequest(intent, session, response);
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        handleHelpRequest(intent, session, response);
    },
    
    
    "AMAZON.CancelIntent": function (intent, session, response) {
        //handleExit(session);
        var speechOutput = "It is ok that you could not finish the class today. Maybe next time. Good-bye";
        shouldEndSession = false;
        response.tell(speechOutput);
           
    }
};

// -------------------------- ALotOfPilates Domain Specific Business Logic --------------------------


function handleWelcomeRequest(response, token) {        

    validateALOPUserRequest(token, function alopGetUserResponseCallback(err, alopGetUserAPIResponse) {
        var speechOutput; 
        var welcomeText = "";
    
        if (err) {
           
        } else {           
         if (typeof alopGetUserAPIResponse != "undefined") {           
                console.log("SUCESSFUL Get user data", alopGetUserAPIResponse);
                name =  alopGetUserAPIResponse.name;
                signInCount = alopGetUserAPIResponse.sign_in_count;
                if(signInCount > 1){
                    welcomeText += " back "
                }
                if (!name){
                    welcomeText+="";
                }else{
                     welcomeText+=name;
                }
           }
        }


        var speechOutput = {            
                    speech: "<speak>Welcome " + welcomeText  + 
                    "<break time=\"0.1s\" /> " + 
                    " to A Lot Of Pilates. " +
                    ".<break time=\"0.7s\" /> " + 
                    "Get your mat ready on the floor." + 
                    ".<break time=\"1s\" /> " +
                    "Are you ready to start the class?" + 
                    "</speak>",
                    type: AlexaSkill.speechOutputType.SSML
                },
            repromptOutput = {
                speech:  "<speak> I can lead you through a pilates sequence " +
                "<break time=\"0.2s\" /> " +
                " You can also "+
                " visit ALotOfPilates.com and take a video instructed class. " +
                ".<break time=\"0.7s\" /> " +           
                "Just say start class when ready. Should I start?" + 
                "</speak>",
                type: AlexaSkill.speechOutputType.SSML
            };

        response.ask(speechOutput, repromptOutput);


    });


   
        
}

function handleEndClassRequest(){
    return "Good job! You are all done. Hope you feel as great as me! Visit ALotOfPilates.com for video classes.";
}

function handleStartOverRequest(response) {
    var repromptText = "Do you want to start the class?";
    var speechOutput = "I can lead you through a pilates sequence " + "Or you can say exit. " + repromptText;

    response.ask(speechOutput, repromptText);
}


/**
 * This handles the skill exit scenarios: stop, cancel intents and session end
 * It logs workout usage for analytics purposes.
 */
function handleExit(session){
    var sessionAttributes = session.attributes;
    console.log("total number of exercises for this class " + sessionAttributes.exerciseTotal);
    console.log("total number of exercises taken  " + sessionAttributes.exerciseCount);
    if (sessionAttributes.exerciseCount === sessionAttributes.exerciseTotal){
        console.log("handle exit for session workout Id - completed", session.attributes.workoutId);
        postALOPTrackingRequest(session.attributes.workoutId, session.user.userId, function alopTrackingResponseCallback(err, alopAPIResponse) {
            if (err) {
                console.log("Error post tracking class");
            } else {

               console.log("Tracked completed class");
            }
        });
    }

    if (sessionAttributes.exerciseCount < sessionAttributes.exerciseTotal){
        console.log("handle exit for session workout Id - quit before completing", session.attributes.workoutId);
        putALOPTrackingRequest(session.attributes.workoutId, session.user.userId, sessionAttributes.exerciseTotal, sessionAttributes.exerciseCount, function alopPutTrackingResponseCallback(err, alopAPIResponse) {
            if (err) {
                console.log("Error put tracking class");
            } else {

               console.log("Put on Tracking");
            }
        });
    }




}

/**
 * This handles the one-shot interaction, where the user utters a phrase like:
 * 'Alexa, start a Pilates class'.
 * If there is an error in a slot, this will guide the user to the dialog approach.
 */
function handleOneshotStartPilatesClassRequest(intent, session, response) {
    var duration = 2;
    var type = 2;
    getPilatesSequenceResponse(duration, type, response, session);
}

/**
 * This handles the Help intent:
 * 'Alexa, help me'.
 */
function handleHelpRequest(intent, session, response) {
   var speechText = "";       
   console.log("User asked for help at stage " + session.attributes.stage);
        switch (session.attributes.stage) {
            case 0: //haven't retrieve the class yet
                speechText = "Pilates classes are great way to feel wonderful. " +
                    "If you are not familiar with the exercises visit a lot pilates dot com. " +
                    "If you are ready to start say go or you can say exit.";
                break;
          
            default:
                speechText = "If you are not familiar with this exercise, " +                            
                            " visit ALotOfPilates.com and take a video instructed class. " +
                            "To start a new class, just say go, or you can say exit.";
        }

        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        var repromptOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.PLAIN_TEXT
        };
        // For the repromptText, play the speechOutput again
        response.ask(speechOutput, repromptOutput);
}

/**
 * Both the one-shot and dialog based paths lead to this method to issue the request, and
 * respond to the user with the final answer.
 */
function getPilatesSequenceResponse(duration, type, response, session) {
    
    var workoutAvailable = [530,94]; //having a problem with 638
    var workoutId = workoutAvailable[Math.floor(Math.random() * workoutAvailable.length)];

    session.attributes.workoutId = workoutId;

    // Issue the request, and respond to the user
    makeALOPRequest(workoutId, duration, type, function alopResponseCallback(err, alopAPIResponse) {
        var speechOutput;        
        if (err) {
            speechOutput = {
                speech:"Sorry, the A Lot Of Pilates service is experiencing a problem. Please access ALotOfPilates.com to take video classes now.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };     
            response.tell(speechOutput);
        } else {

            if(alopAPIResponse.poses.length > 0){ 
                console.log("SUCESSFUL Get on Pilates Sequence"); 
                 //The stage variable tracks the phase of the dialogue.    
                session.attributes.stage = 1;                
                teachClass(alopAPIResponse, response, session);        
            }else{
                speechOutput = {
                    speech:"Sorry, the A Lot Of Pilates service is experiencing a problem. Please access ALotOfPilates.com to take video classes now.",
                     type: AlexaSkill.speechOutputType.PLAIN_TEXT
                };
                response.tell(speechOutput);
           }
        }
    });
    
    
}

/**
 * Call for workout was successfull, so this function responsability is to loop thru the 
 * exercises the output the exercise information. It calls handleExerciseTimings for descriptions.
 * At this point, the user is at stage 1 of the session.
 */

function teachClass(alopAPIResponse, response, session){      
    var speechPoseOutput ="";
    var sessionAttributes = session.attributes;
    sessionAttributes.exerciseCount = 0;
    sessionAttributes.exerciseTotal = alopAPIResponse.poses.length;

    console.log("total number of exercises from teachClass " +  sessionAttributes.exerciseTotal );   
    for(var i = 0; i < alopAPIResponse.poses.length; i++){
        var pose = alopAPIResponse.poses[i]; 
       sessionAttributes.exerciseCount += 1;        
        if( i === 0 ){
            speechPoseOutput += "Get ready on your mat for the " + pose.name;       
        }else{
            speechPoseOutput += "Next exercise is " + pose.name;
        }
        
        speechPoseOutput += ". <break time=\"0.2s\" />. " + pose.repetition;  
        speechPoseOutput += ". <break time=\"1s\" />. ";
        speechPoseOutput += handleExerciseTimings(pose, session);
    }
    speechPoseOutput += handleEndClassRequest();
    console.log(speechPoseOutput);
    var speechText ="<speak>" + speechPoseOutput + "</speak>";
        var speechOutput = {
            speech: speechText,
            type: AlexaSkill.speechOutputType.SSML
        };

    response.tell(speechOutput);
}

function handleExerciseTimings(pose, session){
    var speechExerciseOutput ="";
        var sideLegSeriesPoseIdArray = [431,432,434,435,326];
        var plankPosesIdArray = [133, 564];
        var otherSuppotedPoses =[160, 267, 273, 276, 289, 310, 327, 266, 267, 276, 289, 291, 487, 499, 511, 528, 529, 541, 545, 547, 631];
        //missing 536, 318
        //problem with 487, 291
        if (plankPosesIdArray.indexOf(pose.id) > -1){//Planks - Hold it for 20 to 30 seconds
            speechExerciseOutput += "Get in position for the " + pose.name;
            speechExerciseOutput += "<break time=\"3s\" />. ";
            speechExerciseOutput += "Start holding the plank";
            speechExerciseOutput += "<break time=\"2s\" />. ";
            speechExerciseOutput += "Imagine a straight line from the crown of the head down to the toes.";
            speechExerciseOutput += "<break time=\"7s\" />. ";
            speechExerciseOutput += "10 seconds";
            speechExerciseOutput += "Breath in through the nose, out through the mouth.";
            speechExerciseOutput += ".<break time=\"8s\" />. ";
            speechExerciseOutput += "Engage your legs by squeezing an imaginary ball between them";
            speechExerciseOutput += ".<break time=\"5s\" />. ";
            speechExerciseOutput += "Almost done";
            speechExerciseOutput += ".<break time=\"3s\" />. ";
            speechExerciseOutput += "you are  ";
            speechExerciseOutput += ".<break time=\"0.1s\" />. ";
            speechExerciseOutput += "done. Relax ";
            speechExerciseOutput += ".<break time=\"10s\" />. ";
        }else if (sideLegSeriesPoseIdArray.indexOf(pose.id) > -1){//Side Leg Series
            speechExerciseOutput += "Lie on one side with bottom arm bent for head to lay on.";
            speechExerciseOutput += ".<break time=\"2s\" />";
            speechExerciseOutput += "Position the legs about 45 degrees in front of the body";  
            speechExerciseOutput += ".<break time=\"2s\" />";     
            speechExerciseOutput += "Start";
            speechExerciseOutput += ".<break time=\"10s\" />";
            speechExerciseOutput += "<break time=\"10s\" /> ";
            speechExerciseOutput += "<break time=\"10s\" />. ";
            speechExerciseOutput += "<break time=\"10s\" />. ";
            speechExerciseOutput += "<break time=\"10s\" />. ";
            speechExerciseOutput += "Switch sides";
            speechExerciseOutput += ".<break time=\"5s\" /> ";
            speechExerciseOutput += "Start";
            speechExerciseOutput += ".<break time=\"10s\" /> ";
            speechExerciseOutput += ".<break time=\"10s\" /> ";
            speechExerciseOutput += ".<break time=\"10s\" /> ";
            speechExerciseOutput += ".<break time=\"10s\" /> ";
            speechExerciseOutput += ".<break time=\"10s\" /> ";
        }else if (otherSuppotedPoses.indexOf(pose.id) > -1){

         speechExerciseOutput +=  getExerciseInfo(pose.id,session);
        
       
        }else{  //Generic timining   
            //console.log("Exercise duration " + pose.duration + " formatted " + getFormattedDuration(pose.duration));
            speechExerciseOutput += ". Go. ";
            //var duration = getFormattedDuration(pose.duration);      
            for(var i = 0; i < 10; i++){
                speechExerciseOutput += "<break time=\"5s\" />. ";
            }
        }
    return speechExerciseOutput;
}


/**
 * This function retrieves the exercise information from the exercise.js module
 * It feeds back to the function and set the session parameters necessary to be used by HelpIntent
 */
function getExerciseInfo(id, session){
    var desc = exercises[id].exerciseDescription;   
    session.attributes.exerciseName = exercises[id].exerciseName;   
    session.attributes.exerciseDescription = desc;
    return desc;
}


/**
 * Uses ALOP API, triggered by GET on /workouts API with category and duration querystrings.
 * https://api-2445581417326.apicast.io:443/api/
 */
function makeALOPRequest(workoutId, duration, type, alopResponseCallback) {
       
    var get_options = {
      hostname: config.host_name,
      path: '/api/v1/workouts/' + workoutId,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-3scale-Proxy-Secret-Token':config.api_secret
      }
    };

    //console.log("makeALOPRequest");
    var req = https.request(get_options, function(res) {
       // console.log('STATUS: ' + res.statusCode);       
        res.setEncoding('utf8');
        var alopResponseString = '';

        if (res.statusCode != 200) {
            alopResponseCallback(new Error("Non 200 Response"));
        }

        res.on('data', function (data) {            
            alopResponseString += data;
        });

        res.on('end', function () {
            var alopResponseObject = JSON.parse(alopResponseString);
            console.log("makeALOPRequest alopResponseObject ", alopResponseObject);

            if (alopResponseObject.error) {
                alopResponseCallback(new Error(alopResponseObject.error.message));
            } else {
                //console.log('Workout name: ' + alopResponseObject.title);
                alopResponseCallback(null, alopResponseObject);
            }
        });

    }).on('error', function (e) {
        console.log("Communications error: " + e.message);
        alopResponseCallback(new Error(e.message));
    });

req.end();
    
}



/**
 * PUT Tracking
 * curl -H 'Content-Type: application/json' -H 'Accept: application/json' -X PUT httpS://www.alotofpilates.com/api/v1/trackings/99 -d '{"guid":"12345", "total":15, "watched":15, "device_id":"RWEREW", "user_id":"RWEREW"}' -H "X-3scale-Proxy-Secret-Token:MPP-Allow-API-Call"
 */
function putALOPTrackingRequest(workoutId, userId, total, taken, alopPutTrackingResponseCallback) {
    
    //{"guid":"12345", "total":15, "watched":15, "device_id":"RWEREW", "user_id":"RWEREW"}
    var post_data = JSON.stringify({
      'guid' : guid(),
      'total': total,
      'watched': taken,
      'user_id': userId,
      'device_type' : config.client_id
  });

    var post_options = {
      hostname: config.host_name,
      path: '/api/v1/trackings/'+workoutId,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-3scale-Proxy-Secret-Token':config.api_secret,
        'Content-Length':  Buffer.byteLength(post_data)
      }
    };

    var req = https.request(post_options, function(res) {
       // console.log('STATUS: ' + res.statusCode);       
        res.setEncoding('utf8');
        var trackingPutResponse = '';

        if (res.statusCode != 200) {
            alopPutTrackingResponseCallback(new Error("Non 200 Response"));
        }

        res.on('data', function (data) {
            console.log("data response " + data);
            trackingPutResponse += data;
        });

        res.on('end', function () {
            var alopPutResponseObject = JSON.parse(trackingPutResponse);
           
            if (alopPutResponseObject.error) {
                alopPutTrackingResponseCallback(new Error(alopPutResponseObject.error.message));
            } else {               
                alopPutTrackingResponseCallback(null, alopPutResponseObject);
            }
        });

    }).on('error', function (e) {
        console.log("Put Tracking Communications error: " + e.message);
        alopPutTrackingResponseCallback(new Error(e.message));
    });

    req.write(post_data);
    req.end();
    
}


/**
 * POST Tracking
 */
function postALOPTrackingRequest(workoutId, userId, alopTrackingResponseCallback) {
    
    console.log("POsting Completed class - postALOPTrackingRequest");
    var post_data = JSON.stringify({
      'id' : workoutId,
      'user_id': "",
      'device_id': userId,
      'device_type' : config.client_id
    });

    var post_options = {
      hostname: config.host_name,
      path: '/api/v1/trackings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-3scale-Proxy-Secret-Token':config.api_secret,
        'Content-Length':  Buffer.byteLength(post_data)
      }
    };

    var req = https.request(post_options, function(res) {
       // console.log('STATUS: ' + res.statusCode);       
        res.setEncoding('utf8');
        var trackingPostResponse = '';

        if (res.statusCode != 200) {
            alopTrackingResponseCallback(new Error("Non 200 Response"));
        }

        res.on('data', function (data) {    
            console.log("POST on tracking returned data" , data);       
            trackingPostResponse += data;
        });

        res.on('end', function () {
           var alopPostResponseObject = JSON.parse(trackingPostResponse);
           console.log("POST on tracking parsed object " , alopPostResponseObject); 
           
            if (alopPostResponseObject.error) {
                alopTrackingResponseCallback(new Error(alopPostResponseObject.error.message));
            } else {     
                 console.log("POST on tracking returned callback ");           
                alopTrackingResponseCallback(null, alopPostResponseObject);
            }
        });

    }).on('error', function (e) {
        console.log("Post Tracking Communications error: " + e.message);
        alopTrackingResponseCallback(new Error(e.message));
    });

    req.write(post_data);
    req.end();
    
}

/**
 * Uses ALOP API, triggered by GET on /workouts API with category and duration querystrings.
 * https://api-2445581417326.apicast.io:443/api/
 */
function validateALOPUserRequest(token, alopGetUserResponseCallback) {
       
    console.log("GET ALOP User Request service");

//curl -v -X GET  "https://alop.herokuapp.com/api/v3/users" -H "X-3scale-Proxy-Secret-Token:MPP-Allow-API-Call" -H "X-User-Token:pKGJ-kYMjdcKmj949gz9"
    var get_options = {
      hostname: 'alop.herokuapp.com',
      path: '/api/v3/users',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-3scale-Proxy-Secret-Token':config.api_secret,
        'X-User-Token':token
      }
    };

    var req = https.request(get_options, function(res) {
        console.log('Get ALOT User Quest STATUS: ' + res.statusCode);       
        res.setEncoding('utf8');
        var alopUserResponseString = '';

        if (res.statusCode != 200) {
            console.log("Get ALOP User Request ERROR");   
            alopGetUserResponseCallback(new Error("Non 200 Response"));
        }

        res.on('data', function (data) {        
          console.log("Get ALOP User Request service data ", data);    
            alopUserResponseString += data;
        });

        res.on('error', function () {        
          console.log("timeout Get User ");    
           alopGetUserResponseCallback(new Error("Non 200 Response"));
        });

        res.on('end', function () {
            var alopUserResponseObject = JSON.parse(alopUserResponseString);
             console.log("Get ALOP User Request parse response object " , alopUserResponseObject);
          
            if (alopUserResponseObject.error) {
                alopGetUserResponseCallback(new Error(alopUserResponseObject.error.message));
            } else {
                 console.log("Get ALOP User Request return callback object " , alopUserResponseObject);
                alopGetUserResponseCallback(null, alopUserResponseObject);
            }
        });

    }).on('error', function (e) {
        console.log("Communications error: " + e.message);
        alopGetUserResponseCallback(new Error(e.message));
    });

req.end();
    
}


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
