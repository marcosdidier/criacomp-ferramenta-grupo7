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
    const estilos = [
      "chibi style with oversized head and tiny body",
      "fierce battle-ready pose with glowing eyes",
      "sleepy and relaxed, curled up cutely",
      "mid-jump with motion blur on limbs",
      "wearing a tiny crown and looking regal",
      "baby version with huge innocent eyes",
      "armored with leaf or stone plates",
      "ghostly translucent with glowing outline",
      "muscular and heroic with cape flowing",
      "fluffy and round like a plushie",
    ];
    const cores = [
      "with neon accent highlights",
      "in warm sunset color palette (orange, pink, gold)",
      "in cool ocean tones (teal, cyan, deep blue)",
      "with rainbow iridescent shimmer",
      "in earthy natural tones (moss, clay, bark)",
      "with high contrast black and bright accent",
      "in pastel candy colors",
      "with fire and lava color accents (red, orange, black)",
    ];
    const detalhes = [
      "Add sparkle particles around it.",
      "Give it a tiny companion creature on its shoulder.",
      "Add elemental effects: small flames, water drops, or leaves floating.",
      "Make its eyes glow with inner light.",
      "Add pixel art motion lines showing speed or energy.",
      "Give it an unusual hat or accessory.",
      "Add a magical aura or energy ring.",
      "Make one feature exaggeratedly large (ears, tail, horns).",
    ];
    const estilo = estilos[Math.floor(Math.random() * estilos.length)];
    const cor = cores[Math.floor(Math.random() * cores.length)];
    const detalhe = detalhes[Math.floor(Math.random() * detalhes.length)];
    const variacao = `${estilo}, ${cor}. ${detalhe}`;

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
