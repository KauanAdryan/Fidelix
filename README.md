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

---

**Fidelix** - Transformando a fidelidade em resultados! 🎯
