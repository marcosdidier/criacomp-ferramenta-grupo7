# Respostas — Apresentação Final (PF7)
O Bestiário do Samuel · Grupo 7

Versão atualizada após o merge da PR #6 (remoção da chamada à Retro Diffusion) e das correções de zoológico e narração.

---

## 1. Última decisão de projeto: principal mudança em relação ao PF3?

Várias mudanças significativas em relação ao PF3 original:

- **Minecraft Bedrock descartado:** o PF3 planejava exportar criaturas como `.mcaddon`. Ninguém testou a importação, e o risco era alto. Substituímos por um zoológico 2D web, com cenário pixel art, onde os sprites andam e quicam nas bordas.
- **Stack real divergiu do planejado:** o PF3 listava Whisper, Claude Vision/GPT-4V, DALL-E 3, Phaser.js e Supabase. Na prática usamos `gpt-transcribe`, `gpt-6-luna`, `gpt-image-1-mini`, `gpt-4o-mini-tts`, CSS Animations e `localStorage`. DALL-E 3 foi descontinuado. Phaser.js e Supabase não foram necessários.
- **Sprites pixel art com aleatoriedade:** o PF3 previa sprites genéricos. Implementamos um sistema com 640 combinações (10 poses × 8 paletas × 8 detalhes) para cada sprite ser único.
- **Diálogos automáticos:** o PF3 não previa interação entre criaturas. Quando dois bichos se aproximam no zoológico, a IA gera um diálogo, que aparece em balões de fala.
- **Carta colecionável:** o PF3 previa uma carta simples. Implementamos uma carta estilo game card, com origem, habilidade, curiosidade e visual pixel art.

## 2. Principal erro ou dificuldade: qual foi o problema mais difícil de resolver?

**Compatibilidade mobile.** Foi o mais difícil, porque envolvia vários problemas silenciosos encadeados:

- **Fotos de celular:** câmeras capturam em 4032×3024 (cerca de 5 MB). Convertidas para base64 no corpo do JSON, excediam o limite de 4,5 MB da Vercel. A rota `/api/interpretar` falhava sem aviso, e o app só mostrava "o bestiário está dormindo", sem o motivo real.
- **Formato de áudio:** o `MediaRecorder` grava formatos diferentes por dispositivo (webm no Android, mp4 no iOS, ogg no Firefox). O arquivo era sempre nomeado como `fala.webm`, e a API às vezes rejeitava.
- **Erros invisíveis:** no celular não há console aberto, então os erros eram invisíveis. Levou várias iterações para diagnosticar.

**Como resolvemos:**
- A câmera pede 640×480, não a resolução nativa. A foto é reduzida para no máximo 400 px e comprimida até cerca de 300 KB, com uma recompressão extra no envio.
- Detectamos o tipo de áudio antes de criar o `MediaRecorder`, com a extensão correta por dispositivo e um fallback.
- Passamos a mostrar na tela o motivo real do erro, entre parênteses.
- Testamos o pipeline completo com um script simulando foto e áudio reais antes de cada deploy.

## 3. O que aprenderam: algo que faria diferente em relação ao PF0/PF1?

- **Testar o risco técnico antes do pitch.** No PF1 apresentamos o Minecraft Bedrock como saída principal sem testar a importação de `.mcaddon`. Se tivéssemos testado em 20 minutos, teríamos pivotado antes e poupado semanas de planejamento errado.
- **Começar pelo deploy, não só pelo código.** O deploy na Vercel revelou problemas (token de segurança não injetado no build, tamanho do corpo da requisição, timeout de funções) que não existiam no localhost. Um "hello world" de deploy na primeira semana teria evitado essas surpresas.
- **Não confiar em nomes de modelos.** O PF3 listava DALL-E 3, Whisper e GPT-4V, e nenhum dos três foi usado no final. Os nomes mudam rápido, então é preciso verificar na API antes de documentar.
- **Medir o custo desde o início.** Só medimos o custo por criatura quando o pipeline já estava pronto. Se tivéssemos medido antes, teríamos escolhido `gpt-image-1-mini` desde o começo, em vez de tentar DALL-E 3 e Retro Diffusion.

