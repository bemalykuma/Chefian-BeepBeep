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
Servo myServo1;
Servo myServo2;

const int servoPin1 = 9;  // Entrance
const int servoPin2 = 3;  // Exit

// HC-SR04 sensors
const int trig1 = 5;
const int echo1 = 6;
const int trig2 = 10;
const int echo2 = 11;

// Variables
int status = WL_IDLE_STATUS;
bool servoOpen = false;

void setup() {
  Serial.begin(115200);

  myServo1.attach(servoPin1);
  myServo2.attach(servoPin2);
  myServo1.write(10);
  myServo2.write(90);

  pinMode(trig1, OUTPUT);
  pinMode(echo1, INPUT);
  pinMode(trig2, OUTPUT);
  pinMode(echo2, INPUT);

  // Connect WiFi
  while (status != WL_CONNECTED) {
    Serial.print("Connecting to WiFi: ");
    Serial.println(ssid);
    status = WiFi.begin(ssid, password);
    delay(3000);
  }

  Serial.println("\n✅ Connected to Wi-Fi");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

long measureDistance(int trig, int echo) {
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);

  long duration = pulseIn(echo, HIGH, 30000);
  long distance = duration * 0.034 / 2;
  return distance;
}

void loop() {
  // ---- อ่านค่าจาก Node.js ----
  client.get("/arduino/data2");
  delay(100);
  int statusCode = client.responseStatusCode();
  String response = client.responseBody();

  if (statusCode == 200) {
    StaticJsonDocument<200> doc;
    if (deserializeJson(doc, response) == DeserializationError::Ok) {
      bool found = doc["value"];
      if (found && !servoOpen) {
        myServo1.write(120);
        delay(1000);
        servoOpen = true;
        Serial.println("🚗 Entrance opened");
      }
    }
  }

  // ---- Sensor 1: ปิดประตูเมื่อรถออก ----
  if (servoOpen) {
    long distance1 = measureDistance(trig1, echo1);
    Serial.print("Entrance distance: ");
    Serial.println(distance1);
    if (distance1 > 6) {
      delay(3000);
      myServo1.write(10);
      servoOpen = false;
      Serial.println("🚪 Entrance closed");
    }
  }

  // ---- Sensor 2: เปิด/ปิดประตูออก ----
  long distance2 = measureDistance(trig2, echo2);
  Serial.print("Exit distance: ");
  Serial.println(distance2);

  if (distance2 < 6) {
    delay(500);
    myServo2.write(0);
    Serial.println("🚘 Exit opened");
  } else if (distance2 > 6) {
    delay(3000);
    myServo2.write(90);

    Serial.println("🚪 Exit closed");
  }

  delay(1000);
}
