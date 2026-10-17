# PF0/PF1 — O que já existe (skill `pf-procurar-o-que-existe`), 17/10/2026

Pesquisa feita na web por três agentes, um por ideia. Só entrou o que apareceu nas buscas, sempre com link. **Nada foi testado ainda.** Várias descrições vêm do próprio site ou de agregadores, e algumas páginas do There's an AI for That (TAAFT) bloquearam a leitura automática (erro 403). Abram os links antes de citar qualquer item no pitch.

---

## Ideia A: a criança de 6–9 desenha uma criatura no papel e a IA a transforma em mob/skin de Minecraft/Roblox

| o quê | link | o que faz | para quem | onde a IA entra |
|---|---|---|---|---|
| Minecraft: Skin Scanner (57Digital) | https://iphoneaddict.fr/apps/jeux/minecraft-skin-scanner.html | pinta um molde impresso, escaneia e vira skin; parece ter saído da loja | fãs de Minecraft | a página não fala em IA (é escaneamento) |
| Photo to Skin (AI Skin Studio) | https://theresanaiforthat.com/ai/photo-to-skin/ | foto ou texto vira skin 64x64, com prévia 3D e editor | jogadores | lê a foto ou o texto e gera a skin |
| SkinGenerator.io (Monadical) | https://theresanaiforthat.com/ai/skingenerator-io/ | texto vira skin de Minecraft | jogadores | Stable Diffusion ajustado |
| Minecraft_Skin_Generator (código aberto) | https://github.com/Nick088Official/Minecraft_Skin_Generator | texto vira skin, com demo no Hugging Face | devs e jogadores | Stable Diffusion ajustado |
| AI Skin Maker & Editor (Pixelvoid) | https://apps.apple.com/app/id1583570913 | app iOS: descrição vira skin, com editor | jogadores | gera a skin a partir de texto |
| Drawings Alive | https://apps.apple.com/np/app/drawings-alive-ai-sketch-3d/id6749238166 | desenho infantil vira modelo 3D com realidade aumentada (RA) | pais e crianças | desenho → imagem → 3D |
| Meta Animated Drawings | https://theresanaiforthat.com/ai/animateddrawings-by-meta-1681678375/ | anima figuras humanas de desenhos infantis; código aberto | crianças e famílias | detecção, segmentação, articulações |
| Roblox Cube / geração 4D | https://about.roblox.com/newsroom/2026/02/accelerating-creation-powered-roblox-cube-foundation-model | texto vira objeto funcional dentro do Roblox (beta desde 02/2026) | criadores e jogadores | modelo de base Cube (entrada é texto) |
| ChatScratch (artigo) | https://arxiv.org/pdf/2402.04975 | a criança desenha assets, a IA refina e eles entram num projeto Scratch | crianças de 6–12 | Stable Diffusion com ControlNet |
| Desenhos infantis como sprites (Sharif) | https://repository.sharif.edu/resource/487646/animation-ndash-based-gamification-of-children | foto do desenho vira sprite animável num jogo | crianças pequenas | o papel da IA não fica claro |

