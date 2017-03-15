var Speech = require('./speech'),
    Workout = require('./workout');

var Handler = function (){
    this.hasUser = false;
    this.userId ='';
    this.months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

};


Handler.prototype.initialize = function (user, session, data){
    session.attributes.stage = 0;
    //console.log("USER DATA ", data);
    //var initData = {};
    if ((typeof data != "undefined") || (Object.keys(data).length !== 0) ){
        try{
            this.hasUser = true;
            this.userId = data.id;
            user.id = data.id;
            user.name = data.name;
            user.email = data.email;
            user.signInCount = data.sign_in_count;
            user.workoutTakenCount = data.workouts_taken.length;
        }catch(e){
            this.hasUser = false;
            console.log("ERROR INITIALIZING SESSION DATA");
        }
    }
     //console.log("INITIALIZE USER OBJECT  ", user);
     console.log("HAS USER ", this.hasUser);
    return user;
};


Handler.prototype.startUp = function (response, user){
        var speechOutput,
            welcomeText = "",
            welcomebacktext = "",
            signInText ="",
            workoutTakenText = "";

        var options ={};
        console.log("HAS USER ", this.hasUser);
        if(this.hasUser === true){
            var name =  user.name;
            var userId = user.id;
            var signInCount = user.signInCount;
            var workoutTakenCount = user.workoutTakenCount;

            if (typeof signInCount != "undefined"){
                if(signInCount > 1){
                    welcomeText += " back ";
                    welcomebacktext = " for your next pilates class";
                }else{
                    welcomebacktext = " for your first class";
                }
                signInText =  " You have signed in " + signInCount +  " times to a lot of pilates.";
            }
            if (typeof workoutTakenCount != "undefined"){
                if(workoutTakenCount == 1){
                    workoutTakenText = " You have taken " + workoutTakenCount +  " pilates class before.";
                }else if(workoutTakenCount > 1){
                    workoutTakenText = " Good job, you have taken " + workoutTakenCount +  " pilates classes.";
                }
            }
            if (typeof name != "undefined"){
                if (!name){
                    welcomeText+="";
                }else{
                     welcomeText+=name;
                }
            }

            options ={
                "welcomeText": welcomeText,
                "welcomebacktext":welcomebacktext,
                "signInText": signInText,
                "workoutTakenText": workoutTakenText
            };
        }
        Speech.welcome(options, response);
        
};


Handler.prototype.launchAction = function (user, session, response) {
    session.attributes.stage = 0;
	if(!session.user.accessToken) {
        Speech.accountSetupError(response);
    } else {       
        user.get()                       
            .then((data) => this.initialize(user, session, data))
            .catch((err) => Speech.userAccountError(response))
            .then((user) => this.startUp(response, user))
            .catch((err) => console.error("ERR LAUNCH ACTION",err));
    }
};

/**
 * This handles the one-shot interaction, where the user utters a phrase like:
 * 'Alexa, start a Pilates class'.
 * If there is an error in a slot, this will guide the user to the dialog approach.
 */
Handler.prototype.oneShotAction = function (user, workout, session, response) {
    session.attributes.stage = 0;
    if(!session.user.accessToken) {
            Speech.accountSetupError(response);
    } else {
        if( this.hasUser == false){
            user.get()       
                .then((data) => this.initialize(user, session, data))
                .catch((err) => Speech.userAccountError(response))
                .then((data) => workout.getSequence(response, session));
        }else{            
            workout.getSequence(response, session);
        }
    }
};


Handler.prototype.noAction = function (user, workout, intent, session, response) {    
        if (session.attributes.stage === 0) {
            Speech.stopUnStartedClass(response);
        }else{
            this.exit(user, workout, intent, session, response);
        }
};


Handler.prototype.yesAction = function (user, workout, intent, session, response) {   
	if (session.attributes.stage == 1) {       
		this.exit(user, workout, intent, session, response);
	}else{       
        workout.getSequence(response, session);
	}
};

/**
 * This handles writes to Amazon Dynamo Completion table.
 * It is triggered from the Yes answer to the 'Did you like this class?' question at the end of a class.
 */
Handler.prototype.exit = function (user, workout, intent, session, response){
    if(session.attributes.stage === 1) {      
        if (this.hasUser) {
            try{
            var workout_options = {
                "userId": user.id,
                "userEmail": user.email,
                "token": user.token,
                "workoutId":workout.id,
                "deviceId": user.deviceId
            };
            //console.error("EXIT HAS USER OPTIONS", workout_options);
            workout.postTracking(workout_options)
                .then(()=> workout.getTrackings(session.user.accessToken))
                .then((data) => Speech.trackDisplay(this.formatUserTracking(data), response, intent))
                .catch((err) => console.error("ERR",err));
            }catch(e){
                console.error("ERROR EXITING SKILL",e);
            }
        }else{
            console.error("USER NOT AVAILALABLE TO LOG TRACKING");
            Speech.trackDisplay({}, response, intent);
        }
    }else{
        console.log("nothing to do");
        Speech.genericAnswer(response);
    }

    
};

Handler.prototype.formatUserTracking = function (data){

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


Handler.prototype.getBadge = function (count) {
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


// Handler.prototype.writeToConsole = function (message, session){
// 	console.log(message, session.attributes.userId +
//         " User Name:" + session.attributes.userName +
//         " User Email:" + session.attributes.userEmail +
//         " User Signed In " + session.attributes.signInCount +
//         " Workout Taken Count " + session.attributes.workoutTakenCount +
//         " Workout Id: " + session.attributes.workoutId +
//         " Workout User Tracking: " + session.attributes.workoutTracking);
// };

module.exports = new Handler();
