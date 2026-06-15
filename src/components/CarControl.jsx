import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft as LeftIcon, 
  ArrowRight as RightIcon, 
  Car, 
  Volume2, 
  Lightbulb 
} from 'lucide-react';
import bleManager from './BleManager';

const CarControl = ({ onBack }) => {
  const [speed, setSpeed] = useState(10);
  const [isHornActive, setIsHornActive] = useState(false);
  const [isLightActive, setIsLightActive] = useState(false);

  // Ativa e desativa o modo paisagem na montagem/desmontagem
  useEffect(() => {
    const root = document.getElementById('root');
    if (root) root.classList.add('landscape');
    
    return () => {
      if (root) root.classList.remove('landscape');
    };
  }, []);

  const sendCommand = (cmd) => {
    bleManager.sendString(cmd);
  };

  const handleDirectionPress = (dir) => {
    sendCommand(dir);
  };

  const handleDirectionRelease = () => {
    sendCommand('S'); // S = Stop
  };

  const handleSpeedChange = (e) => {
    const value = parseInt(e.target.value);
    setSpeed(value);
    sendCommand(`SPEED:${value}`);
  };

  const toggleHorn = () => {
    const nextState = !isHornActive;
    setIsHornActive(nextState);
    sendCommand(nextState ? 'HORN_ON' : 'HORN_OFF');
  };

  const toggleLight = () => {
    const nextState = !isLightActive;
    setIsLightActive(nextState);
    sendCommand(nextState ? 'LIGHT_ON' : 'LIGHT_OFF');
  };

  return (
    <div className="app-container" style={{ padding: '16px' }}>
      <button className="back-button" onClick={onBack} style={{ marginBottom: '10px' }}>
        <ArrowLeft size={20} /> Voltar ao Painel
      </button>

      <div className="car-landscape-container">
        {/* Controles de Direção Esquerda: Acelerar e Ré */}
        <div className="direction-dpad-left">
          <button 
            className="dpad-btn"
            onMouseDown={() => handleDirectionPress('F')}
            onMouseUp={handleDirectionRelease}
            onMouseLeave={handleDirectionRelease}
            onTouchStart={() => handleDirectionPress('F')}
            onTouchEnd={handleDirectionRelease}
          >
            <ArrowUp size={36} />
          </button>
          <button 
            className="dpad-btn"
            onMouseDown={() => handleDirectionPress('B')}
            onMouseUp={handleDirectionRelease}
            onMouseLeave={handleDirectionRelease}
            onTouchStart={() => handleDirectionPress('B')}
            onTouchEnd={handleDirectionRelease}
          >
            <ArrowDown size={36} />
          </button>
        </div>

        {/* Painel Central: Status, Velocidade, Buzina e Farol */}
        <div className="car-center-panel">
          <div className="car-icon-display">
            <Car size={48} />
          </div>
          
          <div className="speed-slider-container">
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-lead-light)' }}>
              Velocidade: {speed}
            </span>
            <input 
              type="range" 
              min="0" 
              max="10" 
              value={speed} 
              onChange={handleSpeedChange} 
              className="speed-slider"
            />
          </div>

          <div className="car-action-buttons">
            <button 
              className={`car-action-btn ${isHornActive ? 'active' : ''}`}
              onClick={toggleHorn}
              title="Buzina"
            >
              <Volume2 size={24} />
            </button>
            <button 
              className={`car-action-btn ${isLightActive ? 'active' : ''}`}
              onClick={toggleLight}
              title="Farol"
            >
              <Lightbulb size={24} />
            </button>
          </div>
        </div>

        {/* Controles de Direção Direita: Esquerda e Direita */}
        <div className="direction-dpad-right">
          <button 
            className="dpad-btn"
            onMouseDown={() => handleDirectionPress('L')}
            onMouseUp={handleDirectionRelease}
            onMouseLeave={handleDirectionRelease}
            onTouchStart={() => handleDirectionPress('L')}
            onTouchEnd={handleDirectionRelease}
          >
            <LeftIcon size={36} />
          </button>
          <button 
            className="dpad-btn"
            onMouseDown={() => handleDirectionPress('R')}
            onMouseUp={handleDirectionRelease}
            onMouseLeave={handleDirectionRelease}
            onTouchStart={() => handleDirectionPress('R')}
            onTouchEnd={handleDirectionRelease}
          >
            <RightIcon size={36} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarControl;
