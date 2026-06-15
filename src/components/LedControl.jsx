import React, { useState } from 'react';
import { ArrowLeft, Power } from 'lucide-react';
import bleManager from './BleManager';

const LedControl = ({ onBack }) => {
  const [isOn, setIsOn] = useState(false);

  const handleToggle = async () => {
    const nextState = !isOn;
    const command = nextState ? 'ON1' : 'OFF1';
    
    const success = await bleManager.sendString(command);
    if (success) {
      setIsOn(nextState);
    }
  };

  return (
    <div className="app-container" style={{ padding: 0 }}>
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={20} /> Voltar ao Painel
      </button>

      <h2 className="screen-title">LED / Lâmpada</h2>
      <p className="screen-subtitle">Toque no botão para ligar ou desligar o LED do ESP32.</p>

      <div className="led-container">
        <div 
          className={`power-button-outer ${isOn ? 'active' : ''}`}
          onClick={handleToggle}
        >
          <div className="power-button-inner">
            <Power size={72} strokeWidth={1.5} />
          </div>
        </div>
        
        <div className="power-status-text">
          Status: <span style={{ color: isOn ? 'var(--primary-red)' : 'var(--text-lead-light)' }}>
            {isOn ? 'LIGADO' : 'DESLIGADO'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LedControl;
