#include <SocketIoClient.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>

#define SENS 4

unsigned long int lastTimeOfChange = 0;
unsigned long int lastTimeOfSend = 0;
unsigned long int minTimeOfChange = 1000000;

SocketIoClient webSocket;

int State = 0;  
unsigned long int ChangeCount = 0, lastChangeCount = 0, lastChangeDuration = 100000;

void onSocketDisconnect(const char *, size_t len)
{
  Serial.println("Client has disconnected from the server.");
  webSocket.begin("192.168.31.1", 1206, "/socket.io/?transport=websocket");
}

void onSocketConnect(const char *, size_t len)
{
  Serial.println("Client connected to the server.");
}

void onGetSpeed(const char *, size_t len)
{
  float dlzkaImpulzu_cm = 20;
  float casImpulzu_sec = (float)lastChangeDuration / 1000.0;
  float speed_cm_per_sec = dlzkaImpulzu_cm / casImpulzu_sec;
//  float speed_kmh = speed_m_per_sec * 3.6;

  String json = "{ \"speed\": \"" + String((int)speed_cm_per_sec) + "\" }";

  webSocket.emit("speedJson", json.c_str());
  Serial.printf("\nGetSpeed: %s\n", json.c_str());
}

void setup() 
{
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(SENS, INPUT_PULLUP);

  WiFi.begin("Karfa2","chlapecidehore");
  digitalWrite(LED_BUILTIN, LOW);
 
  while (WiFi.status() != WL_CONNECTED) 
  {
    Serial.println("Waiting for WiFi...");
    delay(1000);
  }

  digitalWrite(LED_BUILTIN, HIGH);

  lastTimeOfChange = lastTimeOfSend = millis();
  Serial.println("Started");

  webSocket.begin("192.168.31.1", 1206, "/socket.io/?transport=websocket"); 
  webSocket.on("disconnect", onSocketDisconnect);
  webSocket.on("connect", onSocketConnect);
  webSocket.on("speed", onGetSpeed);
}

void loop() 
{
  unsigned long int cas = millis();
  int newState = 0;

//  Serial.printf("Sens_1 = %d, Sens_2 = %d\n", digitalRead(SENS1), digitalRead(SENS2));
  
  if (digitalRead(SENS) == LOW) newState = 1;
 
  if (newState == 1)
  {
    if (State != newState)
    {
      lastChangeDuration = cas - lastTimeOfChange;
      if ((State > 0) && (lastChangeDuration < minTimeOfChange)) minTimeOfChange = lastChangeDuration;
      lastTimeOfChange = cas;
      ChangeCount++;
      Serial.printf("State %d [%d] <cur: %d, min: %d>\n", newState, (int)ChangeCount, (int)lastChangeDuration, (int)minTimeOfChange);
      State = newState;
      onGetSpeed(NULL, 0);
    }
  }
  else
  {
    if ((cas - lastTimeOfChange) > lastChangeDuration) lastChangeDuration = cas - lastTimeOfChange;
    if (lastChangeDuration > 2000) lastChangeDuration = 100000;
  }
 
  if ((cas - lastTimeOfSend) > 60000)
  {
    digitalWrite(LED_BUILTIN, LOW);
    if (ChangeCount > lastChangeCount)
    {
      HTTPClient http;
      http.begin("192.168.31.1:1206/senddata?distance="+String(ChangeCount));
      int res = http.GET();
      String payload = http.getString();
      Serial.print(res); Serial.print(": "); Serial.println(payload);
    }
 
    digitalWrite(LED_BUILTIN, HIGH);      
    lastTimeOfSend = cas;
    lastChangeCount = ChangeCount;
    minTimeOfChange = 100000;
  }

  webSocket.loop();
  delay(10);
}
