"use client";

import { useEffect, useRef, useState } from "react";

type Etapa =
  | "bestiario"
  | "zoologico"
  | "captura"
  | "gravacao"
  | "carregando"
  | "escolha"
  | "detalhe"
  | "carta"
  | "historia";

type Versao = {
  nome: string;
  corpo: string;
  cores: string[];
  comportamentos: string[];
  bioma?: string;
  prompt_sprite: string;
};

type Bicho = Versao & {
  id: string;
  foto: string;
  transcricao?: string;
  historia?: string;
};

const CHAVE_BESTIARIO = "bestiario-samuel";
const INSTRUCAO_BESTIARIO_VAZIO = "Oi! Desenha um bicho pra gente começar!";
const INSTRUCAO_CAPTURA = "Coloca o desenho dentro do quadrado.";
const INSTRUCAO_GRAVACAO = "Agora me conta como é o seu bicho! Segure o botão e fala.";
const INSTRUCAO_CARREGANDO = "Seu bicho está nascendo...";
const MENSAGEM_LENTA = "O bicho está demorando pra nascer, espera mais um pouquinho.";
const MENSAGEM_NAO_ENTENDI = "Hum, não entendi, me conta de novo?";
const MENSAGEM_SERVIDOR = "O bestiário está dormindo, tenta daqui a pouco.";
const TEMPO_LENTO_MS = 15000;

let vozAtual: HTMLAudioElement | null = null;
let vozId = 0;

function pararVoz() {
  vozId++;
  vozAtual?.pause();
  vozAtual = null;
}

async function falar(texto: string) {
  pararVoz();
  const id = vozId;
  const resposta = await fetch("/api/falar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texto }),
  });
  if (!resposta.ok || id !== vozId) return;
  const audio = new Audio(URL.createObjectURL(await resposta.blob()));
  vozAtual = audio;
  await audio.play().catch(() => {});
}

