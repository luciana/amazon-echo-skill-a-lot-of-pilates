var Speech = require('./speech'),
    Workout = require('./workout');

var Handler = function (){};

Handler.prototype.initialize = function (session, data){
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
            console.log("SESSION ATTRIBUTES NEED TO BE INITIALIZED  ");
            user.get()               
                .then((data) => this.initialize(session, data))
                .catch((err) => Speech.userAccountError(response))
                .then((session) => workout.getSequence(response, session));
        }else{
            console.log("SESSION ATTRIBUTES ALREADY SETUP ");
            workout.getSequence(response, session);
        }
    }
};


Handler.prototype.noAction = function (workout, session, response) {
        var sessionAttributes = session.attributes;
        if (session.attributes.stage === 0) {
            var speechOutput = "Ok. Hope you find a better time to start the class. Visit ALotOfPilates.com for pilates classes. Goodbye!";
            response.tellWithStop(speechOutput);
        }else{
            this.exit(intent, session, response,workout);
        }
};


Handler.prototype.yesAction = function (workout, intent, session, response) {
	//var workout = new Workout(session.user.accessToken);
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

         console.log("Session attributes on Exit User Id:", session.attributes.userId +
        " User Name:" + session.attributes.userName +
        " User Email:" + session.attributes.userEmail +
        " User Signed In " + session.attributes.signInCount +
        " Workout Taken Count " + session.attributes.workoutTakenCount +
        " Workout Id: " + session.attributes.workoutId);


        
        var workout_options = {
            "userId": session.attributes.userId,
            "userEmail": session.attributes.userEmail,
            "token": session.user.accessToken,
            "workoutId": session.attributes.workoutId,
            "deviceId": session.user.userId
        };
        workout.postTracking(workout_options)
            .then((data) => Speech.trackDisplay(response, data, intent))
            .catch((err) => console.error("ERR",err));
    }
};


module.exports = new Handler();
