const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();
const PORT = 5000;


app.use(cors());
app.use(express.json());
app.use(express.text({ type: 'text/plain', defaultCharset: 'utf-8' }));


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '...',
  database: '...'
});


db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Successfully connected to the MySQL database.');
});
// ------------------------------------


function getDatabase() {
  return new Promise((resolve, reject) => {
    const sql = "SELECT c.*, u.username FROM sys.car c INNER JOIN user u ON c.user = u.id_user";
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
    const sql = "SELECT c.*, u.username FROM sys.car c INNER JOIN user u ON c.user = u.id_user where c.license = ?";
    db.query(sql, [license], (err, results) => {
      if (err) reject(err);
      else resolve(results || []);
    });
  });
}

app.get('/api/dataDb', async (req, res) => {
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

const amount_car = [];

app.post("/api/dataPy", async (req, res) => {

  const pys = req.body;
  console.log("Received string:", req.body);


  try {
    const results = await getCarByLicense(pys);
    if (results.length > 0) {
      if (!(amount_car.includes(pys))) {
        amount_car.push(pys);
      }
      console.log(results);
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

