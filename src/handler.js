var Speech = require('./speech')
    Workout = require('./workout');

var Handler = function (){};

Handler.prototype.initialize = function (session, data){
    session.attributes.stage = 0;
    if (typeof data != "undefined") {
        console.log("USER DATA ", data);
        session.attributes.userId = data.id;
        session.attributes.userName = data.name;
        session.attributes.signInCount = data.sign_in_count;
        session.attributes.userEmail = data.email;
        session.attributes.workoutTakenCount = data.workouts_taken.length;
        session.attributes.workoutTaken= data.workouts_taken;
        session.attributes.workoutTracking = this.formatUserTracking(data);
    }
    this.writeToConsole("Session attributes Initialized User Id:", session);
    return session;
};


Handler.prototype.startUp = function (response, session){
        var speechOutput,
            welcomeText = "",
            welcomebacktext = "",
            signInText ="",
            workoutTakenText = "";

        var name =  session.attributes.userName;
        var userId = session.attributes.userId;
        var signInCount = session.attributes.signInCount;
        var workoutTakenCount = session.attributes.workoutTakenCount;
        this.writeToConsole("Session attributes on Welcome User Id:", session);

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

        var options ={
            "welcomeText": welcomeText,
            "welcomebacktext":welcomebacktext,
            "signInText": signInText,
            "workoutTakenText": workoutTakenText
        };
        Speech.welcome(options, response);
};


Handler.prototype.launchAction = function (user, session, response) {
	if(!session.user.accessToken) {
        Speech.accountSetupError(response);
    } else {       
        user.get()            
            .then((data) => this.initialize(session, data)) 
            .then((session) => this.startUp(response, session))
            .catch((err) => Speech.userAccountError(response));
    }
};

/**
 * This handles the one-shot interaction, where the user utters a phrase like:
 * 'Alexa, start a Pilates class'.
 * If there is an error in a slot, this will guide the user to the dialog approach.
 */
Handler.prototype.oneShotAction = function (workout, session, response) {
    session.attributes.stage = 0;
    if(!session.user.accessToken) {
            Speech.accountSetupError(response);
    } else {
        if( typeof session.attributes.userId == "undefined"){                 
            user.get()                  
                .then((data) => this.initialize(session, data))
                .catch((err) => Speech.userAccountError(response))
                .then((session) => workout.getSequence(response, session));
        }else{
            workout.getSequence(response, session);
        }
    }
};


Handler.prototype.noAction = function (workout, intent, session, response) {
        var sessionAttributes = session.attributes;
        if (session.attributes.stage === 0) {
            Speech.stopUnStartedClass(response);
        }else{
            this.exit(intent, session, response,workout);
        }
};


Handler.prototype.yesAction = function (workout, intent, session, response) {
	if (session.attributes.stage == 1) {
		this.exit(intent, session, response, workout);
	}else{
		this.oneShotAction(workout, session, response);
	}
};

/**
 * This handles writes to Amazon Dynamo Completion table.
 * It is triggered from the Yes answer to the 'Did you like this class?' question at the end of a class.
 */
Handler.prototype.exit = function (intent, session, response, workout){
   
    if (typeof session.attributes.userId != "undefined") {
        this.writeToConsole("Session attributes on Exit User Id:", session);
        var workout_options = {
            "userId": session.attributes.userId,
            "userEmail": session.attributes.userEmail,
            "token": session.user.accessToken,
            "workoutId": session.attributes.workoutId,
            "deviceId": session.user.userId
        };
        var userTracking = session.attributes.workoutTracking;

        workout.postTracking(workout_options)
            .then((data) => Speech.trackDisplay(userTracking, response, data, intent))
            .catch((err) => console.error("ERR",err));
    }
};

Handler.prototype.formatUserTracking = function (data){

        var trackingYearArray = [];
        var trackingYearObject = {};
        trackingYearObject.classCount = 0;
        var workoutCount = data.workouts_taken.length;
        trackingYearObject.badgeTitle = this.getBadge(workoutCount);
        trackingYearObject.year = '';
        trackingYearObject.months = [];
        var prevYear = '';
        var prevMonth = '';

        var trackingMonthArray = [];
        var trackingMonthObject = {};
        trackingMonthObject.month = '';
        trackingMonthObject.classCount = 0;
        
        var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

        for (var i = 0; i < workoutCount; i++) {
            var item = data.workouts_taken[i];
            var workoutDate = new Date(item.created_at);

            var workoutYear = workoutDate.getFullYear();
            var workoutMonth = months[workoutDate.getMonth()];           
            trackingYearObject.year = workoutYear;

            if ((prevYear === '') || (prevYear == workoutYear)){
                 trackingYearObject.classCount += 1;
                 trackingMonthObject.year = workoutYear;
                 if ((prevMonth === '') || (prevMonth == workoutMonth)){
                    trackingMonthObject.classCount += 1;
                    trackingMonthObject.month = workoutMonth;
                 }else {
                    trackingMonthArray.push(trackingMonthObject);
                    //Reset
                    trackingMonthObject = {};
                    trackingMonthObject.classCount = 1;
                    trackingYearObject.months = trackingMonthArray;
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
        //console.log("TRACKING Month ARRAY ", trackingMonthArray);

        trackingYearArray.push(trackingYearObject);
        //console.log("TRACKING YEAR ARRAY ", trackingYearArray);

        return trackingYearArray;

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

    return "badge";
};


Handler.prototype.writeToConsole = function (message, session){
	console.log(message, session.attributes.userId +
        " User Name:" + session.attributes.userName +
        " User Email:" + session.attributes.userEmail +
        " User Signed In " + session.attributes.signInCount +
        " Workout Taken Count " + session.attributes.workoutTakenCount +
        " Workout Id: " + session.attributes.workoutId +
        " Workout User Tracking: " + session.attributes.workoutTracking);
};

module.exports = new Handler();
