// Sistema de Fidelidade Fidelix
class FidelixSystem {
    constructor() {
        this.usuario = null;
        this.compras = [];
        this.cupons = [];
        this.lojas = [];
        this.historico = [];
        this.qrValidator = null; // Novo validador de QR Code
        this.leituraAtiva = false; // Controle de leitura ativa
        this.frameCount = 0; // Contador de frames para debug
        this.html5QrCode = null; // Instância do HTML5-QRCode
        this.init();
    }

    init() {
        this.carregarDados();
        this.verificarLogin();
        this.inicializarValidadorQR(); // Inicializar validador
        this.carregarDashboard();
        this.setupEventListeners();
    }

    // Verificação de login
    verificarLogin() {
        const usuarioLogado = localStorage.getItem('usuarioLogado');
        if (!usuarioLogado) {
            window.location.href = 'index.html';
            return;
        }

        this.usuario = JSON.parse(usuarioLogado);
        document.getElementById('userWelcome').textContent = `Bem-vindo, ${this.usuario.nome}!`;
    }

    // Carregar dados do localStorage
    carregarDados() {
        this.compras = JSON.parse(localStorage.getItem('compras') || '[]');
        this.cupons = JSON.parse(localStorage.getItem('cupons') || '[]');
        this.lojas = JSON.parse(localStorage.getItem('lojas') || '[]');
        this.historico = JSON.parse(localStorage.getItem('historico') || '[]');
        const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');

        console.log('📊 Dados carregados:', {
            compras: this.compras.length,
            cupons: this.cupons.length,
            lojas: this.lojas.length,
            historico: this.historico.length
        });

        // Sincronizar empresas com lojas (garantir que cada empresa tenha uma loja correspondente)
        this.sincronizarEmpresasComLojas(empresas);

        // Se ainda não houver lojas, criar algumas de exemplo
        if (this.lojas.length === 0) {
            console.log('🏪 Criando lojas de exemplo...');
            this.criarLojasExemplo();
        }
        
        console.log('🏪 Lojas disponíveis:', this.lojas.map(l => l.nome));
        
        // Atualizar validador de QR Code com as lojas
        if (this.qrValidator) {
            this.qrValidator.setLojas(this.lojas);
        }
    }

    // Garante que exista uma loja para cada empresa cadastrada
    sincronizarEmpresasComLojas(empresas) {
        let alterou = false;

        empresas.forEach(empresa => {
            // Tenta encontrar uma loja já vinculada pela empresaId ou por nome
            let loja = this.lojas.find(l => l.empresaId === empresa.id) ||
                       this.lojas.find(l => (l.nome && l.nome === empresa.razaoSocial));

            if (!loja) {
                // Criar nova loja para esta empresa
                loja = {
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    empresaId: empresa.id,
                    nome: empresa.razaoSocial,
                    cnpj: empresa.cnpj,
                    endereco: empresa.endereco || 'Não informado',
                    telefone: empresa.telefone || 'Não informado',
                    comprasNecessarias: empresa.comprasNecessarias || 3,
                    cupons: []
                };
                this.lojas.push(loja);
                alterou = true;
            } else {
                // Atualizar dados essenciais se mudou
                const campos = ['nome','cnpj','comprasNecessarias'];
                campos.forEach(c => {
                    const origem = c === 'nome' ? empresa.razaoSocial : empresa[c];
                    if (origem && loja[c] !== origem) {
                        loja[c] = origem;
                        alterou = true;
                    }
                });
                
                // Atualizar endereço se mudou
                if (empresa.endereco && loja.endereco !== empresa.endereco) {
                    loja.endereco = empresa.endereco;
                    alterou = true;
                }
                
                if (empresa.telefone && loja.telefone !== empresa.telefone) { 
                    loja.telefone = empresa.telefone; 
                    alterou = true; 
                }
            }

            // Espelhar cupons da empresa na loja para cálculo de progresso/objetivos
            if (Array.isArray(empresa.cupons)) {
                const cuponsEspelhados = empresa.cupons.map(c => ({
                    desconto: c.desconto,
                    validade: typeof c.validade === 'number' ? `${c.validade} dias` : c.validade || '30 dias',
                    comprasNecessarias: c.comprasNecessarias
                }));
                const difere = JSON.stringify(loja.cupons || []) !== JSON.stringify(cuponsEspelhados);
                if (difere) {
                    loja.cupons = cuponsEspelhados;
                    alterou = true;
                }
            }
        });

        if (alterou) {
            localStorage.setItem('lojas', JSON.stringify(this.lojas));
        }
    }

    // Inicializar validador de QR Code
    inicializarValidadorQR() {
        if (typeof QRCodeValidator !== 'undefined') {
            this.qrValidator = new QRCodeValidator();
            this.qrValidator.setLojas(this.lojas);
            console.log('✅ Validador de QR Code inicializado com', this.lojas.length, 'lojas');
        } else {
            console.warn('⚠️ QRCodeValidator não encontrado. Usando validação básica.');
        }
    }

    // Criar lojas de exemplo
    criarLojasExemplo() {
        console.log('🏪 Criando lojas de exemplo...');
        
        this.lojas = [
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
        ];
        
        console.log('✅ Lojas criadas:', this.lojas.map(l => l.nome));
        this.salvarDados();
        console.log('💾 Dados salvos no localStorage');
    }

