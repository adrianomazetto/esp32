import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import bleManager from './BleManager';

const TerminalControl = ({ onBack, messages, onSendMessage }) => {
  const [inputText, setInputText] = useState('');
  const consoleEndRef = useRef(null);

  // Auto-scroll para a última mensagem recebida
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="app-container" style={{ padding: 0 }}>
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={20} /> Voltar ao Painel
      </button>

      <h2 className="screen-title">Terminal Serial</h2>
      <p className="screen-subtitle">Envie comandos de texto e visualize os dados retornados pelo ESP32.</p>

      <div className="terminal-container">
        <div className="terminal-console">
          {messages.length === 0 ? (
            <div className="terminal-line info">Nenhuma mensagem registrada. Envie comandos para começar.</div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`terminal-line ${msg.type}`}>
                {msg.type === 'sent' && <span>&gt; {msg.text}</span>}
                {msg.type === 'received' && <span>&lt; {msg.text}</span>}
                {msg.type === 'info' && <span>* {msg.text}</span>}
              </div>
            ))
          )}
          <div ref={consoleEndRef} />
        </div>

        <div className="terminal-input-bar">
          <input
            type="text"
            className="terminal-input"
            placeholder="Digite o comando..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="terminal-send-btn" onClick={handleSend}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TerminalControl;
