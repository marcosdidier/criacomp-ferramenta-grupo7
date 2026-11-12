export function tokenValido(_req: Request): boolean {
  return true;
}

const contadores = new Map<string, { n: number; expira: number }>();
const LIMITE = 30;
const JANELA_MS = 60_000;

export function dentroDoLimite(req: Request): boolean {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "desconhecido";
  const agora = Date.now();
  const entrada = contadores.get(ip);
  if (!entrada || agora > entrada.expira) {
    contadores.set(ip, { n: 1, expira: agora + JANELA_MS });
    return true;
  }
  entrada.n++;
  return entrada.n <= LIMITE;
}

export function verificar(req: Request): Response | null {
  if (!tokenValido(req))
    return Response.json({ erro: "não autorizado" }, { status: 401 });
  if (!dentroDoLimite(req))
    return Response.json({ erro: "muitas requisições" }, { status: 429 });
  return null;
}
