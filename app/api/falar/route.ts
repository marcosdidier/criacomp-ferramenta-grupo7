import OpenAI from "openai";

export const runtime = "nodejs";

const VIBE = `Accent/Affect: Brazilian Portuguese (pt-BR), natural and friendly, with a light magical twinkle. Not formal.
Tone: Warm, playful and encouraging, like a friend who is discovering something exciting together with the child.
Pacing: Slow at the start, building up. Pause for a moment after "nascendo..." to create suspense, then speed up slightly on the good news.
Emotion: Curious, surprised and delighted. Show wonder, as if the creature is being born right now.
Pronunciation: Clear and easy to follow for a child.
Personality Affect: Playful, kind and a little silly. Makes the child feel that their drawing matters.`;

export async function POST(req: Request) {
  const { texto } = (await req.json()) as { texto?: string };
  if (!texto) {
    return Response.json({ erro: "texto é obrigatório" }, { status: 400 });
  }

  const openai = new OpenAI();
  const audio = await openai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: "marin",
    input: texto,
    instructions: VIBE,
    response_format: "mp3",
  });

  return new Response(audio.body, {
    headers: { "Content-Type": "audio/mpeg" },
  });
}
