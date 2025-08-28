// Sistema de Edição de Perfil do Usuário - Fidelix

document.addEventListener('DOMContentLoaded', function() {
    verificarLogin();
    carregarDadosUsuario();
    
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
    
    // Carregar informações da conta
    const compras = JSON.parse(localStorage.getItem('compras') || '[]');
    const cupons = JSON.parse(localStorage.getItem('cupons') || '[]');
    
    document.getElementById('dataCadastro').textContent = formatarData(usuario.dataCadastro);
    // Fallback: se registros antigos não tiverem usuarioId, considerar todos
    const possuiUsuarioIdEmCompras = compras.some(c => 'usuarioId' in c);
    const possuiUsuarioIdEmCupons = cupons.some(c => 'usuarioId' in c);

    const comprasUsuario = possuiUsuarioIdEmCompras
        ? compras.filter(c => c.usuarioId === usuario.id)
        : compras;

    const cuponsUsuario = possuiUsuarioIdEmCupons
        ? cupons.filter(c => c.usuarioId === usuario.id)
        : cupons;

    document.getElementById('totalCompras').textContent = comprasUsuario.length;
    document.getElementById('cuponsUtilizados').textContent = cuponsUsuario.filter(c => c.utilizado).length;
}



function salvarPerfil() {
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    
    // Validações
    if (!nome || !email) {
        mostrarMensagem('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    if (nome.length < 3) {
        mostrarMensagem('O nome deve ter pelo menos 3 caracteres.', 'error');
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
