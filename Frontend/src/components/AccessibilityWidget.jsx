import React, { useState, useEffect, useRef } from 'react';
import './AccessibilityWidget.css';

const DEFAULT_SETTINGS = {
  fontSize: 100,
  contrast: 'normal',
  grayscale: false,
  invertColors: false,
  dyslexiaFont: false,
  textSpacing: false,
  highlightLinks: false,
  largeCursor: false,
  readingGuide: false,
};

function applySettings(settings) {
  const root = document.documentElement;
  root.style.setProperty('--a11y-font-scale', settings.fontSize / 100);
  root.setAttribute('data-a11y-font', settings.fontSize);
  root.setAttribute('data-a11y-contrast', settings.contrast);
  root.classList.toggle('a11y-grayscale',       settings.grayscale);
  root.classList.toggle('a11y-invert',          settings.invertColors);
  root.classList.toggle('a11y-dyslexia',        settings.dyslexiaFont);
  root.classList.toggle('a11y-text-spacing',    settings.textSpacing);
  root.classList.toggle('a11y-highlight-links', settings.highlightLinks);
  root.classList.toggle('a11y-large-cursor',    settings.largeCursor);
}

const CONTRAST_OPTIONS = [
  {
    value: 'normal',
    icon: '☀️',
    label: 'Padrão',
    desc: 'Cores originais do sistema',
    bg: '#ffffff',
    color: '#333333',
    border: '#e0e0e0',
  },
  {
    value: 'high',
    icon: '◑',
    label: 'Alto Contraste',
    desc: 'Fundo preto, texto amarelo',
    bg: '#000000',
    color: '#ffff00',
    border: '#ffff00',
  },
  {
    value: 'dark',
    icon: '🌙',
    label: 'Modo Escuro',
    desc: 'Interface em tons escuros',
    bg: '#1e1e2e',
    color: '#cdd6f4',
    border: '#45475a',
  },
];

const TOGGLE_OPTIONS = [
  {
    group: 'Filtros de Cor',
    groupDesc: 'Ajuste a forma como as cores são exibidas',
    items: [
      {
        key: 'grayscale',
        icon: '⬛',
        label: 'Escala de cinza',
        desc: 'Remove todas as cores da tela',
        exclusive: 'invertColors',
      },
      {
        key: 'invertColors',
        icon: '🔄',
        label: 'Inverter cores',
        desc: 'Inverte todas as cores da interface',
        exclusive: 'grayscale',
      },
    ],
  },
  {
    group: 'Leitura',
    groupDesc: 'Facilite a leitura e compreensão do conteúdo',
    items: [
      {
        key: 'dyslexiaFont',
        icon: '🔤',
        label: 'Fonte para dislexia',
        desc: 'Usa fonte com letras mais distintas',
      },
      {
        key: 'textSpacing',
        icon: '↕️',
        label: 'Mais espaçamento',
        desc: 'Aumenta espaço entre linhas e letras',
      },
      {
        key: 'highlightLinks',
        icon: '🔗',
        label: 'Realçar links',
        desc: 'Destaca todos os links da página',
      },
      {
        key: 'readingGuide',
        icon: '📏',
        label: 'Guia de leitura',
        desc: 'Faixa amarela que acompanha o cursor',
      },
    ],
  },
  {
    group: 'Navegação',
    groupDesc: 'Melhore a interação com o sistema',
    items: [
      {
        key: 'largeCursor',
        icon: '🖱️',
        label: 'Cursor ampliado',
        desc: 'Aumenta o tamanho do ponteiro do mouse',
      },
    ],
  },
];

