import OpenAI from "openai";
import { verificar } from "../_seguranca";

export const runtime = "nodejs";

const INSTRUCOES = `Você recebe a foto de um desenho feito por uma criança de 6 a 9 anos e a descrição falada que ela fez do bicho.
Responda somente com JSON no formato:
{"versoes":[{"nome":string,"corpo":string,"cores":string[],"comportamentos":string[],"bioma":string,"prompt_sprite":string},{...},{...}]}
Gere exatamente 3 versões em português, fiéis ao desenho e à fala, sem inventar detalhes que não aparecem nos dois.
"bioma" é o nome curto do lugar onde esse bicho mora, criado a partir da descrição dele (ex.: "Lago de Lava", "Floresta de Cogumelos"). Não escolha de uma lista fixa; cada bicho pode ter um bioma diferente.`;

function limparJSON(texto: string): string {
  const m = texto.match(/```(?:json)?\s*([\s\S]*?)```/);
  return m ? m[1].trim() : texto.trim();
}

export async function POST(req: Request) {
  const bloqueio = verificar(req);
  if (bloqueio) return bloqueio;

  const { foto, transcricao } = (await req.json()) as {
    foto?: string;
    transcricao?: string;
  };
  if (!foto || !transcricao) {
    return Response.json({ erro: "foto e transcricao são obrigatórias" }, { status: 400 });
  }

  try {
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
    return Response.json(JSON.parse(limparJSON(resposta.output_text)));
  } catch {
    return Response.json({ erro: "resposta inválida da IA" }, { status: 502 });
  }
}
