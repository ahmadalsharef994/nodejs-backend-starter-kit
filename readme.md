
Reusable boilerplate code for backend. 

The app is Express API with MongoDB BoilerPlate, having socket.io, validation, sanitization, folder structure, dockerization, esling, prettier, logging, authentication, authorization, jwt, LF/CLRF, deviceauth, jwt tokens
Also upload files, Email and SMS OTPs, live chat using websocket, payment using RazorPay
husky for ensuring linting precommit



1. install yarn
2. yarn install
3. yarn run dev.
4. mongodb setup free-tier 512 mb, 10,000 -20,000 record, 10 users concurrenlty, 200-500 calls a day, 500-1000 active users, 1-2% use it at the same time in most apps
5. create cluster, AWS GCP AZURE, region Frankfurt. Later scal Vertically with M1 Horizontally with sharding
6. create user read and write, not Atlas Admin.


Dockerization:
1. Dockerfile how to build image:
to build image from Dockerfile docker build -t backend_app .
run the image: docker run -d -p 3000:3000 --name wellpath_container backend_app
2. yamls how to run containers
docker-compose app wellpath_dev backend_app_prod








DRAFT NOTES:

Logging: applogger uses winston, httplogger uses morgan
use in-memory db for testing: mongodb-memory-server


    2. delete package-lock.json yarn.lock
    3. check unused packages and delete manually or yarn prune or npx depcheck
    4. delete unused packages

    .gitattributes # Convert all text file line endings to LF: on clone, checkout, commit
    passport and jwt, passport uses jwtstrategy
    6. yarn upgrade --latest
