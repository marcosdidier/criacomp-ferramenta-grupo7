# PF0 — Derrubar as ideias (skill `pf-derrubar-a-ferramenta`)

As respostas abaixo são do Marcos. Em vários pontos ele aceitou a resposta sugerida pelo Claude como advogado do diabo. **Validar com o Grupo 7 antes do pitch.**

---

## Ideia A: o bestiário do Samuel (sessão de 17/10)

**A ideia em uma frase:** uma ferramenta que deixa uma criança de 6–9 anos criar as criaturas do próprio mundo, em que a IA transforma o desenho feito no papel num mob ou personagem de Minecraft/Roblox.

### As seis perguntas

| # | Pergunta | Defesa |
|---|---|---|
| A | Quem é a pessoa? | **Samuel, 8 anos, primo do Marcos.** Joga Minecraft e Roblox e inventa mundos. Dá para testar com ele antes de 12/11. |
| B | O que ele passa a conseguir? | **Faz sozinho:** desenha, fotografa e escolhe, sem escrever prompt e sem conta. O ChatGPT exige ler, escrever e ter 13+ anos. |
| C | Onde a IA entra, e o que decide? | **Interpreta o desenho e propõe comportamentos** para a criatura (voa, come, foge...). Sem a IA, não existe a conversão do desenho livre nem as propostas. |
| D | O que ele controla? | **A IA propõe, o Samuel escolhe:** 3 comportamentos sugeridos, e ele escolhe um, combina ou desenha outro. A palavra final é sempre dele. |
| E | Como desfaz e compara? | **3 interpretações lado a lado** a cada foto e o **bestiário do Samuel**, uma coleção de tudo que ele criou, para voltar e refazer. |
| F | Onde ele usa? | **App web pensado para tablet:** a câmera fotografa o desenho, e o mesmo link abre no computador na Avaliação Cruzada. |

### Os quatro ataques de ferramenta

| Ataque | Defesa |
|---|---|
| Isto é uma demo | Tela guiada **sem texto**, com ícones e voz: desenhe → fotografe → escolha. Testar com o Samuel sem explicar nada e anotar onde ele trava. |
| Isto é a demonstração do modelo | A ideia **nasceu do Samuel**, que inventa mundos e não consegue tirar os bichos do papel. O modelo é trocável e o fluxo continua o mesmo. |
| Isto já existe | O Photo to Skin parte de **foto de pessoa ou texto** e cobra créditos; Drawings Alive e Animated Drawings geram 3D ou animação **fora do jogo**. O Samuel tem um **desenho** e quer o bicho **no jogo**. |
| Isto não roda no dia | O app gera o **arquivo no formato do jogo** e mostra um **passo a passo ilustrado** para importar (talvez com um adulto só nesse passo). O modelo roda por **API configurada pelo grupo**, e a tela avisa quando falha. |

### Veredito

**Onde não consegui derrubar.**
- A pessoa é real e está ao alcance (Samuel).
- A IA está no produto e decide algo: interpretar e propor.
- A diferença para os vizinhos é clara: desenho livre → bicho no jogo, com a criança escolhendo.
- O app web atende à Cruzada.

**O que derruba.** O **escopo de entrada no jogo**. Três coisas difíceis se acumulam:
1. "Mob com comportamento" não é skin. No Minecraft, criatura nova com comportamento exige add-on (Bedrock) ou mod/datapack (Java). No Roblox, exige script.
2. São **dois jogos**, com formatos diferentes.
3. "O Samuel faz sozinho" colide com o passo de importar, que costuma exigir um adulto.

Se nada disso for cortado, o risco é chegar a 10/11 (ponta a ponta) sem o bicho entrando em jogo nenhum.

**A menor mudança que salva** (oferta, não imposição): **começar só com Minecraft** e definir o que é "entrar no jogo" no primeiro checkpoint. Por exemplo: a aparência mais um comportamento simples escolhido de uma lista curta. Roblox e comportamentos mais ricos ficam como extras se der tempo. No pitch, isso também responde à pergunta "o que vocês cortam se não der?".

---

## Ideia B: o baralho da professora (sessão de 17/10)

**A ideia em uma frase:** uma ferramenta que deixa a professora de inglês de crianças de 10 anos criar jogos de cartas sob medida, em que a IA gera o baralho ilustrado com as regras, pronto para imprimir.

Na Ideia B, todas as respostas foram as sugeridas pelo Claude e aceitas pelo Marcos. É mais um motivo para validar com o grupo.

### As seis perguntas

| # | Pergunta | Defesa |
|---|---|---|
| A | Quem é a pessoa? | **Uma professora de inglês infantil que o Marcos conhece** (falta anotar o nome e o curso). |
| B | O que ela passa a conseguir? | **O jogo inteiro em minutos:** cartas ilustradas no mesmo estilo, regras e folha A4 diagramada. No ChatGPT e no Canva, isso levaria uma tarde. |
| C | Onde a IA entra, e o que decide? | **Adapta o jogo ao vocabulário e ilustra:** verbos viram mímica, animais viram trunfo com atributos, comidas viram memória com frase. Sem IA, sobra um gerador de PDF vazio. |
| D | O que ela controla? | **A IA propõe 2–3 jogos, e ela edita:** escolhe um, troca uma regra, refaz uma carta e só então imprime. |
| E | Como desfaz e compara? | **Biblioteca por unidade do livro:** refazer uma carta, duplicar e variar um jogo. |
| F | Onde ela usa? | **App web no computador**, onde ela prepara a aula e imprime. |

### Os quatro ataques de ferramenta

