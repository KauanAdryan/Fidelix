// Sistema de Edição de Perfil do Usuário - Fidelix

document.addEventListener('DOMContentLoaded', function() {
    verificarLogin();
    carregarDadosUsuario();
    aplicarMascaras();
    
    const perfilForm = document.getElementById('perfilForm');
    if (perfilForm) {
        perfilForm.addEventListener('submit', function(e) {
            e.preventDefault();
            salvarPerfil();
        });
    }
});

function verificarLogin() {
    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (!usuarioLogado) {
        window.location.href = 'index.html';
    }
}

function carregarDadosUsuario() {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario = usuarios.find(u => u.id === usuarioLogado.id);
    
    if (!usuario) {
        mostrarMensagem('Usuário não encontrado.', 'error');
        return;
    }
    
    // Preencher formulário
    document.getElementById('nome').value = usuario.nome || '';
    document.getElementById('email').value = usuario.email || '';
    document.getElementById('telefone').value = usuario.telefone || '';
    document.getElementById('cpf').value = usuario.cpf || '';
    document.getElementById('endereco').value = usuario.endereco || '';
    document.getElementById('cidade').value = usuario.cidade || '';
    document.getElementById('estado').value = usuario.estado || '';
    document.getElementById('cep').value = usuario.cep || '';
    
    // Carregar informações da conta
    const compras = JSON.parse(localStorage.getItem('compras') || '[]');
    const cupons = JSON.parse(localStorage.getItem('cupons') || '[]');
    
    document.getElementById('dataCadastro').textContent = formatarData(usuario.dataCadastro);
    document.getElementById('totalCompras').textContent = compras.filter(c => c.usuarioId === usuario.id).length;
    document.getElementById('cuponsUtilizados').textContent = cupons.filter(c => c.usuarioId === usuario.id && c.utilizado).length;
}

function aplicarMascaras() {
    // Máscara de CPF
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/^(\d{3})(\d)/, '$1.$2');
                value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
                value = value.replace(/\.(\d{3})(\d)/, '.$1-$2');
                e.target.value = value;
            }
        });
    }
    
    // Máscara de telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                if (value.length <= 10) {
                    value = value.replace(/^(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{4})(\d)/, '$1-$2');
                } else {
                    value = value.replace(/^(\d{2})(\d)/, '($1) $2');
                    value = value.replace(/(\d{5})(\d)/, '$1-$2');
                }
                e.target.value = value;
            }
        });
    }
    
    // Máscara de CEP
    const cepInput = document.getElementById('cep');
    if (cepInput) {
        cepInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 8) {
                value = value.replace(/^(\d{5})(\d)/, '$1-$2');
                e.target.value = value;
            }
        });
    }
}

function salvarPerfil() {
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
    const endereco = document.getElementById('endereco').value.trim();
    const cidade = document.getElementById('cidade').value.trim();
    const estado = document.getElementById('estado').value.trim();
    const cep = document.getElementById('cep').value.replace(/\D/g, '');
    
    // Validações
    if (!nome || !email || !telefone || !cpf || !endereco || !cidade || !estado || !cep) {
        mostrarMensagem('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    if (nome.length < 3) {
        mostrarMensagem('O nome deve ter pelo menos 3 caracteres.', 'error');
        return;
    }
    
    if (cpf.length !== 11) {
        mostrarMensagem('CPF deve ter 11 dígitos.', 'error');
        return;
    }
    
    if (!validarCPF(cpf)) {
        mostrarMensagem('CPF inválido.', 'error');
        return;
    }
    
    if (cep.length !== 8) {
        mostrarMensagem('CEP deve ter 8 dígitos.', 'error');
        return;
    }
    
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mostrarMensagem('Por favor, insira um e-mail válido.', 'error');
        return;
    }
    
    // Verificar se o email já está sendo usado por outro usuário
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const emailExistente = usuarios.find(u => u.email === email && u.id !== usuarioLogado.id);
    
    if (emailExistente) {
        mostrarMensagem('Este e-mail já está sendo usado por outro usuário.', 'error');
        return;
    }
    
    // Atualizar dados do usuário
    const usuarioIndex = usuarios.findIndex(u => u.id === usuarioLogado.id);
    if (usuarioIndex !== -1) {
        usuarios[usuarioIndex] = {
            ...usuarios[usuarioIndex],
            nome: nome,
            email: email,
            telefone: telefone,
            cpf: cpf,
            endereco: endereco,
            cidade: cidade,
            estado: estado,
            cep: cep,
            dataAtualizacao: new Date().toISOString()
        };
        
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        
        // Atualizar dados da sessão
        const usuarioAtualizado = usuarios[usuarioIndex];
        const sessaoAtualizada = {
            id: usuarioAtualizado.id,
            nome: usuarioAtualizado.nome,
            email: usuarioAtualizado.email,
            tipo: 'usuario'
        };
        localStorage.setItem('usuarioLogado', JSON.stringify(sessaoAtualizada));
        
        // Adicionar ao histórico
        const historico = JSON.parse(localStorage.getItem('historico') || '[]');
        historico.unshift({
            id: Date.now(),
            titulo: 'Perfil atualizado',
            descricao: `Usuário ${nome} atualizou suas informações`,
            tipo: 'perfil_atualizado',
            data: new Date().toISOString()
        });
        localStorage.setItem('historico', JSON.stringify(historico));
        
        mostrarMensagem('Perfil atualizado com sucesso!', 'success');
        
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1500);
    } else {
        mostrarMensagem('Erro ao atualizar perfil. Usuário não encontrado.', 'error');
    }
}

function validarCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // Validação dos dígitos verificadores
    let soma = 0;
    let resto;
    
    for (let i = 1; i <= 9; i++) {
        soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    
    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
}

function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
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
`;
document.head.appendChild(style);
