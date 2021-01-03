# Node.js Alexa Skills For A Lot Of Pilates

This Alexa Skill guides you through a series of Pilates mat exercises. This code uses ALotOfPilates.com API for generating the Pilates mat classes. Pilates classes were designed by certified Pilates instructors.

How to run the build and deploy:

* Development environment
gulp build --env dev //copy environment configuration
gulp deploy --end dev //zip lamda/custom folder and deploys to aws


* Production environment
gulp build --env prod //copy environment configuration
gulp deploy --end prod //zip lamda/custom folder and deploys to aws


* test it locally
run 
    ./test/ngrok http 3001

    https://github.com/alexa/alexa-cookbook/blob/master/tools/LocalDebugger/nodejs/README.md