# Node.js Alexa Skills For A Lot Of Pilates

##ALOP Alexa Skills Documentation
Start a pilates class from Amazon Echo. This code communicates with A Lot Of Pilates(ALOP) API to start a pilates class. Two slots are available. One slot is class duration and the other is class type. Options for class duration is 10, 30, 50 minutes. Options for class type is Stretching, Pilates or Power Pilates.

##How to install skill on Echo device
https://www.alotofpilates.com/amazonechopilates


How to run the build and deploy:

* Development environment
gulp build --env dev //copy environment configuration
gulp deploy --end dev //zip src folder and deploys to aws


* Production environment
gulp build --env prod //copy environment configuration
gulp deploy --end prod //zip src folder and deploys to aws
