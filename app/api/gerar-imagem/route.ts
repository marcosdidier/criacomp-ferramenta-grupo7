import OpenAI from "openai";
import { verificar } from "../_seguranca";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const bloqueio = verificar(req);
  if (bloqueio) return bloqueio;

  const { prompt } = (await req.json()) as { prompt?: string };
  if (!prompt) {
    return Response.json({ erro: "prompt é obrigatório" }, { status: 400 });
  }

  try {
    const variacoes = [
      "Add a surprising twist: an unexpected accessory, unusual marking, or quirky detail that makes this creature unique and memorable.",
      "Give this creature extra personality: an exaggerated expression, a fun pose, or a small detail that tells a story.",
      "Make it slightly wilder than expected: bolder colors, more dynamic shape, or an extra feature that surprises.",
      "Add charm: a tiny imperfection, an asymmetric detail, or something that makes it feel handmade and alive.",
      "Reimagine it playfully: stretch proportions, add sparkle or glow effects, make it feel magical.",
    ];
    const variacao = variacoes[Math.floor(Math.random() * variacoes.length)];

    const openai = new OpenAI();
    const response = await openai.images.generate({
      model: "gpt-image-1-mini",
      prompt: `16-bit pixel art game sprite, retro RPG style like Pokemon or Stardew Valley. ONLY the creature, absolutely nothing else — no background, no ground, no shadow, no scenery, no environment, no grass, no platform. The creature floats centered on a completely transparent empty canvas. Crisp pixel edges, vibrant saturated colors, cute proportions. ${variacao} ${prompt}`,
      n: 1,
      size: "1024x1024",
      output_format: "webp",
      background: "transparent",
    });

    const item = response.data?.[0];
    if (!item) throw new Error("sem imagem na resposta");

    // b64_json em 256x256 e bem menor (~100-200KB)
    if (item.b64_json) {
      return Response.json({ imagem: `data:image/webp;base64,${item.b64_json}` });
    }
    if (item.url) {
      return Response.json({ imagem: item.url });
    }
    throw new Error("sem dados na resposta");
  } catch (e) {
    return Response.json(
      { erro: e instanceof Error ? e.message : "falha ao gerar imagem" },
      { status: 502 },
    );
  }
}
