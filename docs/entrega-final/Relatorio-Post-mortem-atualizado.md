# Relatório Post-mortem: O bestiário do Samuel (Grupo 7)
Projeto Ferramenta · Criatividade Computacional 2026.2 (IF866, CIn-UFPE)

---

## 1. Links

- **Projeto em deploy:** https://criacomp-ferramenta-grupo7.vercel.app
- **Código-fonte:** https://github.com/marcosdidier/criacomp-ferramenta-grupo7 (repositório público)
- **Instruções de uso:**
  1. Abra o link no tablet ou no computador e permita o acesso à câmera e ao microfone.
  2. Fotografe um desenho feito no papel.
  3. Toque no microfone, segure o botão e conte, falando, como o bicho é.
  4. Espere o ovo racha: a narração acompanha cada fase, até o bicho nascer.
  5. Escolha uma das 3 versões. O bicho vai para o bestiário, o zoológico e a carta para imprimir.
- **Aviso:** a ferramenta não guarda foto nem áudio no servidor. O bestiário fica salvo no navegador.

## 2. O que é a ferramenta

- **O que é:** uma criança de 6 a 9 anos desenha um bicho no papel e conta, falando, como ele é. A IA junta o desenho e a fala e propõe 3 versões da criatura, cada uma com nome, corpo, cores, comportamentos, bioma, e uma imagem em pixel art. A criança escolhe uma. Ela entra no bestiário e no zoológico 2D, onde conversa com outras criaturas, e vira uma carta colecionável para imprimir, com uma história narrada em voz.
- **Para quem serve:** crianças de 6 a 9 anos, com foco no Samuel (8 anos). Não exige login, conta ou digitação.
- **Como funciona:**
  1. Foto do desenho e gravação da fala.
  2. Transcrição da fala (`gpt-transcribe`).
  3. Interpretação do desenho e da fala em 3 versões (`gpt-6-luna`, com imagem e texto).
  4. Geração de uma imagem pixel art para cada versão (`gpt-image-1-mini`).
  5. A criança escolhe uma versão.
  6. História curta (`gpt-6-luna`) e narração em voz (`gpt-4o-mini-tts`).
  7. Bestiário, zoológico 2D (com diálogos entre criaturas, em `gpt-6-luna`) e carta para imprimir.

## 3. Modelos, bibliotecas e ferramentas, e por que

| Parte | Escolha | Por quê |
|---|---|---|
| Transcrição | `gpt-transcribe` (OpenAI) | Entende português e voz de criança, com custo baixo |
| Interpretação | `gpt-6-luna` (OpenAI Responses API), com imagem e texto | Lê desenho e fala juntos e devolve JSON estruturado |
| Imagem pixel art | `gpt-image-1-mini` (OpenAI) | Substituiu o DALL-E 3, que foi descontinuado, e gera imagens com fundo transparente |
| História e diálogos | `gpt-6-luna` | Texto curto, usando só o que está na descrição |
| Voz | `gpt-4o-mini-tts` (voz marin) | Narração em português, com instruções de tom para crianças |
| Frontend e backend | Next.js 15, React 19, TypeScript | Rotas de API servem de proxy; as chaves ficam no servidor |
| Biblioteca | SDK `openai` | Cliente oficial |
| Hospedagem | Vercel | Deploy automático a cada push |
| Armazenamento | `localStorage` no navegador | Sem conta e sem dados pessoais no servidor |

Obs.: no PF3 estavam previstos Whisper, Claude/GPT-4V, DALL-E 3 e Phaser.js. As escolhas finais estão na tabela. Nenhum desses modelos previstos foi usado no final, exceto nomes que mudaram de versão.

## 4. Divisão de tarefas

- **Marcos Didier:** entrevistas e testes presenciais com o Samuel (validação do público-alvo e coleta de desenhos/áudios); concepção inicial do projeto e documentação de PF0 e PF1 (caixa morfológica e slides do pitch); gestão do repositório, revisão de PRs e demonstração ao vivo na apresentação final.

- **Sofia Remides:** desenvolvimento principal da aplicação web (Next.js, React, rotas de API, interface e zoológico 2D); integração e migração dos modelos da OpenAI (gpt-transcribe, gpt-6-luna, gpt-image-1-mini e gpt-4o-mini-tts); correções de compatibilidade mobile e fila de áudio.

- **Gabriel Rocha:** documentação de PF2 e PF3 (protótipo de baixa fidelidade e diagrama de arquitetura); estruturação teórica da disciplina nos slides (Boden, Torrance, Csikszentmihalyi e Glaveanu); condução das respostas e discussão na apresentação final (PF7).

- **Júlia Andrade:** design visual e experiência do usuário (estética retrô da carta colecionável, mecânica narrativa do ovo que racha em 5 fases e referências visuais como Unstable Unicorns); elaboração e organização visual dos slides da apresentação final; revisão textual do relatório post-mortem.

