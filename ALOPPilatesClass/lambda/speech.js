var Speech = function (){};

/**
 * This function returns the welcome text:
 * 'Alexa, start pilates class'.
 */
Speech.prototype.welcome = function(handlerInput, myImage){
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    /*const speechText = "Welcome " +
        "<break time=\"0.1s\" /> " +
        " to A Lot Of Pilates. " +        
        ".<break time=\"0.3s\" /> " +
        "Get your mat ready on the floor. " +
        ".<break time=\"1.5s\" /> " +
        "Are you ready to start the class?";
    
    const reprompt = "I can lead you through a pilates sequence " +
        "<break time=\"0.2s\" /> " +
        " You can also "+
        " visit ALotOfPilates.com and take a video instructed class. " +
        ".<break time=\"0.7s\" /> " +
        "Just say start class when ready. Should I start?";*/
  
        return handlerInput.responseBuilder
            .speak(requestAttributes.t('WELCOME_MESSAGE'))
            .reprompt(requestAttributes.t('WELCOME_REPROMPT'))
            .getResponse();

//    return handlerInput.responseBuilder
//       .speak(speechText)
//       .reprompt(reprompt)     
//       .withStandardCard('Welcome to A Lot of Pilates', 
//         "Are you ready to start a pilates class?.",
//         "https://www.alotofpilates.com/assets/logo-294ce89aa8a188826eea52586cd30afa8fb8eacf6683d6f8b737d4e07ef347df.png",
//         "https://www.alotofpilates.com/assets/logo-294ce89aa8a188826eea52586cd30afa8fb8eacf6683d6f8b737d4e07ef347df.png")
//       .getResponse();

 
};



/**
 * This function returns the text when StartOverIntent is triggered
 * 'Alexa, start class again'.
 */
Speech.prototype.startOver = function(handlerInput){
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();    
    /*var repromptText = "Do you want to start the class?";
    var speechOutput = "I can lead you through a pilates sequence " + "Or you can say exit. " + repromptText;*/
    var speeechOutput = requestAttributes.t('STARTOVER_MESSAGE');
    var repromptText = requestAttributes.t('STARTOVER_REPROMPT');
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      //.withSimpleCard('Lets start a class', speechText)
      .getResponse();
};

Speech.prototype.getExerciseName = function(pose, requestAttributes){
    var exercises =requestAttributes.t('EXERCISES');
    
    var exercise = exercises[pose.id];    
    var name;
    if ((typeof exercise != "undefined") || ( ! exercise )){
        name = pose.name;
    }else{
        name = exercise[pose.id].exerciseName;
    }
    return name;
};

Speech.prototype.getStartingClassText = function(name, index, requestAttributes){

    //var startTextOptions = ["Get ready on your mat for the " + name, "Let's get started with " + name];
    //var nextTextOptions = ["Next exercise is " + name, "Moving on to the" +name, "Next is " + name];
    var startTextOptions = requestAttributes.t('GET_START_EXERCISE_MESSAGE', name);   
    var nextTextOptions =requestAttributes.t('GET_NEXT_EXERCISE_MESSAGE',name);
    
    if(name.length > 0){
        if (index === 0){
            //return startTextOptions[Math.floor(Math.random() * startTextOptions.length)];
            return startTextOptions;
        }else{
             //return nextTextOptions[Math.floor(Math.random() * nextTextOptions.length)];
             return nextTextOptions;
        }
    }else{
        if (index === 0){
            //return "Get ready on your mat to get started";
            return requestAttributes.t('GET_START_EXERCISE_DEFAULT_MESSAGE');
        }else{
            //return "Moving on to the next exercise";
            return requestAttributes.t('GET_NEXT_EXERCISE_DEFAULT_MESSAGE');
        }
    }
   
};


/** this method is not being called right now. */
Speech.prototype.aboutToTeachClass = function (alopAPIResponse, handlerInput){  
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes(); 
    return handlerInput.responseBuilder
      .speak(requestAttributes.t('TEACH_CLASS_ABOUT_TO_START_MESSAGE'))         
      .getResponse();
}

/**
 * Call for workout was successfull, so this function responsability is to loop thru the 
 * exercises the output the exercise information. It calls Speech.exerciseTimings for descriptions.
 * At this point, the user is at stage 1 of the session.
 */
