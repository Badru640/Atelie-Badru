# 💌 Ateliê Badru — Sistema de Convites Online

O **Ateliê Badru** é um sistema completo e visualmente encantador de convites digitais, criado para transformar eventos especiais em experiências memoráveis. Ideal para casamentos, aniversários e celebrações únicas, o sistema une elegância, tecnologia e personalização.

---

## ✨ Visão Geral

Este projeto permite:

- Criação de **convites digitais personalizados** com nome do convidado.
- Exibição de **carrossel de fotos românticas** e introdução animada.
- Página de convite realista com:
  - QR Code individual (para check-in ou confirmação)
  - Dados organizados sobre lado (noiva/noivo), acompanhantes e mesa
- Confirmação de presença com opção de:
  - Dedicatória
  - Comentários
- Área de **administração** para visualizar e editar convidados.
- Área para **protocolo** marcar chegada dos convidados.
- Design adaptado para **mobile e desktop** com experiência fluida e envolvente.

---

## 🛠️ Tecnologias Usadas

- **Frontend:**
  - React + TypeScript + Vite
  - React Router DOM (rotas)
  - TanStack React Query (estado assíncrono)
  - Framer Motion (animações suaves)
  - Sonner (notificações modernas)
  - TailwindCSS (estilização)
  - QRCode.react

- **Backend:**
  - Google Apps Script + Planilha Google
  - Endpoints com suporte a CORS para:
    - Buscar convidado
    - Confirmar presença
    - Marcar chegada

- **Deploy & Analytics:**
  - Vercel (hosting + analytics)

---

## 🔗 Rotas principais

| Caminho                | Descrição                                        |
|------------------------|--------------------------------------------------|
| `/`                    | Boas-vindas com introdução animada e fotos       |
| `/convidado/:id`       | Página personalizada do convidado                |
| `/admin`               | Área administrativa com listagem e edição        |
| `/admin/:id`           | Visualizar/editar detalhes do convidado          |
| `/protocolo`           | Área de check-in de convidados (modo geral)      |
| `/protocolo/:id`       | Check-in direto de um convidado via QR ou ID     |

---

## 📦 Como rodar localmente

```bash
# Clone este repositório
https://github.com/Badru640/Atelie-Badru.git

# Acesse a pasta do projeto
cd Atelie-Badru

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
