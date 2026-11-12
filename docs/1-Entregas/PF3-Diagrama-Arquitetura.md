# PF3 — Diagrama de Arquitetura

> O Bestiário do Samuel · Grupo 7 · Criatividade Computacional 2026.2 (IF866, CIn-UFPE)

---

## 1. Análise Caixa Preta

Visão externa da ferramenta: o que entra, o que sai e quais configurações existem.

```mermaid
flowchart LR
    subgraph Entradas
        E1["Foto do desenho\n(JPEG via câmera)"]
        E2["Descrição falada\n(áudio via microfone)"]
    end

    subgraph Configurações
        direction TB
        C1["Prompt de interpretação\n(instruções para gpt-6-luna)"]
        C2["Prompt de história\n(instruções para gpt-6-luna)"]
        C3["Voz e tom\n(VIBE para gpt-4o-mini-tts)"]
    end

    subgraph App["O Bestiário do Samuel"]
        X["App Web\n(Next.js 15)"]
    end

    subgraph Saídas
        S1["3 versões propostas\n(nome, corpo, bioma,\ncomportamentos)"]
        S2["Zoológico 2D\n(CSS animations)"]
        S3["Carta para imprimir\n(canvas → PNG)"]
        S4["História do bicho\n(texto gerado)"]
        S5["Sprite pixel art\n(Retro Diffusion)"]
    end

    E1 --> App
    E2 --> App
    C1 --> App
    C2 --> App
    C3 --> App
    App --> S1
    App --> S2
    App --> S3
    App --> S4
    App --> S5
```

### Detalhamento das entradas e saídas

| Tipo | Item | Formato | Descrição |
|---|---|---|---|
| **Entrada** | Foto do desenho | JPEG via `getUserMedia` (câmera traseira) | Desenho livre da criança feito no papel |
| **Entrada** | Descrição falada | WebM via `MediaRecorder` | A criança conta como o bicho é, o que faz, onde mora |
| **Config** | Prompt de interpretação | Texto fixo no código | Instrui gpt-6-luna a retornar JSON com 3 versões |
| **Config** | Prompt de história | Texto fixo no código | Instrui gpt-6-luna a gerar história de 4-6 frases |
| **Config** | Voz e tom (VIBE) | Texto fixo no código | Direciona gpt-4o-mini-tts (voz marin, tom infantil) |
| **Saída** | 3 versões | JSON (nome, corpo, cores, comportamentos, bioma, prompt_sprite) | Criança escolhe uma |
| **Saída** | Zoológico 2D | HTML/CSS com animações por comportamento | Criaturas agrupadas por bioma com movimento |
| **Saída** | Carta | PNG gerado via Canvas API | Para imprimir ou salvar como imagem |
| **Saída** | História | Texto gerado por gpt-6-luna | 4-6 frases sobre a criatura |
| **Saída** | Sprite | GIF animado pixel art (64x64) via Retro Diffusion | Fallback: foto com filtro CSS (silhueta) |

---

## 2. Interface com o Usuário

Referência completa: [PF2 — Protótipo de Baixíssima Fidelidade](PF2-Prototipo-Baixa-Fidelidade.md)

```mermaid
flowchart LR
    subgraph Interface["Interface (tablet-first, 520px max)"]
        T1["Bestiário\n(tela inicial)"]
        T2["Captura\n(câmera)"]
        T3["Gravação\n(microfone)"]
        T4["Espera\n(ovo nascendo)"]
        T5["Escolha\n(3 versões)"]
        T6["Detalhe\n(criatura)"]
        T7["Zoológico\n(biomas + animações)"]
        T8["Carta\n(impressão)"]
        T9["História\n(texto gerado)"]
    end

    T1 --> T2
    T2 --> T3
    T3 --> T4
    T4 --> T5
    T5 --> T6
    T6 --> T7
    T6 --> T8
    T6 --> T9
```

---

## 3. Análise Caixa Transparente — Pipeline Completo

Visão interna: módulos, serviços externos e fluxo de dados.

