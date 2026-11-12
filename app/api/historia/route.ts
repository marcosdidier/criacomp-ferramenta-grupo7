import OpenAI from "openai";
import { verificar } from "../_seguranca";

export const runtime = "nodejs";

const INSTRUCOES = `Escreva uma história em português do Brasil para uma criança de 6 a 9 anos, sobre o bicho descrito abaixo.

Regras:
- 8 a 12 frases, com tom divertido e carinhoso.
- Inclua diálogo: o bicho fala (com a personalidade dele, baseada nos comportamentos) e encontra pelo menos um outro personagem.
- Dê ao bicho uma personalidade clara baseada nos comportamentos listados.
- Crie um pequeno arco: apresentação do bicho no bioma dele, um desafio ou aventura, e uma resolução feliz.
- Use linguagem simples, frases curtas, e palavras que uma criança de 7 anos entende.
- Use somente o que está na descrição (nome, corpo, bioma, comportamentos e o que a criança contou). Não invente detalhes que não aparecem ali.
- Responda apenas com o texto da história, sem título e sem aspas.`;

export async function POST(req: Request) {
  const bloqueio = verificar(req);
  if (bloqueio) return bloqueio;

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

  try {
    const openai = new OpenAI();
    const resposta = await openai.responses.create({
      model: "gpt-6-luna",
      input: `${INSTRUCOES}\n\n${descricao}`,
    });
    return Response.json({ historia: resposta.output_text.trim() });
  } catch {
    return Response.json({ erro: "falha ao gerar história" }, { status: 502 });
  }
}
