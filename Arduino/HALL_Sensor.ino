#include <SocketIoClient.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>

#define SENS1 12
#define SENS2 14

unsigned long int lastTimeOfChange = 0;
unsigned long int lastTimeOfSend = 0;
unsigned long int minTimeOfChange = 1000000;

SocketIoClient webSocket;

int State = 0;  // 1 or 2 last sensor
unsigned long int ChangeCount = 0, lastChangeCount = 0, lastChangeDuration = 100000;

void onSocketDisconnect(const char *, size_t len)
{
  Serial.println("Client has disconnected from the server.");
  webSocket.begin("194.160.229.181", 1206, "/socket.io/?transport=websocket");
}

void onSocketConnect(const char *, size_t len)
{
  Serial.println("Client connected to the server.");
}

void onGetSpeed(const char *, size_t len)
{
  float dlzkaImpulzu_m = 0.20;
  float casImpulzu_sec = (float)lastChangeDuration / 1000.0;
  float speed_m_per_sec = dlzkaImpulzu_m / casImpulzu_sec;
  float speed_kmh = speed_m_per_sec * 3.6;

  String json = "{ \"speed\": \"" + String((int)speed_kmh) + "\" }";

  webSocket.emit("speedJson", json.c_str());
  Serial.printf("\nGetSpeed: %s\n", json.c_str());
}

//Funkcia ktora bude posielať už data

void sendData(char* output) {
   if(WiFi.status() == WL_CONNECTED) {
    
     webSocket.emit("speed", output);
     Serial.println("Data sended.");
    }
}

void setup() 
{
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(SENS1, INPUT);
  pinMode(SENS2, INPUT);

  WiFi.begin();
  digitalWrite(LED_BUILTIN, LOW);
 
  while (WiFi.status() != WL_CONNECTED) 
  {
    Serial.println("Waiting for WiFi...");
    delay(1000);
  }

  digitalWrite(LED_BUILTIN, HIGH);

  lastTimeOfChange = lastTimeOfSend = millis();
  Serial.println("Started");

  webSocket.begin("194.160.229.181", 1206, "/socket.io/?transport=websocket"); 
  webSocket.on("disconnect", onSocketDisconnect);
  webSocket.on("connect", onSocketConnect);
  webSocket.on("speed", onGetSpeed);
}

void loop() 
{
  unsigned long int cas = millis();
  int newState = 0;

//  Serial.printf("Sens_1 = %d, Sens_2 = %d\n", digitalRead(SENS1), digitalRead(SENS2));
  
  if (digitalRead(SENS1) == LOW) newState = 1;
  else if (digitalRead(SENS2) == LOW) newState = 2;
  else newState = 0;
  
  if ((cas - lastTimeOfChange) < 100)
  {
    digitalWrite(LED_BUILTIN, LOW);
  }
  else
  {
    digitalWrite(LED_BUILTIN, HIGH);
  }
  
  if (newState > 0)
  {
    if (State != newState)
    {
      lastChangeDuration = cas - lastTimeOfChange;
      if ((State > 0) && (lastChangeDuration < minTimeOfChange)) minTimeOfChange = lastChangeDuration;
      lastTimeOfChange = cas;
      ChangeCount++;
      Serial.printf("State %d [%d] <cur: %d, min: %d>\n", newState, (int)ChangeCount, (int)lastChangeDuration, (int)minTimeOfChange);
      State = newState;
    }
  }
  else
  {
    if ((cas - lastTimeOfChange) > lastChangeDuration) lastChangeDuration = cas - lastTimeOfChange;
  }

  if ((cas - lastTimeOfSend) > 60000)
  {
    digitalWrite(LED_BUILTIN, LOW);
    if (ChangeCount > lastChangeCount)
    {
      HTTPClient http;
      http.begin("http://stofa.sk/hamster.php?ticks="+String(ChangeCount - lastChangeCount)+"&total="+String(ChangeCount)+"&speed="+String(minTimeOfChange));
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
  
  //tu bude treba zavolať tu funkciu ktora vytvara JSON 
  
  
}
