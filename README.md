# Node.js Alexa Skills For A Lot Of Pilates

<<<<<<< HEAD
##ALOP Alexa Skills Documentation
Start a pilates class from Amazon Echo. This code communicates with A Lot Of Pilates(ALOP) API to start a pilates class from Alexa. Two slots are available. This Alexa Skill guides you through a series of Pilates mat exercises. This code uses ALotOfPilates.com API for generating the Pilates mat classes. Pilates classes were designed by certified Pilates instructors.

Invoke Alexa skill by saying 'Alext, start pilates class'.

##How to install skill on Echo device
https://www.alotofpilates.com/amazonechopilates


<!---
## Build and Deploy to AWS 

* Development environment
   gulp build --env dev //copy environment configuration
   gulp deploy --end dev //zip lamda/custom folder and deploys to aws


* Production environment
   gulp build --env prod //copy environment configuration
   gulp deploy --end prod //zip lamda/custom folder and deploys to aws


## Test it locally

* Setup proxy server.
   Install Bespoken Proxy
      npm install -g bespoken-tools ( already installed)

   Start the proxy server on terminal
   ALOPPilatesClass git:(master) ✗ bst proxy lambda lambda/index.js

   Copy the public URL 

======================IGNORE===================================
NGROK causing SKILL_ENDPOINT_ERROR while testing.
run 
   > amazon-echo-skill-a-lot-of-pilates git:(master) ./test/ngrok http 3001

copy the Forwarding url from there
===============================================================
   Add URL in the console in Alexa Console ( https://developer.amazon.com/alexa/console/ask/build/custom/amzn1.echo-sdk-ams.app.ef7b5d42-f176-4806-9ea3-6ef6d041c2aa/development/en_US/endpoint)
      In Endpoint section, select as the default region
      Pick HTTPS 
      Paste URL 
      Make sure to select "My development endpoint is a sub-domain ..." 
      Save endpoint.

* Setup local debugging environment
   In VSCode menu - Run Start Debugging
   Ensure launch.json is available ( /.vscode)
   In VSCode debugger, should see 'Starting server on port: 3001.'
   

* Test it

   At this point you have two options to test it:

   1- Via Alexa Console web ( https://developer.amazon.com/alexa/console/ask )
      - go to dev skill -> Test ( ensure skill testing is enabled in Development )
      - invoke the command to get started - 'start pilates class'

   2- Via Terminal, with invocation command ( need ask cli )
   > ALOPPilatesClass git:(master) ask dialog -l en-US

   User  > ask ALOPPilatesClass start pilates class

   to exit type 
   User  > .quit

Reference:  https://github.com/alexa/alexa-cookbook/blob/master/tools/LocalDebugger/nodejs/README.md

-->
