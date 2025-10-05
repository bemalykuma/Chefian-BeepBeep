#include <ArduinoJson.h>
#include <WiFiS3.h>
#include <ArduinoHttpClient.h>
#include <Servo.h>

// WiFi settings
const char* ssid = "OUPAPORN";
const char* password = "0814035065";
const char serverAddress[] = "192.168.1.33";
const int port = 5000;

WiFiClient wifi;
HttpClient client = HttpClient(wifi, serverAddress, port);

// Servo
Servo myServo;
const int servoPin = 9;

// HC-SR04 #1 (ตรวจรถออก)
const int trigPin1 = 7;
const int echoPin1 = 6;

// HC-SR04 #2 (ตรวจรถเข้าจอด)
const int trigPin2 = 3;
const int echoPin2 = 2;

// Variables
int status = WL_IDLE_STATUS;
bool servoOpen = false;
bool carParked = false;

void setup() {
  Serial.begin(115200);

  myServo.attach(servoPin);
  myServo.write(0); // Servo ปิดตอนเริ่มต้น

  pinMode(trigPin1, OUTPUT);
  pinMode(echoPin1, INPUT);
  pinMode(trigPin2, OUTPUT);
  pinMode(echoPin2, INPUT);

  while (status != WL_CONNECTED) {
    Serial.print("Connecting to WiFi: ");
    Serial.println(ssid);
    status = WiFi.begin(ssid, password);
    delay(5000);
  }

  Serial.println("\nConnected to Wi-Fi");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

// ฟังก์ชันวัดระยะ (ใช้ได้ทั้งสองเซนเซอร์)
long measureDistance(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  long distance = duration * 0.034 / 2; // cm
  return distance;
}

// ฟังก์ชันส่งข้อมูลที่จอดไปยัง Node.js
void updateCarSlot(int slotNumber, int value) {
  StaticJsonDocument<100> doc;
  doc["slot"] = "slot" + String(slotNumber);
  doc["value"] = value;

  String jsonData;
  serializeJson(doc, jsonData);

  client.beginRequest();
  client.post("/api/carSlot");
  client.sendHeader("Content-Type", "application/json");
  client.sendHeader("Content-Length", jsonData.length());
  client.beginBody();
  client.print(jsonData);
  client.endRequest();

  int statusCode = client.responseStatusCode();
  String response = client.responseBody();
  Serial.print("Update slot response: ");
  Serial.println(response);
}

void loop() {
  // อ่านค่าจากเซนเซอร์ตัวแรก (หน้าประตู)
  client.get("/arduino/data");
  int statusCode = client.responseStatusCode();
  String response = client.responseBody();

  if (statusCode == 200) {
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, response);

    if (!error) {
      bool found = doc["found"];
      if (found && !servoOpen) {
        myServo.write(90); // เปิด Servo
        servoOpen = true;
        Serial.println("Servo opened");
      }
    }
  }

  // เช็คว่ารถออกไปแล้ว (ตัวแรก)
  if (servoOpen) {
    long distance1 = measureDistance(trigPin1, echoPin1);
    if (distance1 > 6) {
      Serial.println("Car left. Closing servo in 3 sec...");
      delay(3000);
      myServo.write(0);
      servoOpen = false;
      Serial.println("Servo closed");
    }
  }


  long distance2 = measureDistance(trigPin2, echoPin2);
  Serial.print("Parking distance: ");
  if (distance2 < 0) {
    Serial.println("timeout");
  } else {
    Serial.println(distance2);
  }


  if (distance2 < 5 && !carParked) {
    Serial.println("Car detected in parking slot!");
    updateCarSlot(1, 1);
    carParked = true;
  }


  if (distance2 > 6 && carParked) {
    Serial.println("Car left parking slot!");
    updateCarSlot(1, 0); 
    carParked = false;
  }

  delay(1000);
}