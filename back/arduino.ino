#include <ArduinoJson.h>
#include <WiFiS3.h>
#include <ArduinoHttpClient.h>
#include <Servo.h>

// WiFi settings
const char* ssid = "...";
const char* password = "...";
const char serverAddress[] = "...";
const int port = 5000;

WiFiClient wifi;
HttpClient client = HttpClient(wifi, serverAddress, port);

// Servo
Servo myServo;
const int servoPin = 9;

// HC-SR04
const int trigPin = 7;
const int echoPin = 6;

// Variables
int status = WL_IDLE_STATUS;
bool servoOpen = false;

void setup() {
  Serial.begin(115200);

  myServo.attach(servoPin);
  myServo.write(0); // Servo ปิดตอนเริ่มต้น

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

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

long measureDistance() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  long distance = duration * 0.034 / 2; // cm
  return distance;
}

void loop() {
  client.get("/arduino/data");

  int statusCode = client.responseStatusCode();
  String response = client.responseBody();

  Serial.print("Status code: ");
  Serial.println(statusCode);
  Serial.print("Response: ");
  Serial.println(response);

  if (statusCode == 200) {
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, response);

    if (!error) {
      bool found = doc["found"];
      Serial.print("found: ");
      Serial.println(found);

      if (found && !servoOpen) {
        myServo.write(90); // เปิด Servo
        servoOpen = true;
        Serial.println("Servo opened");
      }
    }
  }

  // เช็คว่ารถออกไปแล้ว
  if (servoOpen) {
    long distance = measureDistance();
    Serial.print("Distance: ");
    Serial.println(distance);

    if (distance > 6) { // ปรับค่าระยะตามต้องการ
      Serial.println("Car left. Closing servo in 3 sec...");
      delay(3000); // หน่วงก่อนปิด
      myServo.write(0); // ปิด Servo
      servoOpen = false;
      Serial.println("Servo closed");
    }
  }

  delay(1000); // loop ทุก 1 วินาที
}
