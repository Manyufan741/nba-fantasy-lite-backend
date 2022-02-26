const axios = require("axios");
const db = require("../db");
const BASE_API_URL = 'http://data.nba.net/data/10s/prod/v1/2021/players.json';

class ImageAPI {
    // Basic request configuration for easier API request management
    static async request(endpoint, paramsOrData = {}, verb = "get") {
        
        console.debug("API Call:", endpoint, paramsOrData, verb);
        try {
            return (await axios({
                method: verb,
                url: `${BASE_API_URL}/${endpoint}`,
                [verb === "get" ? "params" : "data"]: paramsOrData
            })).data;
            // axios sends query string data via the "params" key,
            // and request body data via the "data" key,
            // so the key we need depends on the HTTP verb
        } catch (err) {
            // console.error("API Error:", err.response);
            // let message = err.response.data.message;
            // throw Array.isArray(message) ? message : [message];
            throw new Error("API error! Too many requests.");
        }    
    }

    static async getImages() {
        try {
            const res = await this.request(`/`, {});
            console.log("res in getImages", res);
            for (let player of res.league.standard) {
                let wholeName = player.firstName + ' ' + player.lastName;
                let personId = Number(player.personId);
                await this.searchAndUpdate(
                    wholeName,
                    `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${personId}.png`
                );
            }
        } catch (err) {
            throw new Error("Error when getting Images.");
        }
    }

    static async searchAndUpdate(name, image) {
        const res = await db.query(`SELECT * FROM players WHERE name=$1`, [name]);
        if (res.rows[0]) {
            await db.query(`UPDATE players SET image=$1 WHERE name=$2`, [image, name]);
            console.log(`${name} image updated!`);
        }
    }
}

module.exports = ImageAPI;