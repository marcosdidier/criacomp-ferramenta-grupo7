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
          <p>{INSTRUCAO_CAPTURA}</p>
          <video ref={videoRef} autoPlay playsInline muted width={480} />
          <div>
            <button onClick={tirarFoto}>Tirar foto</button>
            <button onClick={() => falar(INSTRUCAO_CAPTURA)}>Ouvir de novo</button>
          </div>
        </section>
      )}

      {etapa === "captura" && foto && (
        <section>
          <img src={foto} alt="Foto do desenho" width={320} />
          <div>
            <button onClick={() => setEtapa("gravacao")}>Usar esta foto</button>
            <button onClick={refazerFoto}>Tirar de novo</button>
          </div>
        </section>
      )}

      {etapa === "gravacao" && (
        <section>
          {foto && <img src={foto} alt="Foto do desenho" width={120} />}
          <p>{INSTRUCAO_GRAVACAO}</p>
          {gravando ? (
            <button onPointerUp={pararGravacao} onPointerLeave={pararGravacao}>
              Soltar para terminar
            </button>
          ) : (
            <button onPointerDown={iniciarGravacao}>Segurar para falar</button>
          )}
          <div>
            <button onClick={() => falar(INSTRUCAO_GRAVACAO)}>Ouvir de novo</button>
            <button onClick={refazerFoto}>Refazer foto</button>
          </div>
        </section>
      )}

      {etapa === "carregando" && (
        <section>
          <p>{INSTRUCAO_CARREGANDO}</p>
        </section>
      )}

      {etapa === "escolha" && (
        <section>
          <p>Olha só! Nasceram três bichos. Qual você escolhe?</p>
          {transcricao && <p>Você disse: &ldquo;{transcricao}&rdquo;</p>}
          <ul>
            {versoes.map((v) => (
              <li key={v.nome}>
                <h2>{v.nome}</h2>
                <p>Corpo: {v.corpo}</p>
                <p>Cores: {v.cores.join(", ")}</p>
                <p>Comportamentos: {v.comportamentos.join(", ")}</p>
                <button
                  onClick={() => {
                    setEscolhida(v);
                    setEtapa("escolhido");
                  }}
                >
                  Escolher {v.nome}
                </button>
              </li>
            ))}
          </ul>
          <button onClick={refazerFoto}>Redesenhar</button>
        </section>
      )}

      {etapa === "escolhido" && escolhida && (
        <section>
          <h2>{escolhida.nome} entrou no bestiário!</h2>
          <p>O sprite animado ainda não está ligado nesta tela.</p>
          <button onClick={refazerFoto}>Começar outro bicho</button>
        </section>
      )}
    </main>
  );
}
