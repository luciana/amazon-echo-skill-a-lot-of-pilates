
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
    AlexaSkill.call(this, 'amzn1.echo-sdk-ams.app.ef7b5d42-f176-4806-9ea3-6ef6d041c2aa'); //I store the APP_ID in a config file instead of global variable (APP_ID)
};

// Extend AlexaSkill
ALotOfPilates.prototype = Object.create(AlexaSkill.prototype);
ALotOfPilates.prototype.constructor = ALotOfPilates;

// ----------------------- Override AlexaSkill request and intent handlers -----------------------

ALotOfPilates.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
    console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId + ", token: " + session.user.accessToken);
  
};

ALotOfPilates.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
    console.log("onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId );
    session.attributes.stage = 0;
    validateALOPUserRequest(session.user.accessToken, function alopGetUserResponseCallback(err, alopUserResponseObject) {        
        //initialize session attributes from authorization class
        initializeSession(session, alopUserResponseObject);
        handleWelcomeRequest(response, session);
    });
    
};

ALotOfPilates.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
    var sessionAttributes = session.attributes;
    console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);
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
        var speechOutput = "It is ok that you could not finish the class today. Maybe next time. Visit ALotOfPilates.com for pilates classes. Good-bye";
        response.tellWithStop(speechOutput);
    },

    "AMAZON.NoIntent": function (intent, session, response) {
        var sessionAttributes = session.attributes;
        if (session.attributes.stage === 0) {
            var speechOutput = "Ok. Hope you find a better time to start the class. Visit ALotOfPilates.com for pilates classes. Goodbye!";
            response.tellWithStop(speechOutput);
        }else{
            handleDidNotLikeClassRequest(intent, session, response);
        }
        
    },

    "AMAZON.YesIntent": function (intent, session, response) {
        if (session.attributes.stage == 1) {
            handleLikeClassRequest(intent, session, response);

        }else{
            handleOneshotStartPilatesClassRequest(intent, session, response);
        }
    },

    "AMAZON.HelpIntent": function (intent, session, response) {
        handleHelpRequest(intent, session, response);
    },
    
    
    "AMAZON.CancelIntent": function (intent, session, response) {
        var speechOutput = "It is ok that you could not finish the class today. Maybe next time. Good-bye";
        response.tellWithStop(speechOutput);
           
    }
};

// -------------------------- ALotOfPilates Domain Specific Business Logic --------------------------


function initializeSession(session, data){
    session.attributes.stage = 0;
    if (typeof data != "undefined") {
        session.attributes.userId = data.id;
        session.attributes.userName = data.name;
        session.attributes.signInCount = data.sign_in_count;
        session.attributes.userEmail = data.email;
        session.attributes.workoutTakenCount = data.workouts_taken.length;
    }
    console.log("Session attributes Initialized User Id:", session.attributes.userId +
        " User Name:" + session.attributes.userName +
        " User Email:" + session.attributes.userEmail +
        " User Signed In " + session.attributes.signInCount +
        " Workout Taken Count " + session.attributes.workoutTakenCount
        );

}