- **Daniel Dias:** engenharia de prompts e sistema de aleatoriedade controlada (criação das 640 combinações de pose, paleta e detalhe para evitar sprites repetitivos); definição da rubrica de avaliação de qualidade (0 a 8 pontos) e execução dos testes manuais de fidelidade das criaturas (rodadas do peixe e do lobo).

- **Guilherme Muniz:** instrumentação e coleta de métricas de desempenho e custo (criação e execução do script medir-geracao.mjs, análise de latência no deploy da Vercel e estimativa de custo por escala); testes de ponta a ponta em diferentes navegadores/dispositivos móveis e consolidação da planilha de métricas e anexos.

## 5. Decisões de projeto e por quê

1. **Ideia (caixa morfológica):** o desenho da criança vira criatura no jogo. Foi escolhida por 4 votos a 2, porque era criação, não produtividade, e era testável com uma turma no prazo.
2. **Entrada:** foto do desenho e fala gravada, sem digitação. A criança tem 8 anos e não digita.
3. **Três versões em vez de uma:** para aumentar a chance de a criança se reconhecer no resultado, e para ela poder escolher.
4. **Bioma criado pela IA, sem lista fixa:** cada bicho mora num lugar com nome próprio, derivado da descrição.
5. **Uma imagem por versão:** as três versões são desenhadas em pixel art, para a criança comparar visualmente antes de escolher.
6. **Modelo de imagem:** `gpt-image-1-mini` no lugar do DALL-E 3 (descontinuado) e da Retro Diffusion (animação removida: a conta estava sem saldo e o sprite animado não era necessário para o fluxo).
7. **Zoológico 2D e carta para imprimir:** o Minecraft Bedrock foi descartado. A importação de `.mcaddon` não foi testada e o risco era alto. O zoológico web roda em qualquer navegador, o que atende à Avaliação Cruzada.
8. **Diálogos entre criaturas:** quando dois bichos se aproximam no zoológico, a IA gera uma conversa entre eles. Não estava no PF3.
9. **Dados das crianças:** áudio descartado após a transcrição, foto não armazenada, bestiário só no navegador. Por se tratar de dados de menor.

## 6. Dificuldades e como lidamos

- **Compatibilidade mobile (a maior dificuldade).** Foi um conjunto de problemas silenciosos:
  - *Fotos de celular:* uma foto de 4032×3024 (cerca de 5 MB) estourava o limite de 4,5 MB da Vercel. A rota falhava sem aviso.
  - *Formato de áudio:* cada aparelho grava em um formato (mp4 no iPhone, webm no Android, ogg no Firefox), e o arquivo era sempre nomeado como webm.
  - *Erros invisíveis:* no celular não há console, então os erros não apareciam.
  - *Como resolvemos:* câmera em 640×480 e foto reduzida para 400 px, com compressão até cerca de 300 KB; detecção do formato de áudio e extensão correta por aparelho; mensagem de erro com o motivo real na tela; teste do pipeline completo com script antes de cada deploy.
- **Geração de sprite.** A primeira tentativa usou DALL-E 3, que foi descontinuado, e depois a Retro Diffusion para a animação, que ficou sem saldo (`insufficient_balance`). Migramos para `gpt-image-1-mini`, que usa a mesma chave da OpenAI. Os sprites saem em 1024×1024 e vão para WebP, para caber no celular.
- **Sprites repetitivos.** Para cada sprite ser único, sorteamos pose, paleta e detalhe, com 640 combinações possíveis.
- **Espera de cerca de 45 s.** Transformamos a espera em parte da história: o ovo racha em 5 fases, e cada fase é narrada por voz, acompanhando uma etapa real do processamento.
- **Zoológico.** As criaturas saíam da tela em celulares, porque as posições eram calculadas em pixels fixos. Passamos a usar porcentagem do mapa, com o rebote nas bordas.
- **Narração sobreposta.** Cada fala cancelava a anterior, e só a última era ouvida. Passamos a usar uma fila de áudio.

## 7. Principal erro e como lidamos

**Testar o risco técnico tarde.** No PF1 apresentamos o Minecraft Bedrock como saída principal, sem ninguém ter testado a importação de `.mcaddon`. Se tivéssemos testado em 20 minutos, teríamos pivotado antes e poupado semanas de planejamento errado.

Como lidamos: trocamos a saída principal por zoológico 2D e carta, que são testáveis no navegador.

## 8. O que aprendemos

- **Testar o risco técnico antes do pitch.** Se a importação no jogo tivesse sido testada no início, o pivô teria sido feito antes.
- **Começar pelo deploy, não só pelo código.** O deploy na Vercel revelou problemas que não existiam no localhost: token de segurança não injetado no build, tamanho do corpo da requisição e timeout de funções. Um deploy de teste na primeira semana teria evitado essas surpresas.
- **Não confiar em nomes de modelos.** Os nomes mudam rápido. Verificamos na API antes de documentar, e ainda assim o DALL-E 3 foi descontinuado no meio do projeto.
- **Medir o custo desde o início.** Só medimos o custo por criatura quando o pipeline já estava pronto. Medir antes teria levado a escolher `gpt-image-1-mini` desde o começo.
- **Trabalho em equipe, divisão de tarefas e prazos.** Foi muito rico o aprendizado desses pontos, acredito que a parte mais importante.

