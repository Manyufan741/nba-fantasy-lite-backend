-- DROP DATABASE IF EXISTS "nba-stats";

-- CREATE DATABASE "nba-stats";

-- \c "nba-stats"


CREATE TABLE teams ( full_name TEXT PRIMARY KEY,
                     abbreviation TEXT,
                     logo TEXT,
                     playing BOOLEAN DEFAULT false,
                     playupcoming BOOLEAN DEFAULT false);

CREATE TABLE players ( name TEXT PRIMARY KEY,
                       player_id INT,
                       points FLOAT,
                       rebounds FLOAT,
                       assists FLOAT,
                       steals FLOAT,
                       blocks FLOAT,
                       turnovers FLOAT,
                       image TEXT,
                       team TEXT REFERENCES teams,
                       value INT);

CREATE TABLE games ( id INT PRIMARY KEY,
                     date DATE,
                     home_team TEXT REFERENCES teams,
                     hometeam_logo TEXT,
                     visitor_team TEXT REFERENCES teams,
                     visitorteam_logo TEXT,
                     season INT,
                     hometeam_score INT,
                     visitorteam_score INT);

CREATE TABLE lineups (id SERIAL PRIMARY KEY,
                      date DATE,
                      player1 TEXT REFERENCES players,
                      player2 TEXT REFERENCES players,
                      player3 TEXT REFERENCES players,
                      player4 TEXT REFERENCES players,
                      player5 TEXT REFERENCES players,
                      player6 TEXT REFERENCES players,
                      player7 TEXT REFERENCES players,
                      player8 TEXT REFERENCES players,
                      player9 TEXT REFERENCES players,
                      player10 TEXT REFERENCES players,
                      total_value INT,
                      score FLOAT);