Speech.prototype.teachClass = function (alopAPIResponse, handlerInput){   
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes(); 
    var speechPoseOutput ="";
  //  console.log("workout response being taught", alopAPIResponse);
    let workout_id = alopAPIResponse.id;
    let workout_title = alopAPIResponse.title;
    console.log("workout_id being taught", alopAPIResponse.id );
    for(var i = 0; i <  alopAPIResponse.poses.length; i++){
        var pose = alopAPIResponse.poses[i];
        var name = this.getExerciseName(pose,requestAttributes);
        console.log("getExerciseName1", name);
        speechPoseOutput += this.getStartingClassText(name, i, requestAttributes);
        speechPoseOutput += ". <break time=\"0.2s\" />. " + pose.repetition;
        speechPoseOutput += ". <break time=\"1s\" />. ";
        speechPoseOutput += this.exerciseTimings(pose,requestAttributes);
    }
    //speechPoseOutput += "You are all done! Hope you feel as great as me! Did you enjoy this class?";
    speechPoseOutput += requestAttributes.t('TEACH_CLASS_DONE_MESSAGE');
    var speechText = speechPoseOutput;
    console.log("CLASS SPEACH OUT NUMBER OF CHAR (max 8000)", speechText.length);
    const speechOutput = speechText;
    //const repromptOutput = "Was this class fun? Say yes for this class to be tracked on the A Lot of Pilates activities calendar.";
    const repromptOutput = requestAttributes.t('TEACH_CLASS_DONE_REPROMPT');
    let cardTitle = "Pilates class";
    if (workout_title){
      cartTitle = workout_title;
    }

    let cardImageSmall = "https://www.alotofpilates.com/assets/logo-294ce89aa8a188826eea52586cd30afa8fb8eacf6683d6f8b737d4e07ef347df.png";
    let cardImageLarge = "https://www.alotofpilates.com/assets/logo-294ce89aa8a188826eea52586cd30afa8fb8eacf6683d6f8b737d4e07ef347df.png";

    if ( workout_id ) {
      cardImageSmall =  "https://www.alotofpilates.com/assets/workout_series_small_"+ workout_id +".png";
      cardImageLarge = "https://www.alotofpilates.com/assets/workout_series_small_"+ workout_id +".png";
    }

    //var cardDescription = "This is your pilates series of exercises for today. Enjoy your class.";
    var cardDescription = requestAttributes.t('TEACH_CLASS_STANDARD_CARD_MESSAGE');
    return handlerInput.responseBuilder
      .speak(speechOutput)    
      .reprompt(repromptOutput)
      .withStandardCard(cartTitle, cardDescription,cardImageSmall, cardImageLarge)
      .getResponse();

};

