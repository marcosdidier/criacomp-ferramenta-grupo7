"use client";

import { useEffect, useRef, useState } from "react";

type Etapa = "captura" | "gravacao" | "carregando" | "escolha" | "escolhido";

type Versao = {
  nome: string;
  corpo: string;
  cores: string[];
  comportamentos: string[];
  prompt_sprite: string;
};

const INSTRUCAO_CAPTURA = "Coloca o desenho dentro do quadrado.";
const INSTRUCAO_GRAVACAO = "Agora me conta como é o seu bicho! Segure o botão e fala.";
const INSTRUCAO_CARREGANDO = "Seu bicho está nascendo...";

async function falar(texto: string) {
  const resposta = await fetch("/api/falar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texto }),
  });
  if (!resposta.ok) return;
  const audio = new Audio(URL.createObjectURL(await resposta.blob()));
  await audio.play().catch(() => {});
}

export default function Home() {
  const [etapa, setEtapa] = useState<Etapa>("captura");
  const [foto, setFoto] = useState<string | null>(null);
  const [transcricao, setTranscricao] = useState<string | null>(null);
  const [versoes, setVersoes] = useState<Versao[]>([]);
  const [escolhida, setEscolhida] = useState<Versao | null>(null);
  const [gravando, setGravando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const trechosRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (etapa !== "captura" || foto) return;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setErro("Não achei a câmera. Permita o acesso e tente de novo."));
    falar(INSTRUCAO_CAPTURA);
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, [etapa, foto]);

  useEffect(() => {
    if (etapa === "gravacao") falar(INSTRUCAO_GRAVACAO);
    if (etapa === "carregando") falar(INSTRUCAO_CARREGANDO);
  }, [etapa]);

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
      const { texto } = await transcrito.json();
      if (!transcrito.ok) throw new Error(texto ?? "falha na transcrição");

      const interpretado = await fetch("/api/interpretar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foto, transcricao: texto }),
      });
      const dados = await interpretado.json();
      if (!interpretado.ok) throw new Error(dados.erro ?? "falha na interpretação");

      setTranscricao(texto);
      setVersoes(dados.versoes);
      setEtapa("escolha");
    } catch (e) {
      setErro(`Algo deu errado: ${e instanceof Error ? e.message : "erro desconhecido"}`);
      setEtapa("gravacao");
    }
  }

  async function iniciarGravacao() {
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

  function refazerFoto() {
    setFoto(null);
    setVersoes([]);
    setEscolhida(null);
    setEtapa("captura");
  }

  return (
    <main>
      <h1>O bestiário do Samuel</h1>
      {erro && <p role="alert">{erro}</p>}

      {etapa === "captura" && !foto && (
        <section>
          <div className="linha-voltar">
            <span />
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
            <button onClick={refazerFoto}>Tirar de novo</button>
          </div>
        </section>
      )}

      {etapa === "gravacao" && (
        <section>
          <div className="linha-voltar">
            <button className="link" onClick={refazerFoto}>‹ Voltar</button>
            <button className="link" onClick={refazerFoto}>Refazer foto</button>
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
          <p>{INSTRUCAO_CARREGANDO}</p>
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
              <button className="primario" onClick={() => setEtapa("escolhido")}>
                Escolher {escolhida.nome}
              </button>
            </div>
          )}
          {transcricao && <p className="subtitulo">Você disse: &ldquo;{transcricao}&rdquo;</p>}
          <div className="botoes">
            <button onClick={() => setEtapa("gravacao")}>Contar de novo</button>
            <button onClick={refazerFoto}>Redesenhar</button>
          </div>
        </section>
      )}

      {etapa === "escolhido" && escolhida && (
        <section>
          <div className="linha-voltar">
            <button className="link" onClick={() => setEtapa("escolha")}>‹ Voltar</button>
          </div>
          {foto && <img className="miniatura" src={foto} alt="Foto do desenho" />}
          <h2 className="cabecalho-bicho">{escolhida.nome}</h2>
          <p className="subtitulo">{escolhida.corpo}</p>
          <div className="tags">
            {escolhida.comportamentos.map((c) => (
              <span key={c} className="tag">{c}</span>
            ))}
          </div>
          <p className="subtitulo">O sprite animado ainda não está ligado nesta tela.</p>
          <div className="botoes">
            <button className="primario" onClick={refazerFoto}>Começar outro bicho</button>
          </div>
        </section>
      )}
    </main>
  );
}
