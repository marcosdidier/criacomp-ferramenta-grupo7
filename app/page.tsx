"use client";

import { useEffect, useRef, useState } from "react";
import { PlusCircle, Map, Info, HelpCircle, ArrowLeft, Volume2, Camera, RefreshCw, Mic, BookOpen, Sparkles, Printer, Download, ChevronRight, Play, Trash2 } from "lucide-react";

type Etapa =
  | "tutorial"
  | "bestiario"
  | "zoologico"
  | "sobre"
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
  imagem_preview?: string;
  origem?: string;
  habilidade?: string;
  curiosidade?: string;
};

type Bicho = Versao & {
  id: string;
  foto: string;
  transcricao?: string;
  historia?: string;
  sprite?: string;
  spriteFallback?: boolean;
};

const APP_TOKEN = process.env.NEXT_PUBLIC_APP_SECRET ?? "";

function classeAnimacao(comportamentos: string[]): string {
  const primeiro = (comportamentos[0] ?? "").toLowerCase();
  if (primeiro.includes("voa") || primeiro.includes("flutua")) return "anima-voa";
  if (primeiro.includes("nada") || primeiro.includes("mergulh")) return "anima-nada";
  if (primeiro.includes("corre") || primeiro.includes("rápid") || primeiro.includes("veloz")) return "anima-corre";
  if (primeiro.includes("fogo") || primeiro.includes("lava") || primeiro.includes("cospe")) return "anima-fogo";
  return "anima-padrao";
}

function tipoBioma(nome: string): string {
  const n = nome.toLowerCase();
  if (n.includes("água") || n.includes("lago") || n.includes("mar") || n.includes("rio") || n.includes("oceano")) return "agua";
  if (n.includes("fogo") || n.includes("lava") || n.includes("vulc")) return "fogo";
  if (n.includes("floresta") || n.includes("selva") || n.includes("mata") || n.includes("jardim") || n.includes("cogumelo")) return "floresta";
  if (n.includes("gelo") || n.includes("neve") || n.includes("frio") || n.includes("glacial")) return "gelo";
  if (n.includes("noite") || n.includes("escur") || n.includes("sombr") || n.includes("caverna")) return "noite";
  return "default";
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  return { "x-app-token": APP_TOKEN, ...extra };
}

function imagemDo(b: { sprite?: string; imagem_preview?: string; foto: string }): string {
  return b.imagem_preview ?? b.sprite ?? b.foto;
}

const CHAVE_BESTIARIO = "bestiario-samuel";
const INSTRUCAO_BESTIARIO_VAZIO = "Oi! Desenha um bicho pra gente começar!";
const INSTRUCAO_CAPTURA = "Coloca o desenho dentro do quadrado.";
const INSTRUCAO_GRAVACAO = "Agora me conta como é o seu bicho! Segure o botão e fala.";
const ETAPAS_LOADING = [
  "Escutando o que você falou...",
  "Olhando o seu desenho...",
  "Inventando três versões do bicho...",
  "Pintando as cores de cada um...",
  "Quase lá! Só mais um toque...",
];
const MENSAGEM_NAO_ENTENDI = "Hum, não entendi, me conta de novo?";
const MENSAGEM_SERVIDOR = "O bestiário está dormindo, tenta daqui a pouco.";
// Loading agora usa passos visuais em vez de timer

let vozAtual: HTMLAudioElement | null = null;
let abortVoz: AbortController | null = null;

function pararVoz() {
  abortVoz?.abort();
  abortVoz = null;
  vozAtual?.pause();
  vozAtual = null;
}

async function falar(texto: string) {
  pararVoz();
  const controller = new AbortController();
  abortVoz = controller;
  try {
    const resposta = await fetch("/api/falar", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ texto }),
      signal: controller.signal,
    });
    if (!resposta.ok) return;
    const audio = new Audio(URL.createObjectURL(await resposta.blob()));
    vozAtual = audio;
    await audio.play().catch(() => {});
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return;
  }
}

