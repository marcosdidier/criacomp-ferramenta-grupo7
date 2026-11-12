# O bestiário do Samuel · Grupo 7

Projeto Ferramenta de Criatividade Computacional 2026.2 (IF866, CIn-UFPE).

Uma criança de 6 a 9 anos **desenha** um bicho no papel e **conta falando** como ele é. A IA junta o desenho e a fala e **propõe** três versões com aparência e comportamentos. A criança **escolhe**. A criatura entra no **bestiário**, ganha vida no **zoológico digital 2D** e sai como **carta para imprimir**.

## Como rodar

```bash
# 1. Clone o repositório
git clone https://github.com/marcosdidier/criacomp-ferramenta-grupo7.git
cd criacomp-ferramenta-grupo7

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas chaves (veja tabela abaixo)

# 4. Rode o servidor de desenvolvimento
npm run dev
# Abra http://localhost:3000
```

Se uma chave for adicionada depois de o servidor subir, reinicie o `npm run dev`. O Next.js só lê `.env.local` na inicialização.

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz (nunca comite esse arquivo):

| Variável | Obrigatória | Descrição |
|---|---|---|
| `OPENAI_API_KEY` | Sim | Chave da API OpenAI (gpt-transcribe, gpt-6-luna, gpt-4o-mini-tts) |
| `RD_API_KEY` | Não | Chave da Retro Diffusion (sprites pixel art). Sem ela, usa silhueta colorida como fallback |
| `APP_SECRET` | Não | Token para proteger as rotas /api/* (lado servidor) |
| `NEXT_PUBLIC_APP_SECRET` | Não | Mesmo valor de APP_SECRET (lado cliente, enviado nos headers) |

## Arquitetura

Foto + fala da criança → gpt-transcribe (STT) → gpt-6-luna (interpretação multimodal) → 3 versões → criança escolhe → bestiário (localStorage) + zoológico 2D (CSS animations) + carta (Canvas → PNG) + história (gpt-6-luna) + sprite (Retro Diffusion, com fallback).

Diagrama completo: [`docs/1-Entregas/PF3-Diagrama-Arquitetura.md`](docs/1-Entregas/PF3-Diagrama-Arquitetura.md)

## Estrutura

```
app/
  page.tsx                    UI completa (state machine de 9 etapas)
  layout.tsx                  Root layout (pt-BR)
  globals.css                 Estilos (mobile-first, animações, biomas)
  api/
    _seguranca.ts             Token + rate limit (compartilhado)
    transcrever/route.ts      gpt-transcribe (STT, language: pt)
    interpretar/route.ts      gpt-6-luna (multimodal → JSON)
    falar/route.ts            gpt-4o-mini-tts (TTS, voz marin)
    historia/route.ts         gpt-6-luna (história infantil)
    sprite/route.ts           Retro Diffusion (pixel art 64x64)
docs/                         Documentação (PF0-PF3, pitch, processo)
```

## Por onde começar (documentação)

- **[`docs/LEIA-ME.md`](docs/LEIA-ME.md)**: visão geral, quem fala o quê no pitch, datas.
- **`docs/0-Dossie-completo.pdf`**: tudo numa leitura só.
- **`docs/1-Entregas/`**: PF0 (caixa morfológica), PF1 (pitch), PF2 (protótipo), PF3 (arquitetura).

## Grupo 7

Júlia Andrade · Daniel Dias · Sofia Remides · Marcos Didier · Guilherme Muniz · Gabriel Rocha

## Privacidade

O repositório é **privado**. **Nunca** versionem fotos, desenhos fotografados ou áudios do Samuel (ele é menor de idade). O `.gitignore` bloqueia esses formatos por padrão. Material de teste com ele fica só na máquina de quem testa, na pasta `dados-samuel/`, que é ignorada pelo git. Imagens que precisarem ir para o repositório (diagramas, prints da interface) vão em `assets-publicos/`.
