const express = require('express');
const bodyParser = require('body-parser');
const HaxballJS = require('haxball.js');


const app = express();
const port = 5000; // Choose a port for your API server
const authToken = 's'; // Change this to a secure token

app.use(bodyParser.json());

let room;

HaxballJS.then((HBInit) => {
// Flag to track the game state
  let isGameRunning = false;
// Same as in Haxball Headless Host Documentation
  room = HBInit({
    roomName: "luthien.com.tr",
    maxPlayers: 2,
    public: false,
    noPlayer: false,
    playerName: "luthien.com.tr",
    token: "thr1.AAAAAGV0mfxK6C5BQMo0gA.G0xwgbrmH5U", // Required
  });

// Set default stadium and other room settings
room.setDefaultStadium("Big");
room.setScoreLimit(5);
room.setTimeLimit(0);

var loginTimeout;

room.onPlayerJoin = function(player) {

    if (room.getPlayerList().length === 1) {
        // If there's only one player, assign them to the red team
        room.setPlayerTeam(player.id, 1); // 1 represents the red team
    } else if (room.getPlayerList().length === 2) {
        // If there are two players, assign the second player to the blue team
        room.setPlayerTeam(player.id, 2); // 2 represents the blue team
    }
    // Send a private announcement to the newly joined player
    room.sendAnnouncement("10 saniye içinde !login yazarak giriş yapınız. Aksi takdirde atılcaksınız", player.id, 0x00FF00, "italic", 2);


    // Set a timeout to kick the player if they don't type !login in 10 seconds
    loginTimeout = setTimeout(function() {
        room.kickPlayer(player.id, "Failed to login within 10 seconds", false);
    }, 10000);
};




room.onPlayerChat = function(player, message) {
    // Check if the player typed !login
    if (message === "!login") {
        clearTimeout(loginTimeout); // Clear the timeout if the player logs in
        room.sendAnnouncement(player.name + " has logged in!", player.id, 0x00FF00, "italic", 2);
    }
};

// Start the script after the room link is obtained
room.onRoomLink = function(link) {
    console.log("Room link:", link);
    // You can perform additional actions here after obtaining the room link
};


// API endpoint to execute custom code
app.post('/api/executeCode', (req, res) => {
    const { code } = req.body;

    // Check if the request includes a code snippet
    if (code) {
        // Check if the request includes a valid Authorization header
        const requestAuthToken = req.headers.authorization;
        if (requestAuthToken !== `Bearer ${authToken}`) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
        }

        try {
            // Use eval to execute the code dynamically (use with caution)
            eval(code);
            res.json({ success: true, message: 'Code executed successfully' });
        } catch (error) {
            console.error('Error executing code:', error.message);
            res.status(500).json({ success: false, message: 'Error executing code' });
        }
    } else {
        res.status(400).json({ success: false, message: 'Code snippet missing in the request payload' });
    }
});


// ... Add more API endpoints for other actions ...

app.listen(port, () => {
    console.log(`API server is running on http://localhost:${port}`);
});

});
