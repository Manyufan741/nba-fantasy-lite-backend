// import axios from "axios";
// import { client as query } from "../db";

const axios = require("axios");
const db = require("../db");
const BASE_API_URL = 'https://www.balldontlie.io/api/v1/';

class AllApi {
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

    static async clearGamesDB() {
        try {
            await db.query(`DELETE FROM games`);    
        } catch {
            throw new Error("Error when deleting contents in games table.");
        }
    }

    static async getGamesOnDate(date) {
        try {
            const res = await this.request(`games`, date);
            return res;    
        } catch (err) {
            console.log("API Error:", err.response);
            throw err.response;
        }    
    }

    static async writeGamesToDB(date) {
        await this.clearGamesDB();
        const games = await this.getGamesOnDate(date);
        let gamesData = [];
        for (let game of games.data) {
            let gameInfo = {};
            let homeLogoRes = await db.query(`SELECT logo FROM teams WHERE full_name=$1`, [game.home_team.full_name]);
            let homeTeamLogo = homeLogoRes.rows[0].logo;
            let visitorLogoRes = await db.query(`SELECT logo FROM teams WHERE full_name=$1`, [game.visitor_team.full_name]);
            let visitorTeamLogo = visitorLogoRes.rows[0].logo;
            try {    
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
                console.log("Error when writing into the games table (all).")
                throw new Error(err);
            }
        }
        return gamesData;
    }

    static async resetTeamStatus() {
        try {
            await db.query(`UPDATE teams SET playupcoming=false, playing=false`);
        } catch (err) {
            throw new Error("Error when resetting team status.");
        }
    }

    //Get the teams that play on the specific date
    static async getTeamsOnDate() {
        try {
            const teams = await db.query(`SELECT home_team, visitor_team FROM games`);
            // console.log(teams.rows);
            return teams.rows;
        } catch (err) {
            throw new Error("Error when getting teams that play on the date.")
        }
    }

    //Update team status to show if the teams are playing a game or have an upcoming game
    //For example: Team.updateTeamStatus({ "dates[]": '2019-12-25' });
    static async updateTeamStatus() {
        await this.resetTeamStatus();
        let resTeams = [];
        const playTeams = await this.getTeamsOnDate();
        for (let playTeam of playTeams) {
            try {
                const res = await db.query(`UPDATE teams SET playupcoming=true WHERE full_name=$1 OR full_name=$2
                RETURNING full_name`,
                    [playTeam.home_team, playTeam.visitor_team]);
                resTeams.push(playTeam.home_team);
                resTeams.push(playTeam.visitor_team);
            } catch(err) {
                throw new Error("Error when update Team status");
            }    
        }
        return resTeams;
    }

    //Get the players that are going to play in the upcoming day
    static async getPlayersOnDate() {
        let players = [];
        try {
            const teams = await db.query(`SELECT full_name FROM teams WHERE playupcoming=true`);
            if (teams.rows.length !== 0) {
                for (let team of teams.rows) {
                    let teamPlayers = await db.query(`SELECT * FROM players WHERE team=$1`, [team.full_name]);
                    for (let player of teamPlayers.rows) {
                        players.push(player);    
                    }                  
                }
            }
            // console.log(players);
            return players;
        } catch {
            throw new Error("Errors happen when getPlayerOnDate.");
        }
    }

    static async getEverything(date) {
        try {
            const games = await this.writeGamesToDB(date);
            const teams = await this.updateTeamStatus();
            const players = await this.getPlayersOnDate();
            return {
                games,
                teams,
                players
            }
        } catch (err) {
            throw new Error("Errors when getEverything.");
        }
    }
    
}

module.exports = AllApi;