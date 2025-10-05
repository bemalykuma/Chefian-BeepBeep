const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const cron = require("node-cron");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.text({ type: "text/plain", defaultCharset: "utf-8" }));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Pitch239@",
  database: "sys",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Successfully connected to the MySQL database.");
});
// ------------------------------------

function getDatabase() {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT c.*, u.username FROM sys.car c INNER JOIN user u ON c.user = u.id_user";
    db.query(sql, (err, results) => {
      if (err) {
        reject(err);
      } else if (results.length > 0) {
        resolve(results);
      } else {
        resolve([]);
      }
    });
  });
}

function getCarByLicense(license) {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT c.*, u.username, u.phone FROM sys.car c INNER JOIN user u ON c.user = u.id_user where c.license = ?";
    db.query(sql, [license], (err, results) => {
      if (err) reject(err);
      else resolve(results || []);
    });
  });
}

app.get("/api/dataDb", async (req, res) => {
  try {
    const results = await getDatabase();
    if (results.length > 0) {
      res.json({ status: "ok", value: results });
    } else {
      res.json({ status: "ok", value: [] });
    }
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ status: "error", message: "Database error" });
  }
});

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.post("/api/register", async (req, res) => {
  try {
    const results = req.body;

    const sql = "insert into user(username, email, phone) values (?,?,?)";
    const sql2 = "insert into car(license, user) values (?,?)";

    db.query(
      sql,
      [results.username, results.email, results.phone],
      (err, result1) => {
        if (err) {
          return res.status(500).json({ error: err });
        }

        const userId = result1.insertId;

        db.query(sql2, [results.license, userId], (err, result2) => {
          if (err) {
            return res.status(500).json({ error: err });
          }

          res.json({
            status: "ok",
            userId: userId,
            license: results.license,
          });
        });
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

const amount_car = [];
const sightParking = [];


app.post("/api/dataPy", async (req, res) => {
  const pys = req.body;
  console.log("Received string:", req.body);



  try {
    const results = await getCarByLicense(pys);
    if (results.length > 0) {

      const now = new Date();
      const resultsWithTime = results.map(car => ({
        ...car,
        datetimeLocal: now.toLocaleString(),
      }));

      const exists = sightParking.some(
        slot => slot.some(car => car.id_car === results[0].id_car)
      );

      if (!exists) {
        sightParking.push(resultsWithTime);
      }
      if (!amount_car.includes(pys)) {
        amount_car.push(pys);
      }
      console.log(results);
      console.log(sightParking);
      global.latestCarData = results;
      return res.json({ status: "ok", value: results });
    } else {
      global.latestCarData = [];
      return res.json({ status: "ok", value: [] });
    }
  } catch (err) {
    console.error("DB error:", err);
    return res.status(500).json({ status: "error", message: "Database error" });
  }
});

app.get("/arduino/data", (req, res) => {
  if (global.latestCarData) {
    res.json(global.latestCarData);
  } else {
    res.json([]);
  }
});

app.get("/api/amount_car", (req, res) => {
  res.json({ amount_car });
});

app.get("/api/sightParking", (req, res) => {
  res.json({ sightParking });
});

const slot = [
  {
    slot1: 1,
    slot2: 0,
    slot3: 1,
    slot4: 1,
    slot5: 1,
    slot6: 0,
  }
];

app.post("/api/carSlot", (req, res) => {
  const results = req.body;
  console.log(results)
})

app.get("/api/carSlot", (req, res) => {
  res.json({ slot });
});

app.get("/api/reserve", async (req, res) => {

  const sql = `
    SELECT u.username, c.license, c.id_car FROM car c join user u on c.user = u.id_user WHERE id_car NOT IN (SELECT id_car FROM reservation)`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error" });
    }

    res.json({ results: result });
  });
});

app.post("/api/reserve", (req, res) => {
  const results = req.body;
  console.log(results);

  slot[0][results.slot] = 1;
  console.log(slot);

  const sql2 = "SELECT * FROM reservation WHERE id_car = ?";

  db.query(sql2, [results.id_car], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "DB error" });
    }

    if (result.length === 0) {
      const sql = "INSERT INTO reservation(id_car, slot) VALUES (?, ?)";
      db.query(sql, [results.id_car, results.slot], (err, result2) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "DB error" });
        }
        res.json({ insertId: result2.insertId });
      });
    } else {
      console.log("Already Reserved");
      res.json({ error: "Already Reserved" });
    }
  });
});

cron.schedule("*/40 * * * * *", () => {

  const sql = `SELECT * FROM reservation r left outer join car c on r.id_car = c.id_car WHERE date_reservation < (NOW() - INTERVAL 10 SECOND)`;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Cron DB error:", err);
      return;
    }
    console.log("Reservation to delete:", results);

    const detectedPlates = sightParking.flat().map(car => car.license);

    results.forEach((row) => {
      console.log("Hello", sightParking);
      if (!detectedPlates.includes(row.license)) {

        slot[0][row.slot] = 0;


        const del = "DELETE FROM reservation WHERE id_car = ?";
        db.query(del, [row.id_car], (err2, res2) => {
          if (err2) {
            return console.error(err2);
          }

          console.log(`Deleted id_car: ${row.id_car}, affected: ${res2.affectedRows}`);

        });
      }else{
        console.log("not delete");
      }
    });
  });
});



app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
