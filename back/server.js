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
  password: '1234',
  database: 'sys'
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

// app.post("/api/register", async (req, res) => {


//   try {
//     const results = req.body;

//     const sql = "insert into user(username, email, phone) values (?,?,?)"
//     const sql2 = "insert into car(license, user) values (?,?)"

//     db.query(sql, [results.username, results.email, results.phone], (err, result1) => {
//       if (err) {
//         return res.status(500).json({ error: err })
//       }

//       const userId = result1.insertId;

//       db.query(sql2, [results.license, userId], (err, result2) => {
//         if (err) {
//           return res.status(500).json({ error: err })
//         }

//         res.json({
//           status: "ok",
//           userId: userId,
//           license: results.license
//         });
//       })
//     });

//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: "Server error" });
//   }
// });
app.post("/api/dataPy", async (req, res) => {
  const pys = req.body;
  console.log("Received plate:", req.body);

  try {
    if (pys && pys.trim().length > 0) {
      const results = await getCarByLicense(pys.trim());

      if (results.length > 0) {
        console.log("License found in DB:", results[0].license);
        global.latestCarData = { license: results[0].license, found: true };
        return res.json({ status: "ok", value: results });
      }
    }

    console.log("License not found or empty input");
    global.latestCarData = { found: false }; // ✨ ส่งชัดเจนเมื่อไม่เจอทะเบียน
    return res.json({ status: "ok", value: null });

  } catch (err) {
    console.error("DB error:", err);
    global.latestCarData = { found: false };
    return res.status(500).json({ status: "error", message: "Database error" });
  }
});

app.get("/arduino/data", (req, res) => {
  if (global.latestCarData) {
    res.json(global.latestCarData);
  } else {
    res.json({ found: false });
  }
});

app.get("/api/amount_car", (req, res) => {
  res.json({ amount_car });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