```mermaid
flowchart TD
    subgraph Entrada["Entrada do Usuário"]
        FOTO["Foto do desenho\n(JPEG base64)"]
        AUDIO["Descrição falada\n(áudio WebM)"]
    end

    subgraph Transcrição["Transcrição"]
        STT["gpt-transcribe\n(OpenAI, language: pt)"]
    end

    subgraph Interpretação["Interpretação Multimodal"]
        LLM["gpt-6-luna\n(OpenAI Responses API)"]
        PROMPT["Prompt estruturado\n+ transcrição + foto"]
    end

    subgraph TTS_Serv["Voz"]
        TTS["gpt-4o-mini-tts\n(voz marin)"]
    end

    subgraph Sprite_Serv["Geração de Sprite"]
        RD["Retro Diffusion API v2\n(rd_plus__low_res 64x64\n+ rd_advanced_animation)"]
    end

    subgraph Cliente["Processamento no Navegador"]
        CARD["Canvas API\n(carta PNG 800x1000)"]
        ZOO["CSS Animations\n(zoológico 2D por bioma)"]
        LS["localStorage\n(bestiário-samuel)"]
    end

    subgraph Saída["Saída para o Usuário"]
        TELA_ESCOLHA["Tela de Escolha\n(3 versões)"]
        TELA_ZOO["Zoológico 2D\n(sprites animados)"]
        TELA_CARTA["Carta para imprimir"]
        TELA_HIST["História do bicho"]
    end

    AUDIO --> STT
    STT -->|texto transcrito| LLM
    FOTO -->|imagem base64| LLM
    PROMPT -->|contexto| LLM

    LLM -->|"JSON: 3x {nome, corpo,\ncores, comportamentos,\nbioma, prompt_sprite}"| TELA_ESCOLHA

    TELA_ESCOLHA -->|"criança escolhe"| LS
    TELA_ESCOLHA -->|"prompt_sprite"| RD
    RD -->|"GIF animado\n(ou fallback silhueta)"| ZOO

    LS -->|dados da criatura| ZOO
    LS -->|dados da criatura| CARD
    LS -->|dados da criatura| LLM

    LLM -->|história gerada| TELA_HIST
    TTS -->|áudio MP3| Saída

    ZOO --> TELA_ZOO
    CARD --> TELA_CARTA
```

---

## 4. Mapping AI Process

Adaptação do diagrama "Mapping AI Process" (Calegario) para o contexto da ferramenta.

```mermaid
flowchart LR
    subgraph Dados["Dados (artefatos)"]
        D1["Desenhos de crianças\n(fotos do papel)"]
        D2["Descrições faladas\n(áudio)"]
    end

    subgraph Modelos["Modelos Pré-treinados (via API)"]
        M1["gpt-transcribe\n(OpenAI STT)"]
        M2["gpt-6-luna\n(OpenAI multimodal)"]
        M3["Retro Diffusion\n(sprite pixel art)"]
        M4["gpt-4o-mini-tts\n(OpenAI TTS, voz marin)"]
    end

    subgraph Inferência["Inferência e Geração"]
        I1["Transcrição\n(áudio → texto pt)"]
        I2["Interpretação\n(imagem + texto → JSON)"]
        I3["Geração de sprite\n(prompt → pixel art 64x64)"]
        I4["Voz de instrução\n(texto → áudio MP3)"]
        I5["Geração de história\n(dados → texto infantil)"]
    end

    subgraph Dados_Gerados["Dados Gerados"]
        G1["Texto da descrição"]
        G2["JSON da criatura\n(nome, corpo, cores,\ncomportamentos, bioma)"]
        G3["Sprite animado\n(GIF pixel art)"]
        G4["Carta de coleção\n(PNG via Canvas)"]
        G5["História\n(4-6 frases)"]
        G6["Áudio de instrução\n(MP3)"]
    end

    subgraph Aplicação["Aplicação"]
        A1["Parâmetros\n(corpo, comportamentos,\nnome, bioma)"]
        A2["Interface\n(tablet-first,\nzoológico 2D,\nvoz nas instruções)"]
    end

    D1 --> I2
    D2 --> I1

    M1 -.->|"modelo usado"| I1
    M2 -.->|"modelo usado"| I2
    M2 -.->|"modelo usado"| I5
    M3 -.->|"modelo usado"| I3
    M4 -.->|"modelo usado"| I4

    I1 --> G1
    G1 --> I2
    I2 --> G2
    G2 --> I3
    I3 --> G3
    I4 --> G6
    I5 --> G5
    G2 --> A1
    G3 --> A2
    G2 -->|"Canvas API"| G4
    G4 --> A2
    G5 --> A2
    G6 --> A2
```

### Legenda

| Símbolo | Significado |
|---|---|
| Retângulo com cantos arredondados | **Artefato** (dado, arquivo, recurso) |
| Retângulo com cantos retos | **Processo** (transformação, inferência) |
| Seta sólida | Fluxo de dados |
| Seta tracejada | Modelo utilizado pelo processo |

### Onde a IA entra

| Componente | Modelo | Papel | Sem IA, o que acontece? |
|---|---|---|---|
| **Transcrição** | gpt-transcribe (OpenAI) | Transcreve a fala da criança para texto em português | A criança precisaria digitar, inviável com 8 anos |
| **Interpretação** | gpt-6-luna (OpenAI) | Interpreta desenho + descrição, propõe corpo, cores, comportamentos e bioma | Não haveria interpretação automática do desenho livre |
| **Sprite** | Retro Diffusion API | Gera sprite pixel art 64x64 animado a partir do prompt_sprite | Foto do desenho usada como fallback (silhueta CSS) |
| **Voz** | gpt-4o-mini-tts (OpenAI) | Fala as instruções para a criança ("coloca o desenho dentro do quadrado") | Criança precisaria ler, difícil com 8 anos |
| **História** | gpt-6-luna (OpenAI) | Gera história curta sobre a criatura a partir dos dados e da transcrição | Não haveria história |

