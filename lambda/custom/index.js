
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
const Alexa = require('ask-sdk-core'),
      User = require('./user'),
      Workout = require('./workout'),
      Speech = require('./speech');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.session.new || handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  async handle(handlerInput) {
    console.log("START LaunchRequestHandler");
    const token = handlerInput.requestEnvelope.context.System.user.accessToken;
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes() || {};
    
    if (Object.keys(sessionAttributes).length === 0) {
      sessionAttributes.classState = 'NOTSTARTED';
    }
    attributesManager.setSessionAttributes(sessionAttributes);

    if(!token){    
      console.log("ACCESSTOKEN do we have it? no" );      
      //return Speech.accountSetupError(handlerInput);  
      return Speech.welcome(handlerInput);  
    } else {       
       console.log("ACCESSTOKEN do we have it? yes" );
       let response;
       var user =  new User(token);
       if( user ){ 
         console.log("CALL USER GET" , user );  
         response =  await user.get()                       
            .catch((err) => console.error("ERR LAUNCH ACTION USER API",err))
            .then((data) => {
              console.log("USER DATA IN LaunchRequestHandler", data);
              sessionAttributes.userState = data;
            })
            .catch((err) => console.error("ERR LAUNCH ACTION CALLING USER DATA",err)            
            );
        }   
        return Speech.welcome(handlerInput); 
    }
  }
};

const YesIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;  
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.YesIntent'
        || request.intent.name === 'AMAZON.OneshotStartPilatesClassIntent');

  },
  async handle(handlerInput) {
    console.log("START YesIntent");
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();
    var token = handlerInput.requestEnvelope.context.System.user.accessToken;
    
    if(!token){    
      console.log("LOG IT THAT ACCESSTOKEN NO AVAILBLE FOR WORKOUT.ACCESSTOKEN do we have it? no" );
    }

    if (sessionAttributes.classState && sessionAttributes.classState === 'NOTSTARTED') {
          var workout =  new Workout(token);
          if( workout ){  
            let response;
            response =  await workout.get()
                .then((data) => {                  
                  if((data ) &&  (data.poses.length > 0)){
                    const attributesManager = handlerInput.attributesManager;
                    const sessionAttributes = attributesManager.getSessionAttributes() || {};
                    sessionAttributes.classState = 'STARTED';
                    return data;
                  }else{
                    return 0;
                  }
                })
                .catch((err) => {
                  console.error("ERR YES INTENT",err);
                  return Speech.startClassError(handlerInput);
                }); 

            console.log("response", response);
           if (response) {
            return Speech.teachClass(response, handlerInput);
           }else{
            return Speech.startClassError(handlerInput);
           }
          }else{
              return Speech.startClassError(handlerInput);
          }
    } else if (sessionAttributes.classState && sessionAttributes.classState === 'STARTED') {  
         console.log("sessionAttributes.userData", sessionAttributes.userData );  
         console.log("sessionAttributes", sessionAttributes );                             
         if( sessionAttributes.userData ){
         
          sessionAttributes.classState = 'ENDED';       
          try{
            var workout_options = {
                "userId": user.id,
                "userEmail": user.email,
                "token": user.token,
                "workoutId":workout.id,
                "deviceId": user.deviceId
            };
            console.error("EXIT HAS USER OPTIONS", workout_options);
            const token = handlerInput.requestEnvelope.context.System.user.accessToken;
            if ( token ){
              var workout =  new Workout(token);  
  
              if( workout ){  
                let response;
                response = await workout.postTracking(workout_options)
                  .then(()=> workout.getTrackings(token))
                  .then((data) => Speech.trackDisplay(this.formatUserTracking(data)))
                  .catch((err) => console.error("ERR",err));
              }
            }else{
               console.log("token  not available, workout not tracked");
              return Speech.finishedWorkout(handlerInput);
            }
          }catch(e){
              console.error("ERROR EXITING SKILL",e);
          }
        } else {
          console.log("user data not available, workout not tracked");
          return Speech.finishedWorkout(handlerInput);
        }

    }else{
      console.log('what to start a class?');
      sessionAttributes.classState = 'NOTSTARTED';
      return Speech.startOver(handlerInput);
    }
  }
};


const getBadge = function (count) {
    console.log("BADGE COUNT ", count);
    var badge = "A Lot of Pilates!";

    if (count > 0 && count < 5){
      badge = "Newbie";
    } else if (count > 6 && count < 10){
        badge =  "Warmed Up";
    } else if (count > 11 && count < 30){
        badge =  "Feel Good";
    } else if (count > 31 && count < 60){
        badge =  "Up and Over";
    } else if (count > 61 && count < 99){
        badge = "Feel Great";
    } else if (count >100 && count < 150){
        badge = "New Body";
    } else if (count > 151 && count < 200){
        badge = "Fit Body";
    } else if (count > 201 && count < 300){
        badge =  "Core Stability";
    }

    return badge;
};