const SLIDES_TUTORIAL = [
  {
    classe: "slide-desenha",
    frase: "Desenha um bicho!",
    descricao: "Pega um papel e canetinha e desenha o bicho mais maluco que você imaginar.",
  },
  {
    classe: "slide-conta",
    frase: "Conta como ele é!",
    descricao: "Segura o botão e fala: de onde ele veio, o que ele come, como ele se mexe...",
  },
  {
    classe: "slide-escolhe",
    frase: "Escolhe o seu favorito!",
    descricao: "A gente cria três versões com imagem. Você escolhe a que mais combina.",
  },
  {
    classe: "slide-zoo",
    frase: "Ele ganha vida no zoológico!",
    descricao: "Seu bicho entra no bestiário, se mexe, e pode até conversar com outros bichos.",
  },
];

export default function Home() {
  const [etapa, setEtapa] = useState<Etapa>("bestiario");
  const [bichos, setBichos] = useState<Bicho[]>([]);
  const [selecionado, setSelecionado] = useState<Bicho | null>(null);
  const [foto, setFoto] = useState<string | null>(null);
  const [transcricao, setTranscricao] = useState<string | null>(null);
  const [versoes, setVersoes] = useState<Versao[]>([]);
  const [escolhida, setEscolhida] = useState<Versao | null>(null);
  const [gravando, setGravando] = useState(false);
  // lento removido — loading agora usa passos visuais
  const [passoLoading, setPassoLoading] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [historiaErro, setHistoriaErro] = useState<string | null>(null);
  const [slideTutorial, setSlideTutorial] = useState(0);
  const [celebrando, setCelebrando] = useState(false);
  const [dialogoFalas, setDialogoFalas] = useState<{autor: string; texto: string}[]>([]);
  const [dialogoCarregando, setDialogoCarregando] = useState(false);
  const [posicoes, setPosicoes] = useState<Record<string, {x: number; y: number; dx: number; dy: number}>>({});
  const [parDialogo, setParDialogo] = useState<[string, string] | null>(null);
  const dialogoAtivo = useRef(false);
  const posRef = useRef(posicoes);
  const gerandoHistoria = useRef(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const trechosRef = useRef<Blob[]>([]);

  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE_BESTIARIO);
    if (salvo) setBichos(JSON.parse(salvo));
    const tutorialVisto = localStorage.getItem("tutorial-visto");
    if (!tutorialVisto) {
      setEtapa("tutorial");
      falar(SLIDES_TUTORIAL[0].frase);
    } else if (!salvo) {
      falar(INSTRUCAO_BESTIARIO_VAZIO);
    }
  }, []);

  useEffect(() => {
    if (etapa !== "captura" || foto) return;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } } })
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
    // loading voice handled by processar()
  }, [etapa]);

  useEffect(() => {
    if (etapa !== "carregando") return;
    setPassoLoading(0);
  }, [etapa]);

  function novoBicho() {
    setErro(null);
    setFoto(null);
    setTranscricao(null);
    setVersoes([]);
    setEscolhida(null);
    setEtapa("captura");
  }

  function tirarFoto() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    // Reduz resolução para caber no limite do serverless (~50-150KB base64)
    const maxLado = 640;
    const escala = Math.min(maxLado / video.videoWidth, maxLado / video.videoHeight, 1);
    canvas.width = Math.round(video.videoWidth * escala);
    canvas.height = Math.round(video.videoHeight * escala);
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    setFoto(canvas.toDataURL("image/jpeg", 0.6));
  }

  async function processar(audio: Blob) {
    setEtapa("carregando");
    setPassoLoading(0);
    setErro(null);
    try {
      // Passo 0: Transcrição
      falar(ETAPAS_LOADING[0]);
      const form = new FormData();
      form.append("audio", new File([audio], "fala.webm", { type: audio.type }));
      const transcrito = await fetch("/api/transcrever", { method: "POST", headers: authHeaders(), body: form });
      if (!transcrito.ok) throw new Error("servidor");
      const { texto } = await transcrito.json();
      if (!texto?.trim()) {
        setErro(MENSAGEM_NAO_ENTENDI);
        falar(MENSAGEM_NAO_ENTENDI);
        setEtapa("gravacao");
        return;
      }

      // Passo 1: Interpretação
      setPassoLoading(1);
      falar(ETAPAS_LOADING[1]);
      const interpretado = await fetch("/api/interpretar", {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ foto, transcricao: texto }),
      });
      if (!interpretado.ok) throw new Error("servidor");
      const dados = await interpretado.json();
      if (!dados.versoes?.length) throw new Error("servidor");

      // Passo 2: Inventando versões
      setPassoLoading(2);
      falar(ETAPAS_LOADING[2]);

      // Passo 3: Gerando sprites (bloqueia até todas ficarem prontas)
      setPassoLoading(3);
      falar(ETAPAS_LOADING[3]);
      const versoesComSprite = await Promise.all(
        (dados.versoes as Versao[]).map(async (v) => {
          try {
            const resp = await fetch("/api/gerar-imagem", {
              method: "POST",
              headers: authHeaders({ "Content-Type": "application/json" }),
              body: JSON.stringify({ prompt: v.prompt_sprite }),
            });
            if (resp.ok) {
              const { imagem } = await resp.json();
              return { ...v, imagem_preview: imagem };
            }
          } catch { /* fallback sem imagem */ }
          return v;
        }),
      );

      // Passo 4: Pronto
      setPassoLoading(4);
      falar(ETAPAS_LOADING[4]);
      setTranscricao(texto);
      setVersoes(versoesComSprite);

      // Pequena pausa dramática antes de mostrar
      await new Promise((r) => setTimeout(r, 800));
      falar("Escolhe o seu favorito!");
      setEtapa("escolha");
    } catch (e) {
      console.error("processar falhou:", e);
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

  function removerBicho(id: string) {
    setBichos((anteriores) => {
      const novos = anteriores.filter((b) => b.id !== id);
      localStorage.setItem(CHAVE_BESTIARIO, JSON.stringify(novos));
      return novos;
    });
    if (selecionado?.id === id) {
      setSelecionado(null);
      setEtapa("bestiario");
    }
  }

  useEffect(() => {
    if (etapa !== "historia" || !selecionado || selecionado.historia || gerandoHistoria.current) return;
    gerandoHistoria.current = true;
    setHistoriaErro(null);
    fetch("/api/historia", {
      method: "POST",
      headers: authHeaders({ "Content-Type": "application/json" }),
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
      const W = 600, H = 900;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Fundo branco limpo
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);

      // Triângulo colorido no canto superior esquerdo
      ctx.fillStyle = "#d4152f";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(60, 0);
      ctx.lineTo(0, 60);
      ctx.closePath();
      ctx.fill();

      // Tipo/bioma centralizado no topo
      ctx.fillStyle = "#888";
      ctx.font = "italic 13px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(selecionado.bioma ?? "Criatura", W / 2, 28);

      // Área da imagem com fundo suave
      ctx.fillStyle = "#f5f4ef";
      ctx.beginPath();
      ctx.roundRect(24, 44, W - 48, 280, 12);
      ctx.fill();

      // Sprite pixel art
      const imgSize = 220;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(imagem, (W - imgSize) / 2, 74, imgSize, imgSize);

      // Nome em bold uppercase
      ctx.fillStyle = "#161616";
      ctx.font = "bold 28px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(selecionado.nome.toUpperCase(), W / 2, 360);

      // Descrição
      ctx.fillStyle = "#5c5c5c";
      ctx.font = "14px system-ui, sans-serif";
      const descLinhas = selecionado.corpo.match(/.{1,45}/g) ?? [selecionado.corpo];
      descLinhas.slice(0, 2).forEach((linha, i) => {
        ctx.fillText(linha, W / 2, 385 + i * 20);
      });

      // Separador
      let y = 425;
      ctx.strokeStyle = "#eee";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(W - 30, y);
      ctx.stroke();
      y += 16;

      // Atributos
      const attrs: [string, string | undefined][] = [
        ["Origem", selecionado.origem],
        ["Habilidade", selecionado.habilidade],
        ["Curiosidade", selecionado.curiosidade],
        ["Comportamentos", selecionado.comportamentos.join(" / ")],
      ];
      for (const [label, valor] of attrs) {
        if (!valor) continue;
        ctx.fillStyle = "#d4152f";
        ctx.font = "bold 10px system-ui, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(label.toUpperCase(), 30, y);
        ctx.fillStyle = "#161616";
        ctx.font = "13px system-ui, sans-serif";
        const linhas = valor.match(/.{1,55}/g) ?? [valor];
        linhas.slice(0, 2).forEach((l, i) => {
          ctx.fillText(l, 30, y + 16 + i * 16);
        });
        y += 16 + Math.min(linhas.length, 2) * 16 + 12;
        ctx.strokeStyle = "#eee";
        ctx.beginPath();
        ctx.moveTo(30, y - 4);
        ctx.lineTo(W - 30, y - 4);
        ctx.stroke();
      }

      // Rodapé
      ctx.fillStyle = "#f5f4ef";
      ctx.fillRect(0, H - 32, W, 32);
      ctx.fillStyle = "#aaa";
      ctx.font = "bold 9px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("BESTIARIO DO SAMUEL", 16, H - 12);
      ctx.textAlign = "right";
      const num = (bichos.findIndex(b => b.id === selecionado.id) + 1).toString().padStart(3, "0");
      ctx.fillText(`#${num}`, W - 16, H - 12);

      const link = document.createElement("a");
      link.download = `${selecionado.nome}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    imagem.crossOrigin = "anonymous";
    imagem.src = imagemDo(selecionado);
  }

  async function gerarSprite(bicho: Bicho) {
    try {
      const resp = await fetch("/api/sprite", {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ prompt: bicho.prompt_sprite }),
      });
      if (!resp.ok) throw new Error("sprite falhou");
      const dados = await resp.json();
      if (dados.erro) throw new Error(dados.erro);
      const spriteUrl = dados.gif
        ? `data:image/gif;base64,${dados.gif}`
        : dados.urls?.[0] ?? null;
      if (spriteUrl) {
        atualizarBicho({ ...bicho, sprite: spriteUrl });
      } else {
        throw new Error("sem sprite");
      }
    } catch {
      atualizarBicho({ ...bicho, spriteFallback: true });
    }
  }

  function escolher(versao: Versao) {
    if (!foto) return;
    const novo: Bicho = { ...versao, id: crypto.randomUUID(), foto, transcricao: transcricao ?? undefined };
    const novos = [...bichos, novo];
    setBichos(novos);
    localStorage.setItem(CHAVE_BESTIARIO, JSON.stringify(novos));
    setSelecionado(novo);
    setEscolhida(null);
    setCelebrando(true);
    falar(`${novo.nome} nasceu! Que bicho incrível!`);
    setTimeout(() => {
      setCelebrando(false);
      setEtapa("detalhe");
    }, 2500);
    gerarSprite(novo);
  }

  function abrirBicho(bicho: Bicho) {
    setSelecionado(bicho);
    setEtapa("detalhe");
  }

  async function gerarDialogo(b1: Bicho, b2: Bicho) {
    const chave = `dialogo-${[b1.id, b2.id].sort().join("--")}`;
    const cached = localStorage.getItem(chave);
    if (cached) {
      setDialogoFalas(JSON.parse(cached));
      return;
    }
    setDialogoCarregando(true);
    try {
      const resp = await fetch("/api/dialogo", {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          bicho1: { nome: b1.nome, comportamentos: b1.comportamentos, bioma: b1.bioma },
          bicho2: { nome: b2.nome, comportamentos: b2.comportamentos, bioma: b2.bioma },
        }),
      });
      if (!resp.ok) throw new Error("servidor");
      const { falas } = await resp.json();
      localStorage.setItem(chave, JSON.stringify(falas));
      setDialogoFalas(falas);
    } catch {
      setDialogoFalas([]);
    } finally {
      setDialogoCarregando(false);
    }
  }

  // Inicializar posições dos sprites quando entra no zoológico
  useEffect(() => {
    if (etapa !== "zoologico" || bichos.length === 0) return;
    const novas: typeof posicoes = {};
    const MAPA_W = 580, GRAMA_TOPO = 200, MAPA_H = 420;
    bichos.forEach((b) => {
      if (!posRef.current[b.id]) {
        novas[b.id] = {
          x: 20 + Math.random() * (MAPA_W - 100),
          y: GRAMA_TOPO + Math.random() * (MAPA_H - GRAMA_TOPO - 80),
          dx: (Math.random() - 0.5) * 1.2,
          dy: (Math.random() - 0.5) * 1.2,
        };
      } else {
        novas[b.id] = posRef.current[b.id];
      }
    });
    setPosicoes(novas);
    posRef.current = novas;
    dialogoAtivo.current = false;
    setDialogoFalas([]);
    setParDialogo(null);
  }, [etapa, bichos.length]);

  // Loop de animação do zoológico
  useEffect(() => {
    if (etapa !== "zoologico" || bichos.length === 0) return;
    const MAPA_W = 580, GRAMA_TOPO = 200, MAPA_H = 420, SPRITE_SZ = 64, DIST_DIALOGO = 80;

    const intervalo = setInterval(() => {
      if (dialogoAtivo.current) return;

      setPosicoes((prev) => {
        const next = { ...prev };
        for (const b of bichos) {
          const p = next[b.id];
          if (!p) continue;
          let nx = p.x + p.dx;
          let ny = p.y + p.dy;
          let ndx = p.dx;
          let ndy = p.dy;
          if (nx < 0 || nx > MAPA_W - SPRITE_SZ) ndx = -ndx;
          if (ny < GRAMA_TOPO || ny > MAPA_H - SPRITE_SZ) ndy = -ndy;
          nx = Math.max(0, Math.min(MAPA_W - SPRITE_SZ, nx));
          ny = Math.max(GRAMA_TOPO, Math.min(MAPA_H - SPRITE_SZ, ny));
          next[b.id] = { x: nx, y: ny, dx: ndx, dy: ndy };
        }

        // Detecção de proximidade para diálogo automático
        if (!dialogoAtivo.current && bichos.length >= 2) {
          for (let i = 0; i < bichos.length; i++) {
            for (let j = i + 1; j < bichos.length; j++) {
              const pi = next[bichos[i].id];
              const pj = next[bichos[j].id];
              if (!pi || !pj) continue;
              const dist = Math.hypot(pi.x - pj.x, pi.y - pj.y);
              if (dist < DIST_DIALOGO) {
                dialogoAtivo.current = true;
                setParDialogo([bichos[i].id, bichos[j].id]);
                gerarDialogo(bichos[i], bichos[j]).then(() => {
                  setTimeout(() => {
                    dialogoAtivo.current = false;
                    setDialogoFalas([]);
                    setParDialogo(null);
                  }, 6000);
                });
                break;
              }
            }
            if (dialogoAtivo.current) break;
          }
        }

        posRef.current = next;
        return next;
      });
    }, 50);

    return () => clearInterval(intervalo);
  }, [etapa, bichos]);

  return (
    <main>
      <h1>O bestiário do Samuel</h1>
      {erro && <p role="alert">{erro}</p>}

      {etapa === "tutorial" && (
        <section className="tutorial">
          <div className={`slide-ilustracao ${SLIDES_TUTORIAL[slideTutorial].classe}`} />
          <h2 className="cabecalho-bicho">{SLIDES_TUTORIAL[slideTutorial].frase}</h2>
          <p className="subtitulo">{SLIDES_TUTORIAL[slideTutorial].descricao}</p>
          <div className="slide-dots">
            {SLIDES_TUTORIAL.map((_, i) => (
              <span key={i} className={`dot ${i === slideTutorial ? "ativo" : ""}`} />
            ))}
          </div>
          <div className="botoes">
            {slideTutorial < SLIDES_TUTORIAL.length - 1 ? (
              <button className="primario" onClick={() => {
                const proximo = slideTutorial + 1;
                setSlideTutorial(proximo);
                falar(SLIDES_TUTORIAL[proximo].frase);
              }}>
                Próximo <ChevronRight size={16} />
              </button>
            ) : (
              <button className="primario" onClick={() => {
                localStorage.setItem("tutorial-visto", "1");
                setSlideTutorial(0);
                setEtapa("bestiario");
                if (bichos.length === 0) falar(INSTRUCAO_BESTIARIO_VAZIO);
              }}>
                Começar!
              </button>
            )}
            <button className="link" onClick={() => {
              localStorage.setItem("tutorial-visto", "1");
              setSlideTutorial(0);
              setEtapa("bestiario");
            }}>
              Pular
            </button>
          </div>
        </section>
      )}

      {etapa === "bestiario" && (
        <section>
          {bichos.length === 0 ? (
            <div className="bestiario-vazio">
              <div className="slide-ilustracao slide-desenha" />
              <h2 className="cabecalho-bicho">Seu bestiário está vazio!</h2>
              <p className="subtitulo">Desenha um bicho no papel, tira uma foto e conta pra gente como ele é. A IA vai dar vida a ele!</p>
            </div>
          ) : (
            <div className="colecao">
              {bichos.map((b) => (
                <button key={b.id} className="colecao-card" onClick={() => abrirBicho(b)}>
                  <div className="colecao-img">
                    <img src={imagemDo(b)} alt={b.nome} className="sprite-img" />
                  </div>
                  <div className="colecao-info">
                    <span className="colecao-nome">{b.nome}</span>
                    {b.bioma && <span className="colecao-bioma">{b.bioma}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="botoes">
            <button className="primario" onClick={novoBicho}><PlusCircle size={18} /> Novo Bicho</button>
            {bichos.length > 0 && (
              <button onClick={() => setEtapa("zoologico")}><Map size={18} /> Zoológico</button>
            )}
          </div>
          <div className="botoes-secundarios">
            <button className="link" onClick={() => setEtapa("sobre")}><Info size={14} /> Sobre</button>
            <button className="link" onClick={() => setEtapa("tutorial")}><HelpCircle size={14} /> Tutorial</button>
          </div>
        </section>
      )}

      {etapa === "sobre" && (
        <section>
          <div className="linha-voltar">
            <button className="link" onClick={() => setEtapa("bestiario")}><ArrowLeft size={14} /> Bestiário</button>
          </div>
          <h2 className="cabecalho-bicho">Sobre</h2>
          <div className="bloco-sobre">
            <p>O Bestiário do Samuel</p>
            <p className="subtitulo">Ferramenta de Criatividade Computacional</p>
            <p className="subtitulo">IF866 &middot; CIn-UFPE &middot; 2026.2</p>
            <p className="subtitulo">Professor: Felipe Calegario</p>
            <div className="tags">
              <span className="tag">Júlia Andrade</span>
              <span className="tag">Daniel Dias</span>
              <span className="tag">Sofia Remides</span>
              <span className="tag">Marcos Didier</span>
              <span className="tag">Guilherme Muniz</span>
              <span className="tag">Gabriel Rocha</span>
            </div>
            <p className="subtitulo">
              Uma criança desenha um bicho, conta como ele é,
              e a IA dá vida a ele no zoológico digital.
            </p>
            <p className="subtitulo">Criado com IA (OpenAI)</p>
          </div>
        </section>
      )}

      {etapa === "zoologico" && (
        <section>
          <div className="linha-voltar">
            <button className="link" onClick={() => setEtapa("bestiario")}><ArrowLeft size={14} /> Bestiário</button>
            <span>{bichos.length} criaturas</span>
          </div>
          <div className="zoo-mapa">
            {bichos.map((b) => {
              const pos = posicoes[b.id];
              if (!pos) return null;
              const emDialogo = parDialogo?.includes(b.id);
              return (
                <div
                  key={b.id}
                  className={`zoo-criatura ${emDialogo ? "zoo-parada" : ""}`}
                  style={{ left: pos.x, top: pos.y }}
                  onClick={() => abrirBicho(b)}
                >
                  <img src={imagemDo(b)} alt={b.nome} className="sprite-img" />
                  <span className="zoo-nome">{b.nome}</span>
                  {emDialogo && dialogoFalas.length > 0 && (
                    <div className="zoo-balao">
                      {dialogoFalas
                        .filter((f) => f.autor === b.nome)
                        .slice(0, 1)
                        .map((f, i) => (
                          <span key={i}>{f.texto}</span>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
            {dialogoCarregando && (
              <div className="zoo-pensando">Os bichos estão conversando...</div>
            )}
          </div>
          {bichos.length < 2 && (
            <p className="subtitulo">Crie mais bichos para vê-los conversar!</p>
          )}
        </section>
      )}

      {etapa === "captura" && !foto && (
        <section>
          <div className="linha-voltar">
            <button className="link" onClick={() => setEtapa("bestiario")}><ArrowLeft size={14} /> Voltar</button>
            <button className="link" onClick={() => falar(INSTRUCAO_CAPTURA)}><Volume2 size={14} /> Ouvir</button>
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
            <button className="link" onClick={novoBicho}><ArrowLeft size={14} /> Voltar</button>
            <button className="link" onClick={novoBicho}><Camera size={14} /> Refazer Foto</button>
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
          <button className="link" onClick={() => falar(INSTRUCAO_GRAVACAO)}><Volume2 size={14} /> Ouvir de novo</button>
        </section>
      )}

      {etapa === "carregando" && (
        <section className="tela-loading">
          <div className={`ovo-container ovo-fase-${Math.min(passoLoading, 4)}`}>
            <div className="ovo" />
            {passoLoading >= 2 && <div className="ovo-racha ovo-racha-1" />}
            {passoLoading >= 3 && <div className="ovo-racha ovo-racha-2" />}
            {passoLoading >= 3 && <div className="ovo-racha ovo-racha-3" />}
            {passoLoading >= 4 && <div className="ovo-brilho" />}
          </div>
          <p className="loading-msg">{ETAPAS_LOADING[Math.min(passoLoading, 4)]}</p>
          <div className="loading-passos">
            {ETAPAS_LOADING.map((_, i) => (
              <div key={i} className={`loading-dot ${i < passoLoading ? "feito" : i === passoLoading ? "ativo" : ""}`} />
            ))}
          </div>
        </section>
      )}

      {etapa === "escolha" && (
        <section>
          <div className="linha-voltar">
            <button className="link" onClick={() => setEtapa("gravacao")}><ArrowLeft size={14} /> Voltar</button>
          </div>
          <p>Qual você quer?</p>
          <div className="cartas escolha-cartas">
            {versoes.map((v) => (
              <button
                key={v.nome}
                className={`carta carta-escolha ${escolhida?.nome === v.nome ? "selecionada" : ""}`}
                onClick={() => setEscolhida(v)}
              >
                {v.imagem_preview ? (
                  <img src={v.imagem_preview} alt={v.nome} className="preview-img" />
                ) : (
                  <div className="preview-placeholder" />
                )}
                <div className="escolha-info">
                  <span className="nome">{v.nome}</span>
                  <span className="resumo">{v.corpo}</span>
                  {v.bioma && <span className="tag destaque">{v.bioma}</span>}
                  <div className="tags-mini">
                    {v.comportamentos.map((c) => (
                      <span key={c} className="tag-mini">{c}</span>
                    ))}
                  </div>
                </div>
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
            <button onClick={() => setEtapa("gravacao")}><Mic size={16} /> Contar de Novo</button>
            <button onClick={novoBicho}><RefreshCw size={16} /> Redesenhar</button>
          </div>
        </section>
      )}

      {celebrando && selecionado && (
        <section className="celebracao">
          <div className="confete-container">
            {Array.from({ length: 20 }, (_, i) => (
              <span
                key={i}
                className="confete"
                style={{
                  left: `${10 + (i * 4.2) % 80}%`,
                  animationDelay: `${(i * 0.07) % 0.5}s`,
                  background: ["#d4152f","#ffd700","#00c853","#2979ff","#ff6d00"][i % 5],
                }}
              />
            ))}
          </div>
          <h2 className="cabecalho-bicho celebra-nome">{selecionado.nome} nasceu!</h2>
          {selecionado.imagem_preview && (
            <img className="celebra-img" src={selecionado.imagem_preview} alt={selecionado.nome} />
          )}
        </section>
      )}

      {etapa === "detalhe" && selecionado && (
        <section>
          <div className="linha-voltar">
            <button className="link" onClick={() => setEtapa("bestiario")}>‹ Bestiário</button>
          </div>
          <img className="miniatura sprite-img" src={imagemDo(selecionado)} alt={selecionado.nome} />
          <h2 className="cabecalho-bicho">{selecionado.nome}</h2>
          <p className="subtitulo">{selecionado.corpo}</p>
          <div className="tags">
            {selecionado.bioma && <span className="tag destaque">{selecionado.bioma}</span>}
            {selecionado.comportamentos.map((c) => (
              <span key={c} className="tag">{c}</span>
            ))}
          </div>
          <div className="botoes">
            <button onClick={() => setEtapa("carta")}><BookOpen size={16} /> Ver Carta</button>
            <button onClick={() => setEtapa("historia")}><Sparkles size={16} /> História</button>
          </div>
          <div className="botoes">
            <button onClick={() => setEtapa("zoologico")}><Map size={16} /> Zoológico</button>
            <button className="primario" onClick={novoBicho}><PlusCircle size={16} /> Novo Bicho</button>
          </div>
          <button className="link perigo" onClick={() => { if (confirm(`Remover ${selecionado.nome} do bestiário?`)) removerBicho(selecionado.id); }}>
            <Trash2 size={14} /> Remover do Bestiário
          </button>
        </section>
      )}

      {etapa === "carta" && selecionado && (
        <section>
          <div className="linha-voltar">
            <button className="link" onClick={() => setEtapa("detalhe")}>&#8249; {selecionado.nome}</button>
            <button className="link" onClick={() => window.print()}><Printer size={14} /> Imprimir</button>
          </div>
          <div className="carta-print carta-game">
            <div className="carta-topo">
              <span className="carta-tipo">{selecionado.bioma ?? "Criatura"}</span>
            </div>
            <div className="carta-img-area">
              <img src={imagemDo(selecionado)} alt={selecionado.nome} className="sprite-img" />
            </div>
            <h2 className="carta-nome">{selecionado.nome}</h2>
            <p className="carta-corpo">{selecionado.corpo}</p>
            <div className="carta-atributos">
              {selecionado.origem && (
                <div className="carta-attr">
                  <span className="carta-attr-label">Origem</span>
                  <span className="carta-attr-valor">{selecionado.origem}</span>
                </div>
              )}
              {selecionado.habilidade && (
                <div className="carta-attr">
                  <span className="carta-attr-label">Habilidade</span>
                  <span className="carta-attr-valor">{selecionado.habilidade}</span>
                </div>
              )}
              {selecionado.curiosidade && (
                <div className="carta-attr">
                  <span className="carta-attr-label">Curiosidade</span>
                  <span className="carta-attr-valor">{selecionado.curiosidade}</span>
                </div>
              )}
              {selecionado.comportamentos.length > 0 && (
                <div className="carta-attr">
                  <span className="carta-attr-label">Comportamentos</span>
                  <span className="carta-attr-valor">{selecionado.comportamentos.join(" / ")}</span>
                </div>
              )}
            </div>
            <div className="carta-rodape">
              <span>Bestiário do Samuel</span>
              <span>#{(bichos.findIndex(b => b.id === selecionado.id) + 1).toString().padStart(3, "0")}</span>
            </div>
          </div>
          <div className="botoes">
            <button onClick={salvarCarta}><Download size={16} /> Salvar Imagem</button>
          </div>
        </section>
      )}

      {etapa === "historia" && selecionado && (
        <section className="tela-historia">
          <div className="linha-voltar">
            <button className="link" onClick={() => setEtapa("detalhe")}>&#8249; {selecionado.nome}</button>
          </div>
          <img className="miniatura sprite-img" src={imagemDo(selecionado)} alt={selecionado.nome} />
          <h2 className="cabecalho-bicho">A história do {selecionado.nome}</h2>
          {historiaErro && <p role="alert">{historiaErro}</p>}
          {!selecionado.historia && !historiaErro && (
            <p className="subtitulo">Contando a história...</p>
          )}
          {selecionado.historia && (
            <>
              <div className="bloco-historia">
                <p>{selecionado.historia}</p>
              </div>
              <button className="primario" onClick={() => falar(selecionado.historia!)}>
                <Play size={16} /> Ler em Voz Alta
              </button>
            </>
          )}
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
