#include <SocketIoClient.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>

#define SENS1 12
#define SENS2 14

unsigned long int lastTimeOfChange = 0;
unsigned long int lastTimeOfSend = 0;

SocketIoClient webSocket;

// spravil som co viem zatiaľ
void onSocketDisconnect(const char *, size_t len)
{
  Serial.println("Client has disconnected from the server.");
  webSocket.begin("194.160.229.181", 1205, "/socket.io/?transport=websocket");
  webSocket.emit("speed");
}

void onSocketConnect(const char *, size_t len)
{
  Serial.println("Client connected to the server.");
  webSocket.emit("speed");
}

Float onGetSpeed(const char *, size_t len)
{
   Serial.println("Client requested onGetSpeed");
   /*
   tu treba spravit vzorec ktory vyrata priemernu rychlost toho točenia 
   za poslednu sekundu(neviem jak rychlo to beha ale ak aspon 3 otočky za sekundu vie urobiť tak by to bolo dobre takto)
   takže returnovalo by nejake obvodKolesaVcm*početotačokZaposlednusekundu
   alebo niečo take neviem jak ten senzor funguje a čoho je schopny 
   */
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

int State = 0;  // 1 or 2 last sensor
unsigned long int ChangeCount = 0, lastChangeCount = 0;
unsigned long int minTimeOfChange = 1000000;

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
      if ((State > 0) && ((cas - lastTimeOfChange) < minTimeOfChange)) minTimeOfChange = cas - lastTimeOfChange;
      lastTimeOfChange = cas;
      ChangeCount++;
      Serial.printf("State %d [%d] <min: %d>\n", newState, (int)ChangeCount, (int)minTimeOfChange);
      State = newState;
    }    
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
  
  delay(10);
}
