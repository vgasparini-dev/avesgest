# 🐥 AvesGest PRO

Sistema completo de gestão para produção de aves poedeiras comerciais

## 📊 Visão Geral

O **AvesGest PRO** é um sistema web moderno e intuitivo desenvolvido especificamente para a gestão de granjas de postura comercial. Inspirado no BovGest, o AvesGest foi adaptado para atender as necessidades específicas da avicultura de postura, com foco em controle de lotes, produção de ovos, sanidade, nutrição e controle financeiro.

### 🎯 Características Principais

- **Sistema multi-usuário** com controle de acesso granular (Admin/Operador)
- **Autenticação segura** com Firebase Authentication
- **Sincronização em nuvem** via Firebase Firestore
- **Interface moderna** com React + Tailwind CSS
- **Design responsivo** para desktop, tablet e mobile
- **Sistema de convites** para novos usuários
- **Controle de permissões** pelo administrador

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + Vite
- **Estilização**: Tailwind CSS
- **Ícones**: Lucide React
- **Backend/Database**: Firebase (Firestore + Authentication)
- **Hospedagem**: Azure Static Web Apps / Vercel

## 📑 Módulos do Sistema

### 1. 🐥 Gestão de Lotes
- Cadastro de lotes com identificação única
- Controle de raça, idade e fase produtiva
- Data de alojamento e quantidade de aves
- Histórico completo de cada lote
- Cálculo automático de idade e fase produtiva

### 2. 🥚 Controle de Produção de Ovos
- Registro diário de produção por lote
- Classificação por tamanho (Extra, Grande, Médio, Pequeno)
- Registro de ovos trincados e descartados
- Gráficos de evolução da produção
- Cálculo de taxa de postura (ave/dia)
- Cálculo de massa de ovos produzida

### 3. 🌡️ Mortalidade
- Registro de mortalidade diária
- Classificação de causa mortis
- Cálculo de taxa de mortalidade acumulada
- Alertas de mortalidade anormal
- Histórico e relatórios

### 4. 💉 Sanidade
- Programa de vacinação
- Controle de medicações
- Registro de interventoções sanitárias
- Período de carência de medicamentos
- Histórico sanitário completo

### 5. 🌾 Nutrição e Ração
- Controle de consumo de ração por lote
- Diferentes tipos de ração por fase
- Cálculo de conversão alimentar
- Estoque de insumos
- Alerta de reabastecimento

### 6. 💰 Financeiro
- Registro de receitas (vendas de ovos e aves de descarte)
- Controle de despesas por categoria
- Relatórios de lucro/prejuízo
- Análise de custos de produção
- Gráficos de desempenho financeiro

### 7. 📋 Anotações
- Sistema de anotações gerais
- Observações por lote
- Histórico de ocorrências

### 8. 👥 Gestão de Usuários (Admin)
- Listagem de todos os usuários do sistema
- **Conceder acesso** a novos usuários via convite por email
- **Revogar acesso** de usuários existentes
- **Reativar acesso** de usuários desativados
- **Alterar roles** (Admin/Operador)
- Visualizar último acesso e status de cada usuário

## 🔐 Sistema de Controle de Acesso

### Fluxo de Concessão de Acesso

1. **Administrador** acessa o módulo "Usuários" no sistema
2. Clica em "Conceder Acesso"
3. Preenche:
   - Email do novo usuário
   - Nome completo
   - Role (Admin ou Operador)
4. Sistema gera um **convite** e envia link de cadastro
5. Novo usuário acessa o link e cria sua senha
6. Sistema valida convite e cria conta
7. Usuário pode fazer login no sistema

### Permissões por Role

**Admin:**
- Acesso total a todos os módulos
- Gestão de usuários (conceder/revogar acesso)
- Configurações globais do sistema
- Relatórios financeiros completos

**Operador:**
- Registro de produção diária
- Registro de mortalidade e sanidade
- Visualização de relatórios básicos
- Anotações gerais
- **NÃO** tem acesso à gestão de usuários

## 🚀 Como Instalar e Executar

### Pré-requisitos

- Node.js 18+ instalado
- Conta no Firebase (projeto criado)
- Git instalado

### Instalação

```bash
# Clone o repositório
git clone https://github.com/vgasparini-dev/avesgest.git

# Entre no diretório
cd avesgest

# Instale as dependências
npm install
```

### Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative **Authentication** (Email/Password)
3. Ative **Firestore Database**
4. Copie as credenciais do Firebase
5. Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

6. Preencha o arquivo `.env` com suas credenciais do Firebase

### Estrutura do Firestore

O sistema utiliza as seguintes coleções:

```
firestore/
  ├── usuarios/          # Dados dos usuários
  ├── convites/          # Convites pendentes
  ├── lotes/             # Lotes de aves
  ├── producaoOvos/      # Registros de produção
  ├── mortalidade/       # Registros de mortalidade
  ├── sanidade/          # Registros sanitários
  ├── nutricao/          # Controle de ração
  ├── financeiro/        # Registros financeiros
  └── anotacoes/         # Anotações gerais
```

### Primeiro Acesso (Criar Admin)

Para criar o primeiro usuário administrador:

1. Acesse o Firebase Console
2. Vá em **Authentication** > **Users** > **Add user**
3. Crie um usuário com email e senha
4. Copie o UID do usuário criado
5. Vá em **Firestore Database**
6. Crie um documento na coleção `usuarios` com o UID como ID:

```json
{
  "email": "admin@suagranja.com",
  "nome": "Administrador",
  "role": "admin",
  "ativo": true,
  "criadoEm": "2026-05-23T18:00:00.000Z"
}
```

### Executar em Desenvolvimento

```bash
npm run dev
```

O sistema estará disponível em `http://localhost:5173`

### Build para Produção

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`

## 📦 Deploy

### Azure Static Web Apps

1. Faça push do código para o GitHub
2. Acesse o [Azure Portal](https://portal.azure.com)
3. Crie um recurso "Static Web App"
4. Conecte ao repositório GitHub
5. Configure:
   - **App location**: `/`
   - **Api location**: *(vazio)*
   - **Output location**: `dist`
6. Adicione as variáveis de ambiente do Firebase nas configurações

### Vercel

```bash
npm i -g vercel
vercel
```

Ou conecte direto no [Vercel Dashboard](https://vercel.com)

## 📝 Próximos Passos

- [ ] Criar o componente `App.jsx` completo com todos os módulos
- [ ] Implementar componentes de UI reutilizáveis
- [ ] Adicionar gráficos e relatórios
- [ ] Implementar sistema de notificações
- [ ] Adicionar exportação de relatórios (PDF/Excel)
- [ ] Implementar modo offline com cache local
- [ ] Adicionar suporte a múltiplas propriedades

## 👥 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer fork do projeto
2. Criar uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abrir um Pull Request

## 📝 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## 📧 Contato

Victor Gasparini - [@vgasparini-dev](https://github.com/vgasparini-dev)

---

**Desenvolvido com ❤️ para a avicultura brasileira**