function handleWelcomeRequest(response, session) {
   
        var speechOutput;
        var welcomeText = "";
        var welcomebacktext = "";
        var signInText ="";
        var name =  session.attributes.userName;
        var userId = session.attributes.userId;
        var signInCount = session.attributes.signInCount;
        var workoutTakenCount = session.attributes.workoutTakenCount;

        console.log("Session attributes on Welcome User Id:", session.attributes.userId +
        " User Name:" + session.attributes.userName +
        " User Email:" + session.attributes.userEmail +
        " User Signed In " + session.attributes.signInCount +
        " Workout Taken Count " + session.attributes.workoutTakenCount
        );

        if (typeof signInCount != "undefined"){
            if(signInCount > 1){
                welcomeText += " back ";
                welcomebacktext = " for your next pilates class";
            }else{
                welcomebacktext = " for your first class";
            }
            signInText =  " You have signed in " + signInCount +  " times to a lot of pilates.";
        }
        if (typeof name != "undefined"){
            if (!name){
                welcomeText+="";
            }else{
                 welcomeText+=name;
            }
        }

//You can now keep track of you pilates exercises.

        var speechOutput = {
                    speech: "<speak>Welcome " + welcomeText  +
                    "<break time=\"0.1s\" /> " +
                    " to A Lot Of Pilates. " +
                    ".<break time=\"0.7s\" /> " +
                    signInText +
                    ".<break time=\"1s\" /> " +
                    "Get your mat ready on the floor " + welcomebacktext  +
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
}


function handleStartOverRequest(response) {
    var repromptText = "Do you want to start the class?";
    var speechOutput = "I can lead you through a pilates sequence " + "Or you can say exit. " + repromptText;

    response.ask(speechOutput, repromptText);
}




/**
 * This handles the one-shot interaction, where the user utters a phrase like:
 * 'Alexa, start a Pilates class'.
 * If there is an error in a slot, this will guide the user to the dialog approach.
 */
function handleOneshotStartPilatesClassRequest(intent, session, response) {
    var duration = 2;
    var type = 2;
    session.attributes.stage = 0;
    
    if( typeof session.attributes.userId == "undefined"){
        validateALOPUserRequest(session.user.accessToken, function alopGetUserResponseCallback(err, alopUserResponseObject) {     
            //initialize session attributes from authorization class
            initializeSession(session, alopUserResponseObject);
            getPilatesSequenceResponse(duration, type, response, session);
        });
    }else{
        getPilatesSequenceResponse(duration, type, response, session);
    }
    
    
}


/**
 * This handles the interaction if the user response Yes to the 'Did you like this class' question.
 * This question comes up at the end of a pilates class.
 * 'Alexa, ...Did you like this class?'
 * This function will write to AWS DynamoDB (handleExit method) and response to the user
 * and it writes a card to the Alexa app
 */
function handleLikeClassRequest(intent, session, response) {
    
    handleExit(intent, session, response);
}

/**
 * This handles the interaction if the user response No to the 'Did you like this class' question.
 * This question comes up at the end of a pilates class.
 * 'Alexa, ...Did you like this class?'
 * This function responds to the user.
 */
function handleDidNotLikeClassRequest(intent, session, response) {
    
    handleExit(intent, session, response);
}


function handleEndClassRequest(){
    return "You are all done! Hope you feel as great as me! Did you enjoy this class?";
}

/**
 * This handles the Help intent:
 * 'Alexa, help me'.
 */
function handleHelpRequest(intent, session, response) {
    var speechText = "";
    switch (session.attributes.stage) {
        case 0: //haven't retrieve the class yet
            speechText = "Pilates classes are great way to feel wonderful. " +
                "If you are not familiar with the exercises visit a lot pilates dot com. " +
                "If you are ready to start say go or you can say exit.";
            break;
      
        default:
            speechText = "If you are not familiar with this exercise, " +
                        " visit A Lot Of Pilates dot com and take a video instructed class. " +
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
    
    var workoutAvailable = [530,94,680,638]; //having a problem with 638
    var workoutId = workoutAvailable[Math.floor(Math.random() * workoutAvailable.length)];

    session.attributes.workoutId = workoutId;

    // Issue the request, and respond to the user
    makeALOPRequest(workoutId, duration, type, function alopResponseCallback(err, alopAPIResponse) {
        var speechOutput;
        if (err) {
            speechOutput = {
                speech:"Sorry, the A Lot Of Pilates service is experiencing a problem. Please access ALotOfPilates.com to take a class.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
            response.tell(speechOutput);
        } else {
            if(alopAPIResponse.poses.length > 0){
                session.attributes.stage = 1;       
                teachClass(alopAPIResponse, response, session);
            }else{
                speechOutput = {
                    speech:"Sorry, the A Lot Of Pilates service is experiencing a problem. Please access ALotOfPilates.com to take a class.",
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

    for(var i = 0; i < 1; i++){
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
    console.log("Class Sequence Text: ", speechPoseOutput);
    var speechText ="<speak>" + speechPoseOutput + "</speak>";
    
    var speechOutput = {
                speech: speechText,
                type: AlexaSkill.speechOutputType.SSML
        },
        repromptOutput = {
            speech:  "<speak> Was this class fun? </speak>",
            type: AlexaSkill.speechOutputType.SSML
        };

    //response.askWithCard(speechOutput,repromptOutput, "Pilates Class", "Good job on completing the class");
    response.ask(speechOutput,repromptOutput);
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
 * This handles writes to Amazon Dynamo Completion table.
 * It is triggered from the Yes answer to the 'Did you like this class?' question at the end of a class.
 */
function handleExit(intent, session, response){
   
    if (typeof session.attributes.userId != "undefined") {

         console.log("Session attributes on Exit User Id:", session.attributes.userId +
        " User Name:" + session.attributes.userName +
        " User Email:" + session.attributes.userEmail +
        " User Signed In " + session.attributes.signInCount +
        " Workout Taken Count " + session.attributes.workoutTakenCount +
        " Workout Id: " + session.attributes.workoutId);

        postALOPTrackingRequest(session.attributes.userId, session.attributes.userEmail,session.user.accessToken, session.attributes.workoutId, session.user.userId, function alopTrackingResponseCallback(err, alopPostResponseObject) {
                console.log(" callback TO postALOPTrackingRequest" , intent);
                if (err) {
                    console.log("Error post tracking class");
                }

                var speechText = "I am glad you liked the class. Visit ALotOfPilates.com for many more pilates classes. Good-bye!";

                if (intent.name == 'AMAZON.NoIntent') {
                    speechText = "I am sorry to hear you did not like this class. Visit ALotOfPilates.com for many more pilates classes. Good-bye!";
                }
                var cardContent = "Congratulations you finished a pilates class. I am glad you liked the class.\nYou earned a Newbie Badge.\n\nVisit ALotOfPilates.com for many more classes";
                response.tellWithCard(speechText,"A Lot Of Pilates Class", cardContent, "https://s3.amazonaws.com/s3-us-studio-resources-output/images/Hundred.gif");
        });
    }
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
            console.log("makeALOPRequest object ", alopResponseObject);

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
 * POST Tracking
 */
function postALOPTrackingRequest(userId, userEmail, token, workoutId, deviceId, alopTrackingResponseCallback) {
      
    //curl -H 'Content-Type: application/json' -H 'Accept: application/json' -X POST https://alop.herokuapp.com/api/v3/trackings 
    //-d '{"id": 530, "user_id":"40", "device_id": "amzn1.ask.account", "device_type":"ECHO"}' 
    //-H "X-3scale-Proxy-Secret-Token:MPP-Allow-API-Call" -H "X-User-Email:luciana.bruscino@gmail.com" -H "X-User-Token:pKGJ-kYMjdcKmj949gz9";

    var post_data = JSON.stringify({
      'id' : workoutId,
      'user_id': userId,
      'device_id': deviceId,
      'device_type' : 'ECHO'
    });

    var post_options = {
      hostname: 'alop.herokuapp.com',
      path: '/api/v3/trackings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-3scale-Proxy-Secret-Token':config.api_secret,
        'X-User-Email':userEmail,
        'X-User-Token': token,
        'Content-Length':  Buffer.byteLength(post_data)
      }
    };

    var req = https.request(post_options, function(res) {
        console.log('STATUS postALOPTrackingRequest: ' + res.statusCode);
        res.setEncoding('utf8');
        var trackingPostResponse = '';

        if (res.statusCode != 200) {
            alopTrackingResponseCallback(new Error("Non 200 Response"));
        }

        res.on('data', function (data) {
            console.log("postALOPTrackingRequest data " , data);
            trackingPostResponse += data;
        });

        res.on('end', function () {
           var alopPostResponseObject = JSON.parse(trackingPostResponse);
          
           
            if (alopPostResponseObject.error) {
                 console.log("postALOPTrackingRequest object " , alopPostResponseObject);
                alopTrackingResponseCallback(new Error(alopPostResponseObject.error.message));
            } else {
                console.log("postALOPTrackingRequest object " , alopPostResponseObject);
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
 */
function validateALOPUserRequest(token, alopGetUserResponseCallback) {
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
        //console.log('Get ALOT User Quest STATUS: ' + res.statusCode);       
        res.setEncoding('utf8');
        var alopUserResponseString = '';

        if (res.statusCode != 200) {
            alopGetUserResponseCallback(new Error("Non 200 Response"));
        }

        res.on('data', function (data) {
            alopUserResponseString += data;
        });

        res.on('error', function () {
           alopGetUserResponseCallback(new Error("Non 200 Response"));
        });

        res.on('end', function () {
            var alopUserResponseObject = JSON.parse(alopUserResponseString);
            
          
            if (alopUserResponseObject.error) {
                alopGetUserResponseCallback(new Error(alopUserResponseObject.error.message));
            } else {
                console.log("validateALOPUserRequest object " , alopUserResponseObject);
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
