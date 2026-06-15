import { BleClient, numbersToDataView, dataViewToText } from '@capacitor-community/bluetooth-le';

// UUIDs padrão do Nordic UART Service (NUS)
export const UART_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
export const RX_CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // Escrita (App -> ESP32)
export const TX_CHARACTERISTIC_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // Notificação (ESP32 -> App)

class BleManager {
  constructor() {
    this.isInitialized = false;
    this.connectedDevice = null;
    this.isSimulator = false;
    this.onDisconnectCallback = null;
    this.onDataReceivedCallback = null;
  }

  // Inicializa o cliente Bluetooth
  async initialize() {
    if (this.isInitialized) return true;
    try {
      // Tenta inicializar o cliente nativo do Capacitor
      await BleClient.initialize();
      this.isInitialized = true;
      this.isSimulator = false;
      console.log('BLE Nativo Inicializado com sucesso.');
      return true;
    } catch (error) {
      // Se falhar (ex: rodando no navegador do PC sem suporte ou Capacitor não carregado)
      this.isInitialized = true;
      this.isSimulator = true;
      console.warn('Bluetooth LE nativo não disponível. Entrando no modo simulador.');
      return true;
    }
  }

  // Inicia a busca por dispositivos
  async startScan(onDeviceFound) {
    await this.initialize();

    if (this.isSimulator) {
      // Simula a descoberta de dispositivos
      console.log('Buscando dispositivos (Simulador)...');
      setTimeout(() => {
        onDeviceFound({
          deviceId: 'ESP32_SIM_MAC_123',
          name: 'SENAI ESP32 (Simulador)',
          rssi: -55
        });
      }, 1000);
      setTimeout(() => {
        onDeviceFound({
          deviceId: 'ESP32_SIM_MAC_456',
          name: 'ESP32_Control_LED',
          rssi: -72
        });
      }, 2000);
      return;
    }

    try {
      await BleClient.requestLEScan(
        {
          services: [], // Escaneia todos os dispositivos BLE próximos
        },
        (result) => {
          if (result && result.device) {
            onDeviceFound({
              deviceId: result.device.deviceId,
              name: result.device.name || result.localName || 'Dispositivo sem Nome',
              rssi: result.rssi
            });
          }
        }
      );
    } catch (error) {
      console.error('Erro ao iniciar escaneamento BLE:', error);
      throw error;
    }
  }

  // Interrompe a busca por dispositivos
  async stopScan() {
    if (this.isSimulator) {
      console.log('Busca interrompida (Simulador).');
      return;
    }
    try {
      await BleClient.stopLEScan();
    } catch (error) {
      console.error('Erro ao parar escaneamento BLE:', error);
    }
  }

  // Conecta a um dispositivo específico
  async connect(deviceId, onDisconnect, onDataReceived) {
    await this.initialize();
    this.onDisconnectCallback = onDisconnect;
    this.onDataReceivedCallback = onDataReceived;

    if (this.isSimulator) {
      console.log(`Conectando ao dispositivo simulado: ${deviceId}...`);
      return new Promise((resolve) => {
        setTimeout(() => {
          this.connectedDevice = {
            deviceId,
            name: deviceId === 'ESP32_SIM_MAC_123' ? 'SENAI ESP32 (Simulador)' : 'ESP32_Control_LED'
          };
          resolve(this.connectedDevice);
          
          // Simula recebimento de mensagens periódicas do ESP32 (ex: telemetria)
          this.simInterval = setInterval(() => {
            if (this.onDataReceivedCallback) {
              const mockTemp = (20 + Math.random() * 10).toFixed(1);
              const mockHum = (40 + Math.random() * 20).toFixed(0);
              this.onDataReceivedCallback(`TEMP:${mockTemp};HUM:${mockHum}`);
            }
          }, 8000);
        }, 1500);
      });
    }

    try {
      await BleClient.connect(deviceId, (disconnectedId) => {
        console.log(`Dispositivo desconectado: ${disconnectedId}`);
        this.connectedDevice = null;
        if (this.onDisconnectCallback) this.onDisconnectCallback();
      });

      this.connectedDevice = { deviceId, name: 'ESP32 Conectado' };

      // Se conecta com sucesso, começa a escutar notificações do TX (dados vindos do ESP32)
      try {
        await BleClient.startNotifications(
          deviceId,
          UART_SERVICE_UUID,
          TX_CHARACTERISTIC_UUID,
          (value) => {
            const text = dataViewToText(value);
            console.log('Dados recebidos do ESP32:', text);
            if (this.onDataReceivedCallback) this.onDataReceivedCallback(text);
          }
        );
      } catch (err) {
        console.warn('Serviço NUS não encontrado ou erro nas notificações TX. Continuando conectado...', err);
      }

      return this.connectedDevice;
    } catch (error) {
      console.error('Erro ao conectar ao dispositivo:', error);
      this.connectedDevice = null;
      throw error;
    }
  }

  // Desconecta o dispositivo atual
  async disconnect() {
    if (this.isSimulator) {
      console.log('Desconectando dispositivo simulado...');
      if (this.simInterval) clearInterval(this.simInterval);
      this.connectedDevice = null;
      if (this.onDisconnectCallback) this.onDisconnectCallback();
      return;
    }

    if (!this.connectedDevice) return;

    try {
      const deviceId = this.connectedDevice.deviceId;
      try {
        await BleClient.stopNotifications(deviceId, UART_SERVICE_UUID, TX_CHARACTERISTIC_UUID);
      } catch (e) {
        console.log('Erro ao parar notificações ao desconectar');
      }
      await BleClient.disconnect(deviceId);
      this.connectedDevice = null;
      if (this.onDisconnectCallback) this.onDisconnectCallback();
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      this.connectedDevice = null;
      if (this.onDisconnectCallback) this.onDisconnectCallback();
    }
  }

  // Envia um comando de texto (string) para o ESP32
  async sendString(text) {
    if (this.isSimulator) {
      console.log(`[SIMULADOR -> ENVIADO]: "${text}"`);
      return true;
    }

    if (!this.connectedDevice) {
      console.error('Nenhum dispositivo conectado para enviar dados.');
      return false;
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const dataView = new DataView(data.buffer);

      await BleClient.write(
        this.connectedDevice.deviceId,
        UART_SERVICE_UUID,
        RX_CHARACTERISTIC_UUID,
        dataView
      );
      console.log(`[BLE -> ENVIADO]: "${text}"`);
      return true;
    } catch (error) {
      console.error('Erro ao enviar string via BLE:', error);
      return false;
    }
  }
}

const bleManagerInstance = new BleManager();
export default bleManagerInstance;
