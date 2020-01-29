# vuejs-boilerplate

This is a boilerplate for Express.js API and Vue.js frontend

## Used technologies

### Backend
- Node.js 12.14
- Express.js
- SQL Server 2017

### Frontend
- Vue.js
- Vue-router
- Vee-Validate
- Bulma

## Prerequisites 

- Node 12.14
- SQL Server installed 

## Installation

- clone the repo
- run 'npm install' in the client and server folder
- create a DB in your SQL Server and a login for with db_datareader and db_datawriter
- run the provided sql script (server/sql) to create the SystemUsers table
- configure jwtSecret, mail info and db info in server/config.js
- configure webpack4.prod.config.js and client/src/main.js - add info to build the app for production

## run it

- execute 'node index.js' in the server folder
- execute 'npm run dev' in the client folder
- open Chrome and go to http://localhost:8080