| Ataque | Defesa |
|---|---|
| Isto é uma demo | Fluxo de 3 telas: palavras → escolher o jogo → revisar e imprimir. As regras saem impressas para os alunos. Testar com a professora sem ajuda. |
| Isto é a demonstração do modelo | A ideia nasceu da falta de tempo da professora para fazer material visual, não do modelo. |
| Isto já existe | Framia só faz flashcard de cenário fixo. **Wordwall e Canva têm modelos de jogo e versão para imprimir, mas isso ainda não foi aberto nem confirmado.** A diferença defendida é que a IA decide qual jogo combina com aquele vocabulário e ilustra tudo no mesmo estilo. |
| Isto não roda no dia | API configurada pelo grupo; 1–2 min por baralho, com barra de progresso e aviso de falha. Estimar o custo por baralho para o pitch. |

### Veredito

**Onde não consegui derrubar.**
- A interação é simples e roda bem no dia: web, PDF e impressora são tecnologias sem surpresa.
- O controle da professora está claro: a IA propõe e ela edita.
- É a mais viável das três até 10/11.

**O que derruba.** Dois pontos.
1. **"Isso já existe" ainda não foi respondido.** Wordwall e Canva são o que a turma vai citar, e ninguém do grupo abriu. Se a diferença ("a IA adapta o jogo") não aparecer na prática, a ideia vira "Wordwall com imagens geradas".
2. **Quem cria?** O professor pede uma ferramenta que deixe outra pessoa *criar*. Na defesa atual, quem decide a mecânica é a IA, e a professora escolhe e edita. A turma pode ler isso como **ferramenta de produtividade** (gerador de material didático), e não como ferramenta de criatividade.

**A menor mudança que salva** (oferta, não imposição): **a professora inventa a regra, a IA materializa.** Por exemplo, ela digita uma "regra da casa" ("quem tirar carta de comida tem que fazer um pedido em inglês ao vizinho"), e a IA verifica se o jogo fica jogável, gera as cartas e escreve as regras para crianças de 10. A IA continua decidindo coisas (equilíbrio, ilustração, adaptação ao A1), mas a ideia do jogo é dela.

---

## Ideia C: a aventura em que o inglês é a chave (sessão de 17/10)

**A ideia em uma frase:** uma ferramenta que deixa a turma de crianças de 10 anos criar uma aventura coletiva, em que a IA narra e ilustra a próxima cena só quando entende o pedido feito em inglês.

Na Ideia C, todas as respostas também foram as sugeridas pelo Claude e aceitas pelo Marcos. Validar com o grupo.

### As seis perguntas

| # | Pergunta | Defesa |
|---|---|---|
| A | Quem é a pessoa? | **A turma da mesma professora da Ideia B.** A turma cria e a professora facilita e abre a porta para o teste. |
| B | O que a turma passa a conseguir? | **Falar inglês para algo acontecer:** o que as crianças dizem vira cena, em vez de repetir frases do livro. A aventura é delas. O ChatGPT não ajusta ao A1, não recusa português e não guarda a aventura da turma. |
| C | Onde a IA entra, e o que decide? | Transcreve a fala, **decide se o pedido é compreensível** (não se é perfeito), narra no nível A1 e ilustra. Quando não entende, responde como personagem ("The dragon looks confused..."). |
| D | O que a turma controla? | **O rumo da história:** não há opções prontas. Se a IA transcrever errado, a turma corrige ("No! We said..."), e a professora tem um botão "aceitar assim mesmo". |
| E | Como desfaz e compara? | **Linha do tempo das cenas:** voltar a uma cena e tentar "e se...?" (um galho). |
| F | Onde usa? | **App web no computador da professora, projetado na sala**, com um microfone. |

### Os quatro ataques de ferramenta

| Ataque | Defesa |
|---|---|
| Isto é uma demo | Tela de início (tema e nível) e um botão grande de microfone. Na Avaliação Cruzada, outro grupo joga como se fosse a turma. Testar com a professora sem explicar. |
| Isto é a demonstração do modelo | A ideia nasceu da aula em que as crianças só repetem frases. Se o modelo mudar, a ideia continua. |
| Isto já existe | Nos apps de inglês, a fala é exercício com nota; nas aventuras com IA, é só comando. **Aqui, entender o inglês é o que move a história da turma inteira.** Nas buscas, não achamos nada assim. |
| Isto não roda no dia | Microfone "passa a vez": um aluno fala de cada vez, segurando o botão. A narração em texto chega primeiro e a imagem depois. Se a voz falhar, a professora digita. API configurada pelo grupo e aviso quando a conexão cai. |

### Veredito

**Onde não consegui derrubar.**
- É a ideia com **a diferença mais clara** diante do que já existe, porque a lacuna apareceu nas buscas.
- A IA está no produto e decide algo central.
- A turma é a autora da história.

**O que derruba.**
1. **O coração da ideia é a parte mais frágil.** Reconhecer a fala de crianças brasileiras de 10 anos falando inglês, numa sala com barulho, e decidir se "entendeu" é exatamente o que precisa funcionar. Se a IA for rígida demais, a aula trava; se for frouxa demais, "o inglês é a chave" deixa de existir.
2. **O teste depende de outras pessoas.** Testar de verdade exige a professora **e** uma turma reunida antes de 12/11. Testar com adultos não mostra o problema real, que é o sotaque e a timidez das crianças.

**A menor mudança que salva** (oferta, não imposição): **testar o ponto frágil esta semana, antes de escolher.** Gravar o Samuel (ou outra criança) dizendo 5 ou 6 pedidos simples em inglês e passar as gravações por um reconhecimento de fala para ver o que sai. Se a transcrição for usável, a ideia está de pé. Se não for, o plano B (a professora digita) vira o plano A, e é melhor saber disso antes do pitch.
