var Speech = require('./speech'),
    Workout = require('./workout');

var Handler = function (){
    this.hasUser = false;
    this.months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

};


Handler.prototype.initialize = function (user, session, data){
    session.attributes.stage = 0;
    console.log("USER DATA ", data);
    //var initData = {};
    if ((typeof data != "undefined") || (Object.keys(data).length !== 0) ){
        try{
            this.hasUser = true;
            // session.attributes.userId = data.id;
            // session.attributes.userName = data.name;
            // session.attributes.signInCount = data.sign_in_count;
            // session.attributes.userEmail = data.email;
            // session.attributes.workoutTakenCount = data.workouts_taken.length;
            // initData.userId = data.id;
            // initData.userName = data.name;
            // initData.signInCount = data.sign_in_count;
            // initData.userEmail = data.email;
            // initData.workoutTakenCount = data.workouts_taken.length;
            user.id = data.id;
            user.name = data.name;
            user.email = data.email;
            user.signInCount = data.sign_in_count;
            user.workoutTakenCount = data.workouts_taken.length;
            //session.attributes.workoutTaken= data.workouts_taken;
            //session.attributes.workoutTracking = this.formatUserTracking(data);
            //this.writeToConsole("Session attributes Initialized User Id:", session);
        }catch(e){
            this.hasUser = false;
            console.log("ERROR INITIALIZING SESSION DATA");
        }
    }
     console.log("USER OBJECT  ", user);
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
        if( this.hasUser){
            user.get()                  
                .then((data) => this.initialize(user, session, data))
                .catch((err) => Speech.userAccountError(response))
                .then((data) => workout.getSequence(response, session));
        }else{
            console.error("ONE SHOT ACTION workout.getSequence");
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
         console.error("YES ACTION EXIT");
		this.exit(user, workout, intent, session, response);
	}else{
        console.error("YES ACTION workout.getSequence");
        workout.getSequence(response, session);
	}
};

/**
 * This handles writes to Amazon Dynamo Completion table.
 * It is triggered from the Yes answer to the 'Did you like this class?' question at the end of a class.
 */
Handler.prototype.exit = function (user, workout, intent, session, response){
    if(session.attributes.stage === 1) {
        console.log("USER IS SET", user);
        if (user.hasUser) {
            try{
            var workout_options = {
                "userId": user.id,
                "userEmail": user.email,
                "token": user.token,
                "workoutId":workout.id,
                "deviceId": user.deviceId
            };
            console.error("EXIT HAS USER OPTIONS", workouts_options);
            workout.postTracking(workout_options)
                .then(()=> workout.getTrackings(session.user.accessToken))
                .then((data) => Speech.trackDisplay1(this.formatUserTracking1(data), response, intent))
                .catch((err) => console.error("ERR",err));
            }catch(e){
                console.error("ERROR EXITING SKILL",e);
            }
        }else{
            console.error("USER NOT AVAILALABLE TO LOG TRACKING");
            Speech.trackDisplay1({}, response, intent);
        }
    }else{
        console.log("nothing to do");
        Speech.genericAnswer(response);
    }

    
};

Handler.prototype.formatUserTracking1 = function (data){
 //{ id: 662, workout_id: 530, created_at: '2016-10-30 22:57:30 UTC' }
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
            var workoutMonth = this.months[workoutDate.getMonth()];

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
        console.log("TRACKING Month ARRAY ");

        trackingYearArray.push(trackingYearObject);
        console.log("TRACKING YEAR ARRAY ");

        return trackingYearArray;
};


Handler.prototype.formatUserTracking = function (data){
 //{ id: 662, workout_id: 530, created_at: '2016-10-30 22:57:30 UTC' }
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
