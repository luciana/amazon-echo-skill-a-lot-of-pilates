# Node.js Alexa Skills For A Lot Of Pilates

This Alexa Skill guides you through a series of Pilates mat exercises. This code uses ALotOfPilates.com API for generating the Pilates mat classes. Pilates classes were designed by certified Pilates instructors.

Invoke Alexa skill by saying 'Alext, start pilates class'.

<!---
How to run the build and deploy:

* Development environment
gulp build --env dev //copy environment configuration
gulp deploy --end dev //zip lamda/custom folder and deploys to aws


* Production environment
gulp build --env prod //copy environment configuration
gulp deploy --end prod //zip lamda/custom folder and deploys to aws


* test it locally
run 
   > amazon-echo-skill-a-lot-of-pilates git:(master) ./test/ngrok http 3001

copy the Forwarding url from there

add it as the Endpoint as the default region for HTTPS in the console
https://developer.amazon.com/alexa/console/ask/build/custom/amzn1.echo-sdk-ams.app.ef7b5d42-f176-4806-9ea3-6ef6d041c2aa/development/en_IN/endpoint

Make sure to select "My development endpoint is a sub-domain ..." 

Save endpoint.

in VSCode debugger, launch. 

    > ALOPPilatesClass git:(master) ask dialog -l en-US

Open Terminal, enter invocation command

    ask ALOPPilatesClass start pilates class

    https://github.com/alexa/alexa-cookbook/blob/master/tools/LocalDebugger/nodejs/README.md

-->