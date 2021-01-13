// import axios from "axios";
// import { client as query } from "../db";

const axios = require("axios");
const db = require("../db");
const BASE_API_URL = 'https://www.balldontlie.io/api/v1/';

class GameAPI {
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
        }

        catch (err) {
            console.error("API Error:", err.response);
            let message = err.response.data.message;
            throw Array.isArray(message) ? message : [message];
        }
    }

    static async getAllGames(query) {
        try {
            const res = await this.request(`games`, query);
            return res;    
        } catch (err) {
            console.log("API Error:", err.response);
            throw err.response;
        }    
    }

    //query is like {dates[]: date}
    static async writeGamesToDB(query) {
        await this.clearGamesDB();
        const games = await this.getAllGames(query);
        let gamesData = [];
        for (let game of games.data) {
            let gameInfo = {};
            try {
                let homeLogoRes = await db.query(`SELECT logo FROM teams WHERE full_name=$1`, [game.home_team.full_name]);
                let homeTeamLogo = homeLogoRes.rows[0].logo;
                let visitorLogoRes = await db.query(`SELECT logo FROM teams WHERE full_name=$1`, [game.visitor_team.full_name]);
                let visitorTeamLogo = visitorLogoRes.rows[0].logo;
                await db.query(`INSERT INTO games (id, date, home_team, visitor_team,
                         season, hometeam_score, visitorteam_score, hometeam_logo, visitorteam_logo) VALUES
                         ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [
                        game.id,
                        game.date,
                        game.home_team.full_name,
                        game.visitor_team.full_name,
                        game.season,
                        game.home_team_score,
                        game.visitor_team_score,
                        homeTeamLogo,
                        visitorTeamLogo
                    ]);
                gameInfo["date"] = game.date;
                gameInfo["home_team"] = game.home_team;
                gameInfo["visitor_team"] = game.visitor_team;
                gameInfo["hometeam_logo"] = homeTeamLogo;
                gameInfo["visitorteam_logo"] = visitorTeamLogo;
                gameInfo["home_team_score"] = game.home_team_score;
                gameInfo["visitor_team_score"] = game.visitor_team_score;
                gameInfo["season"] = game.season;
                gamesData.push(gameInfo);
            } catch (err) {
                console.log("Error when writing into the games table.")
                throw new Error(err);
            }
        }
        // return games.data;
        return gamesData;
    }

    static async getGamesFromDB(date) {
        try {
            const res = await db.query(`SELECT * FROM games WHERE date=$1`, [date]);
            return res.rows;
        } catch (err) {
            throw new Error("Error when getting games from DB.");
        }
    }

    static async clearGamesDB() {
        try {
            await db.query(`DELETE FROM games`);    
        } catch {
            throw new Error("Error when deleting contents in games table.");
        }
    }
}

module.exports = GameAPI;

// Game.clearGamesDB();
// Game.writeGamesToDB({ "seasons[]": 2019, "dates[]": '2019-12-25' });