export default function Home() {
  const [etapa, setEtapa] = useState<Etapa>("bestiario");
  const [bichos, setBichos] = useState<Bicho[]>([]);
  const [selecionado, setSelecionado] = useState<Bicho | null>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [transcricao, setTranscricao] = useState<string | null>(null);
  const [versoes, setVersoes] = useState<Versao[]>([]);
  const [escolhida, setEscolhida] = useState<Versao | null>(null);
  const [gravando, setGravando] = useState(false);
  const [lento, setLento] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [historiaErro, setHistoriaErro] = useState<string | null>(null);
  const gerandoHistoria = useRef(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const trechosRef = useRef<Blob[]>([]);

  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE_BESTIARIO);
    if (salvo) {
      setBichos(JSON.parse(salvo));
    } else {
      falar(INSTRUCAO_BESTIARIO_VAZIO);
    }
  }, []);

  useEffect(() => {
    if (etapa !== "captura" || foto) return;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        const mensagem = "Não achei a câmera. Permita o acesso e tente de novo.";
        setErro(mensagem);
        falar(mensagem);
      });
    falar(INSTRUCAO_CAPTURA);
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, [etapa, foto]);

  useEffect(() => {
    if (etapa === "gravacao") falar(INSTRUCAO_GRAVACAO);
    if (etapa === "carregando") falar(INSTRUCAO_CARREGANDO);
  }, [etapa]);

  useEffect(() => {
    if (etapa !== "carregando") return;
    setLento(false);
    const timer = setTimeout(() => setLento(true), TEMPO_LENTO_MS);
    return () => clearTimeout(timer);
  }, [etapa]);

  function novoBicho() {
    setErro(null);
    setFoto(null);
    setEtapa("captura");
  }

  function tirarFoto() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    setFoto(canvas.toDataURL("image/jpeg", 0.9));
  }

  async function processar(audio: Blob) {
    setEtapa("carregando");
    setErro(null);
    try {
      const form = new FormData();
      form.append("audio", new File([audio], "fala.webm", { type: audio.type }));
      const transcrito = await fetch("/api/transcrever", { method: "POST", body: form });
      if (!transcrito.ok) throw new Error("servidor");
      const { texto } = await transcrito.json();
      if (!texto?.trim()) {
        setErro(MENSAGEM_NAO_ENTENDI);
        falar(MENSAGEM_NAO_ENTENDI);
        setEtapa("gravacao");
        return;
      }

      const interpretado = await fetch("/api/interpretar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foto, transcricao: texto }),
      });
      if (!interpretado.ok) throw new Error("servidor");
      const dados = await interpretado.json();

      setTranscricao(texto);
      setVersoes(dados.versoes);
      setEtapa("escolha");
    } catch {
      setErro(MENSAGEM_SERVIDOR);
      falar(MENSAGEM_SERVIDOR);
      setEtapa("gravacao");
    }
  }

  async function iniciarGravacao() {
    pararVoz();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      trechosRef.current = [];
      recorder.ondataavailable = (e) => trechosRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(trechosRef.current, { type: recorder.mimeType });
        stream.getTracks().forEach((t) => t.stop());
        processar(blob);
      };
      recorder.start();
      recorderRef.current = recorder;
      setGravando(true);
    } catch {
      setErro("Não achei o microfone. Permita o acesso e tente de novo.");
    }
  }

  function pararGravacao() {
    if (!recorderRef.current || recorderRef.current.state === "inactive") return;
    recorderRef.current.stop();
    setGravando(false);
  }

  function atualizarBicho(atualizado: Bicho) {
    setBichos((anteriores) => {
      const novos = anteriores.map((b) => (b.id === atualizado.id ? atualizado : b));
      localStorage.setItem(CHAVE_BESTIARIO, JSON.stringify(novos));
      return novos;
    });
    setSelecionado(atualizado);
  }

  useEffect(() => {
    if (etapa !== "historia" || !selecionado || selecionado.historia || gerandoHistoria.current) return;
    gerandoHistoria.current = true;
    setHistoriaErro(null);
    fetch("/api/historia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: selecionado.nome,
        corpo: selecionado.corpo,
        bioma: selecionado.bioma,
        comportamentos: selecionado.comportamentos,
        transcricao: selecionado.transcricao,
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("servidor");
        return r.json();
      })
      .then(({ historia }) => atualizarBicho({ ...selecionado, historia }))
      .catch(() => setHistoriaErro(MENSAGEM_SERVIDOR))
      .finally(() => {
        gerandoHistoria.current = false;
      });
  }, [etapa, selecionado]);

  function salvarCarta() {
    if (!selecionado) return;
    const imagem = new Image();
    imagem.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(imagem, 60, 60, 680, 560);
      ctx.fillStyle = "#161616";
      ctx.font = "bold 64px system-ui, sans-serif";
      ctx.fillText(selecionado.nome, 60, 720);
      ctx.font = "32px system-ui, sans-serif";
      ctx.fillStyle = "#5c5c5c";
      ctx.fillText(selecionado.corpo.slice(0, 40), 60, 790);
      if (selecionado.bioma) ctx.fillText(selecionado.bioma, 60, 840);
      const link = document.createElement("a");
      link.download = `${selecionado.nome}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    imagem.src = selecionado.foto;
  }

  function escolher(versao: Versao) {
    if (!foto) return;
    const novo: Bicho = { ...versao, id: crypto.randomUUID(), foto, transcricao: transcricao ?? undefined };
    const novos = [...bichos, novo];
    setBichos(novos);
    localStorage.setItem(CHAVE_BESTIARIO, JSON.stringify(novos));
    setSelecionado(novo);
    setEscolhida(null);
    setEtapa("detalhe");
  }

  function abrirBicho(bicho: Bicho) {
    setSelecionado(bicho);
    setEtapa("detalhe");
  }

  return (
    <main>
      <h1>O bestiário do Samuel</h1>
      {erro && <p role="alert">{erro}</p>}

      {etapa === "bestiario" && (
        <section>
          {bichos.length === 0 ? (
            <p>{INSTRUCAO_BESTIARIO_VAZIO}</p>
          ) : (
            <div className="cartas">
              {bichos.map((b) => (
                <button key={b.id} className="carta" onClick={() => abrirBicho(b)}>
                  <img src={b.foto} alt={b.nome} />
                  <span className="nome">{b.nome}</span>
                </button>
              ))}
            </div>
          )}
          <div className="botoes">
            <button className="primario" onClick={novoBicho}>Novo bicho</button>
            {bichos.length > 0 && (
              <button onClick={() => setEtapa("zoologico")}>Zoológico</button>
            )}
          </div>
        </section>
      )}

      {etapa === "zoologico" && (
        <section>
          <div className="linha-voltar">
            <button className="link" onClick={() => setEtapa("bestiario")}>‹ Bestiário</button>
            <span>{bichos.length} criaturas</span>
          </div>
          {Object.entries(
            bichos.reduce<Record<string, Bicho[]>>((grupos, b) => {
              const chave = b.bioma?.trim() || "Ainda sem bioma";
              (grupos[chave] ??= []).push(b);
              return grupos;
            }, {}),
          ).map(([bioma, lista]) => (
            <div key={bioma} className="bioma">
              <h2>{bioma}</h2>
              <div className="cartas">
                {lista.map((b) => (
                  <button key={b.id} className="carta" onClick={() => abrirBicho(b)}>
                    <img src={b.foto} alt={b.nome} />
                    <span className="nome">{b.nome}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {etapa === "captura" && !foto && (
        <section>
          <div className="linha-voltar">
            <button className="link" onClick={() => setEtapa("bestiario")}>‹ Voltar</button>
            <button className="link" onClick={() => falar(INSTRUCAO_CAPTURA)}>ouvir</button>
          </div>
          <div className="moldura">
            <div className="guia">
              <video ref={videoRef} autoPlay playsInline muted />
            </div>
          </div>
          <p className="instrucao">
            <span className="ondas"><span /><span /><span /></span>
            {INSTRUCAO_CAPTURA}
          </p>
          <button className="obturador" onClick={tirarFoto} aria-label="Tirar foto" />
        </section>
      )}

      {etapa === "captura" && foto && (
        <section>
          <div className="moldura">
            <img className="foto" src={foto} alt="Foto do desenho" />
          </div>
          <div className="botoes">
            <button className="primario" onClick={() => setEtapa("gravacao")}>Usar esta foto</button>
            <button onClick={novoBicho}>Tirar de novo</button>
          </div>
        </section>
      )}

      {etapa === "gravacao" && (
        <section>
          <div className="linha-voltar">
            <button className="link" onClick={novoBicho}>‹ Voltar</button>
            <button className="link" onClick={novoBicho}>Refazer foto</button>
          </div>
          {foto && <img className="miniatura" src={foto} alt="Foto do desenho" />}
          <p>{INSTRUCAO_GRAVACAO}</p>
          {gravando ? (
            <button
              className="gravar gravando"
              onPointerUp={pararGravacao}
              onPointerLeave={pararGravacao}
            >
              Soltar
            </button>
          ) : (
            <button className="gravar" onPointerDown={iniciarGravacao}>
              Segure para falar
            </button>
          )}
          <button className="link" onClick={() => falar(INSTRUCAO_GRAVACAO)}>ouvir de novo</button>
        </section>
      )}

      {etapa === "carregando" && (
        <section>
          <div className="ovo" />
          <div className="progresso"><span /></div>
          <p>{lento ? MENSAGEM_LENTA : INSTRUCAO_CARREGANDO}</p>
        </section>
      )}

      {etapa === "escolha" && (
        <section>
          <div className="linha-voltar">
            <button className="link" onClick={() => setEtapa("gravacao")}>‹ Voltar</button>
          </div>
          <p>Qual você quer?</p>
          <div className="cartas">
            {versoes.map((v) => (
              <button
                key={v.nome}
                className={`carta ${escolhida?.nome === v.nome ? "selecionada" : ""}`}
                onClick={() => setEscolhida(v)}
              >
                <span className="resumo">{v.corpo}</span>
                <span className="nome">{v.nome}</span>
              </button>
            ))}
          </div>
          {escolhida && (
            <div className="botoes">
              <button className="primario" onClick={() => escolher(escolhida)}>
                Escolher {escolhida.nome}
              </button>
            </div>
          )}
          {transcricao && <p className="subtitulo">Você disse: &ldquo;{transcricao}&rdquo;</p>}
          <div className="botoes">
            <button onClick={() => setEtapa("gravacao")}>Contar de novo</button>
            <button onClick={novoBicho}>Redesenhar</button>
          </div>
        </section>
      )}

      {etapa === "detalhe" && selecionado && (
        <section>
          <div className="linha-voltar">
            <button className="link" onClick={() => setEtapa("bestiario")}>‹ Bestiário</button>
          </div>
          <img className="miniatura" src={selecionado.foto} alt={selecionado.nome} />
          <h2 className="cabecalho-bicho">{selecionado.nome}</h2>
          <p className="subtitulo">{selecionado.corpo}</p>
          <div className="tags">
            {selecionado.bioma && <span className="tag destaque">{selecionado.bioma}</span>}
            {selecionado.comportamentos.map((c) => (
              <span key={c} className="tag">{c}</span>
            ))}
          </div>
          <div className="botoes">
            <button onClick={() => setEtapa("carta")}>Ver carta</button>
            <button onClick={() => setEtapa("historia")}>História</button>
          </div>
          <div className="botoes">
            <button onClick={() => setEtapa("zoologico")}>Zoológico</button>
            <button className="primario" onClick={novoBicho}>Novo bicho</button>
          </div>
        </section>
      )}

      {etapa === "carta" && selecionado && (
        <section>
          <div className="linha-voltar">
            <button className="link" onClick={() => setEtapa("detalhe")}>‹ {selecionado.nome}</button>
            <button className="link" onClick={() => window.print()}>Imprimir</button>
          </div>
          <div className="carta-print moldura-carta">
            <img className="foto" src={selecionado.foto} alt={selecionado.nome} />
            <h2 className="cabecalho-bicho">{selecionado.nome}</h2>
            <p className="subtitulo">{selecionado.corpo}</p>
            {selecionado.bioma && <p className="subtitulo">{selecionado.bioma}</p>}
          </div>
          <div className="botoes">
            <button onClick={salvarCarta}>Salvar imagem</button>
          </div>
        </section>
      )}

      {etapa === "historia" && selecionado && (
        <section>
          <div className="linha-voltar">
            <button className="link" onClick={() => setEtapa("detalhe")}>‹ {selecionado.nome}</button>
          </div>
          <h2 className="cabecalho-bicho">A história do {selecionado.nome}</h2>
          {historiaErro && <p role="alert">{historiaErro}</p>}
          {!selecionado.historia && !historiaErro && (
            <p className="subtitulo">Contando a história...</p>
          )}
          {selecionado.historia && <p>{selecionado.historia}</p>}
          {selecionado.transcricao && (
            <div className="bloco-fala">
              <span className="subtitulo">O que você contou</span>
              <span>{selecionado.transcricao}</span>
            </div>
          )}
          <p className="subtitulo">Criado com IA</p>
        </section>
      )}
    </main>
  );
}
