# Time Off App

This is a simple time off application , UI is simple but API support more functionality

# Api documentation

Documentation of the API can be found in the following link: https://documenter.getpostman.com/view/23100935/VUxNS8Nc

## Usage

Install required packages for UI by running in the terminal:
	
	npm install 

Install the dependencies of backend by:
    
    Opening the backend folder with VS code and typing "npm install"
    or try from the root folder with
    "cd backend && npm install"
	
To start the application , open 2 terminals and run the below separately

1) for Backend the port is dependent on PORT value in config.env
    
    npm run startbackend

2) For UI the port is 8089
	
    npm start

## What you need to provide
This app is build based on a online hosted DB so you will need to provide configurations to acomodate that
create a config.env file which has the below key value paris:

NODE_ENV=development

PORT=3030

DATABASE= "link to connect to the online DB"

DATABASE_PASSWORD= "password"

JWT_SECRET = ultra-secure-and-long-secret

JWT_EXPIRES_IN=90d

JWT_COOKIE_EXPIRES_IN=90


## Node Version
The Node version while developing this app was:

v10.24.1
