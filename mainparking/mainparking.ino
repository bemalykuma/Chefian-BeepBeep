#include <WiFiS3.h>
#include <ArduinoHttpClient.h>
#include <ArduinoJson.h>

const char* WIFI_SSID = "OUPAPORN";
const char* WIFI_PASSWORD = "0814035065";

const char SERVER_HOST[] = "192.168.1.33";  // IP ของเครื่อง Node.js
const int SERVER_PORT = 5000;

WiFiClient wifi;
HttpClient client(wifi, SERVER_HOST, SERVER_PORT);

// -------- STRUCT & SENSORS --------
struct SensorData {
  int id;
  int trigPin;
  int echoPin;
  int state;
  long duration;
  int distance;
};

SensorData s1 = { 1, 2, 3, 0, 0, 0 };
SensorData s2 = { 2, 7, 8, 0, 0, 0 };
// SensorData s3 = {3, 6, 7, 0, 0, 0};
// SensorData s4 = {4, 8, 9, 0, 0, 0};

void setup() {
  Serial.begin(9600);
  pinMode(s1.trigPin, OUTPUT);
  pinMode(s1.echoPin, INPUT);
  pinMode(s2.trigPin, OUTPUT);
  pinMode(s2.echoPin, INPUT);
  // pinMode(s3.trigPin, OUTPUT); pinMode(s3.echoPin, INPUT);
  // pinMode(s4.trigPin, OUTPUT); pinMode(s4.echoPin, INPUT);

  Serial.print("Connecting to WiFi...");
  while (WiFi.begin(WIFI_SSID, WIFI_PASSWORD) != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }
  Serial.println("\n✅ WiFi connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  readAndSend(s1);
  delay(2000);
  readAndSend(s2);
  delay(500);
  // readAndSend(s3);
  // delay(50);
  // readAndSend(s4);
  // delay(1000);  // ตรวจทุก 1 วิ
}

// ฟังก์ชันอ่าน Ultrasonic และส่ง JSON ถ้า state เปลี่ยน
// ฟังก์ชันอ่าน Ultrasonic และส่ง JSON ถ้า state เปลี่ยน
void readAndSend(SensorData& sensor) {
  // Trigger ultrasonic
  digitalWrite(sensor.trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(sensor.trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(sensor.trigPin, LOW);

  // 1. รับค่า duration และตั้ง timeout เป็น 30ms (30000 µs) ให้เวลามากกว่าเดิมเล็กน้อย
  //    เพื่อให้แน่ใจว่าได้ค่า และหาก timeout จะเป็น 0
  sensor.duration = pulseIn(sensor.echoPin, HIGH, 30000);

  // 2. ⚡️ **เพิ่มการตรวจสอบ: หาก duration เป็น 0 แสดงว่า timeout หรือมีปัญหา**
  if (sensor.duration == 0) {
    // หากไม่ได้รับค่า ให้ถือว่าระยะทางเป็นค่าที่ไม่ถูกต้อง (เช่น -1) หรือ 0
    // เพื่อหลีกเลี่ยงการคำนวณที่ผิดพลาดและอาจไม่เปลี่ยน state
    sensor.distance = 0;
    // Serial.println("⚠️ pulseIn() Timeout/Error!"); // ใช้สำหรับการ Debug
  } else {
    // หากได้รับค่า ให้คำนวณระยะทางตามปกติ (cm/µs = 0.034 / 2)
    sensor.distance = sensor.duration * 0.034 / 2;
  }

  // กำหนด state: 1 หากระยะทาง 1-14 ซม., 0 หาก 0 หรือ >= 15 ซม.
  int prevState = sensor.state;
  sensor.state = (sensor.distance >= 1 && sensor.distance < 15) ? 1 : 0;

  // ... (ส่วนที่เหลือของโค้ดส่ง JSON เหมือนเดิม) ...
  // ✅ ส่งข้อมูลเมื่อ state เปลี่ยน (จาก 1→0 หรือ 0→1)
  if (sensor.state != prevState) {
    StaticJsonDocument<128> doc;
    doc["id"] = sensor.id;
    doc["state"] = sensor.state;
    doc["distance"] = sensor.distance;

    String json;
    serializeJson(doc, json);

    Serial.print("📡 Sending JSON (Sensor ");
    Serial.print(sensor.id);
    Serial.print("): ");
    Serial.println(json);

    client.beginRequest();
    client.post("/api/carSlot");
    client.sendHeader("Content-Type", "application/json");
    client.sendHeader("Content-Length", json.length());
    client.beginBody();
    client.print(json);
    client.endRequest();
    client.stop();  // ปิดทันทีไม่รอ response
  }
}