export default function AccessibilityWidget() {
  const [open, setOpen]       = useState(false);
  const [guideY, setGuideY]   = useState(0);
  const panelRef              = useRef(null);
  const btnRef                = useRef(null);

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('a11y-settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    applySettings(settings);
    localStorage.setItem('a11y-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (!settings.readingGuide) return;
    const handler = (e) => setGuideY(e.clientY);
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, [settings.readingGuide]);

  useEffect(() => {
    if (!open) return;
    const onMouse = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        btnRef.current   && !btnRef.current.contains(e.target)
      ) setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onMouse);
    document.addEventListener('keydown',   onKey);
    return () => {
      document.removeEventListener('mousedown', onMouse);
      document.removeEventListener('keydown',   onKey);
    };
  }, [open]);

  const update = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const toggle = (key, exclusive) => setSettings(prev => {
    const next = { ...prev, [key]: !prev[key] };
    if (exclusive && next[key]) next[exclusive] = false;
    return next;
  });

  const resetAll = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem('a11y-settings');
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(DEFAULT_SETTINGS);

  return (
    <>
      {/* Guia de leitura */}
      {settings.readingGuide && (
        <div
          className="a11y-reading-guide"
          style={{ top: guideY - 22 }}
          aria-hidden="true"
        />
      )}

      {/* Botão flutuante */}
      <button
        ref={btnRef}
        className={`a11y-fab${hasChanges ? ' a11y-fab--active' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Abrir painel de acessibilidade"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Ferramentas de Acessibilidade"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26" aria-hidden="true">
          <path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm9 7h-6l-1.5-1.4A2 2 0 0 0 12 7H9.5a2 2 0 0 0-1.4.6L6.5 9H3a1 1 0 0 0 0 2h3l1 3-2.8 6.3a1 1 0 1 0 1.8.8L9 16h1.5v5a1 1 0 0 0 2 0v-5H14l2 5.1a1 1 0 1 0 1.8-.8L15 14.8 16 12h3a1 1 0 0 0 0-2z"/>
        </svg>
        {hasChanges && <span className="a11y-fab-badge" aria-label="Configurações ativas" />}
      </button>

      {/* Painel */}
      {open && (
        <div
          ref={panelRef}
          className="a11y-panel"
          role="dialog"
          aria-modal="true"
          aria-label="Painel de acessibilidade"
        >
          {/* Cabeçalho */}
          <div className="a11y-panel-header">
            <div>
              <h2 className="a11y-panel-title">Acessibilidade</h2>
              <p className="a11y-panel-subtitle">Personalize a exibição do sistema</p>
            </div>
            <button
              className="a11y-close-btn"
              onClick={() => setOpen(false)}
              aria-label="Fechar painel de acessibilidade"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div className="a11y-panel-body">

            {/* Tamanho do texto */}
            <section className="a11y-section" aria-labelledby="a11y-font-label">
              <div className="a11y-section-header">
                <h3 id="a11y-font-label" className="a11y-section-title">
                  Tamanho do texto
                </h3>
                <span className="a11y-section-desc">Ajuste o tamanho da letra</span>
              </div>
              <div className="a11y-font-controls">
                <button
                  className="a11y-font-btn"
                  onClick={() => update('fontSize', Math.max(80, settings.fontSize - 10))}
                  aria-label="Diminuir tamanho do texto"
                  disabled={settings.fontSize <= 80}
                  title="Diminuir"
                >
                  <span style={{ fontSize: '13px', fontWeight: 800 }}>A</span>
                  <span style={{ fontSize: '10px', marginLeft: '1px' }}>−</span>
                </button>

                <div className="a11y-font-track">
                  <div
                    className="a11y-font-fill"
                    style={{ width: `${((settings.fontSize - 80) / 70) * 100}%` }}
                  />
                  <span
                    className="a11y-font-value"
                    aria-live="polite"
                    aria-atomic="true"
                    aria-label={`Tamanho atual: ${settings.fontSize} por cento`}
                  >
                    {settings.fontSize}%
                  </span>
                </div>

                <button
                  className="a11y-font-btn a11y-font-btn--plus"
                  onClick={() => update('fontSize', Math.min(150, settings.fontSize + 10))}
                  aria-label="Aumentar tamanho do texto"
                  disabled={settings.fontSize >= 150}
                  title="Aumentar"
                >
                  <span style={{ fontSize: '18px', fontWeight: 800 }}>A</span>
                  <span style={{ fontSize: '12px', marginLeft: '1px' }}>+</span>
                </button>

                {settings.fontSize !== 100 && (
                  <button
                    className="a11y-font-reset"
                    onClick={() => update('fontSize', 100)}
                    aria-label="Redefinir tamanho do texto para padrão"
                    title="Redefinir"
                  >
                    ↺
                  </button>
                )}
              </div>
            </section>

            {/* Contraste / Tema */}
            <section className="a11y-section" aria-labelledby="a11y-contrast-label">
              <div className="a11y-section-header">
                <h3 id="a11y-contrast-label" className="a11y-section-title">
                  Tema de cores
                </h3>
                <span className="a11y-section-desc">Escolha o esquema visual</span>
              </div>
              <div className="a11y-contrast-options">
                {CONTRAST_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className={`a11y-contrast-btn${settings.contrast === opt.value ? ' active' : ''}`}
                    style={{
                      '--card-bg':     opt.bg,
                      '--card-color':  opt.color,
                      '--card-border': opt.border,
                    }}
                    onClick={() => update('contrast', opt.value)}
                    aria-pressed={settings.contrast === opt.value}
                    aria-label={`${opt.label}: ${opt.desc}`}
                  >
                    <span className="a11y-contrast-preview" aria-hidden="true">
                      {opt.icon}
                    </span>
                    <span className="a11y-contrast-label-text">{opt.label}</span>
                    {settings.contrast === opt.value && (
                      <span className="a11y-contrast-check" aria-hidden="true">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </section>

            {/* Grupos de toggles */}
            {TOGGLE_OPTIONS.map(group => (
              <section key={group.group} className="a11y-section" aria-labelledby={`a11y-group-${group.group}`}>
                <div className="a11y-section-header">
                  <h3 id={`a11y-group-${group.group}`} className="a11y-section-title">
                    {group.group}
                  </h3>
                  <span className="a11y-section-desc">{group.groupDesc}</span>
                </div>
                <div className="a11y-toggles">
                  {group.items.map(item => (
                    <ToggleRow
                      key={item.key}
                      icon={item.icon}
                      label={item.label}
                      desc={item.desc}
                      checked={settings[item.key]}
                      onChange={() => toggle(item.key, item.exclusive)}
                    />
                  ))}
                </div>
              </section>
            ))}

            {/* Rodapé */}
            <div className="a11y-footer">
              {hasChanges ? (
                <button className="a11y-reset-all" onClick={resetAll}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/>
                  </svg>
                  Restaurar configurações padrão
                </button>
              ) : (
                <p className="a11y-footer-hint">
                  Suas preferências são salvas automaticamente
                </p>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}

function ToggleRow({ icon, label, desc, checked, onChange }) {
  const id = `a11y-toggle-${label.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <div className={`a11y-toggle-row${checked ? ' a11y-toggle-row--on' : ''}`}>
      <div className="a11y-toggle-info">
        <span className="a11y-toggle-icon" aria-hidden="true">{icon}</span>
        <div>
          <span className="a11y-toggle-label">{label}</span>
          <span className="a11y-toggle-desc">{desc}</span>
        </div>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`a11y-switch${checked ? ' on' : ''}`}
        aria-label={`${label}: ${checked ? 'ativado' : 'desativado'}`}
      >
        <span className="a11y-switch-thumb" />
      </button>
    </div>
  );
}
