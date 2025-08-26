# Fidelix - Sistema de Fidelidade Inteligente

## 📋 Descrição

O Fidelix é um sistema completo de fidelidade que permite aos usuários acumular compras e desbloquear cupons de desconto, enquanto oferece às empresas um portal dedicado para gerenciar seus próprios cupons de desconto.

## 🚀 Funcionalidades

### Para Usuários
- ✅ Sistema de login e cadastro
- ✅ Validação de compras via QR Code ou código manual
- ✅ Histórico de compras e cupons
- ✅ Dashboard com estatísticas e progresso
- ✅ Sistema de cupons automático baseado em compras
- ✅ Cupons empresariais personalizados
- ✅ Edição de perfil e dados pessoais

### Para Empresas
- ✅ Portal empresarial dedicado
- ✅ Login e cadastro com validação de CNPJ
- ✅ Criação, edição e exclusão de cupons
- ✅ Configuração de compras necessárias para desbloquear cupons
- ✅ Dashboard com estatísticas da empresa
- ✅ Gerenciamento completo de cupons de desconto
- ✅ Edição de perfil empresarial e alteração de senha

<<<<<<< HEAD
### 📊 Dashboard Completo
- **Estatísticas em tempo real** (compras, cupons, lojas)
- **Atividades recentes** com timeline
- **Objetivos e progresso** por loja
- **Filtros avançados** para histórico

### 🏪 Gestão de Lojas
- **Configuração de cupons** por estabelecimento
- **Progresso visual** com barras animadas
- **Informações detalhadas** de cada loja
- **Sistema flexível** de regras de fidelidade

## 🚀 Como Usar

### 1. Primeiro Acesso
1. Acesse `cadastro.html` para criar sua conta
2. Preencha todos os campos obrigatórios
3. Faça login em `index.html`
4. Acesse o dashboard em `home.html`

### 2. Validando Compras
- **Lojas Físicas**: Use o QR Code fornecido pela loja
- **Compras Online**: Digite o código recebido no campo manual

### 3. Gerenciando Cupons
- Visualize cupons disponíveis na aba "Cupons"
- Clique em um cupom para utilizá-lo
- Acompanhe o histórico na aba "Histórico"

### 4. Acompanhando Progresso
- Monitore seu progresso por loja na aba "Lojas"
- Veja quantas compras faltam para o próximo cupom
- Acompanhe estatísticas no dashboard principal

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura semântica
- **CSS3** - Estilos modernos com animações
- **JavaScript ES6+** - Lógica de negócio
- **Font Awesome** - Ícones vetoriais
- **LocalStorage** - Persistência de dados
- **CSS Grid & Flexbox** - Layout responsivo

## 📱 Design Responsivo

- **Mobile First** - Otimizado para dispositivos móveis
- **Adaptativo** - Funciona em todos os tamanhos de tela
- **Touch Friendly** - Interface otimizada para toque
- **Performance** - Carregamento rápido e fluido

## 🎨 Características Visuais

- **Gradientes modernos** com cores vibrantes
- **Glassmorphism** - Efeito de vidro translúcido
- **Animações suaves** e transições elegantes
- **Ícones intuitivos** para melhor UX
- **Tipografia clara** e legível

## 📋 Funcionalidades Técnicas
=======
## 🏗️ Estrutura do Projeto

```
Projeto Pessoal/
├── index.html                 # Página de login principal
├── empresa-login.html         # Página de login empresarial
├── empresa-dashboard.html     # Dashboard empresarial
├── perfil-usuario.html        # Página de edição de perfil do usuário
├── perfil-empresa.html        # Página de edição de perfil da empresa
├── home.html                  # Dashboard do usuário
├── cadastro.html              # Página de cadastro
├── config.js                  # Configurações do sistema
├── css/
│   ├── home.css              # Estilos do dashboard
│   ├── loginCadastro.css     # Estilos de login/cadastro
│   └── style.css             # Estilos gerais
├── js/
│   ├── home.js               # Lógica principal do sistema
│   ├── empresa-login.js      # Lógica de login empresarial
│   ├── empresa-dashboard.js  # Lógica do dashboard empresarial
│   ├── perfil-usuario.js     # Lógica de edição de perfil do usuário
│   ├── perfil-empresa.js     # Lógica de edição de perfil da empresa
│   ├── loginCadastro.js      # Lógica de login/cadastro
│   ├── compras.js            # Lógica de compras
│   └── qr-validator.js       # Validador de QR Code
└── README.md                 # Documentação
```

## 🎯 Como Usar
>>>>>>> 8d8d7cc (Adição de cadastro e login de empresa e edição de cupons)

### Para Usuários

1. **Acesso**: Acesse `index.html`
2. **Cadastro**: Crie uma conta ou faça login
3. **Dashboard**: Visualize seu progresso e cupons disponíveis
4. **Compras**: Valide compras via QR Code ou código manual
5. **Cupons**: Use os cupons desbloqueados automaticamente
6. **Perfil**: Edite suas informações pessoais através do botão "Meu Perfil"

### Para Empresas

1. **Acesso**: Clique em "Área Empresarial" na página inicial
2. **Cadastro**: Registre sua empresa com CNPJ válido
3. **Login**: Acesse o portal empresarial
4. **Cupons**: Crie, edite e gerencie cupons de desconto
5. **Configuração**: Defina quantas compras são necessárias
6. **Perfil**: Edite as informações da empresa através do botão "Perfil da Empresa"

## 🔧 Tecnologias Utilizadas

- **HTML5**: Estrutura das páginas
- **CSS3**: Estilização e responsividade
- **JavaScript**: Lógica do sistema
- **LocalStorage**: Armazenamento local de dados
- **FontAwesome**: Ícones
- **HTML5-QRCode**: Leitura de QR Codes

## 📊 Sistema de Cupons

### Cupons Automáticos
- Desbloqueados automaticamente após atingir número de compras
- Configurados pelas empresas
- Validade personalizada

### Cupons Empresariais
- Criados pelas empresas através do portal
- Desconto personalizado (1% a 100%)
- Validade em dias (1 a 365)
- Compras necessárias configuráveis
- Descrição opcional

## 🔐 Segurança

- Validação de CNPJ para empresas
- Senhas com mínimo de 6 caracteres
- Validação de e-mail
- Sessões separadas para usuários e empresas

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- Desktop
- Tablet
- Smartphone

## 🚀 Como Executar

1. Clone ou baixe o projeto
2. Abra `index.html` em um navegador moderno
3. Para empresas, acesse através do botão "Área Empresarial"

## 📝 Notas de Desenvolvimento

<<<<<<< HEAD
Kauan Adryan (@kauanadryan)

Desenvolvido como projeto pessoal para demonstrar habilidades em desenvolvimento web front-end.
=======
- Sistema baseado em localStorage (sem banco de dados)
- Compatível com navegadores modernos
- Interface intuitiva e moderna
- Código modular e bem organizado

## 🔄 Atualizações Recentes

### v2.0 - Sistema Empresarial
- ✅ Portal empresarial completo
- ✅ Gerenciamento de cupons empresariais
- ✅ Validação de CNPJ
- ✅ Dashboard empresarial
- ✅ Integração com sistema de compras

### v1.0 - Sistema Básico
- ✅ Sistema de login/cadastro
- ✅ Validação de compras
- ✅ Cupons automáticos
- ✅ Dashboard do usuário

## 📞 Suporte

Para dúvidas ou sugestões, entre em contato através do sistema.
>>>>>>> 8d8d7cc (Adição de cadastro e login de empresa e edição de cupons)

---

**Fidelix** - Transformando a fidelidade em resultados! 🎯
