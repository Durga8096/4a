const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDatabaseServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

initializeDatabaseServer();

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT 
    * 
    FROM 
    cricket_team 
    ORDER BY
    player_id;
    `;
  const playersArr = await db.all(getPlayersQuery);
  response.send(playersArr);
});

app.post("/players/", async (request, response) => {
  try {
    const playerDetails = request.body;
    const { playerName, jerseyNumber, role } = playerDetails;

    const addPlayerQuery = `
      INSERT INTO 
      cricket_team 
      (player_name, jersey_number, role)
      VALUES
       ("${playerName}", "${jerseyNumber}","${role}");
    `;

    const dbResponse = await db.run(addPlayerQuery);
    const playerId = dbResponse.lastID;
    response.send(`Player Added to Team`);
    console.log(dbResponse);
  } catch (error) {
    console.error(error);
    response.status(500).send("Error adding player to team");
  }
});

app.get("/players/:playerId/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const getPlayerQuery = `
    SELECT 
    * 
    FROM 
    cricket_team 
   WHERE 
   player_id= ${playerId}
   ;
    `;
    const player = await db.get(getPlayerQuery);
    response.send(player);
  } catch (e) {
    console.error(e);
  }
});

app.put("/players/:playerId/", async (request, response) => {
  try {
    const { playerId } = request.params;
    const playerDetails = request.body;
    const { playerName, jerseyNumber, role } = playerDetails;

    const updatePlayerQuery = `
      UPDATE cricket_team
      SET
        player_name = '${playerName}',
        jersey_number = '${jerseyNumber}',
        role = '${role}'
      WHERE
        player_id = ${playerId};
    `;

    await db.run(updatePlayerQuery);
    response.send("Player Details Updated");
  } catch (error) {
    console.error(error);
    response.status(500).send("Error updating player details");
  }
});
app.delete("/players/:playerId", async (request, response) => {
  try {
    const { playerId } = request.params;

    const deletePlayerQuery = `
      DELETE FROM cricket_team
      WHERE player_id = ${playerId};
    `;

    await db.run(deletePlayerQuery);
    response.send("Player Removed");
  } catch (error) {
    console.error(error);
    response.status(500).send("Error deleting player");
  }
});

module.exports = app;