    // Salvar dados no localStorage
    salvarDados() {
        console.log('💾 Salvando dados no localStorage...');
        console.log('🏪 Lojas para salvar:', this.lojas.length);
        console.log('🛒 Compras para salvar:', this.compras.length);
        console.log('🎫 Cupons para salvar:', this.cupons.length);
        console.log('📚 Histórico para salvar:', this.historico.length);
        
        try {
            localStorage.setItem('compras', JSON.stringify(this.compras));
            localStorage.setItem('cupons', JSON.stringify(this.cupons));
            localStorage.setItem('lojas', JSON.stringify(this.lojas));
            localStorage.setItem('historico', JSON.stringify(this.historico));
            
            console.log('✅ Dados salvos com sucesso!');
            
            // Verificar se foi salvo corretamente
            const comprasSalvas = JSON.parse(localStorage.getItem('compras') || '[]');
            const cuponsSalvos = JSON.parse(localStorage.getItem('cupons') || '[]');
            const lojasSalvas = JSON.parse(localStorage.getItem('lojas') || '[]');
            const historicoSalvo = JSON.parse(localStorage.getItem('historico') || '[]');
            
            console.log('🔍 Verificação - Dados no localStorage:');
            console.log('  - Compras:', comprasSalvas.length);
            console.log('  - Cupons:', cuponsSalvos.length);
            console.log('  - Lojas:', lojasSalvas.length);
            console.log('  - Histórico:', historicoSalvo.length);
            
        } catch (error) {
            console.error('❌ Erro ao salvar dados:', error);
        }
    }

    // Setup de event listeners
    setupEventListeners() {
        // Filtros do histórico
        document.getElementById('filtroLoja')?.addEventListener('change', () => this.filtrarHistorico());
        document.getElementById('filtroPeriodo')?.addEventListener('change', () => this.filtrarHistorico());
    }

    // Carregar dashboard
    carregarDashboard() {
        console.log('🔄 Carregando dashboard...');
        console.log('📊 Estado atual - Compras:', this.compras.length);
        
        this.atualizarEstatisticas();
        this.carregarAtividadesRecentes();
        this.carregarProximosObjetivos();
        this.carregarUltimasCompras();
        this.carregarCuponsDisponiveis();
        this.carregarCuponsUtilizados();
        this.carregarHistoricoCompras();
        this.carregarHistoricoCupons();
        this.carregarProgressoLojas();
        this.carregarInfoLojas();
        
        console.log('✅ Dashboard carregado completamente');
    }

    // Atualizar estatísticas
    atualizarEstatisticas() {
        console.log('🔄 Atualizando estatísticas...');
        console.log('📊 Compras para estatísticas:', this.compras.length);
        
        const totalCompras = this.compras.length;
        const totalCupons = this.cupons.filter(c => !c.utilizado).length;
        const totalLojas = this.lojas.length;

        const totalComprasElement = document.getElementById('totalCompras');
        const totalCuponsElement = document.getElementById('totalCupons');
        const totalLojasElement = document.getElementById('totalLojas');
        
        if (totalComprasElement) totalComprasElement.textContent = totalCompras;
        if (totalCuponsElement) totalCuponsElement.textContent = totalCupons;
        if (totalLojasElement) totalLojasElement.textContent = totalLojas;
        
        console.log('✅ Estatísticas atualizadas:', { totalCompras, totalCupons, totalLojas });
    }

    // Carregar atividades recentes
    carregarAtividadesRecentes() {
        const container = document.getElementById('atividadesRecentes');
        const atividades = [...this.historico]
            .sort((a, b) => new Date(b.data) - new Date(a.data))
            .slice(0, 5);

        if (atividades.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhuma atividade recente</p>';
            return;
        }

        container.innerHTML = atividades.map(atividade => `
            <div class="activity-item">
                <i class="fas ${this.getIconeAtividade(atividade.tipo)}"></i>
                <div class="activity-info">
                    <div class="activity-title">${atividade.titulo}</div>
                    <div class="activity-time">${this.formatarData(atividade.data)}</div>
                </div>
            </div>
        `).join('');
    }

    // Carregar próximos objetivos
    carregarProximosObjetivos() {
        const container = document.getElementById('proximosObjetivos');
        const objetivos = [];

        this.lojas.forEach(loja => {
            const comprasLoja = this.compras.filter(c => c.lojaId === loja.id).length;
            const proximoCupom = loja.cupons.find(c => c.comprasNecessarias > comprasLoja);
            
            if (proximoCupom) {
                objetivos.push({
                    loja: loja.nome,
                    comprasAtuais: comprasLoja,
                    comprasNecessarias: proximoCupom.comprasNecessarias,
                    desconto: proximoCupom.desconto
                });
            }
        });

        if (objetivos.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhum objetivo próximo</p>';
            return;
        }

        container.innerHTML = objetivos.map(objetivo => `
            <div class="objective-item">
                <i class="fas fa-trophy"></i>
                <div class="objective-info">
                    <div class="objective-title">${objetivo.loja} - ${objetivo.desconto}% OFF</div>
                    <div class="objective-progress">${objetivo.comprasAtuais}/${objetivo.comprasNecessarias} compras</div>
                </div>
            </div>
        `).join('');
    }

