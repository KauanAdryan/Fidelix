// Dashboard Empresarial - Fidelix

let empresaLogada = null;
let cupomEditando = null;

document.addEventListener('DOMContentLoaded', function() {
    verificarLoginEmpresa();
    carregarDadosEmpresa();
    carregarCuponsEmpresa();
    carregarConfiguracaoCompras();
    
    // Event listeners
    const cupomForm = document.getElementById('cupomForm');
    const editCupomForm = document.getElementById('editCupomForm');
    
    if (cupomForm) {
        cupomForm.addEventListener('submit', function(e) {
            e.preventDefault();
            criarCupom();
        });
    }
    
    if (editCupomForm) {
        editCupomForm.addEventListener('submit', function(e) {
            e.preventDefault();
            salvarEdicaoCupom();
        });
    }
});

function verificarLoginEmpresa() {
    const empresaLogadaStr = localStorage.getItem('empresaLogada');
    if (!empresaLogadaStr) {
        window.location.href = 'empresa-login.html';
        return;
    }
    
    try {
        empresaLogada = JSON.parse(empresaLogadaStr);
    } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error);
        window.location.href = 'empresa-login.html';
    }
}

function carregarDadosEmpresa() {
    if (!empresaLogada) return;
    
    document.getElementById('empresaWelcome').textContent = `Bem-vindo, ${empresaLogada.razaoSocial}`;
    document.getElementById('empresaNome').textContent = empresaLogada.razaoSocial;
    document.getElementById('empresaCNPJ').textContent = formatarCNPJ(empresaLogada.cnpj);
    document.getElementById('empresaEmail').textContent = empresaLogada.email;
}

function carregarCuponsEmpresa() {
    if (!empresaLogada) return;
    
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    const empresa = empresas.find(e => e.id === empresaLogada.id);
    
    if (!empresa) return;
    
    const cuponsContainer = document.getElementById('cuponsEmpresa');
    const totalCuponsElement = document.getElementById('totalCuponsEmpresa');
    
    if (empresa.cupons && empresa.cupons.length > 0) {
        totalCuponsElement.textContent = empresa.cupons.length;
        
        cuponsContainer.innerHTML = empresa.cupons.map(cupom => `
            <div class="cupom-card">
                <div class="cupom-header">
                    <div class="cupom-desconto">${cupom.desconto}% OFF</div>
                    <div class="cupom-actions">
                        <button onclick="editarCupom(${cupom.id})" class="btn-edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="excluirCupom(${cupom.id})" class="btn-danger">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="cupom-info">
                    <p><strong>Validade:</strong> ${cupom.validade} dias</p>
                    <p><strong>Compras necessárias:</strong> ${cupom.comprasNecessarias}</p>
                    ${cupom.descricao ? `<p><strong>Descrição:</strong> ${cupom.descricao}</p>` : ''}
                    <p><strong>Criado em:</strong> ${formatarData(cupom.dataCriacao)}</p>
                </div>
            </div>
        `).join('');
    } else {
        totalCuponsElement.textContent = '0';
        cuponsContainer.innerHTML = `
            <div class="no-cupons">
                <i class="fas fa-ticket-alt"></i>
                <p>Nenhum cupom criado ainda</p>
                <p>Crie seu primeiro cupom de desconto acima!</p>
            </div>
        `;
    }
    
    // Carregar estatísticas de cupons utilizados
    carregarEstatisticasCupons();
}

function carregarConfiguracaoCompras() {
    if (!empresaLogada) return;
    
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    const empresa = empresas.find(e => e.id === empresaLogada.id);
    
    if (empresa) {
        const comprasNecessarias = empresa.comprasNecessarias || 3;
        document.getElementById('comprasNecessarias').textContent = comprasNecessarias;
        document.getElementById('comprasNecessariasInput').value = comprasNecessarias;
    }
}

