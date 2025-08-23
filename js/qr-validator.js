// Configurações do Validador de QR Code
const QR_VALIDATOR_CONFIG = {
    // Configurações de validação
    validation: {
        // Tamanho mínimo do nome da empresa
        minEmpresaLength: 3,
        
        // Tamanho máximo do nome da empresa
        maxEmpresaLength: 100,
        
        // Caracteres especiais permitidos
        allowedSpecialChars: [' ', '-', '&', '.', ',', '(', ')', '/'],
        
        // Palavras proibidas (para evitar fraudes)
        forbiddenWords: ['teste', 'fake', 'falso', 'invalido', 'erro']
    },
    
    // Configurações de formato
    formats: {
        // Formatos suportados
        supported: ['text', 'json'],
        
        // Campos JSON obrigatórios
        requiredJsonFields: ['empresa'],
        
        // Campos JSON opcionais
        optionalJsonFields: ['nome', 'loja', 'tipo', 'codigo']
    },
    
    // Configurações de erro
    errors: {
        // Mensagens de erro personalizadas
        messages: {
            empresaNaoEncontrada: 'Empresa "{empresa}" não encontrada no sistema.',
            qrCodeInvalido: 'QR Code inválido ou corrompido.',
            formatoNaoSuportado: 'Formato de QR Code não suportado.',
            empresaMuitoCurta: 'Nome da empresa muito curto.',
            empresaMuitoLonga: 'Nome da empresa muito longo.',
            caracteresInvalidos: 'QR Code contém caracteres inválidos.',
            palavraProibida: 'QR Code contém palavras não permitidas.'
        }
    },
    
    // Configurações de debug
    debug: {
        // Habilitar logs detalhados
        enabled: true,
        
        // Mostrar informações de validação
        showValidationInfo: true
    }
};

// Classe principal do validador
class QRCodeValidator {
    constructor(config = QR_VALIDATOR_CONFIG) {
        this.config = config;
        this.lojas = [];
    }
    
    // Definir lista de lojas para validação
    setLojas(lojas) {
        this.lojas = lojas;
    }
    
    // Validar QR Code
    validar(codigo) {
        try {
            // Log de debug
            if (this.config.debug.enabled) {
                console.log('🔍 Validando QR Code:', codigo);
            }
            
            // Validações básicas
            const validacaoBasica = this.validarBasico(codigo);
            if (!validacaoBasica.valido) {
                return validacaoBasica;
            }
            
            // Decodificar conteúdo
            const dadosDecodificados = this.decodificarConteudo(codigo);
            if (!dadosDecodificados.valido) {
                return dadosDecodificados;
            }
            
            // Validar empresa
            const validacaoEmpresa = this.validarEmpresa(dadosDecodificados.dados);
            if (!validacaoEmpresa.valido) {
                return validacaoEmpresa;
            }
            
            // Log de sucesso
            if (this.config.debug.enabled) {
                console.log('✅ QR Code válido para empresa:', validacaoEmpresa.empresa);
            }
            
            return {
                valido: true,
                dados: dadosDecodificados.dados,
                empresa: validacaoEmpresa.empresa,
                loja: validacaoEmpresa.loja
            };
            
        } catch (error) {
            console.error('❌ Erro na validação:', error);
            return {
                valido: false,
                mensagem: this.config.errors.messages.qrCodeInvalido,
                erro: error.message
            };
        }
    }
    
    // Validação básica do QR Code
    validarBasico(codigo) {
        // Verificar se o código existe
        if (!codigo || typeof codigo !== 'string') {
            return {
                valido: false,
                mensagem: this.config.errors.messages.qrCodeInvalido
            };
        }
        
        // Verificar tamanho
        if (codigo.length < this.config.validation.minEmpresaLength) {
            return {
                valido: false,
                mensagem: this.config.errors.messages.empresaMuitoCurta
            };
        }
        
        if (codigo.length > this.config.validation.maxEmpresaLength) {
            return {
                valido: false,
                mensagem: this.config.errors.messages.empresaMuitoLonga
            };
        }
        
        // Verificar palavras proibidas
        const palavrasProibidas = this.config.validation.forbiddenWords;
        const codigoLower = codigo.toLowerCase();
        
        for (const palavra of palavrasProibidas) {
            if (codigoLower.includes(palavra.toLowerCase())) {
                return {
                    valido: false,
                    mensagem: this.config.errors.messages.palavraProibida
                };
            }
        }
        
        return { valido: true };
    }
    
