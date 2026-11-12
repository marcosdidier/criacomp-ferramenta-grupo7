import OpenAI from "openai";

export const runtime = "nodejs";

const INSTRUCOES = `Escreva uma historinha curta em português do Brasil para uma criança de 6 a 9 anos, sobre o bicho descrito abaixo.
Use 4 a 6 frases simples, com tom divertido e carinhoso.
Use somente o que está na descrição (nome, corpo, bioma, comportamentos e o que a criança contou). Não invente detalhes que não aparecem ali.
Responda apenas com o texto da história, sem título e sem aspas.`;

export async function POST(req: Request) {
  const { nome, corpo, bioma, comportamentos, transcricao } = (await req.json()) as {
    nome?: string;
    corpo?: string;
    bioma?: string;
    comportamentos?: string[];
    transcricao?: string;
  };
  if (!nome || !corpo || !transcricao) {
    return Response.json({ erro: "dados do bicho são obrigatórios" }, { status: 400 });
  }

  const descricao = [
    `Nome: ${nome}`,
    `Corpo: ${corpo}`,
    bioma ? `Bioma: ${bioma}` : null,
    comportamentos?.length ? `Comportamentos: ${comportamentos.join(", ")}` : null,
    `O que a criança contou: "${transcricao}"`,
  ]
    .filter(Boolean)
    .join("\n");

  const openai = new OpenAI();
  const resposta = await openai.responses.create({
    model: "gpt-6-luna",
    input: `${INSTRUCOES}\n\n${descricao}`,
  });

  return Response.json({ historia: resposta.output_text.trim() });
}
