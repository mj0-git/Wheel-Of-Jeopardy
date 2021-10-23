# Wheel-Of-Jeopardy

# Install Instructions: 
1. Install nodejs from the website: https://nodejs.org/en/ 
2. Open up terminal/cmd and run the below commands to install express, socket.io and nodemon: 
 - npm install -g nodemon
 - npm install --save express socket.io

# Run Instructions:   
1. Open Terminal and navigate to directory Wheel-Of-Jeopardy/
2. Run Command:  
 - nodemon server/server.js

# Minimal Increment Features List

1. Database for questions ->Caitlyn 
 - Press button on client, display question (or text message) on page 

2. Chat messages between players -> Idress 

3. Server outputs message indicating when a user connects ->Andrea 
  - Show that a session was created 
  - Name of the users are displayed on everyone’s screens 
 
4. Show demo of an object moving on screen -> Meraj 
 - All players should be able to see the same object moving  
 - Referenced: https://devdojo.com/dennis/use-socketio-to-build-a-game#adding-our-variables

5. Message on screen for everyone if user leaves (their session ends) -> Cedric 
 - Game should end if player can’t reconnect 

