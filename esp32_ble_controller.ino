/*
  FIRMWARE ESP32 BLE UART (SENAI + ESP32)
  Utiliza o serviço BLE UART padrão da Nordic (NUS)
  Compatível com o aplicativo desenvolvido.
*/

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

BLEServer *pServer = NULL;
BLECharacteristic *pTxCharacteristic;
bool deviceConnected = false;

// Pinos de controle
const int LED_PIN = 2; // LED Onboard do ESP32 (GPIO 2)

// UUIDs padrão do Nordic UART Service (NUS)
#define SERVICE_UUID           "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
#define CHARACTERISTIC_UUID_RX "6e400002-b5a3-f393-e0a9-e50e24dcca9e"
#define CHARACTERISTIC_UUID_TX "6e400003-b5a3-f393-e0a9-e50e24dcca9e"

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
      Serial.println("App Conectado!");
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
      Serial.println("App Desconectado. Aguardando nova conexão...");
      // Reinicia anúncio
      pServer->getAdvertising()->start();
    }
};

class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      std::string rxValue = pCharacteristic->getValue();

      if (rxValue.length() > 0) {
        String cmd = "";
        for (int i = 0; i < rxValue.length(); i++) {
          cmd += rxValue[i];
        }
        
        Serial.print("Comando Recebido: ");
        Serial.println(cmd);

        // --- Lógica de controle ---
        
        // 1. Liga/Desliga LED/Interruptor 1
        if (cmd == "ON1") {
          digitalWrite(LED_PIN, HIGH);
          Serial.println("LED LIGADO");
        } 
        else if (cmd == "OFF1") {
          digitalWrite(LED_PIN, LOW);
          Serial.println("LED DESLIGADO");
        }
        // 2. Exemplo de comandos adicionais (Interruptores 2 e 3)
        else if (cmd == "ON2") {
          Serial.println("Saída 2 LIGADA");
        }
        else if (cmd == "OFF2") {
          Serial.println("Saída 2 DESLIGADA");
        }
        // 3. Controle de Direção (Car / Gamepad)
        else if (cmd == "F") {
          Serial.println("Carro: Frente");
        }
        else if (cmd == "B") {
          Serial.println("Carro: Ré");
        }
        else if (cmd == "L") {
          Serial.println("Carro: Esquerda");
        }
        else if (cmd == "R") {
          Serial.println("Carro: Direita");
        }
        else if (cmd == "S") {
          Serial.println("Carro: PARAR");
        }
        // 4. Controle de Velocidade
        else if (cmd.startsWith("SPEED:")) {
          String valStr = cmd.substring(6);
          int speed = valStr.toInt();
          Serial.print("Velocidade definida em: ");
          Serial.println(speed);
        }
        // 5. Receber cor RGB
        else if (cmd.startsWith("RGB:")) {
          String valStr = cmd.substring(4);
          int comma1 = valStr.indexOf(',');
          int comma2 = valStr.lastIndexOf(',');
          int r = valStr.substring(0, comma1).toInt();
          int g = valStr.substring(comma1 + 1, comma2).toInt();
          int b = valStr.substring(comma2 + 1).toInt();
          Serial.printf("RGB: R=%d, G=%d, B=%d\n", r, g, b);
        }
      }
    }
};

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);

  // Inicializa o dispositivo BLE
  BLEDevice::init("SENAI ESP32");

  // Cria o Servidor BLE
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Cria o Serviço BLE NUS
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Cria a Característica TX (Notificações)
  pTxCharacteristic = pService->createCharacteristic(
                        CHARACTERISTIC_UUID_TX,
                        BLECharacteristic::PROPERTY_NOTIFY
                      );
                      
  pTxCharacteristic->addDescriptor(new BLE2902());

  // Cria a Característica RX (Escrita)
  BLECharacteristic *pRxCharacteristic = pService->createCharacteristic(
                                           CHARACTERISTIC_UUID_RX,
                                           BLECharacteristic::PROPERTY_WRITE
                                         );

  pRxCharacteristic->setCallbacks(new MyCallbacks());

  // Inicia o Serviço
  pService->start();

  // Inicia o Anúncio BLE (Advertising)
  pServer->getAdvertising()->start();
  Serial.println("Servidor BLE iniciado! Aguardando conexões...");
}

void loop() {
  // Envia dados simulados a cada 5 segundos se conectado
  if (deviceConnected) {
    // Exemplo de envio de dados de sensor para o App
    // float temp = readTempSensor();
    // String data = "TEMP:" + String(temp);
    // pTxCharacteristic->setValue(data.c_str());
    // pTxCharacteristic->notify();
    delay(5000);
  }
}
