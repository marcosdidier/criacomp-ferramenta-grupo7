import OpenAI from "openai";
import { verificar } from "../_seguranca";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const bloqueio = verificar(req);
  if (bloqueio) return bloqueio;

  const form = await req.formData();
  const audio = form.get("audio");
  if (!(audio instanceof File)) {
    return Response.json({ erro: "áudio ausente" }, { status: 400 });
  }

  try {
    const openai = new OpenAI();
    const resultado = await openai.audio.transcriptions.create({
      model: "gpt-transcribe",
      file: audio,
      language: "pt",
    });
    return Response.json({ texto: resultado.text });
  } catch {
    return Response.json({ erro: "falha na transcrição" }, { status: 502 });
  }
}
