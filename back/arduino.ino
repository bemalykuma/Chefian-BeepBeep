// #include <ArduinoJson.h>

// #include <WiFiS3.h>
// #include <ArduinoHttpClient.h>

// const char *ssid = "...";
// const char *password = "...";
// int status = WL_IDLE_STATUS;

// const char serverAddress[] = "...";
// const int port = 5000;

// WiFiClient wifi;
// HttpClient client = HttpClient(wifi, serverAddress, port);

// const int trigPins[6] = {2, 4, 6, 8, 10, 12};
// const int echoPins[6] = {3, 5, 7, 9, 11, 13};

// int slots[6];

// const int thresholdCM = 20;

// void setup()
// {

//     Serial.begin(115200);
//     while (!Serial)
//         ;

//     while (status != WL_CONNECTED)
//     {
//         Serial.print("Attempting to connect to SSID: ");
//         Serial.println(ssid);
//         status = WiFi.begin(ssid, password);
//         delay(5000);
//     }

//     Serial.println("\nConnected to Wi-Fi");
//     Serial.print("IP Address: ");
//     Serial.println(WiFi.localIP());

//     for (int i = 0; i < 6; i++)
//     {
//         pinMode(trigPins[i], OUTPUT);
//         pinMode(echoPins[i], INPUT);
//     }
// }

// void getLicense()
// {

//     client.get("/arduino/data");
//     int statusCode = client.responseStatusCode();
//     String response = client.responseBody();

//     Serial.print("Status code: ");
//     Serial.println(statusCode);
//     Serial.print("Response: ");
//     Serial.println(response);

//     if (statusCode == 200)
//     {

//         StaticJsonDocument<200> doc;
//         DeserializationError error = deserializeJson(doc, response);

//         if (!error)
//         {
//             const char *license = doc[0]["license"];
//             Serial.print("license ");
//             Serial.println(license);
//         }
//         else
//         {
//             Serial.print("JSON parse error: ");
//             Serial.println(error.c_str());
//         }
//     }

//     delay(1000);
// }

// long readDistanceCM(int trigPin, int echoPin)
// {
//     digitalWrite(trigPin, LOW);
//     delayMicroseconds(2);
//     digitalWrite(trigPin, HIGH);
//     delayMicroseconds(10);
//     digitalWrite(trigPin, LOW);

//     long duration = pulseIn(echoPin, HIGH, 30000);
//     long distance = duration * 0.034 / 2;

//     return distance;
// }

// void postSlotParking()
// {

//     for (int i = 0; i < 6; i++)
//     {
//         long distance = readDistanceCM(trigPins[i], echoPins[i]);
//         slots[i] = (distance > 0 && distance <= thresholdCM) ? 1 : 0;

//         Serial.print("Sensor ");
//         Serial.print(i + 1);
//         Serial.print(": ");
//         Serial.print(distance);
//         Serial.print(" cm -> slot");
//         Serial.print(i + 1);
//         Serial.print(" = ");
//         Serial.println(slots[i]);
//     }

//     String postData = "{";
//     for (int i = 0; i < 6; i++)
//     {
//         postData += "\"slot" + String(i + 1) + "\":" + String(slots[i]);
//         if (i < 5)
//             postData += ",";
//     }
//     postData += "}";

//     Serial.println("Sending: " + postData);

//     client.beginRequest();
//     client.post("/data");
//     client.sendHeader("Content-Type", "application/json");
//     client.sendHeader("Content-Length", postData.length());
//     client.beginBody();
//     client.print(postData);
//     client.endRequest();

//     int statusCode = client.responseStatusCode();
//     String response = client.responseBody();

//     Serial.print("Status code: ");
//     Serial.println(statusCode);
//     Serial.print("Response: ");
//     Serial.println(response);

//     delay(5000);
// }

// void loop()
// {
//     Serial.println("\nMaking GET request...");

//     getLicense();
//     postSlotParking();
// }