Speech.prototype.exerciseTimings = function (pose,requestAttributes){
    var speechExerciseOutput ="";
        var sideLegSeriesPoseIdArray = [431,432,434,435,326];
        var plankPosesIdArray = [133];
        var otherSuppotedPoses =[158, 160, 247, 266, 267, 273, 274, 276, 287, 289, 291, 310, 315, 318, 321, 324, 326, 327, 381, 451, 487, 499, 511, 536, 545, 528, 529, 541, 547, 564, 431, 432, 434, 435, 631];
         var name = this.getExerciseName(pose,requestAttributes);

        if (plankPosesIdArray.indexOf(pose.id) > -1){//Planks - Hold it for 20 to 30 seconds
            speechExerciseOutput += "Get in position for the " + name;
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
            speechExerciseOutput += "Good job. ";
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

            speechExerciseOutput +=  this.exerciseInfo(pose.id,requestAttributes);
       
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
Speech.prototype.exerciseInfo = function(id,requestAttributes){
    var exercises =requestAttributes.t('EXERCISES');
    return exercises[id].exerciseDescription;
};

/**
 * This handles the Help intent:
 * 'Alexa, help me'.
 */
Speech.prototype.helpText = function (handlerInput, attributes) {
    var speechText = "";
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();    
    switch (attributes.classState) {
        case 'NOTSTARTED':
             /*speechText = "If you are not familiar with Pilates exercises visit a lot of pilates dot com. " +
                "There you can take video instructed classes to become comfortable with these exercises. Do you want to give it a try? ";*/
             speechText = requestAttributes.t('HELP_TEXT_NOTSTARTED_CLASS_MESSAGE');
        break;
        default:
            /*speechText = "Sorry that you are having trouble with this class. " +
                "At a lot of pilates dot com you can take video instructed classes to become comfortable with these exercises. "+
                "Do you want to start a new class with me? ";*/
            speechText = requestAttributes.t('HELP_TEXT_DEFAULT_STATE_MESSAGE');
    }

    //var cardTitle = 'Pilates help';
    var cardTitle = requestAttributes.t('HELP_TEXT_CARD_TITLE');
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(cardTitle, speechText)
      .getResponse();
  };

Speech.prototype.stopUnStartedClass = function (handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    var speechText = requestAttributes.t('STOP_UNSTARTED_CLASS_MESSAGE');    
    //var speechText = "Ok. Hope you find a better time to start the class. Be sure to visit ALotOfPilates.com for pilates classes. Goodbye!";
    return handlerInput.responseBuilder
      .speak(speechText)     
      .getResponse();
};

Speech.prototype.finishedWorkout = function (handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    var speechText = requestAttributes.t('FINISHED_WORKOUT_MESSAGE');    
    //var speechText = "That is awesome. Now relax and enjoy the moment. Goodbye!";
    return handlerInput.responseBuilder
      .speak(speechText)     
      .getResponse();
};


Speech.prototype.cancelClass = function (handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    var speechText = requestAttributes.t('CANCEL_CLASS_MESSAGE');    
    //var speechText = "It is ok that you could not finish the class today. Visit ALotOfPilates.com for other pilates classes. Good-bye";
    return handlerInput.responseBuilder
      .speak(speechText)      
      .getResponse();
};

Speech.prototype.notAFunClass = function(handlerInput){
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    var speechText = requestAttributes.t('NOT_A_FUN_CLASS_MESSAGE');
    //var speechText = "Sorry. How about you try another class next time. Visit ALotOfPilates.com for other pilates classes as well. Good-bye";
    return handlerInput.responseBuilder
      .speak(speechText)    
      .getResponse();
};

Speech.prototype.noHelp = function(handlerInput){
   // var speechText = "Sorry that you had a hard time with this class. Visit ALotOfPilates.com for other pilates classes, there are plenty to choose from. Good-bye";
   const requestAttributes = handlerInput.attributesManager.getRequestAttributes(); 
   return handlerInput.responseBuilder
      .speak(requestAttributes.t('NO_HELP_MESSAGE'))  
      .getResponse();
};

Speech.prototype.pluralClassText = function(count,requestAttributes){    
    return count > 1 ? requestAttributes.t('CLASSES_TEXT'): requestAttributes.t('CLASS_TEXT');
};

Speech.prototype.trackDisplay = function(data, handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const speechText = requestAttributes.t('FINISH_ENCOURAGEMENT'); //"Good job finishing a Pilates class. Visit ALotOfPilates.com for many more pilates classes. Good-bye!";
    var cardContent = speechText;

    if( data ) {      
        if (data.length) {
            var trackingIndex = data.length-1;
            var tracking = data[trackingIndex];
            //console.log("TRACKING ITEM", tracking);
            var yearCount = tracking.classCount;
            var yearClassText = this.pluralClassText(tracking.classCount,requestAttributes);
            var year = tracking.year;
            var trackingText = "";
            if (tracking.months.length > 0 ){
                var lineBreak = '\n\n----------------------\n\n';
                trackingText = lineBreak;
                for (var i = 0; i < tracking.months.length; i++) {
                    var item = tracking.months[i];
                    var classText = this.pluralClassText(item.classCount,requestAttributes);
                    trackingText += item.month + " : " + item.classCount + classText + "taken.";
                    trackingText += lineBreak;
                }
            }
            //cardContent = " You have taken " + yearCount + yearClassText + " in " + year + ". \r\nKeep track of your progress per month. \r\n" + trackingText +"\n \nVisit ALotOfPilates.com for many more classes and tracking calendar.";
            cardContent = requestAttributes.t('TRACK_DISPLAY_CARD_MESSAGE',yearCount,yearClassText,year, trackingText);
        }
    }
    
    //var cardTitle = 'Pilates class activity';
    var cardTitle = requestAttributes.t('TRACK_DISPLAY_CARD_TITLE');
    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(cardTitle, cardContent)
      .getResponse();
};


/************ ERROR Speech **************/
Speech.prototype.accountSetupError = function (handlerInput){
    console.log("Account linking message FRAM speech");
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    
    return handlerInput.responseBuilder
      //.speak("You must have an ALotOfPilates.com account to use this skill. Please use the Alexa app to link your Amazon account with your ALotOfPilates Account.")      
      .speak(requestAttributes.t('ACCOUNT_SETUP_ERROR_MESSAGE'))
      .withLinkAccountCard()
      .getResponse();
};

Speech.prototype.genericAnswer = function (handlerInput){
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();   
   // var speechText = "I had a hard time understanding you. Say Start Pilates class or visit ALotOfPilates to take a class.";
     return handlerInput.responseBuilder
      .speak(requestAttributes.t('GENERIC_MESSAGE'))     
      .getResponse();
};

Speech.prototype.userAccountError = function(handlerInput){
  //var speechText = "Sorry, I can not identify your account. You must have an ALotOfPilates.com account to use this skill. Please use the Alexa app to link your Amazon account with your ALotOfPilates Account.";                 
  const requestAttributes = handlerInput.attributesManager.getRequestAttributes(); 
  return handlerInput.responseBuilder
      .speak(requestAttributes.t('USER_ACCOUNT_ERROR_MESSAGE'))     
      .withLinkAccountCard()
      .getResponse();
};


Speech.prototype.startClassError = function(handlerInput, err){
    console.log("ERROR WORKOUT GET SEQUENCE", err);
    //var speechText = "Sorry, an error occurred retrieving a pilates class. Please access ALotOfPilates.com to take a class.";
    return handlerInput.responseBuilder
    .speak(requestAttributes.t('START_CLASS_ERROR_MESSAGE'))     
      .getResponse();          
};



module.exports = new Speech();