import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import bleManager from './BleManager';

const KeypadControl = ({ onBack }) => {
  const [lastKeyPressed, setLastKeyPressed] = useState('-');

  const keys = [
    ['1', '2', '3', 'A'],
    ['4', '5', '6', 'B'],
    ['7', '8', '9', 'C'],
    ['*', '0', '#', 'D']
  ];

  const handleKeyPress = async (key) => {
    setLastKeyPressed(key);
    // Envia o caractere correspondente diretamente via BLE
    await bleManager.sendString(key);
  };

  const isActionKey = (key) => {
    return ['A', 'B', 'C', 'D', '*', '#'].includes(key);
  };

  return (
    <div className="app-container" style={{ padding: 0 }}>
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={20} /> Voltar ao Painel
      </button>

      <h2 className="screen-title">Teclado 4x4</h2>
      <p className="screen-subtitle">Simule um teclado matricial enviando caracteres individuais.</p>

      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', color: 'var(--text-lead-light)' }}>Última Tecla Pressionada</div>
        <div style={{ 
          fontSize: '36px', 
          fontFamily: 'var(--font-heading)', 
          fontWeight: 800, 
          color: 'var(--primary-red)',
          marginTop: '4px' 
        }}>
          {lastKeyPressed}
        </div>
      </div>

      <div className="keypad-grid">
        {keys.map((row, rowIdx) => (
          <React.Fragment key={rowIdx}>
            {row.map((key) => (
              <button
                key={key}
                className={`keypad-btn ${isActionKey(key) ? 'action-key' : ''}`}
                onClick={() => handleKeyPress(key)}
              >
                {key}
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default KeypadControl;