## 4. Tempo e custo: números medidos

### Tempo por etapa (medido no deploy da Vercel, com foto e áudio reais)

| Etapa | Tempo |
|---|---|
| Transcrição (`gpt-transcribe`) | ~1,2 s |
| Interpretação (`gpt-6-luna`, multimodal) | ~14 s |
| Geração de 1 sprite (`gpt-image-1-mini`) | ~13–30 s |
| Geração de 3 sprites (em paralelo) | ~30–32 s |
| Voz (`gpt-4o-mini-tts`) | ~2 s |
| História (`gpt-6-luna`) | ~5 s |
| Diálogo entre criaturas (`gpt-6-luna`) | ~3 s |
| **Total do desenho ao sprite pronto** | **~45–50 s** |

*Medição complementar do grupo, com o script `medir-geracao.mjs` (só a parte de texto, sem as imagens): 21,6 s e 23,1 s por geração; média de 22,4 s. Essa medição não inclui a geração das imagens, que é a etapa mais lenta.*

### Custo por criatura

| Etapa | API | Custo |
|---|---|---|
| Transcrição | `gpt-transcribe` | ~US$ 0,006 |
| Interpretação | `gpt-6-luna` | ~US$ 0,03 |
| 3 sprites | `gpt-image-1-mini` (3×) | ~US$ 0,12 |
| Voz (instruções) | `gpt-4o-mini-tts` | ~US$ 0,01 |
| História | `gpt-6-luna` | ~US$ 0,005 |
| **Total por criatura** | | **~US$ 0,17** |

*Medição complementar do grupo, só com os modelos de texto (sem imagens e sem voz): média de US$ 0,0023 por criatura (US$ 0,0022 e US$ 0,0024). Os valores de `gpt-image-1-mini` e da voz são estimativas, não medidos pelo script.*

**Retro Diffusion:** foi usada na animação dos sprites até 17/11/2026 e removida da versão final. A conta estava sem saldo (`insufficient_balance`), e o app passou a usar só a OpenAI, com a mesma chave. Se tivéssemos usado a Retro Diffusion, o custo seria de ~US$ 0,20 por sprite.

**Orçamento total:** para 50 criaturas (testes, demo e Avaliação Cruzada), ~US$ 8,50.

**Tamanho dos sprites:** ~500–750 KB cada, em WebP 1024×1024 com fundo transparente.

## 5. Qualidade: rubrica de 0 a 2 em 4 critérios

A rubrica adotada pelo grupo tem quatro critérios, cada um de 0 a 2 pontos (máximo 8):

1. **Fidelidade ao desenho:** forma e cores da criatura batem com o desenho.
2. **Fidelidade à fala:** comportamentos e bioma saem do que a criança disse.
3. **Coerência da história:** a história usa só a descrição, sem inventar.
4. **Bioma:** o nome do lugar faz sentido para o bicho descrito.

**Régua:** boa = 7 ou 8 pontos, sem nenhum critério em 0. Ruim = 4 ou menos, ou algum critério em 0.

**Resultado:** o peixe (Bolinho) recebeu 2, 2, 2 e 2, total 8 de 8: geração boa. O lobo (Mola) não foi avaliado.

*Em relação à sugestão anterior: o critério "animação" foi retirado, porque o sprite é uma imagem gerada, e a animação de caminhada, que dependia da Retro Diffusion, saiu do produto. O movimento no zoológico é de CSS e não entra na rubrica.*

## 6. Demo

- **Link:** https://criacomp-ferramenta-grupo7.vercel.app
- **Dica:** ter 2 criaturas já criadas no bestiário para mostrar o zoológico com diálogo. Criar 1 nova ao vivo para mostrar o fluxo completo (cerca de 50 s de espera).
