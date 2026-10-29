# Guia para Apresentação — PF2 e PF3

> O Bestiário do Samuel · Grupo 7

---

## O que é a ferramenta?

Uma criança de 6 a 9 anos desenha um bicho no papel e conta, falando, como ele é. A IA junta o desenho e a fala, propõe três versões da criatura. A criança escolhe. A criatura entra no bestiário dela, ganha vida como sprite no zoológico digital 2D e vira carta para imprimir.

---

## Para quem é?

Samuel, 8 anos, primo do Marcos. Joga Minecraft no tablet, inventa mundos, desenha bichos no papel, escreve pouco. Os pais autorizaram os testes.

---

## Onde a IA entra?

1. **Whisper API** transcreve a fala da criança para texto
2. **Modelo multimodal** (Claude Vision ou GPT-4V) interpreta o desenho + a descrição e propõe corpo-base, cores e comportamentos
3. **DALL-E ou Stable Diffusion** gera o sprite da criatura

Sem IA, não existe conversão do desenho livre nem propostas de comportamento. Quem decide é sempre o Samuel — a IA propõe, ele escolhe.

---

## Por que zoológico 2D e não Minecraft?

Ninguém testou importação de criaturas no Minecraft Bedrock. O zoológico 2D roda 100% no navegador, sem instalar nada. Na Avaliação Cruzada, outro grupo abre o link e usa direto.

---

## Como o Samuel interage?

Três passos: **fotografar** o desenho → **falar** como o bicho é → **escolher** entre 3 versões. Toda a interface funciona por ícones, voz e toque. Sem texto, sem login, sem conta.

---

## O que já existe e o que a nossa faz de diferente?

| Ferramenta | Faz | Não faz |
|---|---|---|
| Photo to Skin | Foto/texto → skin Minecraft | Não parte de desenho livre, exige login e créditos |
| Drawings Alive | Desenho → 3D com realidade aumentada | Fora de qualquer jogo |
| ChatScratch | Desenho → asset de Scratch | Não é Minecraft, não usa voz |

**Nossa diferença:** desenho livre + fala de criança → criatura com comportamento → zoológico interativo, tudo escolhido por ela.

---

## Qual é a stack?

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js + React (tablet-first) |
| Zoológico 2D | Phaser.js ou Canvas API |
| Backend | Node.js ou Python FastAPI |
| Transcrição | Whisper API (OpenAI) |
| Interpretação | Claude Vision ou GPT-4V |
| Geração de sprite | DALL-E 3 ou Stable Diffusion |
| Banco | Supabase |
| Hospedagem | Vercel |

Custo por criatura: ~US$ 0,15. Para 50 criaturas: ~US$ 7,50.

---

## E a privacidade? Samuel é menor.

- Sem login, sem conta, sem dados pessoais
- Áudio deletado logo após transcrição
- Foto não armazenada no servidor (só o sprite fica)
- Chaves de API ficam no servidor, nunca no frontend
- Pais autorizaram em 17/10/2026

---

## Quando a IA erra?

- Mostra 3 versões para aumentar a chance de acerto
- Botão "contar de novo" e "redesenhar" sempre disponíveis
- Erro tratado como personagem: "hum, não entendi, me conta de novo?"
- Se o servidor cair: "o bestiário está dormindo, tenta daqui a pouco"

---

## Quanto custa para quem usa?

Nada. A API é do grupo. O custo por criatura é de centavos.

---

## Dá para fazer até 17/nov? O que cortamos?

| Data | Entrega |
|---|---|
| 29/10 | PF2 + PF3 (esta entrega) |
| 10/11 | PF4 — ponta a ponta mínimo |
| 12/11 | PF5 — outro grupo usa sem explicação |
| 17/11 | PF6 — congela + apresentação |

Se não der tempo: cortamos comportamentos extras → interação entre criaturas → voz sintética. Último recurso: só carta impressa.

---

## Por que não usar o ChatGPT direto?

Porque Samuel não lê nem escreve prompt, não tem conta, e o ChatGPT não entrega um bicho que entra no zoológico.

---

## Na Avaliação Cruzada, como funciona sem o grupo?

Tudo roda no navegador. O outro grupo abre o link, desenha, fala, escolhe e vê o bicho no zoológico. Sem instalar nada, sem explicação.
