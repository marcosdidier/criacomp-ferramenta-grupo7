# PF1 — "Como vai ser feita" (item 7 do pitch), 17/10/2026

Ideia: **o bestiário do Samuel, com voz.** As decisões abaixo foram tomadas pelo Marcos; validar com o grupo.

## Decisões de base

| Decisão | Escolha | Por quê |
|---|---|---|
| Onde o Samuel joga | **Tablet, Minecraft Bedrock** | O arquivo `.mcaddon` abre direto no jogo com um toque, o que ajuda no "ele faz sozinho". |
| Onde a ferramenta roda | **App web pensado para tablet** | A câmera fotografa o desenho e o microfone grava a fala. O mesmo link abre no computador na Avaliação Cruzada. |
| Fala → texto | **API de transcrição** (ex.: Whisper) | Funciona bem com português e voz de criança e custa centavos. O Samuel não configura nada. |
| Desenho + fala → criatura | **Modelo multimodal** (lê a imagem e o texto) | Escolhe um **corpo-base** do jogo (lobo, galinha, lula, morcego...), **pinta a textura** com as cores do desenho e **propõe 3 comportamentos** a partir do que ele disse. |
| Comportamento | **Lista curta de comportamentos prontos** (voa, nada, segue o dono, foge da chuva, é amigável/bravo...) | A IA escolhe e combina itens da lista, e o Samuel confirma. Assim o resultado sempre vira um arquivo válido para o jogo. |
| Acesso ao modelo | **API configurada pelo grupo**, atrás de um servidor | Sem chave para o Samuel nem para quem testa. Com limite de uso. |
| Equipe | **Todos programam com agente de código** (IA no processo) | Definir quem revisa o quê. A IA no **produto** é o modelo multimodal e a transcrição. |

**A confirmar no protótipo (27/10):** se criaturas novas com corpo-base e textura própria entram no Bedrock do tablet sem precisar ativar recursos experimentais. Esse é o maior risco técnico. Testar **antes** de qualquer outra coisa.

## As garantias que a ferramenta precisa dar (do lançamento)

| Garantia | Como atendemos |
|---|---|
| Responder no tempo da pessoa | Transcrição em segundos. As 3 propostas aparecem em até cerca de 30 s, com animação de espera ("seu bicho está nascendo..."). |
| Deixar repetir e comparar | 3 versões lado a lado a cada desenho, mais o **bestiário** com tudo o que já foi criado. |
| Deixar claro como chegar ao modelo | O Samuel não vê modelo nem chave: a API é do grupo. Na tela de "sobre", uma linha explica que IA é usada e onde. |
| Funcionar fora da máquina do grupo | Link público (hospedagem web) e passo a passo ilustrado de como colocar o bicho no Minecraft. |
| Falhar com aviso | A criatura responde como personagem ("hum, não entendi... me conta de novo?"). Se a API cair, aparece uma tela clara e o desenho fica salvo para tentar depois. |

## Custo estimado (a medir no protótipo)

Por criatura: uma transcrição curta e uma chamada multimodal. Ordem de grandeza: **centavos**. O valor real deve ser medido no protótipo antes de ir para o pitch final.

## Cronograma até as datas do bloco

| Quando | O quê | Entrega |
|---|---|---|
| até 20/10 | Pitch (PF0 + PF1) | caixa + pitch |
| 21–27/10 | **Teste de risco:** fazer à mão **uma** criatura entrar no Minecraft do tablet do Samuel. Gravar o Samuel descrevendo 3 bichos e testar a transcrição. Protótipo de papel ou Figma das 3 telas. | **PF2** protótipo de baixa fidelidade + **PF3** diagrama de arquitetura |
| 28/10–09/11 (inclui a semana sem aula, 03 e 05/11) | Pipeline completo: foto + fala → propostas → escolha → `.mcaddon`. Bestiário. Carta para imprimir. | — |
| **10/11** | **Ponta a ponta mínimo:** o Samuel desenha, fala, escolhe, e **um** bicho entra no jogo. | **PF4** checkpoint 1 |
| **12/11** | **Outro grupo usa sem explicação** (e o Samuel em casa). Anotar onde travam. | **PF5** checkpoint 2 |
| 13–17/11 | Corrigir o que travou, avisos de falha, polimento. **Congela.** | **PF6** + apresentação (PF7) |

## O que cortamos se não der (em ordem)

1. Roblox: só Minecraft.
2. Comportamentos além da lista curta.
3. A criatura "falando" de volta com voz sintética.
4. **Último recurso:** se a importação no jogo não funcionar até 10/11, o bicho sai como **carta do bestiário impressa** e como prévia 3D na tela. O desenho, a fala, a escolha e o bestiário continuam funcionando.
