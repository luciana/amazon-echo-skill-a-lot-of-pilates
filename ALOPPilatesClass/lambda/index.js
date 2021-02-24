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
      Speech = require('./speech'),
      config = require('./config');

const i18n = require('i18next'); 
const sprintf = require('i18next-sprintf-postprocessor');
const languageStrings = {
    'en' : require('./i18n/en'),
    'pt' : require('./i18n/pt')
  };

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
      console.log("Account Linking message FROM LaunchRequestHandler" ); 
      return Speech.accountSetupError(handlerInput);  
    } else {       
       console.log("ACCESSTOKEN do we have it? yes" );
       let response;
       var user =  new User(token);
       if( user ){        
         response =  await user.get()                       
            .catch((err) => console.error("ERR LAUNCH ACTION USER API",err))
            .then((data) => {
              console.log("USER DATA IN LaunchRequestHandler", data.id);              
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
        || request.intent.name === 'OneshotStartPilatesClassIntent');

  },
  async handle(handlerInput) {
    console.log("START YesIntent");
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();
    var token = handlerInput.requestEnvelope.context.System.user.accessToken;
    
    if(!token){    
      console.log("LOG IT THAT ACCESSTOKEN NOT AVAILBLE FROM YesIntent" );
    }

    if (sessionAttributes.classState && (sessionAttributes.classState === 'NOTSTARTED' ||
      sessionAttributes.classState === 'CONTINUE')) {
          console.log("sessionAttributes.classState in YesIntent", sessionAttributes.classState );   
          if ( sessionAttributes.userState ) {  
            console.log("sessionAttributes.userState in YesIntent", sessionAttributes.userState.id );  
          }else {
             console.log("sessionAttributes.userState in YesIntent - user info not available.");  
          }
          var workout =  new Workout(token);
          if( workout ){  
            let response;
            response =  await workout.get()
                .then((data) => {                  
                  if((data ) &&  (data.poses.length > 0)){ 
                    console.log("Call to Workout API successfull. retrieved", data.id);                   
                    return data;
                  }else{
                    console.log("Call to Workout API failed. returned mock data");      
                    return JSON.parse("{id: 127,title: 'Basic Beginner Pilates Class II',duration_id: 1,poses: [{id: 310,duration: 89,image_path: 'Pelvic_Tilt.gif',name: 'Pelvic Tilt',sound_track_path: 'Pelvic_Tilt.m4a',repetition: 'Repeat 5 times', }, {id: 511,duration: 150,image_path: 'Bridge.gif',name: 'Basic Bridge',sound_track_path: 'Bridge.m4a',repetition: 'Repeat 5-8 times',}, {id: 499,duration: 70,image_path: 'Toe_Taps.gif',name: 'Double Knee Fold/Toe taps',sound_track_path: 'Toe_Taps.m4a',repetition: 'Repeat 8 times',}, {id: 266,duration: 93,image_path: 'Hundred.gif',name: 'Hundred',sound_track_path: 'Hundred.m4a',repetition: 'Pulse your arms 100 times',}, {id: 273,duration: 103,image_path: 'Roll_Up.gif',name: 'Roll Up',sound_track_path: 'Roll_Up.m4a',repetition: 'Repeat 5 times',}, {id: 158,duration: 150,image_path: 'Roll_Over.gif',name: 'Roll Over',sound_track_path: 'Roll_Over.m4a',repetition: 'Repeat 5 times',}, {id: 287,duration: 158,image_path: 'Single_Leg_Circle.gif',name: 'Single Leg Circle',sound_track_path: 'Single_Leg_Circle.m4a',repetition: 'Repeat 5 times each direction both legs',}, {id: 160,duration: 93,image_path: 'Rolling_Like_A_Ball.gif',name: 'Rolling Like a Ball',sound_track_path: 'Rolling_Like_A_Ball.m4a',repetition: 'Repeat 6 times',}, {id: 381,duration: 78,image_path: 'Criss-Cross.gif',name: 'Criss Cross ',sound_track_path: 'Criss-Cross.m4a',repetition: 'Repeat 10 times',}, {id: 315,duration: 62,image_path: 'Single_Leg_Stretch.gif',name: 'Single Leg Stretch',sound_track_path: 'Single_Leg_Stretch.m4a',repetition: 'Repeat 5-10 times',}, {id: 327,duration: 69,image_path: 'Childs_Pose.gif',name: 'Rest Pose',sound_track_path: 'Childs_Pose.m4a',repetition: 'Inhale, Exhale 3-5 times',}],url: 'https://www.alotofpilates.com/workouts/127'}");
                  }
                })
                .catch((err) => {
                  console.error("ERR YES INTENT",err);
                  return Speech.startClassError(handlerInput);
                }); 

            console.log("responsedafdafafasfa", response);
           if (response) {
            const attributesManager = handlerInput.attributesManager;
            const sessionAttributes = attributesManager.getSessionAttributes() || {};
            sessionAttributes.classState = 'STARTED';
            sessionAttributes.workoutState = response;
          
            return Speech.teachClass(response, handlerInput);
           }else{
            return Speech.startClassError(handlerInput);
           }
          }else{
              return Speech.startClassError(handlerInput);
          }
    } else if (sessionAttributes.classState && sessionAttributes.classState === 'STARTED') {  
        console.log("sessionAttributes.classState in YesIntent", sessionAttributes.classState );    
                               
        if ( sessionAttributes.userState && sessionAttributes.workoutState ) { 
            console.log("sessionAttributes.userState in YesIntent", sessionAttributes.userState.id ); 
            console.log("sessionAttributes.workoutState in YesIntent", sessionAttributes.workoutState.id );        
            sessionAttributes.classState = 'ENDED';       
            try{
              let user =  sessionAttributes.userState;
              var workout_options = {
                  "userId": user.id,
                  "userEmail": user.email,
                  "token": user.token,
                  "workoutId": sessionAttributes.workoutState.id,
                  "deviceId": user.id
              };              
              //const token = handlerInput.requestEnvelope.context.System.user.accessToken;
              if ( token ){
                var workout =  new Workout(token);  
    
                if( workout ){  
                  let response;
                  response = await workout.postTracking(workout_options)
                    .then(()=> { return workout.getTrackings(token)})                    
                    .catch((err) => console.error("ERR workout posttracking api",err));
                  
                  //console.log("response", response);
                  if (response) {
                    return Speech.trackDisplay(formatUserTracking(response), handlerInput);
                  }else{
                     console.log("error with displaying activity, activity not displayed");
                    return Speech.finishedWorkout(handlerInput);
                  }
                }
              }else{
                 console.log("token  not available, workout not tracked");
                return Speech.finishedWorkout(handlerInput);
              }
            }catch(e){
                console.error("ERROR EXITING SKILL",e);
                return Speech.startOver(handlerInput);
            }
        } else {
          console.log("user or workout data not available, activity not tracked");
          return Speech.finishedWorkout(handlerInput);
        }
    } else{     
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
      const monthsArray = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

      //console.log("TRACKING USER GET DATA", data);
      //[ { id: 682, workout_id: 656, created_at: '2016-11-05 19:25:35 UTC' }, 
      //{ id: 681, workout_id: 656, created_at: '2016-11-05 19:18:13 UTC' }, 
      //{ id: 680, workout_id: 680, created_at: '2016-11-05 03:20:51 UTC' } ]

        var workoutCount = data.length;
        var trackingYearArray = [];
        
        //Tracking Object 
        var trackingYearObject = {};
        trackingYearObject.classCount = 0;
        trackingYearObject.badgeTitle = getBadge(workoutCount);
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
            //console.log("TRACKING WORKOUT YEAR", workoutYear);

            var workoutMonth = monthsArray[workoutDate.getMonth()];
            //console.log("TRACKING WORKOUT MONTH", workoutMonth);

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
     }else if (sessionAttributes.classState === "CONTINUE") { 
        return Speech.noHelp(handlerInput);
     }
  }
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log("Session Ended");
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

    if (sessionAttributes.classState == 'STARTED' ) {
      sessionAttributes.classState = "CONTINUE";
    }

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
    return Speech.cancelClass(handlerInput);
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

const LocalizationInterceptor = {
  process(handlerInput) {
      const localizationClient = i18n.use(sprintf).init({
          lng: handlerInput.requestEnvelope.request.locale,
          fallbackLng: 'en', // fallback to EN if locale doesn't exist
          resources: languageStrings
      });

      localizationClient.localize = function () {
          const args = arguments;
          let values = [];

          for (var i = 1; i < args.length; i++) {
              values.push(args[i]);
          }
          const value = i18n.t(args[0], {
              returnObjects: true,
              postProcess: 'sprintf',
              sprintf: values
          });

          if (Array.isArray(value)) {
              return value[Math.floor(Math.random() * value.length)];
          } else {
              return value;
          }
      }

      const attributes = handlerInput.attributesManager.getRequestAttributes();
      attributes.t = function (...args) { // pass on arguments to the localizationClient
          return localizationClient.localize(...args);
      };
  },
};

let skill;

exports.handler = async function (event, context) {
  console.log(`REQUEST++++${JSON.stringify(event)}`);
  if (!skill) {
    console.log("ID", config.app_id);
    skill = Alexa.SkillBuilders.custom()
      .withSkillId(config.app_id)
      .addRequestHandlers(
        LaunchRequestHandler,
        HelpIntentHandler,
        YesIntentHandler,
        NoIntentHandler,
        StartOverIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        UnhandledIntent
      )
      .addRequestInterceptors(LocalizationInterceptor)
      .addErrorHandlers(ErrorHandler)
      .create();
  }

  const response = await skill.invoke(event, context);
  console.log(`RESPONSE++++${JSON.stringify(response)}`);

  return response;
};

