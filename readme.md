1. install yarn
2. delete package-lock.jsom yarn.lock

3. check unused packages and delete manually or yarn prune or npx depcheck

4. delete unused packages
5. yarn install

6. yarn upgrade --latest

7. yarn run dev.


8. mongodb setup
9. free-tier 512 mb, 10,000 -20,000 record, 10 users concurrenlty, 200-500 calls a day, 500-1000 active users, 1-2% use it at the same time in most apps
10. create cluster, AWS GCP AZURE, region Frankfurt. Later scal Vertically with M1 Horizontally with sharding
11. create user read and write, not Atlas Admin.


The app is Express API with MongoDB BoilerPlate, having socket.io, validation, sanitization, folder structure, dockerization, esling, prettier, logging, authentication, authorization, jwt, LF/CLRF, deviceauth, jwt tokens

husky for ensuring linting precommit

.gitattributes # Convert all text file line endings to LF: on clone, checkout, commit


,loggers: applogger uses winston, httplogger uses morgan
passport and jwt, passport uses jwtstrategy


otp and doctor verification by admin is skipped for now.




use in-memory db for testing: mongodb-memory-server



docker:
Dockerfile how to build image
yamls how to run containers


to build image from Dockerfile docker build -t wellpath .

run the image: docker run -d -p 3000:3000 --name wellpath_container wellpath
