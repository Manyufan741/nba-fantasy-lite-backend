const TeamAPI = require("./getTeams");
const PlayerAPI = require("./getPlayers");
const ImageAPI = require("./getImages");

async function setup() {
    try {
        await TeamAPI.writeTeamsToDB({ "per_page": 100 });
        await PlayerAPI.getPlayers();
        await ImageAPI.getImages();    
    } catch (err) {
        console.log("Error when setting up!");
        throw new Error(err);
    }
    
}

setup();

