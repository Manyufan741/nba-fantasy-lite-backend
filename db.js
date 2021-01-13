/** Database setup for nba-fantasy-lite */
const { Client } = require("pg");
const { DB_URI } = require("./config");

const client = new Client({
  connectionString: DB_URI,
  ssl: true
});

client.connect();


module.exports = client;
// export default client;