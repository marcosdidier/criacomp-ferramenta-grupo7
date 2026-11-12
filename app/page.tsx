"use client";

import { useEffect, useRef, useState } from "react";

type Etapa = "captura" | "gravacao" | "pronto";

const INSTRUCAO_CAPTURA = "Coloca o desenho dentro do quadrado.";
const INSTRUCAO_GRAVACAO = "Agora me conta como é o seu bicho! Segure o botão e fala.";

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
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
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

  async function iniciarGravacao() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      trechosRef.current = [];
      recorder.ondataavailable = (e) => trechosRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(trechosRef.current, { type: recorder.mimeType });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
        setEtapa("pronto");
      };
      recorder.start();
      recorderRef.current = recorder;
      setGravando(true);
    } catch {
      setErro("Não achei o microfone. Permita o acesso e tente de novo.");
    }
  }

  function pararGravacao() {
    recorderRef.current?.stop();
    setGravando(false);
  }

  function refazerFoto() {
    setFoto(null);
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

      {etapa === "pronto" && (
        <section>
          <p>Gravação pronta.</p>
          {audioUrl && <audio controls src={audioUrl} />}
          <div>
            <button onClick={() => { setAudioUrl(null); setEtapa("gravacao"); }}>
              Gravar de novo
            </button>
            <button onClick={refazerFoto}>Começar outro bicho</button>
          </div>
        </section>
      )}
    </main>
  );
}
