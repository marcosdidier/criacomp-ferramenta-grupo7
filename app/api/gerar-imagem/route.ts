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
      prompt: `Cute illustrated creature for a children's bestiary game, digital art style, simple and colorful, white background, single character, front-facing, friendly expression: ${prompt}`,
      n: 1,
      size: "1024x1024",
    });

    const item = response.data?.[0];
    if (!item) throw new Error("sem imagem na resposta");

    // gpt-image retorna b64_json direto (não URL)
    const b64 = item.b64_json ?? item.url;
    if (!b64) throw new Error("sem dados na resposta");

    // Se veio b64_json, usa direto. Se veio URL, faz fetch.
    if (item.b64_json) {
      return Response.json({
        imagem: `data:image/png;base64,${item.b64_json}`,
      });
    }

    const imgResp = await fetch(item.url!);
    const buffer = Buffer.from(await imgResp.arrayBuffer());
    return Response.json({
      imagem: `data:image/png;base64,${buffer.toString("base64")}`,
    });
  } catch (e) {
    return Response.json(
      { erro: e instanceof Error ? e.message : "falha ao gerar imagem" },
      { status: 502 },
    );
  }
}