Nenhum modelo é treinado ou ajustado pelo grupo. Todos são usados via API com prompts específicos.

---

## 5. Stack Tecnológica

```mermaid
flowchart TD
    subgraph Frontend["Frontend"]
        NEXT["Next.js 15\n+ React 19\n+ TypeScript"]
        CSS["CSS Animations\n(zoológico 2D)"]
        CANVAS["Canvas API\n(carta PNG)"]
    end

    subgraph Backend["Backend (Next.js API Routes)"]
        TRANS["/api/transcrever\n(proxy gpt-transcribe)"]
        INTER["/api/interpretar\n(proxy gpt-6-luna)"]
        FALAR["/api/falar\n(proxy gpt-4o-mini-tts)"]
        HIST["/api/historia\n(proxy gpt-6-luna)"]
        SPR["/api/sprite\n(proxy Retro Diffusion)"]
        SEC["_seguranca.ts\n(token + rate limit)"]
    end

    subgraph Externos["Serviços Externos"]
        EX1["OpenAI\n(gpt-transcribe,\ngpt-6-luna,\ngpt-4o-mini-tts)"]
        EX2["Retro Diffusion\n(sprite pixel art)"]
    end

    subgraph Infra["Infraestrutura"]
        VERCEL["Vercel\n(hospedagem)"]
        LOCAL["localStorage\n(bestiário no navegador)"]
    end

    Frontend --> Backend
    TRANS --> EX1
    INTER --> EX1
    FALAR --> EX1
    HIST --> EX1
    SPR --> EX2
    SEC --> Backend
    Frontend --> LOCAL
    Backend --> VERCEL
```

### Escolha de cada tecnologia

| Camada | Tecnologia | Justificativa |
|---|---|---|
| **Frontend** | Next.js 15 + React 19 | App Router, deploy simples na Vercel, TypeScript |
| **Zoológico 2D** | CSS Animations | Animações por comportamento (voa, nada, corre, fogo) sem game engine |
| **Backend** | Next.js API Routes (Node.js) | Proxy para APIs externas, sem expor chaves no frontend |
| **Transcrição** | OpenAI gpt-transcribe | STT otimizado para português, `language: "pt"` para voz de criança |
| **Interpretação** | OpenAI gpt-6-luna | Multimodal (imagem + texto), retorna JSON estruturado com 3 versões |
| **Voz (TTS)** | OpenAI gpt-4o-mini-tts (voz marin) | Voz quente e infantil para instruções, com VIBE prompt detalhado |
| **História** | OpenAI gpt-6-luna | Gera história de 4-6 frases a partir dos dados da criatura |
| **Sprite** | Retro Diffusion API v2 | Pixel art 64x64 com animação walking. Fallback: silhueta CSS |
| **Armazenamento** | localStorage (navegador) | Sem servidor de banco. Chave `bestiario-samuel`, dados em JSON |
| **Segurança** | Token APP_SECRET + rate limit 30 req/min/IP | Protege rotas antes do deploy público |
| **Hospedagem** | Vercel | Deploy automático, HTTPS nativo, variáveis de ambiente seguras |

---

## 6. Fluxo de Dados Detalhado

Sequência completa de uma criação de criatura.

```mermaid
sequenceDiagram
    actor Samuel
    participant App as App Web
    participant STT as /api/transcrever
    participant LLM as /api/interpretar
    participant TTS as /api/falar
    participant RD as /api/sprite
    participant LS as localStorage

    Note over App,TTS: Instruções faladas ao abrir cada tela
    App->>TTS: POST {texto: "Coloca o desenho..."}
    TTS-->>App: MP3 (voz marin)

    Samuel->>App: Fotografa o desenho (câmera)
    Samuel->>App: Pressiona microfone e descreve o bicho

    App->>STT: POST FormData(áudio)
    STT-->>App: {texto: "cospe fogo..."}

    App->>LLM: POST {foto: base64, transcricao: texto}
    LLM-->>App: {versoes: [{nome, corpo, cores, comportamentos, bioma, prompt_sprite} x3]}

    App->>Samuel: Mostra 3 opções lado a lado

    Samuel->>App: Toca na versão favorita
    App->>LS: Salva criatura no bestiário

    Note over App,RD: Sprite gerado em background (não bloqueia)
    App->>RD: POST {prompt: prompt_sprite}
    RD-->>App: {gif: base64} ou erro (fallback silhueta)
    App->>LS: Atualiza criatura com sprite

    App->>Samuel: Criatura aparece no zoológico com animação
```

