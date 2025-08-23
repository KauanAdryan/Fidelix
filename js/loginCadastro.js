// Sistema de Login e Cadastro - Fidelix

// Login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const cadastroForm = document.getElementById('cadastroForm');

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            fazerLogin();
        });
    }

    if (cadastroForm) {
        cadastroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            fazerCadastro();
        });
    }
});

function fazerLogin() {
    const usuario = document.getElementById('usuarioLogin').value.trim();
    const senha = document.getElementById('senhaLogin').value.trim();

    if (!usuario || !senha) {
        mostrarMensagem('Por favor, preencha todos os campos.', 'error');
        return;
    }

    // Verificar se o usuário existe
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuarioEncontrado = usuarios.find(u => u.usuario === usuario && u.senha === senha);

    if (usuarioEncontrado) {
        // Login bem-sucedido
        const usuarioLogado = {
            id: usuarioEncontrado.id,
            nome: usuarioEncontrado.nome,
            usuario: usuarioEncontrado.usuario,
            email: usuarioEncontrado.email,
            dataCadastro: usuarioEncontrado.dataCadastro
        };

        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
        
        // Adicionar ao histórico
        const historico = JSON.parse(localStorage.getItem('historico') || '[]');
        historico.unshift({
            id: Date.now(),
            titulo: 'Login realizado',
            descricao: `Usuário ${usuarioEncontrado.nome} fez login no sistema`,
            tipo: 'login',
            data: new Date().toISOString()
        });
        localStorage.setItem('historico', JSON.stringify(historico));

        mostrarMensagem('Login realizado com sucesso!', 'success');
        
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1500);
    } else {
        mostrarMensagem('Usuário ou senha incorretos.', 'error');
    }
}

function fazerCadastro() {
    const nomeCompleto = document.getElementById('nomeCompleto').value.trim();
    const usuario = document.getElementById('usuarioCadastro').value.trim();
    const email = document.getElementById('emailCadastro').value.trim();
    const senha = document.getElementById('senhaCadastro').value.trim();
    const confirmarSenha = document.getElementById('confirmarSenha').value.trim();

    // Validações
    if (!nomeCompleto || !usuario || !email || !senha || !confirmarSenha) {
        mostrarMensagem('Por favor, preencha todos os campos.', 'error');
        return;
    }

    if (nomeCompleto.length < 3) {
        mostrarMensagem('O nome completo deve ter pelo menos 3 caracteres.', 'error');
        return;
    }

    if (usuario.length < 3) {
        mostrarMensagem('O nome de usuário deve ter pelo menos 3 caracteres.', 'error');
        return;
    }

    if (senha.length < 6) {
        mostrarMensagem('A senha deve ter pelo menos 6 caracteres.', 'error');
        return;
    }

    if (senha !== confirmarSenha) {
        mostrarMensagem('As senhas não coincidem.', 'error');
        return;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mostrarMensagem('Por favor, insira um e-mail válido.', 'error');
        return;
    }

    // Verificar se o usuário já existe
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuarioExistente = usuarios.find(u => u.usuario === usuario || u.email === email);

    if (usuarioExistente) {
        if (usuarioExistente.usuario === usuario) {
            mostrarMensagem('Este nome de usuário já está em uso.', 'error');
        } else {
            mostrarMensagem('Este e-mail já está cadastrado.', 'error');
        }
        return;
    }

    // Criar novo usuário
    const novoUsuario = {
        id: Date.now(),
        nome: nomeCompleto,
        usuario: usuario,
        email: email,
        senha: senha,
        dataCadastro: new Date().toISOString()
    };

    usuarios.push(novoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    // Adicionar ao histórico
    const historico = JSON.parse(localStorage.getItem('historico') || '[]');
    historico.unshift({
        id: Date.now(),
        titulo: 'Conta criada',
        descricao: `Nova conta criada para ${nomeCompleto}`,
        tipo: 'cadastro',
        data: new Date().toISOString()
    });
    localStorage.setItem('historico', JSON.stringify(historico));

    mostrarMensagem('Conta criada com sucesso! Redirecionando para login...', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
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

// Verificar se já está logado (TEMPORARIAMENTE DESABILITADO PARA TESTES)
function verificarLogin() {
    // Comentado para permitir testar o sistema
    // const usuarioLogado = localStorage.getItem('usuarioLogado');
    // if (usuarioLogado) {
    //     window.location.href = 'home.html';
    // }
}

// Executar verificação se estiver na página de login ou cadastro
if (window.location.pathname.includes('index.html') || window.location.pathname.includes('cadastro.html')) {
    verificarLogin();
}