## 9. Diferenças entre o projeto autoral (PF0/PF1) e o projeto ferramenta

- **Escopo:** o autoral era uma ideia no papel. A ferramenta precisou funcionar de ponta a ponta, em celular real, com dados de criança.
- **Decisões:** no autoral, a escolha era de ideia. Na ferramenta, cada decisão tinha custo real (API, latência, compatibilidade e privacidade).
- **Verificação:** no autoral, testamos com o pitch e a caixa. Na ferramenta, precisamos de medição de tempo, custo e qualidade.

---

## 10. Métricas (obrigatório)

### Tempo
- **Como medimos:** duas medições. (a) Medição no deploy da Vercel, com foto e áudio reais, que cobre o fluxo completo do desenho ao sprite pronto. (b) Script `medir-geracao.mjs` rodado localmente, que repete as chamadas de texto das rotas do app (transcrição, interpretação, história e voz), mas não gera as imagens.
- **Resultado (geração típica, deploy):** ~45–50 s do desenho ao sprite pronto.
  - Transcrição: ~1,2 s
  - Interpretação: ~14 s
  - Geração de 3 imagens (em paralelo): ~30–32 s
  - Voz: ~2 s
  - História: ~5 s
  - Diálogo entre criaturas: ~3 s
- **Resultado (script local, só texto):** 21,6 s e 23,1 s, média de 22,4 s.

### Custo
- **Como medimos:** tokens por chamada (campo `usage`) e preços por unidade informados ao script, para as chamadas de texto. Os preços das imagens e da voz são estimativas.
- **Resultado (geração típica):**

| Etapa | API | Custo |
|---|---|---|
| Transcrição | `gpt-transcribe` | ~US$ 0,006 |
| Interpretação | `gpt-6-luna` | ~US$ 0,03 |
| 3 imagens | `gpt-image-1-mini` (3×) | ~US$ 0,12 |
| Voz | `gpt-4o-mini-tts` | ~US$ 0,01 |
| História | `gpt-6-luna` | ~US$ 0,005 |
| **Total** | | **~US$ 0,17 por criatura** |

- **Medição só do texto (script local, sem imagens):** média de US$ 0,0023 por criatura.
- **Escala:** 50 criaturas (testes, demo e Avaliação Cruzada) ≈ US$ 8,50.
- **Comparação:** a Retro Diffusion custaria cerca de US$ 0,20 por sprite. O `gpt-image-1-mini` custa cerca de US$ 0,04 por imagem.

### Qualidade
- **O que é uma geração boa:** rubrica de 0 a 2 em 4 critérios (máximo 8):
  1. Fidelidade ao desenho: forma e cores batem com o que foi desenhado.
  2. Fidelidade à fala: comportamentos e bioma saem do que a criança disse.
  3. Coerência da história: usa só a descrição, sem invenção.
  4. Bioma: o nome do lugar faz sentido para o bicho descrito.
- **Régua:** boa = 7 ou 8 pontos, sem nenhum critério em 0; ruim = 4 ou menos, ou algum critério em 0.
- **Como medimos:** avaliação manual pelo grupo, com a rubrica acima.
- **Resultado:** peixe (Bolinho): 2, 2, 2 e 2, total 8 de 8, geração boa.

### Como as métricas mudaram entre versões
- **Versão anterior (DALL-E 3 e Retro Diffusion):** não medimos o custo por criatura. A comparação é uma estimativa, feita a partir dos preços de tabela: o DALL-E 3 e a Retro Diffusion custariam cerca de US$ 0,20 por sprite, e a Retro Diffusion dependia de saldo, que acabou.
- **Versão final (gpt-image-1-mini):** custo medido por criatura em torno de US$ 0,17 no deploy, com as imagens incluídas. O tempo, de cerca de 45 a 50 s, também foi medido no deploy, mas não temos a mesma medição da versão anterior para comparar.
- **Conclusão:** a mudança de modelo reduziu o custo estimado e removeu a dependência de um segundo serviço de imagem.

---

## Anexos
- Medições da rodada do peixe e do lobo: `docs/medicoes/peixe/` e `docs/medicoes/lobo/` no repositório.
- Planilha de custo e tempo (3 abas: medições, estimativa por criatura e tempo do deploy): planilha-custo-tempo-bestiario-samuel.xlsx https://github.com/marcosdidier/criacomp-ferramenta-grupo7/blob/main/docs/entrega-final/planilha-custo-tempo-bestiario-samuel.xlsx