function criarCupom() {
    const desconto = parseInt(document.getElementById('desconto').value);
    const validade = parseInt(document.getElementById('validade').value);
    const comprasNecessarias = parseInt(document.getElementById('comprasNecessariasCupom').value);
    const descricao = document.getElementById('descricao').value.trim();
    
    if (!desconto || !validade || !comprasNecessarias) {
        mostrarMensagem('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    if (desconto < 1 || desconto > 100) {
        mostrarMensagem('O desconto deve estar entre 1% e 100%.', 'error');
        return;
    }
    
    const novoCupom = {
        id: Date.now(),
        desconto: desconto,
        validade: validade,
        comprasNecessarias: comprasNecessarias,
        descricao: descricao,
        dataCriacao: new Date().toISOString(),
        empresaId: empresaLogada.id
    };
    
    // Adicionar cupom à empresa
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    const empresaIndex = empresas.findIndex(e => e.id === empresaLogada.id);
    
    if (empresaIndex !== -1) {
        if (!empresas[empresaIndex].cupons) {
            empresas[empresaIndex].cupons = [];
        }
        empresas[empresaIndex].cupons.push(novoCupom);
        localStorage.setItem('empresas', JSON.stringify(empresas));

        // Atualizar loja espelho para refletir cupons no dashboard do usuário
        const lojas = JSON.parse(localStorage.getItem('lojas') || '[]');
        const lojaIndex = lojas.findIndex(l => l.empresaId === empresaLogada.id || l.nome === empresaLogada.razaoSocial);
        if (lojaIndex !== -1) {
            const cuponsEspelhados = empresas[empresaIndex].cupons.map(c => ({
                desconto: c.desconto,
                validade: `${c.validade} dias`,
                comprasNecessarias: c.comprasNecessarias
            }));
            lojas[lojaIndex].cupons = cuponsEspelhados;
            localStorage.setItem('lojas', JSON.stringify(lojas));
        }
        
        // Adicionar ao histórico
        const historico = JSON.parse(localStorage.getItem('historico') || '[]');
        historico.unshift({
            id: Date.now(),
            titulo: 'Cupom criado',
            descricao: `Empresa ${empresaLogada.razaoSocial} criou cupom de ${desconto}%`,
            tipo: 'cupom_criado',
            data: new Date().toISOString()
        });
        localStorage.setItem('historico', JSON.stringify(historico));
        
        mostrarMensagem('Cupom criado com sucesso!', 'success');
        limparFormulario();
        carregarCuponsEmpresa();
    }
}

function editarCupom(cupomId) {
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    const empresa = empresas.find(e => e.id === empresaLogada.id);
    
    if (!empresa || !empresa.cupons) return;
    
    const cupom = empresa.cupons.find(c => c.id === cupomId);
    if (!cupom) return;
    
    cupomEditando = cupom;
    
    // Preencher formulário de edição
    document.getElementById('editDesconto').value = cupom.desconto;
    document.getElementById('editValidade').value = cupom.validade;
    document.getElementById('editComprasNecessarias').value = cupom.comprasNecessarias;
    document.getElementById('editDescricao').value = cupom.descricao || '';
    
    // Mostrar modal
    document.getElementById('editModal').style.display = 'flex';
}

function salvarEdicaoCupom() {
    if (!cupomEditando) return;
    
    const desconto = parseInt(document.getElementById('editDesconto').value);
    const validade = parseInt(document.getElementById('editValidade').value);
    const comprasNecessarias = parseInt(document.getElementById('editComprasNecessarias').value);
    const descricao = document.getElementById('editDescricao').value.trim();
    
    if (!desconto || !validade || !comprasNecessarias) {
        mostrarMensagem('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    // Atualizar cupom
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    const empresaIndex = empresas.findIndex(e => e.id === empresaLogada.id);
    
    if (empresaIndex !== -1 && empresas[empresaIndex].cupons) {
        const cupomIndex = empresas[empresaIndex].cupons.findIndex(c => c.id === cupomEditando.id);
        
        if (cupomIndex !== -1) {
            empresas[empresaIndex].cupons[cupomIndex] = {
                ...cupomEditando,
                desconto: desconto,
                validade: validade,
                comprasNecessarias: comprasNecessarias,
                descricao: descricao,
                dataAtualizacao: new Date().toISOString()
            };
            
            localStorage.setItem('empresas', JSON.stringify(empresas));

            // Atualizar loja espelho
            const lojas = JSON.parse(localStorage.getItem('lojas') || '[]');
            const lojaIndex = lojas.findIndex(l => l.empresaId === empresaLogada.id || l.nome === empresaLogada.razaoSocial);
            if (lojaIndex !== -1) {
                const cuponsEspelhados = empresas[empresaIndex].cupons.map(c => ({
                    desconto: c.desconto,
                    validade: `${c.validade} dias`,
                    comprasNecessarias: c.comprasNecessarias
                }));
                lojas[lojaIndex].cupons = cuponsEspelhados;
                localStorage.setItem('lojas', JSON.stringify(lojas));
            }
            
            // Adicionar ao histórico
            const historico = JSON.parse(localStorage.getItem('historico') || '[]');
            historico.unshift({
                id: Date.now(),
                titulo: 'Cupom editado',
                descricao: `Empresa ${empresaLogada.razaoSocial} editou cupom de ${desconto}%`,
                tipo: 'cupom_editado',
                data: new Date().toISOString()
            });
            localStorage.setItem('historico', JSON.stringify(historico));
            
            mostrarMensagem('Cupom atualizado com sucesso!', 'success');
            closeEditModal();
            carregarCuponsEmpresa();
        }
    }
}

function excluirCupom(cupomId) {
    mostrarConfirmacao(
        'Excluir Cupom',
        'Tem certeza que deseja excluir este cupom? Esta ação não pode ser desfeita.',
        () => {
            const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
            const empresaIndex = empresas.findIndex(e => e.id === empresaLogada.id);
            
            if (empresaIndex !== -1 && empresas[empresaIndex].cupons) {
                const cupomIndex = empresas[empresaIndex].cupons.findIndex(c => c.id === cupomId);
                
                if (cupomIndex !== -1) {
                    const cupom = empresas[empresaIndex].cupons[cupomIndex];
                    empresas[empresaIndex].cupons.splice(cupomIndex, 1);
                    localStorage.setItem('empresas', JSON.stringify(empresas));

                    // Remover cupom dos usuários que o possuem
                    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
                    usuarios.forEach(usuario => {
                        if (usuario.cupons) {
                            // Remover cupons com mesmo desconto e empresaId
                            usuario.cupons = usuario.cupons.filter(c => 
                                !(c.empresaId === empresaLogada.id && 
                                  c.desconto === cupom.desconto && 
                                  c.lojaId === cupom.lojaId)
                            );
                        }
                    });
                    localStorage.setItem('usuarios', JSON.stringify(usuarios));

                    // Atualizar loja espelho
                    const lojas = JSON.parse(localStorage.getItem('lojas') || '[]');
                    const lojaIndex = lojas.findIndex(l => l.empresaId === empresaLogada.id || l.nome === empresaLogada.razaoSocial);
                    if (lojaIndex !== -1) {
                        const cuponsEspelhados = empresas[empresaIndex].cupons.map(c => ({
                            desconto: c.desconto,
                            validade: `${c.validade} dias`,
                            comprasNecessarias: c.comprasNecessarias
                        }));
                        lojas[lojaIndex].cupons = cuponsEspelhados;
                        localStorage.setItem('lojas', JSON.stringify(lojas));
                    }
                    
                    // Adicionar ao histórico
                    const historico = JSON.parse(localStorage.getItem('historico') || '[]');
                    historico.unshift({
                        id: Date.now(),
                        titulo: 'Cupom excluído',
                        descricao: `Empresa ${empresaLogada.razaoSocial} excluiu cupom de ${cupom.desconto}%`,
                        tipo: 'cupom_excluido',
                        data: new Date().toISOString()
                    });
                    localStorage.setItem('historico', JSON.stringify(historico));
                    
                    mostrarMensagem('Cupom excluído com sucesso!', 'success');
                    carregarCuponsEmpresa();
                }
            }
        }
    );
}

function salvarConfiguracaoCompras() {
    const comprasNecessarias = parseInt(document.getElementById('comprasNecessariasInput').value);
    
    if (!comprasNecessarias || comprasNecessarias < 1) {
        mostrarMensagem('Por favor, insira um número válido de compras necessárias.', 'error');
        return;
    }
    
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    const empresaIndex = empresas.findIndex(e => e.id === empresaLogada.id);
    
    if (empresaIndex !== -1) {
        empresas[empresaIndex].comprasNecessarias = comprasNecessarias;
        localStorage.setItem('empresas', JSON.stringify(empresas));
        
        // Atualizar exibição
        document.getElementById('comprasNecessarias').textContent = comprasNecessarias;

        // Sincronizar com a loja espelho
        const lojas = JSON.parse(localStorage.getItem('lojas') || '[]');
        const lojaIndex = lojas.findIndex(l => l.empresaId === empresaLogada.id || l.nome === empresaLogada.razaoSocial);
        if (lojaIndex !== -1) {
            lojas[lojaIndex].comprasNecessarias = comprasNecessarias;
            localStorage.setItem('lojas', JSON.stringify(lojas));
        }
        
        // Adicionar ao histórico
        const historico = JSON.parse(localStorage.getItem('historico') || '[]');
        historico.unshift({
            id: Date.now(),
            titulo: 'Configuração atualizada',
            descricao: `Empresa ${empresaLogada.razaoSocial} alterou compras necessárias para ${comprasNecessarias}`,
            tipo: 'config_atualizada',
            data: new Date().toISOString()
        });
        localStorage.setItem('historico', JSON.stringify(historico));
        
        mostrarMensagem('Configuração salva com sucesso!', 'success');
    }
}

function carregarEstatisticasCupons() {
    // Aqui você pode implementar a lógica para carregar estatísticas
    // Por exemplo, quantos cupons foram utilizados pelos clientes
    document.getElementById('cuponsUtilizadosEmpresa').textContent = '0';
}

function limparFormulario() {
    document.getElementById('cupomForm').reset();
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    cupomEditando = null;
}

function mostrarConfirmacao(titulo, mensagem, onConfirm) {
    document.getElementById('modalTitle').textContent = titulo;
    document.getElementById('modalMessage').textContent = mensagem;
    document.getElementById('modalConfirmBtn').onclick = onConfirm;
    document.getElementById('confirmModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('confirmModal').style.display = 'none';
}

function logoutEmpresa() {
    localStorage.removeItem('empresaLogada');
    window.location.href = 'empresa-login.html';
}

function mostrarMensagem(mensagem, tipo) {
    // Remover mensagens anteriores
    const mensagensAnteriores = document.querySelectorAll('.mensagem');
    mensagensAnteriores.forEach(msg => msg.remove());

    // Criar nova mensagem
    const mensagemElement = document.createElement('div');
    mensagemElement.className = `mensagem ${tipo}`;
    mensagemElement.textContent = mensagem;

    // Adicionar estilos
    mensagemElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;

    // Estilos baseados no tipo
    if (tipo === 'success') {
        mensagemElement.style.backgroundColor = '#28a745';
    } else if (tipo === 'error') {
        mensagemElement.style.backgroundColor = '#dc3545';
    } else {
        mensagemElement.style.backgroundColor = '#007bff';
    }

    // Adicionar ao DOM
    document.body.appendChild(mensagemElement);

    // Remover após 5 segundos
    setTimeout(() => {
        if (mensagemElement.parentNode) {
            mensagemElement.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (mensagemElement.parentNode) {
                    mensagemElement.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Funções utilitárias
function formatarCNPJ(cnpj) {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Adicionar estilos CSS para as animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        justify-content: center;
        align-items: center;
    }
    
    .modal-content {
        background-color: white;
        padding: 30px;
        border-radius: 15px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    }
    
    .modal-buttons {
        display: flex;
        gap: 15px;
        justify-content: flex-end;
        margin-top: 20px;
    }
`;
document.head.appendChild(style);
