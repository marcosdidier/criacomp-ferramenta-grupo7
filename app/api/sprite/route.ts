export const runtime = "nodejs";
export const maxDuration = 300;

const BASE = "https://api.retrodiffusion.ai/v2/inferences";
const INTERVALO_MS = 2000;
const MAX_TENTATIVAS = 120;

type Tarefa = { task_id: string };
type Resultado = { base64_images?: string[]; output_urls?: string[] };

function token() {
  const chave = process.env.RD_API_KEY;
  if (!chave) throw new Error("RD_API_KEY não configurada");
  return chave;
}

async function enviar(corpo: Record<string, unknown>): Promise<Tarefa> {
  const resposta = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-RD-Token": token(),
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify(corpo),
  });
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.error?.message ?? `Retro Diffusion respondeu ${resposta.status}`);
  return dados as Tarefa;
}

async function esperar(taskId: string): Promise<Resultado> {
  for (let i = 0; i < MAX_TENTATIVAS; i++) {
    const resposta = await fetch(`${BASE}/tasks/${taskId}`, {
      headers: { "X-RD-Token": token() },
    });
    const dados = await resposta.json();
    if (dados.status === "succeeded") return dados.result as Resultado;
    if (dados.status === "failed") throw new Error(`geração falhou: ${JSON.stringify(dados.error)}`);
    await new Promise((r) => setTimeout(r, INTERVALO_MS));
  }
  throw new Error("tempo esgotado esperando a geração");
}

export async function POST(req: Request) {
  const { prompt = "", imagem, acao = "walking" } = (await req.json()) as {
    prompt?: string;
    imagem?: string;
    acao?: string;
  };

  try {
    let quadro = imagem;
    if (!quadro) {
      const inicial = await enviar({
        prompt,
        prompt_style: "rd_plus__low_res",
        width: 64,
        height: 64,
        num_images: 1,
      });
      const gerada = await esperar(inicial.task_id);
      quadro = gerada.base64_images?.[0];
      if (!quadro) throw new Error("quadro inicial não veio");
    }

    const animacao = await enviar({
      prompt: "",
      prompt_style: `rd_advanced_animation__${acao}`,
      width: 64,
      height: 64,
      num_images: 1,
      frames_duration: 8,
      input_image: quadro,
    });
    const resultado = await esperar(animacao.task_id);

    return Response.json({
      quadro,
      gif: resultado.base64_images?.[0] ?? null,
      urls: resultado.output_urls ?? [],
    });
  } catch (e) {
    return Response.json(
      { erro: e instanceof Error ? e.message : "erro desconhecido" },
      { status: 502 },
    );
  }
}
