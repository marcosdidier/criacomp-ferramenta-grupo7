import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const audio = form.get("audio");
  if (!(audio instanceof File)) {
    return Response.json({ erro: "áudio ausente" }, { status: 400 });
  }

  const openai = new OpenAI();
  const resultado = await openai.audio.transcriptions.create({
    model: "gpt-transcribe",
    file: audio,
  });

  return Response.json({ texto: resultado.text });
}
