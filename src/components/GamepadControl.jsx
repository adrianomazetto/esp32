import React, { useEffect } from 'react';
import { ArrowLeft, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import bleManager from './BleManager';

const GamepadControl = ({ onBack }) => {
  // Ativa e desativa o modo paisagem na montagem/desmontagem
  useEffect(() => {
    const root = document.getElementById('root');
    if (root) root.classList.add('landscape');
    
    // Tenta rotacionar fisicamente a tela para paisagem
    const lockLandscape = async () => {
      try {
        await ScreenOrientation.lock({ orientation: 'landscape' });
      } catch (err) {
        console.warn('Rotação nativa para landscape não disponível:', err);
      }
    };
    lockLandscape();
    
    return () => {
      if (root) root.classList.remove('landscape');
      
      // Restaura a orientação para retrato ao sair
      const lockPortrait = async () => {
        try {
          await ScreenOrientation.lock({ orientation: 'portrait' });
        } catch (err) {
          console.warn('Rotação nativa para portrait não disponível:', err);
        }
      };
      lockPortrait();
    };
  }, []);

  const sendCommand = (cmd) => {
    bleManager.sendString(cmd);
  };

  return (
    <div className="app-container" style={{ padding: '16px' }}>
      <button className="back-button" onClick={onBack} style={{ marginBottom: '10px' }}>
        <ArrowLeft size={20} /> Voltar ao Painel
      </button>

      <div className="gamepad-landscape-container">
        {/* Lado Esquerdo: D-Pad Direcional */}
        <div className="gamepad-dpad">
          <button className="gamepad-btn up" onClick={() => sendCommand('GP_UP')}>
            <ChevronUp size={24} />
          </button>
          <button className="gamepad-btn left" onClick={() => sendCommand('GP_LEFT')}>
            <ChevronLeft size={24} />
          </button>
          <div className="gamepad-btn center-hub" />
          <button className="gamepad-btn right" onClick={() => sendCommand('GP_RIGHT')}>
            <ChevronRight size={24} />
          </button>
          <button className="gamepad-btn down" onClick={() => sendCommand('GP_DOWN')}>
            <ChevronDown size={24} />
          </button>
        </div>

        {/* Centro: START e PAUSE */}
        <div className="gamepad-center-controls">
          <button className="gamepad-sys-btn" onClick={() => sendCommand('GP_START')}>
            START
          </button>
          <button className="gamepad-sys-btn" onClick={() => sendCommand('GP_PAUSE')}>
            PAUSE
          </button>
        </div>

        {/* Lado Direito: Botões de Ação estilo Playstation */}
        <div className="gamepad-actions">
          <button className="gamepad-act-btn triangle" onClick={() => sendCommand('GP_TRIANGLE')}>
            ▲
          </button>
          <button className="gamepad-act-btn square" onClick={() => sendCommand('GP_SQUARE')}>
            ■
          </button>
          <button className="gamepad-act-btn circle" onClick={() => sendCommand('GP_CIRCLE')}>
            ●
          </button>
          <button className="gamepad-act-btn cross" onClick={() => sendCommand('GP_CROSS')}>
            ✖
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamepadControl;