    // Carregar últimas compras
    carregarUltimasCompras() {
        console.log('🔄 Carregando últimas compras...');
        console.log('📊 Total de compras no sistema:', this.compras.length);
        console.log('📊 Compras:', this.compras);
        
        const container = document.getElementById('ultimasCompras');
        if (!container) {
            console.error('❌ Container de últimas compras não encontrado');
            return;
        }
        
        const ultimasCompras = [...this.compras]
            .sort((a, b) => new Date(b.data) - new Date(a.data))
            .slice(0, 5);

        console.log('📊 Últimas 5 compras ordenadas:', ultimasCompras);

        if (ultimasCompras.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhuma compra registrada</p>';
            console.log('ℹ️ Nenhuma compra para exibir');
            return;
        }

        const htmlCompras = ultimasCompras.map(compra => {
            const loja = this.lojas.find(l => l.id === compra.lojaId);
            console.log('🔍 Compra:', compra, 'Loja encontrada:', loja);
            
            return `
                <div class="historico-item">
                    <i class="fas fa-shopping-cart"></i>
                    <div class="historico-info">
                        <div class="historico-title">${loja ? loja.nome : 'Loja não encontrada'}</div>
                        <div class="historico-details">${this.formatarData(compra.data)} - ${compra.tipo} - R$ ${compra.valor}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = htmlCompras;
        console.log('✅ Últimas compras carregadas com sucesso');
        console.log('🔍 HTML gerado:', htmlCompras);
    }

    // Carregar cupons disponíveis
    carregarCuponsDisponiveis() {
        const container = document.getElementById('cuponsDisponiveis');
        const cuponsDisponiveis = this.cupons.filter(c => !c.utilizado);

        if (cuponsDisponiveis.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhum cupom disponível</p>';
            return;
        }

        container.innerHTML = cuponsDisponiveis.map(cupom => {
            const loja = this.lojas.find(l => l.id === cupom.lojaId);
            const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
            const empresa = cupom.empresaId ? empresas.find(e => e.id === cupom.empresaId) : null;
            
            let cupomInfo = '';
            if (cupom.descricao) {
                cupomInfo += `<div class="cupom-descricao">${cupom.descricao}</div>`;
            }
            if (cupom.valorMinimo && cupom.valorMinimo > 0) {
                cupomInfo += `<div class="cupom-valor-minimo">Mínimo: R$ ${cupom.valorMinimo.toFixed(2)}</div>`;
            }
            
            return `
                <div class="cupom-card ${empresa ? 'empresa-cupom' : ''}" onclick="fidelixSystem.usarCupom(${cupom.id})">
                    <div class="cupom-desconto">${cupom.desconto}% OFF</div>
                    <div class="cupom-loja">${loja ? loja.nome : 'Loja não encontrada'}</div>
                    ${empresa ? '<div class="cupom-empresa"><i class="fas fa-building"></i> Cupom Empresarial</div>' : ''}
                    ${cupomInfo}
                    <div class="cupom-validade">Válido até ${this.formatarData(cupom.validade)}</div>
                </div>
            `;
        }).join('');
    }

    // Carregar cupons utilizados
    carregarCuponsUtilizados() {
        const container = document.getElementById('cuponsUtilizados');
        const cuponsUtilizados = this.cupons.filter(c => c.utilizado);

        if (cuponsUtilizados.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhum cupom utilizado</p>';
            return;
        }

        container.innerHTML = cuponsUtilizados.map(cupom => {
            const loja = this.lojas.find(l => l.id === cupom.lojaId);
            return `
                <div class="cupom-item used">
                    <i class="fas fa-check-circle"></i>
                    <div class="cupom-info">
                        <div class="cupom-desconto-small">${cupom.desconto}% OFF - ${loja ? loja.nome : 'Loja não encontrada'}</div>
                        <div class="cupom-details">Utilizado em ${this.formatarData(cupom.dataUtilizacao)}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Carregar histórico de compras
    carregarHistoricoCompras() {
        const container = document.getElementById('historicoCompras');
        this.filtrarHistorico();
    }

    // Carregar histórico de cupons
    carregarHistoricoCupons() {
        const container = document.getElementById('historicoCupons');
        const historicoCupons = this.cupons
            .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));

        if (historicoCupons.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhum cupom no histórico</p>';
            return;
        }

        container.innerHTML = historicoCupons.map(cupom => {
            const loja = this.lojas.find(l => l.id === cupom.lojaId);
            const status = cupom.utilizado ? 'Utilizado' : 'Disponível';
            const statusClass = cupom.utilizado ? 'used' : '';
            
            return `
                <div class="cupom-item ${statusClass}">
                    <i class="fas ${cupom.utilizado ? 'fa-check-circle' : 'fa-ticket-alt'}"></i>
                    <div class="cupom-info">
                        <div class="cupom-desconto-small">${cupom.desconto}% OFF - ${loja ? loja.nome : 'Loja não encontrada'}</div>
                        <div class="cupom-details">${status} - Criado em ${this.formatarData(cupom.dataCriacao)}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Carregar progresso das lojas
    carregarProgressoLojas() {
        const container = document.getElementById('progressoLojas');
        
        if (this.lojas.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhuma loja cadastrada</p>';
            return;
        }

        container.innerHTML = this.lojas.map(loja => {
            const comprasLoja = this.compras.filter(c => c.lojaId === loja.id).length;
            const proximoCupom = loja.cupons.find(c => c.comprasNecessarias > comprasLoja);
            const progresso = proximoCupom ? (comprasLoja / proximoCupom.comprasNecessarias) * 100 : 100;
            
            return `
                <div class="loja-progress-item">
                    <div class="loja-header">
                        <div class="loja-nome">${loja.nome}</div>
                        <div class="loja-compras">${comprasLoja} compras</div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(progresso, 100)}%"></div>
                    </div>
                    <div class="progress-text">
                        ${proximoCupom ? `${comprasLoja}/${proximoCupom.comprasNecessarias} compras para próximo cupom` : 'Todos os cupons desbloqueados!'}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Carregar informações das lojas
    carregarInfoLojas() {
        const container = document.getElementById('infoLojas');
        
        if (this.lojas.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhuma informação disponível</p>';
            return;
        }

        container.innerHTML = this.lojas.map(loja => {
            const comprasLoja = this.compras.filter(c => c.lojaId === loja.id).length;
            const cuponsDisponiveis = loja.cupons.length;
            
            return `
                <div class="loja-info-item">
                    <div class="loja-info-header">
                        <i class="fas fa-store"></i>
                        <div class="loja-info-nome">${loja.nome}</div>
                    </div>
                    <div class="loja-info-details">
                        <strong>Endereço:</strong> ${loja.endereco}<br>
                        <strong>Telefone:</strong> ${loja.telefone}<br>
                        <strong>Compras realizadas:</strong> ${comprasLoja}<br>
                        <strong>Cupons disponíveis:</strong> ${cuponsDisponiveis}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Filtrar histórico
    filtrarHistorico() {
        const filtroLoja = document.getElementById('filtroLoja').value;
        const filtroPeriodo = parseInt(document.getElementById('filtroPeriodo').value);
        const container = document.getElementById('historicoCompras');

        let comprasFiltradas = [...this.compras];

        // Filtrar por loja
        if (filtroLoja) {
            comprasFiltradas = comprasFiltradas.filter(c => c.lojaId === parseInt(filtroLoja));
        }

        // Filtrar por período
        if (filtroPeriodo) {
            const dataLimite = new Date();
            dataLimite.setDate(dataLimite.getDate() - filtroPeriodo);
            comprasFiltradas = comprasFiltradas.filter(c => new Date(c.data) >= dataLimite);
        }

        // Ordenar por data
        comprasFiltradas.sort((a, b) => new Date(b.data) - new Date(a.data));

        if (comprasFiltradas.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhuma compra encontrada com os filtros selecionados</p>';
            return;
        }

        container.innerHTML = comprasFiltradas.map(compra => {
            const loja = this.lojas.find(l => l.id === compra.lojaId);
            return `
                <div class="historico-item">
                    <i class="fas fa-shopping-cart"></i>
                    <div class="historico-info">
                        <div class="historico-title">${loja ? loja.nome : 'Loja não encontrada'}</div>
                        <div class="historico-details">${this.formatarData(compra.data)} - ${compra.tipo} - ${compra.valor || 'Valor não informado'}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Validar compra por código
    validarCodigoCompra() {
        const codigo = document.getElementById('codigoCompra').value.trim();
        
        if (!codigo) {
            this.mostrarModal('Erro', 'Por favor, digite um código válido.');
            return;
        }

        // Simular validação de compra
        this.simularValidacaoCompra(codigo);
    }

    // Simular validação de compra
    simularValidacaoCompra(codigo) {
        // Simular processamento
        setTimeout(() => {
            const loja = this.lojas[Math.floor(Math.random() * this.lojas.length)];
            const compra = {
                id: Date.now(),
                usuarioId: this.usuario?.id,
                lojaId: loja.id,
                data: new Date().toISOString(),
                tipo: 'Online',
                valor: (Math.random() * 100 + 20).toFixed(2),
                codigo: codigo
            };

            this.compras.push(compra);
            this.adicionarHistorico('Compra validada', `Compra de R$ ${compra.valor} na ${loja.nome}`, 'compra');
            this.verificarCupons(loja.id);
            this.salvarDados();
            this.carregarDashboard();

            this.mostrarModalSucesso('Sucesso!', `Compra validada com sucesso na ${loja.nome}!`);
            document.getElementById('codigoCompra').value = '';
        }, 1000);
    }

    // Escanear QR Code (simulado)
    scanQRCode() {
        this.mostrarModal('QR Code', 'Funcionalidade de escaneamento de QR Code será implementada com biblioteca de câmera.');
    }

    // Inicializar leitura de QR Code
    async iniciarLeituraQR() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.mostrarModal('Erro', 'Câmera não suportada neste dispositivo.');
            return;
        }

        try {
            console.log('🔧 Iniciando leitura de QR Code...');
            
            // Verificar se HTML5-QRCode está disponível
            if (typeof Html5Qrcode === 'undefined') {
                console.error('❌ HTML5-QRCode não está disponível');
                this.mostrarModal('Erro', 'Biblioteca de leitura QR não carregada. Recarregue a página.');
                return;
            }
            
            // Limpar container
            const container = document.querySelector('#qr-interactive');
            container.innerHTML = '';
            
            // Criar instância do HTML5-QRCode
            this.html5QrCode = new Html5Qrcode("qr-interactive");
            
            console.log('📱 Configurando câmera...');
            
            // Configurações da câmera
            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            };
            
            // Iniciar leitura
            await this.html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText, decodedResult) => {
                    console.log('🔍 QR Code detectado:', decodedText);
                    // Parar a leitura automaticamente após detectar
                    this.pararLeituraQR();
                    // Processar o QR Code detectado
                    this.processarQRCodeDetectado(decodedText);
                },
                (errorMessage) => {
                    // Erro de decodificação é normal, não mostrar
                    console.log(' Procurando QR Code...');
                }
            );
            
            console.log('✅ Câmera inicializada com sucesso');
            this.atualizarInterfaceQR(true);
            this.leituraAtiva = true;
            
        } catch (error) {
            console.error('❌ Erro ao inicializar câmera:', error);
            this.mostrarModal('Erro', 'Erro ao acessar a câmera. Verifique as permissões.');
        }
    }

    // Nova função para processar QR Code detectado
    processarQRCodeDetectado(codigo) {
        try {
            console.log('✅ QR Code detectado com sucesso:', codigo);
            
            // Validar QR Code baseado no nome da empresa
            const validacao = this.validarQRCodeEmpresa(codigo);
            
            if (validacao.valido) {
                // Mostrar resultado com dados reais da loja
                this.mostrarResultadoQR(validacao.dadosCompra);
            } else {
                // Mostrar erro de validação
                this.mostrarErroQRCode(validacao.mensagem);
            }
            
        } catch (error) {
            console.error('❌ Erro ao processar QR Code:', error);
            this.mostrarErroQRCode('Erro interno ao processar QR Code. Tente novamente.');
        }
    }

    // Parar leitura de QR Code
    async pararLeituraQR() {
        this.leituraAtiva = false;
        
        // Parar HTML5-QRCode se estiver ativo
        if (this.html5QrCode && this.html5QrCode.isScanning) {
            try {
                await this.html5QrCode.stop();
                console.log('✅ Leitura parada com sucesso');
            } catch (error) {
                console.warn('⚠️ Erro ao parar leitura:', error);
            }
        }
        
        // Restaurar interface
        this.atualizarInterfaceQR(false);
        this.ocultarResultadoQR();
        
        // Restaurar container original
        const container = document.querySelector('#qr-interactive');
        container.innerHTML = '<div id="qr-status" class="qr-status"><i class="fas fa-camera"></i><p>Posicione o QR Code da loja na área da câmera</p></div>';
    }

    // Alternar entre câmeras
    alternarCamera() {
        this.pararLeituraQR();
        setTimeout(() => {
            this.iniciarLeituraQR();
        }, 500);
    }

    // Processar QR Code detectado
    async processarQRCode(result) {
        try {
            // Validações de segurança
            if (!result) {
                console.warn('⚠️ Resultado vazio recebido do Quagga');
                return;
            }
            
            if (!result.codeResult) {
                console.warn('⚠️ codeResult não encontrado no resultado:', result);
                return;
            }
            
            if (!result.codeResult.code) {
                console.warn('⚠️ Código não encontrado no codeResult:', result.codeResult);
                return;
            }
            
            const codigo = result.codeResult.code;
            console.log('✅ QR Code detectado com sucesso:', codigo);
            
            // Parar a leitura
            await this.pararLeituraQR();
            
            // Validar QR Code baseado no nome da empresa
            const validacao = this.validarQRCodeEmpresa(codigo);
            
            if (validacao.valido) {
                // Mostrar resultado com dados reais da loja
                this.mostrarResultadoQR(validacao.dadosCompra);
            } else {
                // Mostrar erro de validação
                this.mostrarErroQRCode(validacao.mensagem);
            }
            
        } catch (error) {
            console.error('❌ Erro ao processar QR Code:', error);
            this.mostrarErroQRCode('Erro interno ao processar QR Code. Tente novamente.');
            
            // Parar leitura em caso de erro
            await this.pararLeituraQR();
        }
    }

    // Validar QR Code baseado no nome da empresa
    validarQRCodeEmpresa(codigo) {
        console.log('🔍 Validando QR Code:', codigo);
        console.log('🔍 Tipo do código:', typeof codigo);
        console.log('🔍 Conteúdo bruto:', JSON.stringify(codigo));
        
        // Usar o novo validador se disponível
        if (this.qrValidator) {
            console.log('✅ Usando validador avançado');
            const validacao = this.qrValidator.validar(codigo);
            
            if (validacao.valido) {
                // Gerar dados da compra usando o validador
                const dadosCompra = this.qrValidator.gerarDadosCompra(validacao);
                console.log('✅ Validação bem-sucedida:', dadosCompra);
                return {
                    valido: true,
                    dadosCompra: dadosCompra,
                    loja: validacao.loja
                };
            } else {
                console.log('❌ Validação falhou:', validacao.mensagem);
                return validacao;
            }
        }
        
        console.log('⚠️ Usando validação básica (fallback)');
        
        // Fallback para o método antigo se o validador não estiver disponível
        try {
            // Tentar decodificar o QR Code (pode ser JSON ou texto simples)
            let dadosQR;
            
            // Se já é um objeto, usar diretamente
            if (typeof codigo === 'object' && codigo !== null) {
                dadosQR = codigo;
            }
            // Verificar se é JSON válido
            else if (typeof codigo === 'string') {
                let codigoLimpo = codigo.trim();
                
                // Remover possíveis aspas extras
                if (codigoLimpo.startsWith('"') && codigoLimpo.endsWith('"')) {
                    codigoLimpo = codigoLimpo.slice(1, -1);
                }
                
                if (codigoLimpo.startsWith('{') || codigoLimpo.startsWith('[')) {
                    try {
                        dadosQR = JSON.parse(codigoLimpo);
                    } catch (parseError) {
                        console.warn('⚠️ Falha no parse JSON, usando como texto:', parseError);
                        dadosQR = { empresa: codigoLimpo };
                    }
                } else {
                    dadosQR = { empresa: codigoLimpo };
                }
            } else {
                dadosQR = { empresa: String(codigo) };
            }
            
            // Extrair nome da empresa
            const nomeEmpresa = dadosQR.empresa || dadosQR.nome || dadosQR.loja || String(codigo);
            console.log('🔍 Nome da empresa extraído:', nomeEmpresa);
            
            // Buscar loja pelo nome (case insensitive)
            const loja = this.lojas.find(l => 
                l.nome.toLowerCase().includes(nomeEmpresa.toLowerCase()) ||
                nomeEmpresa.toLowerCase().includes(l.nome.toLowerCase())
            );
            
            if (!loja) {
                console.log('❌ Loja não encontrada para:', nomeEmpresa);
                return {
                    valido: false,
                    mensagem: `Empresa "${nomeEmpresa}" não encontrada no sistema. Verifique se o QR Code é da loja correta.`
                };
            }
            
            console.log('✅ Loja encontrada:', loja.nome);
            
            // Gerar dados da compra baseados na loja encontrada
            const dadosCompra = {
                codigo: typeof codigo === 'string' ? codigo : JSON.stringify(codigo),
                loja: loja.nome,
                lojaId: loja.id,
                valor: this.gerarValorCompra(loja),
                data: new Date().toISOString(),
                tipo: 'Física',
                empresa: nomeEmpresa
            };
            
            return {
                valido: true,
                dadosCompra: dadosCompra,
                loja: loja
            };
            
        } catch (error) {
            console.error('❌ Erro ao processar QR Code:', error);
            return {
                valido: false,
                mensagem: 'QR Code inválido ou corrompido. Tente novamente.'
            };
        }
    }

    // Gerar valor de compra baseado na loja
    gerarValorCompra(loja) {
        // Valores baseados no tipo de loja
        const valoresBase = {
            'Supermercado': { min: 30, max: 150 },
            'Farmácia': { min: 20, max: 80 },
            'Loja de Roupas': { min: 50, max: 200 },
            'Padaria': { min: 15, max: 60 }
        };
        
        // Determinar tipo de loja
        let tipoLoja = 'Supermercado'; // padrão
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

    // Mostrar resultado do QR Code
    mostrarResultadoQR(dadosCompra) {
        console.log('🔍 Mostrando resultado QR:', dadosCompra);
        
        document.getElementById('qr-loja-nome').textContent = dadosCompra.loja;
        document.getElementById('qr-codigo').textContent = dadosCompra.codigo;
        document.getElementById('qr-valor').textContent = `R$ ${dadosCompra.valor}`;
        
        document.getElementById('qr-result').style.display = 'block';
        document.getElementById('qr-result').classList.add('qr-success');
        
        // Armazenar dados temporariamente
        this.dadosCompraTemporaria = dadosCompra;
        console.log('💾 Dados temporários armazenados:', this.dadosCompraTemporaria);
    }

    // Mostrar erro de validação do QR Code
    mostrarErroQRCode(mensagem) {
        // Ocultar resultado anterior se existir
        this.ocultarResultadoQR();
        
        // Mostrar mensagem de erro
        this.mostrarModal('Erro de Validação', mensagem);
        
        // Resetar interface
        this.atualizarInterfaceQR(false);
    }

    // Ocultar resultado do QR Code
    ocultarResultadoQR() {
        document.getElementById('qr-result').style.display = 'none';
        document.getElementById('qr-result').classList.remove('qr-success');
        this.dadosCompraTemporaria = null;
    }

    // Confirmar compra do QR Code
    confirmarCompraQR() {
        console.log('🔄 Confirmando compra QR...');
        console.log('🔍 Dados temporários:', this.dadosCompraTemporaria);
        
        if (!this.dadosCompraTemporaria) {
            console.error('❌ Dados da compra não encontrados');
            this.mostrarModal('Erro', 'Dados da compra não encontrados.');
            return;
        }

        try {
            const compra = {
                id: Date.now(),
                usuarioId: this.usuario?.id,
                lojaId: this.dadosCompraTemporaria.lojaId,
                data: this.dadosCompraTemporaria.data,
                tipo: this.dadosCompraTemporaria.tipo,
                valor: this.dadosCompraTemporaria.valor,
                codigo: this.dadosCompraTemporaria.codigo
            };

            console.log('✅ Compra criada:', compra);

            // Adicionar compra ao array
            this.compras.push(compra);
            console.log('📊 Total de compras após adição:', this.compras.length);
            console.log('📊 Array de compras atualizado:', this.compras);

            // Adicionar ao histórico
            this.adicionarHistorico('Compra validada', 
                `Compra de R$ ${compra.valor} na ${this.dadosCompraTemporaria.loja}`, 'compra');
            
            // Verificar cupons
            this.verificarCupons(compra.lojaId);
            
            // Salvar dados ANTES de recarregar
            this.salvarDados();
            console.log('💾 Dados salvos no localStorage');
            
            // Verificar se foi salvo corretamente
            const comprasSalvas = JSON.parse(localStorage.getItem('compras') || '[]');
            console.log('🔍 Verificação - Compras no localStorage após salvar:', comprasSalvas.length);
            
            // Recarregar dashboard DEPOIS de salvar
            this.carregarDashboard();
            console.log('🔄 Dashboard recarregado');

            // Mostrar sucesso
            this.mostrarModalSucesso('Sucesso!', 
                `Compra validada com sucesso na ${this.dadosCompraTemporaria.loja}!`);
            
            // Limpar interface
            this.ocultarResultadoQR();
            this.atualizarInterfaceQR(false);
            
            // Limpar dados temporários
            this.dadosCompraTemporaria = null;
            
            console.log('✅ Compra confirmada com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao confirmar compra:', error);
            this.mostrarModal('Erro', 'Erro ao confirmar compra. Tente novamente.');
        }
    }

    // Rejeitar compra do QR Code
    rejeitarCompraQR() {
        this.ocultarResultadoQR();
        this.atualizarInterfaceQR(false);
        this.mostrarModal('Compra Rejeitada', 'A compra foi rejeitada. Nenhum dado foi salvo.');
    }

    // Testar validação de QR Code (para debug)
    testarValidacaoQR(codigo) {
        console.log('🧪 Testando validação com código:', codigo);
        
        try {
            const validacao = this.validarQRCodeEmpresa(codigo);
            
            if (validacao.valido) {
                console.log('✅ Teste válido:', validacao);
                this.mostrarResultadoQR(validacao.dadosCompra);
            } else {
                console.log('❌ Teste inválido:', validacao);
                this.mostrarErroQRCode(validacao.mensagem);
            }
            
        } catch (error) {
            console.error('❌ Erro no teste:', error);
            this.mostrarErroQRCode('Erro interno no teste de validação.');
        }
    }

    // Atualizar interface do QR Code
    atualizarInterfaceQR(ativo) {
        const btnIniciar = document.getElementById('btnIniciarQR');
        const btnParar = document.getElementById('btnPararQR');
        const btnAlternar = document.getElementById('btnAlternarCamera');
        const qrStatus = document.getElementById('qr-status');

        if (ativo) {
            btnIniciar.style.display = 'none';
            btnParar.style.display = 'inline-flex';
            btnAlternar.style.display = 'inline-flex';
            qrStatus.style.display = 'none';
        } else {
            btnIniciar.style.display = 'inline-flex';
            btnParar.style.display = 'none';
            btnAlternar.style.display = 'none';
            qrStatus.style.display = 'block';
        }
    }

    // Verificar cupons após compra
    verificarCupons(lojaId) {
        const loja = this.lojas.find(l => l.id === lojaId);
        if (!loja) return;

        const comprasLoja = this.compras.filter(c => c.lojaId === lojaId).length;
        
        // Verificar cupons das empresas
        const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
        const empresa = empresas.find(e => e.cnpj === loja.cnpj || e.razaoSocial === loja.nome);
        
        if (empresa && empresa.cupons) {
            empresa.cupons.forEach(cupomEmpresa => {
                if (comprasLoja >= cupomEmpresa.comprasNecessarias) {
                    // Verificar se já existe um cupom não utilizado
                    const cupomExistente = this.cupons.find(c => 
                        c.lojaId === lojaId && 
                        c.desconto === cupomEmpresa.desconto && 
                        !c.utilizado &&
                        c.empresaId === empresa.id
                    );

                    if (!cupomExistente) {
                        const novoCupom = {
                            id: Date.now(),
                            usuarioId: this.usuario?.id,
                            lojaId: lojaId,
                            empresaId: empresa.id,
                            desconto: cupomEmpresa.desconto,
                            dataCriacao: new Date().toISOString(),
                            validade: this.calcularValidadeEmpresa(cupomEmpresa.validade),
                            utilizado: false,
                            comprasNecessarias: cupomEmpresa.comprasNecessarias,
                            descricao: cupomEmpresa.descricao,
                            valorMinimo: cupomEmpresa.valorMinimo
                        };

                        this.cupons.push(novoCupom);
                        this.adicionarHistorico('Cupom desbloqueado', 
                            `${cupomEmpresa.desconto}% OFF na ${loja.nome}`, 'cupom');
                    }
                }
            });
        }
        
        // Verificar cupons padrão da loja (mantendo compatibilidade)
        if (loja.cupons) {
            loja.cupons.forEach(cupomConfig => {
                if (comprasLoja >= cupomConfig.comprasNecessarias) {
                    // Verificar se já existe um cupom não utilizado
                    const cupomExistente = this.cupons.find(c => 
                        c.lojaId === lojaId && 
                        c.desconto === cupomConfig.desconto && 
                        !c.utilizado &&
                        !c.empresaId // Cupons padrão não têm empresaId
                    );

                    if (!cupomExistente) {
                        const novoCupom = {
                            id: Date.now(),
                            usuarioId: this.usuario?.id,
                            lojaId: lojaId,
                            desconto: cupomConfig.desconto,
                            dataCriacao: new Date().toISOString(),
                            validade: this.calcularValidade(cupomConfig.validade),
                            utilizado: false,
                            comprasNecessarias: cupomConfig.comprasNecessarias
                        };

                        this.cupons.push(novoCupom);
                        this.adicionarHistorico('Cupom desbloqueado', 
                            `${cupomConfig.desconto}% OFF na ${loja.nome}`, 'cupom');
                    }
                }
            });
        }
    }

    // Usar cupom
    usarCupom(cupomId) {
        const cupom = this.cupons.find(c => c.id === cupomId);
        if (!cupom || cupom.utilizado) return;

        this.mostrarModal('Usar Cupom', 
            `Deseja usar o cupom de ${cupom.desconto}% OFF?`, 
            () => this.confirmarUsoCupom(cupom));
    }

    // Confirmar uso do cupom
    confirmarUsoCupom(cupom) {
        cupom.utilizado = true;
        cupom.dataUtilizacao = new Date().toISOString();
        
        const loja = this.lojas.find(l => l.id === cupom.lojaId);
        this.adicionarHistorico('Cupom utilizado', 
            `${cupom.desconto}% OFF usado na ${loja.nome}`, 'cupom');
        
        this.salvarDados();
        this.carregarDashboard();
        this.mostrarModalSucesso('Cupom utilizado!', 'Cupom aplicado com sucesso!');
    }

    // Adicionar ao histórico
    adicionarHistorico(titulo, descricao, tipo) {
        const atividade = {
            id: Date.now(),
            titulo,
            descricao,
            tipo,
            data: new Date().toISOString()
        };

        this.historico.unshift(atividade);
        if (this.historico.length > 100) {
            this.historico = this.historico.slice(0, 100);
        }
    }

    // Calcular validade do cupom
    calcularValidade(validade) {
        const data = new Date();
        if (validade.includes('dias')) {
            const dias = parseInt(validade);
            data.setDate(data.getDate() + dias);
        } else if (validade.includes('meses')) {
            const meses = parseInt(validade);
            data.setMonth(data.getMonth() + meses);
        }
        return data.toISOString();
    }

    // Calcular validade do cupom empresarial (em dias)
    calcularValidadeEmpresa(dias) {
        const data = new Date();
        data.setDate(data.getDate() + parseInt(dias));
        return data.toISOString();
    }

    // Mostrar modal de confirmação
    mostrarModal(titulo, mensagem, callback) {
        document.getElementById('modalTitle').textContent = titulo;
        document.getElementById('modalMessage').textContent = mensagem;
        
        if (callback) {
            document.getElementById('modalConfirmBtn').onclick = callback;
        } else {
            document.getElementById('modalConfirmBtn').onclick = () => this.closeModal();
        }
        
        document.getElementById('confirmModal').style.display = 'block';
    }

    // Mostrar modal de sucesso
    mostrarModalSucesso(titulo, mensagem) {
        document.getElementById('successTitle').textContent = titulo;
        document.getElementById('successMessage').textContent = mensagem;
        document.getElementById('successModal').style.display = 'block';
    }

    // Fechar modal
    closeModal() {
        document.getElementById('confirmModal').style.display = 'none';
    }

    // Fechar modal de sucesso
    closeSuccessModal() {
        document.getElementById('successModal').style.display = 'none';
    }

    // Utilitários
    getIconeAtividade(tipo) {
        const icones = {
            'compra': 'fa-shopping-cart',
            'cupom': 'fa-ticket-alt',
            'login': 'fa-sign-in-alt',
            'default': 'fa-info-circle'
        };
        return icones[tipo] || icones.default;
    }

    formatarData(dataString) {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Funções globais
let fidelixSystem;

// Inicializar sistema quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    fidelixSystem = new FidelixSystem();
});

// Funções de navegação
function showTab(tabName) {
    // Esconder todas as tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remover classe active de todos os botões
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Mostrar tab selecionada
    document.getElementById(tabName).classList.add('active');
    
    // Adicionar classe active ao botão clicado
    event.target.classList.add('active');
}

// Funções de validação
function showValidationTab(tabName) {
    const contents = document.querySelectorAll('.validation-content');
    const tabs = document.querySelectorAll('.validation-tab');
    
    contents.forEach(content => content.classList.remove('active'));
    tabs.forEach(tab => tab.classList.remove('active'));
    
    document.getElementById(`${tabName}-validation`).classList.add('active');
    event.target.classList.add('active');
}

// Funções de modal
function closeModal() {
    fidelixSystem.closeModal();
}

function closeSuccessModal() {
    fidelixSystem.closeSuccessModal();
}

// Funções de validação
function validarCodigoCompra() {
    fidelixSystem.validarCodigoCompra();
}

function scanQRCode() {
    fidelixSystem.scanQRCode();
}

// Novas funções de QR Code
function iniciarLeituraQR() {
    fidelixSystem.iniciarLeituraQR();
}

function pararLeituraQR() {
    fidelixSystem.pararLeituraQR();
}

function alternarCamera() {
    fidelixSystem.alternarCamera();
}

function confirmarCompraQR() {
    fidelixSystem.confirmarCompraQR();
}

function rejeitarCompraQR() {
    fidelixSystem.rejeitarCompraQR();
}

// Logout
function logout() {
    localStorage.removeItem('usuarioLogado');
    window.location.href = 'index.html';
}





// Fechar modais ao clicar fora
window.onclick = function(event) {
    const confirmModal = document.getElementById('confirmModal');
    const successModal = document.getElementById('successModal');
    
    if (event.target === confirmModal) {
        fidelixSystem.closeModal();
    }
    
    if (event.target === successModal) {
        fidelixSystem.closeSuccessModal();
    }
}