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
    const openai = new OpenAI();
    const response = await openai.images.generate({
      model: "gpt-image-1-mini",
      prompt: `Pixel art sprite for a children's game bestiary. 64x64 style upscaled. Side view, single creature, vibrant colors, transparent background, no ground, no shadow. Clean pixel edges. ${prompt}`,
      n: 1,
      size: "512x512",
      background: "transparent",
    });

    const item = response.data?.[0];
    if (!item) throw new Error("sem imagem na resposta");

    if (item.b64_json) {
      return Response.json({ imagem: `data:image/png;base64,${item.b64_json}` });
    }
    if (item.url) {
      const imgResp = await fetch(item.url);
      const buffer = Buffer.from(await imgResp.arrayBuffer());
      return Response.json({ imagem: `data:image/png;base64,${buffer.toString("base64")}` });
    }
    throw new Error("sem dados na resposta");
  } catch (e) {
    return Response.json(
      { erro: e instanceof Error ? e.message : "falha ao gerar imagem" },
      { status: 502 },
    );
  }
}
