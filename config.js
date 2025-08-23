// Configurações do Sistema Fidelix
const FIDELIX_CONFIG = {
    // Configurações gerais
    APP_NAME: 'Fidelix',
    APP_VERSION: '1.0.0',
    APP_DESCRIPTION: 'Sistema de Fidelidade Inteligente',
    
    // Configurações de cores
    COLORS: {
        PRIMARY: '#667eea',
        SECONDARY: '#764ba2',
        SUCCESS: '#28a745',
        WARNING: '#ffc107',
        DANGER: '#dc3545',
        INFO: '#17a2b8',
        LIGHT: '#f8f9fa',
        DARK: '#343a40'
    },
    
    // Configurações de cupons
    COUPONS: {
        MIN_DESCONTO: 5,
        MAX_DESCONTO: 50,
        VALIDADE_PADRAO: '30 dias',
        COMPRAS_MINIMAS: 2
    },
    
    // Configurações de lojas
    LOJAS: {
        MAX_CUPONS_POR_LOJA: 5,
        COMPRAS_MINIMAS_PADRAO: 3,
        NOME_MAX_LENGTH: 50,
        ENDERECO_MAX_LENGTH: 100
    },
    
    // Configurações de usuários
    USUARIOS: {
        NOME_MIN_LENGTH: 3,
        USUARIO_MIN_LENGTH: 3,
        SENHA_MIN_LENGTH: 6,
        EMAIL_MAX_LENGTH: 100
    },
    
    // Configurações de compras
    COMPRAS: {
        CODIGO_MAX_LENGTH: 10,
        VALOR_MIN: 0.01,
        VALOR_MAX: 999999.99
    },
    
    // Configurações de interface
    UI: {
        ANIMATION_DURATION: 300,
        MESSAGE_TIMEOUT: 5000,
        MAX_HISTORICO_ITEMS: 100,
        ITEMS_PER_PAGE: 10
    },
    
    // Configurações de validação
    VALIDATION: {
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        CODIGO_REGEX: /^[A-Z0-9]{4,10}$/,
        NOME_REGEX: /^[a-zA-ZÀ-ÿ\s]{3,50}$/
    },
    
    // Mensagens do sistema
    MESSAGES: {
        SUCCESS: {
            LOGIN: 'Login realizado com sucesso!',
            CADASTRO: 'Conta criada com sucesso!',
            COMPRA_VALIDADA: 'Compra validada com sucesso!',
            CUPOM_UTILIZADO: 'Cupom aplicado com sucesso!'
        },
        ERROR: {
            LOGIN_INVALIDO: 'Usuário ou senha incorretos.',
            USUARIO_EXISTENTE: 'Este nome de usuário já está em uso.',
            EMAIL_EXISTENTE: 'Este e-mail já está cadastrado.',
            SENHA_INVALIDA: 'A senha deve ter pelo menos 6 caracteres.',
            SENHAS_DIFERENTES: 'As senhas não coincidem.',
            EMAIL_INVALIDO: 'Por favor, insira um e-mail válido.',
            CAMPOS_OBRIGATORIOS: 'Por favor, preencha todos os campos.',
            CODIGO_INVALIDO: 'Por favor, digite um código válido.'
        },
        INFO: {
            CARREGANDO: 'Carregando...',
            NENHUMA_ATIVIDADE: 'Nenhuma atividade recente',
            NENHUM_CUPOM: 'Nenhum cupom disponível',
            NENHUMA_COMPRA: 'Nenhuma compra registrada'
        }
    },
    
    // Configurações de lojas padrão
    LOJAS_PADRAO: [
        {
            id: 1,
            nome: 'Supermercado Central',
            endereco: 'Rua das Flores, 123',
            telefone: '(11) 9999-9999',
            comprasNecessarias: 5,
            cupons: [
                { desconto: 10, validade: '30 dias', comprasNecessarias: 5 },
                { desconto: 20, validade: '30 dias', comprasNecessarias: 10 }
            ]
        },
        {
            id: 2,
            nome: 'Farmácia Popular',
            endereco: 'Av. Principal, 456',
            telefone: '(11) 8888-8888',
            comprasNecessarias: 3,
            cupons: [
                { desconto: 15, validade: '15 dias', comprasNecessarias: 3 },
                { desconto: 25, validade: '30 dias', comprasNecessarias: 6 }
            ]
        },
        {
            id: 3,
            nome: 'Loja de Roupas Fashion',
            endereco: 'Shopping Center, Loja 78',
            telefone: '(11) 7777-7777',
            comprasNecessarias: 2,
            cupons: [
                { desconto: 20, validade: '60 dias', comprasNecessarias: 2 },
                { desconto: 30, validade: '90 dias', comprasNecessarias: 5 }
            ]
        }
    ],
    
    // Configurações de desenvolvimento
    DEV: {
        DEBUG_MODE: false,
        LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
        MOCK_DATA: true,
        AUTO_SAVE: true
    }
};

// Funções utilitárias de configuração
const ConfigUtils = {
    // Obter configuração
    get: (key) => {
        const keys = key.split('.');
        let value = FIDELIX_CONFIG;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return undefined;
            }
        }
        
        return value;
    },
    
    // Definir configuração
    set: (key, value) => {
        const keys = key.split('.');
        let config = FIDELIX_CONFIG;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!(keys[i] in config)) {
                config[keys[i]] = {};
            }
            config = config[keys[i]];
        }
        
        config[keys[keys.length - 1]] = value;
    },
    
    // Verificar se configuração existe
    has: (key) => {
        return ConfigUtils.get(key) !== undefined;
    },
    
    // Obter mensagem do sistema
    getMessage: (type, key) => {
        return FIDELIX_CONFIG.MESSAGES[type]?.[key] || 'Mensagem não encontrada';
    },
    
    // Obter cor do sistema
    getColor: (colorName) => {
        return FIDELIX_CONFIG.COLORS[colorName] || FIDELIX_CONFIG.COLORS.PRIMARY;
    },
    
    // Validar configuração
    validate: () => {
        const required = [
            'APP_NAME',
            'COLORS.PRIMARY',
            'COLORS.SECONDARY',
            'MESSAGES.SUCCESS.LOGIN',
            'MESSAGES.ERROR.LOGIN_INVALIDO'
        ];
        
        const missing = required.filter(key => !ConfigUtils.has(key));
        
        if (missing.length > 0) {
            console.error('Configurações obrigatórias ausentes:', missing);
            return false;
        }
        
        return true;
    },
    
    // Exportar configuração
    export: () => {
        return JSON.stringify(FIDELIX_CONFIG, null, 2);
    },
    
    // Importar configuração
    import: (configString) => {
        try {
            const config = JSON.parse(configString);
            Object.assign(FIDELIX_CONFIG, config);
            return true;
        } catch (error) {
            console.error('Erro ao importar configuração:', error);
            return false;
        }
    }
};

// Validação inicial da configuração
if (typeof window !== 'undefined') {
    // Executar apenas no browser
    document.addEventListener('DOMContentLoaded', () => {
        if (!ConfigUtils.validate()) {
            console.warn('Configuração do Fidelix inválida. Verifique o console para detalhes.');
        }
        
        if (FIDELIX_CONFIG.DEV.DEBUG_MODE) {
            console.log('Configuração do Fidelix carregada:', FIDELIX_CONFIG);
        }
    });
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FIDELIX_CONFIG, ConfigUtils };
} else if (typeof window !== 'undefined') {
    window.FIDELIX_CONFIG = FIDELIX_CONFIG;
    window.ConfigUtils = ConfigUtils;
}
