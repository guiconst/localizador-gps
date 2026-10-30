import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { TEMA } from './tema.js';

const mapaUrl = (lat, lng) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

function traduzirErro(error) {
  const msg = String(error?.message || error || '').toLowerCase();
  if (error?.code === 1 || msg.includes('denied') || msg.includes('permission')) {
    return {
      titulo: 'Permissão negada',
      texto: 'Libere a localização para este app em Configurações > Apps > Localizador GPS > Permissões.',
    };
  }
  if (error?.code === 3 || msg.includes('timeout') || msg.includes('timed out')) {
    return {
      titulo: 'Tempo esgotado',
      texto: 'O GPS não achou sinal a tempo. Vá para um lugar aberto e tente de novo.',
    };
  }
  if (msg.includes('disabled') || msg.includes('location services')) {
    return {
      titulo: 'GPS desligado',
      texto: 'Ative a localização do aparelho no painel rápido do Android e tente de novo.',
    };
  }
  return {
    titulo: 'Não foi possível obter a posição',
    texto: 'Verifique o GPS do aparelho e tente novamente.',
  };
}

function Radar({ precisao }) {
  // Quanto menor a margem de erro, menor (mais firme) o círculo.
  const raio = precisao == null ? 70 : Math.max(10, Math.min(70, 10 + precisao * 0.6));
  const boa = precisao != null && precisao <= TEMA.precisaoAceitavel;
  return (
    <svg className="radar" viewBox="0 0 200 200" role="img"
         aria-label={precisao == null ? 'Aguardando posição' : `Margem de erro de ${precisao.toFixed(1)} metros`}>
      {[30, 55, 80, 95].map((r) => (
        <circle key={r} cx="100" cy="100" r={r} className="radar-grade" />
      ))}
      <line x1="100" y1="5" x2="100" y2="195" className="radar-grade" />
      <line x1="5" y1="100" x2="195" y2="100" className="radar-grade" />
      {precisao != null && (
        <circle cx="100" cy="100" r={raio}
                className={boa ? 'radar-erro radar-erro--boa' : 'radar-erro radar-erro--fraca'} />
      )}
      <circle cx="100" cy="100" r="5" className="radar-ponto" />
    </svg>
  );
}

export default function App() {
  const [status, setStatus] = useState('idle'); // idle | loading | ok | erro
  const [posicao, setPosicao] = useState(null);
  const [erro, setErro] = useState(null);
  const [historico, setHistorico] = useState([]);

  const capturar = async () => {
    setStatus('loading');
    setErro(null);
    try {
      // No Android, pede a permissão nativa (aparece o modal do sistema).
      if (Capacitor.isNativePlatform()) {
        let perm = await Geolocation.checkPermissions();
        if (perm.location !== 'granted' && perm.coarseLocation !== 'granted') {
          perm = await Geolocation.requestPermissions();
        }
        if (perm.location === 'denied' && perm.coarseLocation === 'denied') {
          throw { code: 1, message: 'permission denied' };
        }
      }

      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      });

      const ponto = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        precisao: pos.coords.accuracy,
        hora: new Date(pos.timestamp),
      };
      setPosicao(ponto);
      setHistorico((h) => [ponto, ...h].slice(0, TEMA.maxHistorico));
      setStatus('ok');
    } catch (e) {
      setErro(traduzirErro(e));
      setStatus('erro');
    }
  };

  const sinalBom = posicao && posicao.precisao <= TEMA.precisaoAceitavel;

  return (
    <main className="app">
      <header className="topo">
        <h1>{TEMA.titulo}</h1>
        <p>{TEMA.descricao}</p>
      </header>

      <section className="painel" aria-live="polite">
        <Radar precisao={posicao?.precisao} />

        {status === 'idle' && (
          <p className="vazio">Nenhuma posição capturada ainda. Toque no botão abaixo para começar.</p>
        )}

        {status === 'loading' && (
          <p className="vazio">Buscando satélites… isso pode levar alguns segundos.</p>
        )}

        {status === 'erro' && erro && (
          <div className="erro" role="alert">
            <strong>{erro.titulo}</strong>
            <span>{erro.texto}</span>
          </div>
        )}

        {posicao && status !== 'loading' && (
          <dl className="dados">
            <div>
              <dt>Latitude</dt>
              <dd>{posicao.lat.toFixed(6)}</dd>
            </div>
            <div>
              <dt>Longitude</dt>
              <dd>{posicao.lng.toFixed(6)}</dd>
            </div>
            <div>
              <dt>Precisão</dt>
              <dd>
                ±{posicao.precisao.toFixed(1)} m
                <span className={sinalBom ? 'selo selo--boa' : 'selo selo--fraca'}>
                  {sinalBom ? 'sinal bom' : 'sinal fraco'}
                </span>
              </dd>
            </div>
          </dl>
        )}
      </section>

      <div className="acoes">
        <button className="btn btn-primario" onClick={capturar} disabled={status === 'loading'}>
          {status === 'loading' ? 'Buscando sinal…' : TEMA.botao}
        </button>

        {posicao && (
          <a className="btn btn-secundario"
             href={mapaUrl(posicao.lat, posicao.lng)}
             target="_blank" rel="noreferrer">
            Abrir localização no mapa
          </a>
        )}
      </div>

      {historico.length > 0 && (
        <section className="historico">
          <h2>Últimos pontos</h2>
          <ul>
            {historico.map((p, i) => (
              <li key={p.hora.getTime() + '-' + i}>
                <span className="hora">{p.hora.toLocaleTimeString('pt-BR')}</span>
                <span className="coord">{p.lat.toFixed(5)}, {p.lng.toFixed(5)}</span>
                <a href={mapaUrl(p.lat, p.lng)} target="_blank" rel="noreferrer">mapa</a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
