import OpenAI from "openai";
import { verificar } from "../_seguranca";

export const runtime = "nodejs";

const INSTRUCOES = `Dois bichos do bestiário se encontraram! Escreva um diálogo curto (2-3 falas cada) entre eles, em português do Brasil, com tom divertido e infantil.
Use a personalidade de cada bicho (baseada nos comportamentos).
Formato da resposta: JSON com {"falas": [{"autor": "nome", "texto": "fala"}, ...]}
Máximo 6 falas no total.`;

function limparJSON(texto: string): string {
  const m = texto.match(/```(?:json)?\s*([\s\S]*?)```/);
  return m ? m[1].trim() : texto.trim();
}

export async function POST(req: Request) {
  const bloqueio = verificar(req);
  if (bloqueio) return bloqueio;

  const { bicho1, bicho2 } = (await req.json()) as {
    bicho1?: { nome: string; comportamentos: string[]; bioma?: string };
    bicho2?: { nome: string; comportamentos: string[]; bioma?: string };
  };

  if (!bicho1?.nome || !bicho2?.nome) {
    return Response.json({ erro: "dados dos dois bichos são obrigatórios" }, { status: 400 });
  }

  const descricao = `Bicho 1: ${bicho1.nome} (comportamentos: ${bicho1.comportamentos.join(", ")}${bicho1.bioma ? `, bioma: ${bicho1.bioma}` : ""})
Bicho 2: ${bicho2.nome} (comportamentos: ${bicho2.comportamentos.join(", ")}${bicho2.bioma ? `, bioma: ${bicho2.bioma}` : ""})`;

  try {
    const openai = new OpenAI();
    const resposta = await openai.responses.create({
      model: "gpt-6-luna",
      input: `${INSTRUCOES}\n\n${descricao}`,
    });
    const json = JSON.parse(limparJSON(resposta.output_text));
    return Response.json(json);
  } catch {
    return Response.json({ erro: "falha ao gerar diálogo" }, { status: 502 });
  }
}
