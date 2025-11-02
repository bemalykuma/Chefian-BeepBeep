
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const cron = require("node-cron");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const PORT = 5000;

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Set();




app.use(cors());
app.use(express.json());
app.use(express.text({ type: "text/plain", defaultCharset: "utf-8" }));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'sys'
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


let arduinoData2 = 0; // ตัวแปรเก็บค่าที่จะให้ Arduino อ่าน

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

      arduinoData2 = 1;

      return res.json({ status: "ok", value: results });
    } else {
      global.latestCarData = [];

      arduinoData2 = 0;

      return res.json({ status: "ok", value: [] });
    }
  } catch (err) {
    console.error("DB error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
});

app.get("/arduino/data2", (req, res) => {
  res.json({ value: arduinoData2 });
  // console.log("Arduino requested data2:", arduinoData2);

  // รีเซ็ตกลับเป็น 0 เพื่อไม่ให้เปิดซ้ำ
  if (arduinoData2 === 1) {
    setTimeout(() => {
      arduinoData2 = 0;
      console.log("arduinoData2 reset to 0");
    }, 1000); // ดีเลย์ 1 วินาที (กัน Arduino อ่านซ้ำทันที)
  }
});


app.get("/arduino/data", (req, res) => {
  // console.log("global :");

  // console.log(global.latestCarData)
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
    slot1: 0,
    slot2: 0,
    slot3: 0,
    slot4: 0,
    slot5: 0,
    slot6: 0,
  }
];

app.post("/api/carSlot", (req, res) => {
  try {
    const body = req.body;
    console.log("📡 Data from client:", body);

    // 🧩 กรณีที่ body เป็น {"slot":[{"slot1":0,"slot2":1,...}]}
    if (body.slot && Array.isArray(body.slot)) {
      const slots = body.slot[0];

      // loop ทุกช่อง
      Object.entries(slots).forEach(([key, value]) => {
        const id = parseInt(key.replace("slot", ""));
        slot[0][key] = value;

        // ✅ ส่งข้อมูลออกไปทาง WebSocket
        broadcast({ id, state: value, distance: 0 });
      });

      return res.json({ status: "ok", message: "Broadcasted all slots" });
    }

    // 🧩 กรณีที่ body เป็น {"id":1,"state":0,"distance":10}
    if (body.id !== undefined && body.state !== undefined) {
      const { id, state, distance } = body;
      slot[0][`slot${id}`] = state;

      // ✅ broadcast เฉพาะช่องนั้น
      broadcast({ id, state, distance });
      return res.json({ status: "ok", message: "Broadcasted single slot" });
    }

    res.status(400).json({ status: "error", message: "Invalid format" });
  } catch (err) {
    console.error("Error handling /api/carSlot:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});




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
  console.log("📩 Reservation request:", results);

  // ✅ ตรวจว่ามีค่า slot ส่งมาหรือไม่
  if (!results.slot) {
    return res.status(400).json({ error: "Missing slot" });
  }

  // ✅ อัปเดตค่า slot ในตัวแปร memory (เช่น slot2 = 1)
  slot[0][results.slot] = 1;
  console.log("🧭 Updated slot array:", slot);

  // ✅ แปลงชื่อช่อง เช่น "slot2" → 2
  const id = parseInt(results.slot.replace("slot", ""), 10);

  const sqlCheck = "SELECT * FROM reservation WHERE id_car = ?";
  db.query(sqlCheck, [results.id_car], (err, existing) => {
    if (err) {
      console.error("❌ DB select error:", err);
      return res.status(500).json({ error: "DB error" });
    }

    // ถ้ายังไม่มีการจอง
    if (existing.length === 0) {
      const sqlInsert = "INSERT INTO reservation(id_car, slot) VALUES (?, ?)";
      db.query(sqlInsert, [results.id_car, results.slot], (err2, result2) => {
        if (err2) {
          console.error("❌ DB insert error:", err2);
          return res.status(500).json({ error: "DB error" });
        }

        // ✅ BROADCAST ไปทุก client ที่เชื่อม WebSocket
        console.log(`📡 Broadcasting slot ${id} -> state=1`);
        broadcast({ id, state: 1, distance: 0 });

        return res.json({ status: "ok", insertId: result2.insertId });
      });
    } else {
      console.log("⚠️ Already Reserved");
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

        const id = parseInt(row.slot.replace("slot", ""), 10);
        broadcast({ id, state: 0, distance: 0 });
        console.log(`📡 Broadcasted slot ${id} -> state=0`);

        const del = "DELETE FROM reservation WHERE id_car = ?";
        db.query(del, [row.id_car], (err2, res2) => {
          if (err2) {
            return console.error(err2);
          }

          console.log(`Deleted id_car: ${row.id_car}, affected: ${res2.affectedRows}`);

        });
      } else {
        console.log("not delete");
      }
    });
  });
});

wss.on("connection", (ws) => {
  console.log("🔗 WebSocket client connected");
  clients.add(ws);


  ws.on("message", (msg) => {
    try {
      const data = JSON.parse(msg);
      if (data.ping) return;
      console.log("📩 WebSocket message:", data);

      // ✅ ถ้ามาจากหน้า Reservation ให้ broadcast ไปหน้า Parking
      if (data.from === "reservation") {
        broadcast({ id: data.id, state: data.state, distance: data.distance });
        console.log(`📡 Broadcasted slot ${data.id} -> state=${data.state}`);
      }
    } catch (e) {
      console.error("Error parsing WebSocket msg:", e);
    }
  });

  ws.on("close", () => {
    console.log("❌ Client disconnected");
    clients.delete(ws);
  });
});

function broadcast(data) {
  const jsonData = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(jsonData);
    }
  }
}


server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