---

## 7. Estrutura do Projeto

```
criacomp-ferramenta-grupo7/
├── app/
│   ├── page.tsx                   # UI completa (state machine de 9 etapas)
│   ├── layout.tsx                 # Root layout (pt-BR)
│   ├── globals.css                # Estilos (mobile-first, animações, biomas)
│   └── api/
│       ├── _seguranca.ts          # Token + rate limit (compartilhado)
│       ├── transcrever/route.ts   # gpt-transcribe (STT)
│       ├── interpretar/route.ts   # gpt-6-luna (multimodal)
│       ├── falar/route.ts         # gpt-4o-mini-tts (TTS)
│       ├── historia/route.ts      # gpt-6-luna (história)
│       └── sprite/route.ts        # Retro Diffusion (sprite)
│
├── docs/                          # Documentação (PF0-PF3, pitch, processo)
├── .env.example                   # Template de variáveis de ambiente
├── .gitignore                     # Bloqueia mídia do Samuel (menor)
├── package.json                   # Next.js 15, React 19, OpenAI SDK
├── tsconfig.json
└── README.md
```

---

## 8. Privacidade e Segurança

Samuel é menor de idade. O sistema protege os dados dele.

```mermaid
flowchart TD
    subgraph Sensível["Dados Sensíveis (nunca versionados)"]
        DS1["Áudio da voz"]
        DS2["Foto do desenho"]
    end

    subgraph Ciclo["Ciclo de Vida"]
        CV1["Áudio → /api/transcrever"]
        CV2["Texto transcrito substitui áudio"]
        CV3["Áudio descartado no servidor"]
        CV4["Foto → /api/interpretar"]
        CV5["JSON da criatura substitui foto no servidor"]
        CV6["Foto fica apenas em localStorage\n(navegador da criança)"]
    end

    subgraph Guardado["O que fica armazenado"]
        A1["localStorage: foto base64\n+ metadados + história"]
        A2["Servidor: nada persistido\n(stateless)"]
    end

    DS1 --> CV1 --> CV2 --> CV3
    DS2 --> CV4 --> CV5 --> CV6
    CV2 --> A1
    CV6 --> A1
    A2
```

### Medidas de proteção

| Medida | Implementação |
|---|---|
| Sem login e sem conta | Samuel não fornece nome, email nem senha |
| Áudio descartado após transcrição | O servidor não persiste o arquivo de áudio |
| Servidor stateless | Nenhum dado é salvo no servidor. Tudo fica em localStorage no navegador |
| Foto apenas local | A foto base64 fica em localStorage, nunca sobe para banco de dados |
| `.gitignore` bloqueia mídia | Áudio, foto e vídeo bloqueados por padrão no repositório |
| `dados-samuel/` ignorada | Material de teste fica apenas na máquina de quem testa |
| Chaves no servidor | OPENAI_API_KEY e RD_API_KEY ficam nas variáveis de ambiente da Vercel |
| Token de acesso | Rotas /api/* protegidas por APP_SECRET + rate limit 30 req/min/IP |
| Autorização dos pais | Registrada em 17/10/2026 |

---

## 9. Riscos Técnicos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| **gpt-transcribe não entender voz de criança** | Transcrição errada | `language: "pt"` + botão "contar de novo" + mensagem "hum, não entendi" |
| **gpt-6-luna interpretar mal o desenho** | Criatura não combina | 3 versões para escolher + prompt com instruções detalhadas |
| **Retro Diffusion sem saldo** | Sem sprite | Fallback: foto com filtro CSS (silhueta colorida) |
| **JSON da IA com markdown fences** | Parse falha | `limparJSON()` remove fences antes de `JSON.parse` |
| **Latência do pipeline (>30s)** | Criança perde interesse | Tela de espera com ovo animado + mensagem se demorar |
| **localStorage cheio (~5MB)** | Não salva novas criaturas | Aceitável para demo. Fotos base64 ~100-200KB cada |
| **API abusada sem token** | Gasta créditos | APP_SECRET + rate limit antes do deploy |

---

## 10. Custo Estimado por Criatura

| Etapa | API | Custo estimado |
|---|---|---|
| Transcrição | gpt-transcribe | ~US$ 0,006 (~10s de áudio) |
| Interpretação | gpt-6-luna (multimodal) | ~US$ 0,01-0,03 (1 imagem + texto) |
| Sprite | Retro Diffusion (64x64 + animação) | ~US$ 0,20 |
| Voz (instruções) | gpt-4o-mini-tts | ~US$ 0,005 por frase |
| História | gpt-6-luna (texto) | ~US$ 0,005 |
| **Total por criatura** | | **~US$ 0,25** |

Para 50 criaturas (testes + demo + Avaliação Cruzada): **~US$ 12,50**.
