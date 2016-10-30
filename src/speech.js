var AlexaSkill = require('./AlexaSkill'),
    Exercises = require('./exercises');

var Speech = function (){};

/**
 * This function returns the welcome text:
 * 'Alexa, start pilates class'.
 */
Speech.prototype.welcome = function(options, response){
//You can now keep track of you pilates exercises.

  var speechOutput = {
        speech: "<speak>Welcome " + options.welcomeText  +
        "<break time=\"0.1s\" /> " +
        " to A Lot Of Pilates. " +
        ".<break time=\"0.7s\" /> " +
        options.workoutTakenText +
        ".<break time=\"1s\" /> " +
        "Get your mat ready on the floor " + options.welcomebacktext  +
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
};



/**
 * This function returns the text when StartOverIntent is triggered
 * 'Alexa, start class again'.
 */
Speech.prototype.startOver = function(response){
    var repromptText = "Do you want to start the class?";
    var speechOutput = "I can lead you through a pilates sequence " + "Or you can say exit. " + repromptText;
    response.ask(speechOutput, repromptText);
};


/**
 * Call for workout was successfull, so this function responsability is to loop thru the 
 * exercises the output the exercise information. It calls Speech.exerciseTimings for descriptions.
 * At this point, the user is at stage 1 of the session.
 */
Speech.prototype.teachClass = function (alopAPIResponse, response){
    var speechPoseOutput ="";
    for(var i = 0; i < 1; i++){
        var pose = alopAPIResponse.poses[i];
        if( i === 0 ){
            speechPoseOutput += "Get ready on your mat for the " + pose.name;
        }else{
            speechPoseOutput += "Next exercise is " + pose.name;
        }
        
        speechPoseOutput += ". <break time=\"0.2s\" />. " + pose.repetition;
        speechPoseOutput += ". <break time=\"1s\" />. ";
        speechPoseOutput += this.exerciseTimings(pose);
    }
    speechPoseOutput += "You are all done! Hope you feel as great as me! Did you enjoy this class?";
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
};

Speech.prototype.exerciseTimings = function (pose){
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
            speechExerciseOutput += "you are done  ";
            speechExerciseOutput += ".<break time=\"0.1s\" />. ";
            speechExerciseOutput += "Relax ";
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

        speechExerciseOutput +=  this.exerciseInfo(pose.id);       
       
        }else{  //Generic timining   
            //console.log("Exercise duration " + pose.duration + " formatted " + getFormattedDuration(pose.duration));
            speechExerciseOutput += ". Go. ";
            //var duration = getFormattedDuration(pose.duration);      
            for(var i = 0; i < 10; i++){
                speechExerciseOutput += "<break time=\"5s\" />. ";
            }
        }
    return speechExerciseOutput;
};

/**
 * This function retrieves the exercise information from the exercise.js module
 * It feeds back to the function and set the session parameters necessary to be used by HelpIntent
 */
Speech.prototype.exerciseInfo = function(id){
  return Exercises[id].exerciseDescription;
};

/**
 * This handles the Help intent:
 * 'Alexa, help me'.
 */
Speech.prototype.help = function (stage, response) {
    var speechText = "";
    switch (stage) {
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
    response.ask(speechOutput, repromptOutput);
};


Speech.prototype.stopClass = function (response) {
  var speechOutput = "It is ok that you could not finish the class today. Maybe next time. Visit ALotOfPilates.com for pilates classes. Good-bye";
  response.tellWithStop(speechOutput);
};

Speech.prototype.stopUnStartedClass = function (response) {
  var speechOutput = "Ok. Hope you find a better time to start the class. Visit ALotOfPilates.com for pilates classes. Goodbye!";
  response.tellWithStop(speechOutput);
};

Speech.prototype.cancelClass = function (response) {
 var speechOutput = "It is ok that you could not finish the class today. Maybe next time. Good-bye";
        response.tellWithStop(speechOutput);
};

Speech.prototype.trackDisplay = function(userTracking, response, data, intent) {
    if ((response != "undefined") || (response)){
        var speechText = "I am glad you liked the class. Visit ALotOfPilates.com for many more pilates classes. Good-bye!";

        if (intent.name == 'AMAZON.NoIntent') {
            speechText = "I am sorry to hear you did not like this class. Visit ALotOfPilates.com for many more pilates classes. Good-bye!";
        }
    
        var cardContent = speechText;
        var trackingIndex = userTracking.length-1;
        //console.log("TRACKING INDEX", trackingIndex);
        if (typeof userTracking[trackingIndex] != "undefined") {
            var badgeText = "";
            // if (typeof userTracking[trackingIndex].badgeTitle != "undefined") {
            //     var badgeTitle = userTracking[trackingIndex].badgeTitle;
            //     badgeText = "You earned a " + badgeText + " Badge.\n\n";
            // }
            var yearCount = userTracking[trackingIndex].classCount;
            var year = userTracking[trackingIndex].year;
            var lineBreak = '\n\n----------------------\n\n';
            var trackingText = lineBreak;
            for (var i = 0; i < userTracking[trackingIndex].months.length; i++) {
                var item = userTracking[trackingIndex].months[i];
                trackingText += item.month + " : " + item.classCount + " classes taken.";
                trackingText += lineBreak;
            }
                 
            cardContent = badgeText + " You have taken " + yearCount + " classes in " + year + ". \r\nKeep track of your progress per month. \r\n" + trackingText +"\n \nVisit ALotOfPilates.com for many more classes and tracking calendar.";
        }
        response.tellWithCard(speechText,"A Lot Of Pilates Class", cardContent, "https://s3.amazonaws.com/s3-us-studio-resources-output/images/Hundred.gif");
    }
};

/************ ERROR Speech **************/
Speech.prototype.accountSetupError = function (response){
    var speechOutput = "You must have an ALotOfPilates.com free account to use this skill. Please use the Alexa app to link your Amazon account with your ALotOfPilates Account.";
    response.tellWithLinkAccount(speechOutput);
};

Speech.prototype.userAccountError = function(response){
    var speechOutput = {
                speech:"Sorry, I can not identify your account. You must have an ALotOfPilates.com free account to use this skill. Please use the Alexa app to link your Amazon account with your ALotOfPilates Account.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
    response.tellWithLinkAccount(speechOutput);
};

Speech.prototype.startClassError = function(response){
    var speechOutput = {
                speech:"Sorry, the A Lot Of Pilates service is experiencing a problem. Please access ALotOfPilates.com to take a class.",
                type: AlexaSkill.speechOutputType.PLAIN_TEXT
            };
    response.tell(speechOutput);
};



module.exports = new Speech();