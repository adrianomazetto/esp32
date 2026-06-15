import React, { useState, useEffect, useCallback } from 'react';
import { Bluetooth, RefreshCw, X, FileCode } from 'lucide-react';
import bleManager from './components/BleManager';

// Importando componentes das telas
import Dashboard from './components/Dashboard';
import LedControl from './components/LedControl';
import RgbControl from './components/RgbControl';
import SwitchesControl from './components/SwitchesControl';
import CarControl from './components/CarControl';
import GamepadControl from './components/GamepadControl';
import TerminalControl from './components/TerminalControl';
import VoiceControl from './components/VoiceControl';
import KeypadControl from './components/KeypadControl';
import CodeExamples from './components/CodeExamples';

function App() {
  const [screen, setScreen] = useState('dashboard');
  const [isConnected, setIsConnected] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [connectedDeviceName, setConnectedDeviceName] = useState('');

  // Adiciona mensagens ao console do terminal
  const addConsoleMessage = useCallback((text, type = 'info') => {
    setMessages((prev) => [...prev, { text, type }]);
  }, []);

  // Handler para desconexão acionada pelo BLE
  const handleBleDisconnect = useCallback(() => {
    setIsConnected(false);
    setConnectedDeviceName('');
    addConsoleMessage('Dispositivo desconectado.', 'info');
  }, [addConsoleMessage]);

  // Handler para recebimento de dados do ESP32
  const handleBleDataReceived = useCallback((text) => {
    addConsoleMessage(text, 'received');
  }, [addConsoleMessage]);

  // Envia comando e loga no terminal
  const handleSendMessage = async (text) => {
    const success = await bleManager.sendString(text);
    if (success) {
      addConsoleMessage(text, 'sent');
    } else {
      addConsoleMessage(`Falha ao enviar: "${text}"`, 'info');
    }
  };

  // Escanear dispositivos
  const startScanning = async () => {
    setDevices([]);
    setIsScanning(true);
    addConsoleMessage('Buscando dispositivos Bluetooth Low Energy...', 'info');

    try {
      await bleManager.startScan((device) => {
        setDevices((prev) => {
          // Evita duplicados na lista
          if (prev.some((d) => d.deviceId === device.deviceId)) return prev;
          return [...prev, device];
        });
      });
      
      // Auto stop scan após 10 segundos
      setTimeout(() => {
        stopScanning();
      }, 10000);
    } catch (err) {
      console.error(err);
      setIsScanning(false);
      addConsoleMessage('Erro ao buscar dispositivos Bluetooth.', 'info');
    }
  };

  const stopScanning = async () => {
    await bleManager.stopScan();
    setIsScanning(false);
  };

  // Conectar dispositivo
  const connectDevice = async (device) => {
    await stopScanning();
    addConsoleMessage(`Conectando a: ${device.name}...`, 'info');
    
    try {
      const conn = await bleManager.connect(
        device.deviceId,
        handleBleDisconnect,
        handleBleDataReceived
      );
      if (conn) {
        setIsConnected(true);
        setConnectedDeviceName(device.name);
        setShowConnectModal(false);
        addConsoleMessage(`Conectado a ${device.name}!`, 'info');
      }
    } catch (err) {
      console.error(err);
      addConsoleMessage('Erro ao conectar ao dispositivo.', 'info');
    }
  };

  // Desconectar dispositivo
  const disconnectDevice = async () => {
    addConsoleMessage('Desconectando...', 'info');
    await bleManager.disconnect();
  };

  // Abre/fecha modal de conexão e gerencia scan
  const handleConnectionBadgeClick = () => {
    if (isConnected) {
      disconnectDevice();
    } else {
      setShowConnectModal(true);
      startScanning();
    }
  };

  // Retorna tela ativa
  const renderScreen = () => {
    switch (screen) {
      case 'led':
        return <LedControl onBack={() => setScreen('dashboard')} />;
      case 'rgb':
        return <RgbControl onBack={() => setScreen('dashboard')} />;
      case 'car':
        return <CarControl onBack={() => setScreen('dashboard')} />;
      case 'switches':
        return <SwitchesControl onBack={() => setScreen('dashboard')} />;
      case 'gamepad':
        return <GamepadControl onBack={() => setScreen('dashboard')} />;
      case 'terminal':
        return (
          <TerminalControl 
            onBack={() => setScreen('dashboard')} 
            messages={messages} 
            onSendMessage={handleSendMessage}
          />
        );
      case 'voice':
        return (
          <VoiceControl 
            onBack={() => setScreen('dashboard')} 
            onAddConsoleMessage={addConsoleMessage}
          />
        );
      case 'keypad':
        return <KeypadControl onBack={() => setScreen('dashboard')} />;
      case 'code':
        return <CodeExamples onBack={() => setScreen('dashboard')} />;
      default:
        return <Dashboard onNavigate={(target) => setScreen(target)} />;
    }
  };

  return (
    <>
      {/* Cabeçalho Fixo do App */}
      <header className="app-header">
        <div className="logo-container" onClick={() => setScreen('dashboard')} style={{ cursor: 'pointer' }}>
          <span className="logo-text">SENAI</span>
          <span className="logo-plus">+</span>
          <span className="logo-text">ESP32</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Botão de Exemplos de Código no Header */}
          <button 
            onClick={() => setScreen('code')} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-lead-dark)', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Código Exemplo ESP32"
          >
            <FileCode size={22} className="code-header-icon" />
          </button>
          
          {/* Badge de Conexão */}
          <div 
            className={`connection-badge ${isConnected ? 'connected' : 'disconnected'}`}
            onClick={handleConnectionBadgeClick}
          >
            <Bluetooth size={14} />
            <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
          </div>
        </div>
      </header>

      {/* Container Principal com a tela atual */}
      <main className="app-container">
        {renderScreen()}
      </main>

      {/* Modal de Conexão e Busca Bluetooth */}
      {showConnectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700 }}>
                Dispositivos Bluetooth
              </h3>
              <button 
                onClick={() => { setShowConnectModal(false); stopScanning(); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-lead-light)' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--text-lead-light)', marginTop: '-8px' }}>
              Selecione o seu ESP32 para conectar.
            </p>

            <div className="device-list">
              {devices.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', fontSize: '13px', color: 'var(--text-lead-light)' }}>
                  {isScanning ? 'Buscando dispositivos...' : 'Nenhum dispositivo encontrado.'}
                </div>
              ) : (
                devices.map((device) => (
                  <div 
                    key={device.deviceId} 
                    className="device-item"
                    onClick={() => connectDevice(device)}
                  >
                    <div>
                      <div className="device-name">{device.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-lead-light)', fontFamily: 'monospace' }}>
                        {device.deviceId}
                      </div>
                    </div>
                    <div className="device-rssi">{device.rssi} dBm</div>
                  </div>
                ))
              )}
            </div>

            <button 
              className={`scan-button ${isScanning ? 'scanning' : ''}`}
              onClick={isScanning ? stopScanning : startScanning}
              disabled={isScanning}
              style={{ padding: '10px 16px', fontSize: '14px', marginTop: '12px' }}
            >
              {isScanning ? (
                <>
                  <RefreshCw size={16} className="spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                  Buscando...
                </>
              ) : (
                'Buscar Novamente'
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
