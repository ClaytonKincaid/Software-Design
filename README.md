# Software-Design-Temp

# Updates:
-April 11 2024
Integrated MySQL for backend.

Steps to setup:
1. Install MySQL  
2. Install mysql2 node package by using: npm install mysql2
3. Run the queries in database.sql to create the database and setup the tables  
4. Create .env text file in root directory if you don't already have one  
   Your .env file should have the following:  
   SESSION_SECRET=<your_secret>  
   MYSQL_HOST=<your_host>            ('localhost' should work fine)  
   MYSQL_USER=<your_username>        ('root' should work fine)  
   MYSQL_PASSWORD=<your_password>  
   MYSQL_DATABASE='main'  

-March 29 2024
Add unit tests for all endpoints

-March 28 2024
Fix logout button to make its style and functionality consistent across pages

Add error message when user tries to create an account with a username that already exists

-March 22 2024
Updated required to make profile before accessing other pages

Split profile into profile.js for updating profiles and complete-profile.js for initial profile completion

Profile page update to reflect current saved profile

Moved css to public folder



-March 16 2024
Uploaded backend code

Locked views require registering user

Locked views: home page ('/'), profile ('/profile'), quote ('/quote'), history ('/history')

Unlocked views: login ('/login'), register ('/register')

Login and registering works, blocks home view if not registered

Fixed fuelQuoteRoutes routing style error

Added comments to unused files


# Explained:

***Any file with _1 is usually a copy made to use if modifications dont work out.

To run add .env file in root folder with SESSION_SECRET=someKey

-Libraries-used.txt

Contains what type of libraries were downloaded to start the backend project.


-authMiddleware.js

Functions to check if user is authenticated or not.


-PricingModule.js

Contains method for calculating the price of fuel (required to create in assignment 3 but implement in assignment 4)


-userData.js

Contains the in-memory database since we are not implementing it yet (implementing database in assignment 4) and contains support functions to use for authenticating users.


-passport-config.js

This file defines the configuration for Passport library which is a middleware for node.js that we are using to simplify the process of authentication.


-html_copies (folder)

This stores the initially created html templates, useful to see original for making changes. We are using .ejs templates since we are using ejs view engine.

