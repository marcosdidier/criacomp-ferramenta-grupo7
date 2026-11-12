import OpenAI from "openai";
import { verificar } from "../_seguranca";

export const runtime = "nodejs";

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
      model: "dall-e-3",
      prompt: `Cute illustrated creature for a children's game, digital art style, simple and colorful, white background, single character, front-facing, friendly expression: ${prompt}`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });
    const url = response.data?.[0]?.url;
    if (!url) throw new Error("sem url na resposta");

    const imgResp = await fetch(url);
    const buffer = Buffer.from(await imgResp.arrayBuffer());
    const base64 = buffer.toString("base64");

    return Response.json({
      imagem: `data:image/png;base64,${base64}`,
    });
  } catch (e) {
    return Response.json(
      { erro: e instanceof Error ? e.message : "falha ao gerar imagem" },
      { status: 502 },
    );
  }
}
