/** Shared config for application; can be req'd many places. */

require("dotenv").config();

const SECRET = process.env.SECRET_KEY || 'test';

const PORT = +process.env.PORT || 3001;

//This is a hack to solve " UnhandledPromiseRejectionWarning: Error: self signed certificate" issue
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

// database is:
//
// - on Heroku, get from env var DATABASE_URL
// - in testing, 'nba-stats-test'
// - else: 'nba-stats'

let DB_URI;

if (process.env.NODE_ENV === "test") {
  DB_URI = "nba-stats-test";
} else {
  DB_URI  = process.env.DATABASE_URL || 'nba-stats';
}

console.log("Using database", DB_URI);

module.exports = {
  SECRET,
  PORT,
  DB_URI,
};

// export { SECRET, PORT, DB_URL };