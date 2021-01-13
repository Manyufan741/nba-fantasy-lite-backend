-- DROP DATABASE IF EXISTS "nba-stats";

-- CREATE DATABASE "nba-stats";

-- \c "nba-stats"

-- CREATE TABLE posts (id SERIAL PRIMARY KEY, 
--                     title TEXT NOT NULL, 
--                     description TEXT NOT NULL,
--                     body TEXT, 
--                     votes INT NOT NULL DEFAULT 0);
                    
-- CREATE TABLE comments (id SERIAL PRIMARY KEY, 
--                        text TEXT NOT NULL, 
--                        post_id INT NOT NULL REFERENCES posts ON DELETE CASCADE);

-- INSERT INTO posts (title, description, body) VALUES
--     ('First Post', 'Best post ever!', 'Everyone loves posting first. I win!'),
--     ('Second Post', 'A very good post!', 'Oh well. Didn''t get to be first.');

-- INSERT INTO comments (text, post_id) VALUES
--     ('This is a really great post.', 1),
--     ('I learned so much reading this.', 1);

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
