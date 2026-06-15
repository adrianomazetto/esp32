import React from 'react';
import { 
  Lightbulb, 
  Sliders, 
  Gamepad, 
  Terminal, 
  Mic, 
  Grid, 
  ToggleLeft, 
  Navigation 
} from 'lucide-react';

const Dashboard = ({ onNavigate }) => {
  const menuItems = [
    { id: 'led', title: 'LED/Lamp', icon: <Lightbulb size={32} /> },
    { id: 'rgb', title: 'RGB Picker', icon: <Sliders size={32} /> },
    { id: 'car', title: 'Car Controller', icon: <Navigation size={32} /> },
    { id: 'switches', title: 'Switches', icon: <ToggleLeft size={32} /> },
    { id: 'gamepad', title: 'Gamepad', icon: <Gamepad size={32} /> },
    { id: 'terminal', title: 'Terminal', icon: <Terminal size={32} /> },
    { id: 'voice', title: 'Voice Terminal', icon: <Mic size={32} /> },
    { id: 'keypad', title: '4x4 Keypad', icon: <Grid size={32} /> },
  ];

  return (
    <div>
      <h2 className="screen-title" style={{ fontFamily: 'var(--font-heading)', marginTop: '8px' }}>
        Painel de Controle
      </h2>
      <p className="screen-subtitle">
        Selecione um módulo para controlar ou ler dados do ESP32.
      </p>
      
      <div className="menu-grid">
        {menuItems.map((item) => (
          <div 
            key={item.id} 
            className="menu-card" 
            onClick={() => onNavigate(item.id)}
          >
            <div className="menu-card-icon">
              {item.icon}
            </div>
            <div className="menu-card-title">{item.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