    // Decodificar conteúdo do QR Code
    decodificarConteudo(codigo) {
        try {
            console.log('🔍 Decodificando código:', codigo);
            console.log('🔍 Tipo do código:', typeof codigo);
            
            // Se o código já é um objeto (já foi parseado), retornar diretamente
            if (typeof codigo === 'object' && codigo !== null) {
                console.log('✅ Código já é um objeto:', codigo);
                return {
                    valido: true,
                    dados: codigo,
                    formato: 'object'
                };
            }
            
            // Se é string, tentar limpar e fazer parse
            if (typeof codigo === 'string') {
                let codigoLimpo = codigo.trim();
                
                // Remover possíveis aspas extras no início e fim
                if (codigoLimpo.startsWith('"') && codigoLimpo.endsWith('"')) {
                    codigoLimpo = codigoLimpo.slice(1, -1);
                }
                
                // Tentar decodificar como JSON
                if (codigoLimpo.startsWith('{') || codigoLimpo.startsWith('[')) {
                    try {
                        const dadosJSON = JSON.parse(codigoLimpo);
                        console.log('✅ JSON parseado com sucesso:', dadosJSON);
                        
                        // Verificar campos obrigatórios
                        const camposObrigatorios = this.config.formats.requiredJsonFields;
                        for (const campo of camposObrigatorios) {
                            if (!dadosJSON[campo]) {
                                return {
                                    valido: false,
                                    mensagem: `Campo obrigatório "${campo}" não encontrado no JSON.`
                                };
                            }
                        }
                        
                        return {
                            valido: true,
                            dados: dadosJSON,
                            formato: 'json'
                        };
                    } catch (jsonError) {
                        console.warn('⚠️ Falha no parse JSON, tentando como texto:', jsonError);
                        // Se falhar o parse JSON, tratar como texto
                        return {
                            valido: true,
                            dados: { empresa: codigoLimpo },
                            formato: 'text'
                        };
                    }
                }
                
                // Tratar como texto simples
                return {
                    valido: true,
                    dados: { empresa: codigoLimpo },
                    formato: 'text'
                };
            }
            
            // Fallback para outros tipos
            return {
                valido: true,
                dados: { empresa: String(codigo) },
                formato: 'text'
            };
            
        } catch (error) {
            console.error('❌ Erro ao decodificar conteúdo:', error);
            return {
                valido: false,
                mensagem: 'Erro ao decodificar conteúdo do QR Code.'
            };
        }
    }
    
    // Validar se a empresa existe
    validarEmpresa(dados) {
        // Extrair nome da empresa
        const nomeEmpresa = dados.empresa || dados.nome || dados.loja || '';
        
        if (!nomeEmpresa) {
            return {
                valido: false,
                mensagem: 'Nome da empresa não encontrado no QR Code.'
            };
        }
        
        // Buscar loja pelo nome (case insensitive)
        const loja = this.lojas.find(l => 
            l.nome.toLowerCase().includes(nomeEmpresa.toLowerCase()) ||
            nomeEmpresa.toLowerCase().includes(l.nome.toLowerCase())
        );
        
        if (!loja) {
            return {
                valido: false,
                mensagem: this.config.errors.messages.empresaNaoEncontrada.replace('{empresa}', nomeEmpresa)
            };
        }
        
        return {
            valido: true,
            empresa: nomeEmpresa,
            loja: loja
        };
    }
    
    // Gerar dados de compra baseados na validação
    gerarDadosCompra(validacao) {
        if (!validacao.valido || !validacao.loja) {
            return null;
        }
        
        return {
            codigo: Date.now().toString(),
            loja: validacao.loja.nome,
            lojaId: validacao.loja.id,
            valor: this.gerarValorCompra(validacao.loja),
            data: new Date().toISOString(),
            tipo: 'Física',
            empresa: validacao.empresa
        };
    }
    
    // Gerar valor de compra baseado na loja
    gerarValorCompra(loja) {
        const valoresBase = {
            'Supermercado': { min: 30, max: 150 },
            'Farmácia': { min: 20, max: 80 },
            'Loja de Roupas': { min: 50, max: 200 },
            'Padaria': { min: 15, max: 60 }
        };
        
        let tipoLoja = 'Supermercado';
        if (loja.nome.toLowerCase().includes('farmácia') || loja.nome.toLowerCase().includes('farmacia')) {
            tipoLoja = 'Farmácia';
        } else if (loja.nome.toLowerCase().includes('roupa') || loja.nome.toLowerCase().includes('fashion')) {
            tipoLoja = 'Loja de Roupas';
        } else if (loja.nome.toLowerCase().includes('padaria') || loja.nome.toLowerCase().includes('pão')) {
            tipoLoja = 'Padaria';
        }
        
        const valores = valoresBase[tipoLoja] || valoresBase['Supermercado'];
        return (Math.random() * (valores.max - valores.min) + valores.min).toFixed(2);
    }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.QRCodeValidator = QRCodeValidator;
    window.QR_VALIDATOR_CONFIG = QR_VALIDATOR_CONFIG;
}
