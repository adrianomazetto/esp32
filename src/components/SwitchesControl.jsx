import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import bleManager from './BleManager';

const SwitchesControl = ({ onBack }) => {
  // Estado para os 10 interruptores (falso = desligado, verdadeiro = ligado)
  const [switches, setSwitches] = useState(Array(10).fill(false));

  const handleToggle = async (index) => {
    const nextState = !switches[index];
    const switchNum = index + 1;
    // Comando compatível com o código do ESP32 (ex: ON1/OFF1, ON2/OFF2)
    const command = nextState ? `ON${switchNum}` : `OFF${switchNum}`;

    const success = await bleManager.sendString(command);
    if (success) {
      const updatedSwitches = [...switches];
      updatedSwitches[index] = nextState;
      setSwitches(updatedSwitches);
    }
  };

  return (
    <div className="app-container" style={{ padding: 0 }}>
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={20} /> Voltar ao Painel
      </button>

      <h2 className="screen-title">Interruptores</h2>
      <p className="screen-subtitle">Controle múltiplos relés ou saídas digitais do ESP32.</p>

      <div className="switches-list">
        {switches.map((state, idx) => (
          <div key={idx} className="switch-item">
            <span className="switch-label">Interruptor {idx + 1}</span>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={state} 
                onChange={() => handleToggle(idx)} 
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SwitchesControl;
