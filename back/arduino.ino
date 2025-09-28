// #include <ArduinoJson.h>

// #include <WiFiS3.h>
// #include <ArduinoHttpClient.h>


// const char* ssid = "...";
// const char* password = "...";
// int status = WL_IDLE_STATUS;


// const char serverAddress[] = "...";
// const int port = 5000;

// WiFiClient wifi;
// HttpClient client = HttpClient(wifi, serverAddress, port);


// void setup() {
//   Serial.begin(115200);
//   while (!Serial)
//     ;

//   while (status != WL_CONNECTED) {
//     Serial.print("Attempting to connect to SSID: ");
//     Serial.println(ssid);
//     status = WiFi.begin(ssid, password);
//     delay(5000);
//   }

//   Serial.println("\nConnected to Wi-Fi");
//   Serial.print("IP Address: ");
//   Serial.println(WiFi.localIP());
// }

// void loop() {
//   Serial.println("\nMaking GET request...");


//   client.get("/arduino/data");

//   int statusCode = client.responseStatusCode();
//   String response = client.responseBody();

//   Serial.print("Status code: ");
//   Serial.println(statusCode);
//   Serial.print("Response: ");
//   Serial.println(response);

//   if (statusCode == 200) {

//     StaticJsonDocument<200> doc;
//     DeserializationError error = deserializeJson(doc, response);

//     if (!error) {
//       const char* license = doc[0]["license"];
//       Serial.print("license ");
//       Serial.println(license);

//     } else {
//       Serial.print("JSON parse error: ");
//       Serial.println(error.c_str());
//     }
//   }


//   delay(1000);
// }