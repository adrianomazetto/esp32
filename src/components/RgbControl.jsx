import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import bleManager from './BleManager';

const RgbControl = ({ onBack }) => {
  const canvasRef = useRef(null);
  const [color, setColor] = useState({ r: 255, g: 255, b: 255 });
  const [hexColor, setHexColor] = useState('#ffffff');
  const isDrawingRef = useRef(false);
  const lastSentTimeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const radius = width / 2;

    ctx.clearRect(0, 0, width, height);

    // Cria a roda de cores HSV usando faixas angulares
    for (let angle = 0; angle < 360; angle += 1) {
      const startAngle = (angle - 1) * Math.PI / 180;
      const endAngle = (angle + 1) * Math.PI / 180;

      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.arc(radius, radius, radius - 2, startAngle, endAngle, false);
      ctx.closePath();

      // Gradiente angular (HUE)
      const grad = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
      grad.addColorStop(0, '#ffffff'); // Centro branco
      grad.addColorStop(1, `hsl(${angle}, 100%, 50%)`); // Borda colorida

      ctx.fillStyle = grad;
      ctx.fill();
    }
  }, []);

  const handleColorChange = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    
    // Suporta mouse e toque
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const radius = canvas.width / 2;
    const dx = x - radius;
    const dy = y - radius;
    const distance = Math.sqrt(dx * dx + dx * dx);

    // Se estiver dentro da roda
    try {
      const imgData = ctx.getImageData(x, y, 1, 1).data;
      const r = imgData[0];
      const g = imgData[1];
      const b = imgData[2];

      // Ignora áreas transparentes fora do círculo
      if (imgData[3] > 0) {
        const rgbColor = { r, g, b };
        setColor(rgbColor);
        
        const toHex = (c) => c.toString(16).padStart(2, '0');
        const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        setHexColor(hex);

        // Limita a taxa de envio para não inundar o buffer do BLE (máximo 1 envio a cada 150ms)
        const now = Date.now();
        if (now - lastSentTimeRef.current > 150) {
          bleManager.sendString(`RGB:${r},${g},${b}`);
          lastSentTimeRef.current = now;
        }
      }
    } catch (err) {
      // Fora dos limites
    }
  };

  const handleStart = (e) => {
    isDrawingRef.current = true;
    handleColorChange(e);
  };

  const handleMove = (e) => {
    if (!isDrawingRef.current) return;
    handleColorChange(e);
  };

  const handleEnd = () => {
    isDrawingRef.current = false;
    // Garante o envio do valor final após soltar
    bleManager.sendString(`RGB:${color.r},${color.g},${color.b}`);
  };

  return (
    <div className="app-container" style={{ padding: 0 }}>
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={20} /> Voltar ao Painel
      </button>

      <h2 className="screen-title">Seletor RGB</h2>
      <p className="screen-subtitle">Deslize o dedo na roda para alterar a cor do LED RGB no ESP32.</p>

      <div className="rgb-container">
        <div className="color-picker-wrapper">
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            style={{ borderRadius: '50%', cursor: 'crosshair', boxShadow: 'var(--shadow-lg)' }}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          />
          <div 
            className="color-preview-box"
            style={{ backgroundColor: hexColor }}
          />
        </div>

        <div className="rgb-values-display">
          <div className="rgb-badge">R: <span>{color.r}</span></div>
          <div className="rgb-badge">G: <span>{color.g}</span></div>
          <div className="rgb-badge">B: <span>{color.b}</span></div>
        </div>
        
        <div style={{ fontSize: '14px', color: 'var(--text-lead-light)', marginTop: '8px' }}>
          Hex: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{hexColor.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

export default RgbControl;
