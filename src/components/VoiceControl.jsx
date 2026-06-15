import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Mic, MicOff } from 'lucide-react';
import bleManager from './BleManager';

const VoiceControl = ({ onBack, onAddConsoleMessage }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('Clique no microfone e fale um comando...');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Verifica se a API de Reconhecimento de Voz está disponível
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.lang = 'pt-BR'; // Idioma em Português
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      setTranscript('Ouvindo...');
    };

    rec.onerror = (e) => {
      console.error('Erro no reconhecimento de voz:', e);
      setTranscript(`Erro: ${e.error}. Tente novamente.`);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.onresult = (event) => {
      const text = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      console.log(`Transcrição recebida: "${text}" (Confiança: ${confidence})`);
      setTranscript(text);
      
      // Envia o comando transcrito via Bluetooth (convertido para maiúsculas para facilitar no ESP32)
      const command = text.toUpperCase().trim();
      
      // Também adiciona no console global
      onAddConsoleMessage(command, 'sent');
      bleManager.sendString(command);
    };

    recognitionRef.current = rec;
  }, [onAddConsoleMessage]);

  const startListening = () => {
    if (!isSupported) {
      // Simula o reconhecimento de voz em navegadores não suportados
      setIsListening(true);
      setTranscript('Ouvindo (Simulador)...');
      setTimeout(() => {
        const mockCommands = ['LIGAR LUZ', 'DESLIGAR LUZ', 'ON1', 'OFF1', 'BUSINA'];
        const randomCommand = mockCommands[Math.floor(Math.random() * mockCommands.length)];
        setTranscript(`"${randomCommand}" (Simulado)`);
        onAddConsoleMessage(randomCommand, 'sent');
        bleManager.sendString(randomCommand);
        setIsListening(false);
      }, 2000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="app-container" style={{ padding: 0 }}>
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={20} /> Voltar ao Painel
      </button>

      <h2 className="screen-title">Terminal de Voz</h2>
      <p className="screen-subtitle">Controle o ESP32 falando comandos de voz (ex: "ON1", "OFF1", "LIGAR LUZ").</p>

      <div className="voice-container">
        <div 
          className={`mic-button-outer ${isListening ? 'listening' : ''}`}
          onClick={startListening}
        >
          <div className="mic-button-inner">
            {isListening ? <Mic size={48} /> : <MicOff size={48} />}
          </div>
        </div>

        <div className="voice-transcript-box">
          &ldquo;{transcript}&rdquo;
        </div>

        <div className="voice-instruction">
          {!isSupported && (
            <span style={{ color: 'var(--primary-red)', fontWeight: 600 }}>
              Nota: API nativa não suportada neste navegador. Ativado modo de demonstração.
            </span>
          )}
          {isSupported && (
            <span>
              Toque no microfone para falar. Fale de forma clara e próxima ao microfone.
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceControl;