- **Vizinho mais próximo:** **Photo to Skin**, no lado do jogo. No fluxo "papel → skin", é o **Skin Scanner**, mas este não usa IA e exige molde. No lado infantil, é o **Drawings Alive**.
- **Tasks do TAAFT:**
  - [Minecraft skins](https://theresanaiforthat.com/task/minecraft-skins/) (3 ferramentas)
  - [Minecraft](https://theresanaiforthat.com/task/minecraft/) (24)
  - [Game assets](https://theresanaiforthat.com/task/game-assets/) (43)
  - [Sketch to image](https://theresanaiforthat.com/task/sketch-to-image/) (20)
  - [Animated drawings](https://theresanaiforthat.com/task/animated-drawings/) (2)
  - [2D to 3D](https://theresanaiforthat.com/task/2d-to-3d-image-conversion/) (7)
- **Lacunas nas buscas:**
  - Não encontramos nada que transforme, com IA, um **desenho livre fotografado do papel** em **mob ou personagem jogável**. O que existe parte de texto ou selfie, exige molde, ou gera 3D genérico fora do jogo.
  - Também não encontramos nada voltado para crianças de 6–9 anos com ajuste e comparação de versões lado a lado.

---

## Ideia B: a professora de inglês define regras e vocabulário, e a IA gera um baralho ilustrado para imprimir

| o quê | link | o que faz | para quem | onde a IA entra |
|---|---|---|---|---|
| Framia: AI Vocabulary Flashcard Generator | https://framia.converge.ai/apps/vocabulary-flashcard/ | tema e nível viram flashcards ilustrados em PDF para recortar | alunos e professores de idiomas | escolhe as palavras e ilustra |
| YouMind: Illustrated Vocabulary Worksheet | https://youmind.com/skills/illustrated-vocabulary-worksheet-generator-TNa1aCY68soXX6 | lista de palavras vira página ilustrada | professores | ilustra e diagrama |
| Venngage: AI Flashcard Generator | https://venngage.com/ai-tools/flashcard-generator | flashcards editáveis por tema | público geral e professores | gera conteúdo e visual |
| Summer Engine: AI Card Game Generator | https://www.summerengine.com/ai-card-game-generator | prompt vira jogo de cartas digital, exportável para Godot | devs de jogos | mecânica, cartas e arte (digital) |
| AI for Education: prompt "Apples to Apples" | https://www.aiforeducation.io/prompts/apples-to-apples | prompt para gerar cartas de Apples to Apples por tema | professores | texto das cartas, sem imagem |
| TeacherForge | https://www.hunted.space/product/teacherforge | fichas de ESL por nível CEFR, em PDF ou DOCX | professores de ESL | exercícios e textos |
| English No Kidding | https://www.producthunt.com/products/english-no-kidding-ai-fuelled-esl-tools | jogos de conversação com IA para aula | professores de idiomas | gera atividades de speaking |
| Twee | https://twee.com/tools | mais de 30 ferramentas de IA para professores de inglês | professores de ESL/EFL | material alinhado ao CEFR |
| printable-flashcard-generator (GitHub) | https://github.com/kougen/printable-flashcard-generator | lista de palavras e imagens viram PDF imprimível | uso self-hosted | **sem IA** |
| trAIding-cards (Univ. Hamburg) | https://www.inf.uni-hamburg.de/inst/basecamp/blog/24-03-27-expo2024/expoheft-2024-pdf.pdf | um LLM cria as cartas e a arte é gerada por IA | pesquisa | conteúdo e ilustração |

- **Vizinho mais próximo:** **Framia**, que gera baralho ilustrado de vocabulário em PDF para recortar. Pelo que se viu, não deixa a professora definir **regras de jogo**.
- **TAAFT:** não foi encontrada página de task específica (a tentativa deu 403). Ferramentas relacionadas: [Flashcard Assistant](https://theresanaiforthat.com/gpt/flashcard-assistant/), [Worksheet Design Generator](https://theresanaiforthat.com/@markwryte/worksheet-design-generator/), [AI Worksheet Generator](https://theresanaiforthat.com/ai/ai-worksheet-generator@813324/).
- **Lacunas nas buscas:**
  - Não encontramos nada que junte **regras de jogo definidas pela professora** com **baralho ilustrado por IA para imprimir**. Os itens encontrados fazem uma metade ou a outra.
  - Não encontramos histórico de versões nem foco em crianças de cerca de 10 anos de curso livre.

---

## Ideia C: a turma de 10 anos cria uma aventura falada, e a IA narra e ilustra só quando entende o pedido em inglês

| o quê | link | o que faz | para quem | onde a IA entra |
|---|---|---|---|---|
| Storybot AI | https://hunted.space/product/storybot-ai | a criança fala a ideia e o bot narra uma aventura de escolhas, com imagens | crianças, individual ou em família | fala→texto, GPT-4, DALL-E, voz |
| Tinker Tales (Choi et al., 2026) | https://arxiv.org/html/2602.04109v1 | tabuleiro com NFC e diálogo por voz para cocriar a história | crianças (pesquisa) | parceira de criação por voz |
| Colin (Ye et al.) | https://arxiv.org/html/2405.06495v5 | texto, voz e imagem para treinar narrativa, com facilitador | crianças com um adulto | gera texto e imagem e faz perguntas |
| Kahaani | https://arxiv.org/html/2409.11261v6 | criança e IA em turnos; sai texto, fala, música e vídeo | crianças | coautora e geradora de mídia |
| CoolE Bot (Tai & Chen, 2024) | https://scholar.lib.ntnu.edu.tw/en/publications/navigating-elementary-efl-speaking-skills-with-generative-ai-chat/ | chatbot de fala em inglês, estudo com 85 alunos do fundamental | alunos de EFL do fundamental | parceiro de conversa (menos ansiedade para falar) |
| gopuman/ADM (GitHub) | https://github.com/gopuman/ADM | mestre de RPG automatizado com cenas em DALL-E (voz só como trabalho futuro) | jogadores de RPG | narra e ilustra |
| Isekai Chronicles | https://dev.to/aswinkbehera/isekai-chronicles-14lm | aventura com comandos falados, narração e imagem por cena | público geral | transcreve, narra e ilustra |
| Buddy.ai | https://www.educationalappstore.com/app/buddy-ai-early-learning-games | tutor de inglês por voz | crianças de 3–8, em casa | reconhece a fala e conduz |
| AI Speak: Fun English for kids | https://apps.apple.com/us/app/-/id6736606662 | jogos com nota de pronúncia | crianças, individual | avalia a pronúncia |
| SceneCraft (lição do NSF AI Institute) | https://docs.google.com/document/d/1Oe1M0e1roT7bPDRHr_EnOYJT85k4vTOZBpyf1lV76To/export?format=pdf | turma cria a história, com o professor digitando os comandos | turmas do 6º ao 12º ano (EUA) | gera a história |

- **Vizinho mais próximo:** **Storybot AI**, uma aventura por voz em que a IA narra e ilustra. Mas é individual, não é para aula de inglês e não exige que o pedido seja entendido em inglês.
- **Tasks do TAAFT:**
  - [Children's stories](https://theresanaiforthat.com/task/children-s-stories/)
  - [Text-based RPG](https://theresanaiforthat.com/task/text-based-rpg/)
  - Language learning (ex.: [Talkpal](https://theresanaiforthat.com/ai/talkpal/))
  - [Interactive storytelling](https://theresanaiforthat.com/s/interactive-storytelling/) (página de busca)
  - [Story visualization](https://theresanaiforthat.com/s/story+visualization/) (página de busca)
- **Lacunas nas buscas:**
  - Não encontramos nada em que **a compreensão de um pedido falado em inglês seja a condição para a história avançar**. Nos apps de inglês, a fala é exercício avaliado; nas aventuras, é só um jeito de dar comandos.
  - Não encontramos nada para uma **turma inteira falando junta** com a cena projetada. O caso mais próximo (SceneCraft) é por texto digitado.

---

## Reconhecimento dos vizinhos (feito pelo Claude em 17/10, sem login)

Esta não é a experiência de uso de vocês: nas três ferramentas, a geração exige conta. O professor quer que **alguém do grupo** teste de verdade pelo menos um dos vizinhos.

- **Photo to Skin ([phototoskin.com](https://phototoskin.com/)), Ideia A.** Está no ar. A entrada é uma foto ou um texto, e a saída é uma **skin de jogador** (humanoide 64x64, modelo Steve), não um mob. Para gerar, precisa de **login e créditos**: no modo foto, 1 crédito pela prévia de frente e costas e mais 2 pela conversão. O próprio site mostra um exemplo em que um **esboço a lápis** vira skin; a IA "inferiu cores e detalhes" e "os olhos foram corrigidos à mão". Tem editor manual de pixels, mas não tem comparação de versões lado a lado. É voltado para jogadores, não para crianças de 6–9.
- **Framia ([framia.converge.ai](https://framia.converge.ai/apps/vocabulary-flashcard/)), Ideia B.** Está no ar. O formulário só aceita um **cenário de uma lista fixa** (Restaurant, Airport, Hotel, Shopping, Hospital, Office, School, Travel), mais nível e idioma. **Não dá para escolher o vocabulário da aula nem definir regras de jogo.** Até o "testar exemplo" leva ao login.
- **Storybot AI, Ideia C.** O link do agregador está vazio. Nas buscas, ele aparece como uma **demonstração** da empresa Daily lançada no Product Hunt (Deepgram, GPT-4, DALL-E 2, PlayHT). Não foi possível confirmar que ainda está no ar. Também apareceram na busca: [VIVID](https://www.producthunt.com/p/vivid-5/vivid-7) (audiolivros interativos para 3–12 anos) e [Kids Tell Tales](https://neura.market/ai-tools-directory/story-generators/kids-tell-tales).

## A diferença, nas palavras do Marcos (17/10; ainda validar com o grupo)

| Ideia | vizinho mais próximo | a nossa faz o que ele não faz |
|---|---|---|
| A | Photo to Skin | parte do **desenho livre da criança no papel**, não de foto nem de texto |
| B | Framia | a professora escolhe o **tipo de jogo** e as cartas saem com as **regras** (o Framia só faz flashcard de cenário fixo) |
| C | Storybot / VIVID / Kids Tell Tales | **o inglês é a chave**: a história só anda quando a IA entende o pedido em inglês |

Observação: "pronto para recortar" foi considerado como diferença da B e descartado, porque o Framia já gera PDF para recortar.

## Antes de seguir: abrir e testar

A skill pede que o grupo abra e, quando der, **teste pelo menos dois itens de cada quadro**, começando pelo vizinho mais próximo, antes das perguntas de comparação.

| Ideia | testar primeiro | depois |
|---|---|---|
| A | Photo to Skin | Drawings Alive ou Meta Animated Drawings (tem demo online) |
| B | Framia Flashcard Generator | Twee ou Summer Engine |
| C | Storybot AI (verificar se ainda está no ar) | Buddy.ai ou o modo de voz de qualquer chatbot como "narrador" |