const formatUserTracking = function (data){

  if(data){
      console.log("TRACKING USER GET DATA", data);
      //[ { id: 682, workout_id: 656, created_at: '2016-11-05 19:25:35 UTC' }, 
      //{ id: 681, workout_id: 656, created_at: '2016-11-05 19:18:13 UTC' }, 
      //{ id: 680, workout_id: 680, created_at: '2016-11-05 03:20:51 UTC' } ]

        var workoutCount = data.length;
        var trackingYearArray = [];
        
        //Tracking Object 
        var trackingYearObject = {};
        trackingYearObject.classCount = 0;
        trackingYearObject.badgeTitle = this.getBadge(workoutCount);
        trackingYearObject.year = '';
        trackingYearObject.months = [];


        var prevYear = '';
        var prevMonth = '';

        var trackingMonthArray = [];

        var trackingMonthObject = {};
        trackingMonthObject.month = '';
        trackingMonthObject.classCount = 0;
        
        
        for (var i = 0; i < workoutCount; i++) {
            var item = data[i];
            var workoutDate = new Date(item.created_at);
            var workoutYear = workoutDate.getFullYear();
            console.log("TRACKING WORKOUT YEAR", workoutYear);

            var workoutMonth = this.months[workoutDate.getMonth()];
            console.log("TRACKING WORKOUT MONTH", workoutMonth);

            trackingYearObject.year = workoutYear;

            if ((prevYear === '') || (prevYear == workoutYear)){
                 trackingYearObject.classCount += 1;
                 //trackingYearObject.year = workoutYear;
                 if ((prevMonth === '') || (prevMonth == workoutMonth)){

                    trackingMonthObject.classCount += 1;
                    trackingMonthObject.month = workoutMonth;                    
                 }else {
                    trackingMonthArray.push(trackingMonthObject);                     
                    trackingYearObject.months = trackingMonthArray;
                    //Reset
                    trackingMonthObject = {};
                    trackingMonthObject.classCount = 1;
                    
                 }
                 prevMonth = workoutMonth;
            }else{
                trackingYearObject.classCount = 0;
                trackingYearArray.push(trackingYearObject);
                //Reset
                trackingYearObject = {};
                trackingYearObject.classCount = 1;
                trackingYearObject = trackingYearArray;
            }
            prevYear = workoutYear;
        }
    
        trackingMonthArray.push(trackingMonthObject);
        trackingYearObject.months = trackingMonthArray;        
        trackingYearArray.push(trackingYearObject);       
       

        return trackingYearArray;
    } else {
         return [];
    }
};

const NoIntentHandler = {
  canHandle(handlerInput) {  
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' 
      && request.intent.name === 'AMAZON.NoIntent';    
  },
  handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;   
    const sessionAttributes = attributesManager.getSessionAttributes();

     if (sessionAttributes.classState === "NOTSTARTED") {
          return Speech.stopUnStartedClass(handlerInput);
     }else if (sessionAttributes.classState === "STARTED") {    
        return Speech.notAFunClass(handlerInput);
     }
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse();
  }
};

const UnhandledIntent = {
  canHandle() {
    return true;
  },
  handle(handlerInput) {
     return Speech.genericAnswer(handlerInput);
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return Speech.genericAnswer(handlerInput);
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const attributesManager = handlerInput.attributesManager;   
    const sessionAttributes = attributesManager.getSessionAttributes();

    return Speech.helpText(handlerInput, sessionAttributes);
  }
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    Speech.cancelClass(handlerInput);
  }
};

const StartOverIntentHandler = {
   canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'StartOverIntentHandler';
  },
  handle(handlerInput) {
    console.log("START StartOverIntentHandler");
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes() || {};
    sessionAttributes.classState = 'NOTSTARTED';
    

    return Speech.startOver(handlerInput);  
  }
};

let skill;

exports.handler = async function (event, context) {
  console.log(`REQUEST++++${JSON.stringify(event)}`);
  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        LaunchRequestHandler,
        HelpIntentHandler,
        YesIntentHandler,
        NoIntentHandler,
        StartOverIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        UnhandledIntent,
      )
      .addErrorHandlers(ErrorHandler)
      .create();
  }

  const response = await skill.invoke(event, context);
  console.log(`RESPONSE++++${JSON.stringify(response)}`);

  return response;
};

