import OpenAI from "openai";

export const runtime = "nodejs";

const INSTRUCOES = `Você recebe a foto de um desenho feito por uma criança de 6 a 9 anos e a descrição falada que ela fez do bicho.
Responda somente com JSON no formato:
{"versoes":[{"nome":string,"corpo":string,"cores":string[],"comportamentos":string[],"prompt_sprite":string},{...},{...}]}
Gere exatamente 3 versões em português, fiéis ao desenho e à fala, sem inventar detalhes que não aparecem nos dois.`;

export async function POST(req: Request) {
  const { foto, transcricao } = (await req.json()) as {
    foto?: string;
    transcricao?: string;
  };
  if (!foto || !transcricao) {
    return Response.json({ erro: "foto e transcricao são obrigatórias" }, { status: 400 });
  }

  const openai = new OpenAI();
  const resposta = await openai.responses.create({
    model: "gpt-6-luna",
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: `${INSTRUCOES}\n\nDescrição da criança: "${transcricao}"` },
          { type: "input_image", image_url: foto, detail: "auto" },
        ],
      },
    ],
  });

  try {
    return Response.json(JSON.parse(resposta.output_text));
  } catch {
    return Response.json({ erro: "resposta inválida da IA" }, { status: 502 });
  }
}
