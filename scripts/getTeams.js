const axios = require("axios");
const db = require("../db");
const GameAPI = require("./getGames");
const BASE_API_URL = 'https://www.balldontlie.io/api/v1/';
const TEAM_LOGO_URL = 'https://www.nba.com/.element/img/1.0/teamsites/logos/teamlogos_500x500';

class TeamAPI {
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

    /** Get all the teams. Essential to do this before setting up the database as
     *  games and players table depend on teams table
     */
    static async getAllTeams(query) {
        try {
            const res = await this.request(`teams`, query);
            return res;    
        } catch (err) {
            console.log("API Error:", err.response);
            throw err.response;
        }        
    }

    //Write the teams from API responses to database. This have to be done prior to anything.
    //For example: Team.writeTeamsToDB({ "per_page": 100 });
    static async writeTeamsToDB() {
        const checkTeams = await db.query(`SELECT full_name, abbreviation FROM teams`);
        if (checkTeams.rows.length !== 0) {
            return checkTeams.rows;
        }
        const teams = await this.getAllTeams({ "per_page": 100 });
        for (let team of teams.data) {
            // console.log(">>T", team);
            try {
                await db.query(`INSERT INTO teams (full_name, abbreviation, logo) VALUES
                         ($1, $2, $3)`,
                    [
                        team.full_name,
                        team.abbreviation,
                        `${TEAM_LOGO_URL}/${team.abbreviation.toLowerCase()}.png`
                    ]);
            } catch (err) {
                throw new Error("Error when writing teams to DB.");
            }
        }
        return teams.data;
    }

    //Reset all teams' status
    static async resetTeamStatus() {
        try {
            await db.query(`UPDATE teams SET playupcoming=false, playing=false`);
        } catch (err) {
            throw new Error("Error when resetting team status.");
        }
    }

    //Get the teams that play on the specific date. query: { "dates[]": date }
    static async getTeamsOnDate(query) {
        // await GameAPI.clearGamesDB();
        // await GameAPI.writeGamesToDB(query);
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
    static async updateTeamStatus(query) {
        await this.resetTeamStatus();
        let resTeams = [];
        const playTeams = await this.getTeamsOnDate(query);
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
}

module.exports = TeamAPI;

// TeamAPI.updateTeamStatus({ "dates[]": '2019-12-25' });
