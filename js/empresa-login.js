// Sistema de Login e Cadastro Empresarial - Fidelix

document.addEventListener('DOMContentLoaded', function() {
    const empresaLoginForm = document.getElementById('empresaLoginForm');
    const empresaCadastroForm = document.getElementById('empresaCadastroForm');

    if (empresaLoginForm) {
        empresaLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            fazerLoginEmpresa();
        });
    }

    if (empresaCadastroForm) {
        empresaCadastroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            fazerCadastroEmpresa();
        });
    }

    // Aplicar máscara de CNPJ
    const cnpjInputs = document.querySelectorAll('input[placeholder="CNPJ"]');
    cnpjInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 14) {
                value = value.replace(/^(\d{2})(\d)/, '$1.$2');
                value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
                value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
                value = value.replace(/(\d{4})(\d)/, '$1-$2');
                e.target.value = value;
            }
        });
    });

    // Aplicar máscara de telefone
    const telefoneInput = document.getElementById('telefoneEmpresa');
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
});

function mostrarForm(tipo) {
    // Atualizar botões
    const botoes = document.querySelectorAll('.tipo-btn');
    botoes.forEach(btn => btn.classList.remove('active'));
    
    if (tipo === 'login') {
        document.querySelector('.tipo-btn:first-child').classList.add('active');
    } else {
        document.querySelector('.tipo-btn:last-child').classList.add('active');
    }

    // Mostrar formulário correto
    const forms = document.querySelectorAll('.form-container');
    forms.forEach(form => form.classList.remove('active'));
    
    if (tipo === 'login') {
        document.getElementById('loginForm').classList.add('active');
    } else {
        document.getElementById('cadastroForm').classList.add('active');
    }
}

function fazerLoginEmpresa() {
    const cnpj = document.getElementById('cnpjLogin').value.replace(/\D/g, '');
    const senha = document.getElementById('senhaEmpresaLogin').value.trim();

    if (!cnpj || !senha) {
        mostrarMensagem('Por favor, preencha todos os campos.', 'error');
        return;
    }

    if (cnpj.length !== 14) {
        mostrarMensagem('CNPJ deve ter 14 dígitos.', 'error');
        return;
    }

    // Verificar se a empresa existe
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    const empresaEncontrada = empresas.find(e => e.cnpj === cnpj && e.senha === senha);

    if (empresaEncontrada) {
        // Login bem-sucedido
        const empresaLogada = {
            id: empresaEncontrada.id,
            razaoSocial: empresaEncontrada.razaoSocial,
            cnpj: empresaEncontrada.cnpj,
            email: empresaEncontrada.email,
            dataCadastro: empresaEncontrada.dataCadastro,
            tipo: 'empresa'
        };

        localStorage.setItem('empresaLogada', JSON.stringify(empresaLogada));
        
        // Adicionar ao histórico
        const historico = JSON.parse(localStorage.getItem('historico') || '[]');
        historico.unshift({
            id: Date.now(),
            titulo: 'Login empresarial realizado',
            descricao: `Empresa ${empresaEncontrada.razaoSocial} fez login no sistema`,
            tipo: 'login_empresa',
            data: new Date().toISOString()
        });
        localStorage.setItem('historico', JSON.stringify(historico));

        mostrarMensagem('Login realizado com sucesso!', 'success');
        
        setTimeout(() => {
            window.location.href = 'empresa-dashboard.html';
        }, 1500);
    } else {
        mostrarMensagem('CNPJ ou senha incorretos.', 'error');
    }
}

function fazerCadastroEmpresa() {
    const razaoSocial = document.getElementById('razaoSocial').value.trim();
    const cnpj = document.getElementById('cnpjCadastro').value.replace(/\D/g, '');
    const email = document.getElementById('emailEmpresa').value.trim();
    const endereco = document.getElementById('enderecoEmpresa').value.trim();
    const telefone = document.getElementById('telefoneEmpresa').value.trim();
    const senha = document.getElementById('senhaEmpresa').value.trim();
    const confirmarSenha = document.getElementById('confirmarSenhaEmpresa').value.trim();

    // Validações
    if (!razaoSocial || !cnpj || !email || !endereco || !telefone || !senha || !confirmarSenha) {
        mostrarMensagem('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }

    if (razaoSocial.length < 3) {
        mostrarMensagem('A razão social deve ter pelo menos 3 caracteres.', 'error');
        return;
    }

    if (cnpj.length !== 14) {
        mostrarMensagem('CNPJ deve ter 14 dígitos.', 'error');
        return;
    }

    if (!validarCNPJ(cnpj)) {
        mostrarMensagem('CNPJ inválido.', 'error');
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

    // Verificar se a empresa já existe
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    const empresaExistente = empresas.find(e => e.cnpj === cnpj || e.email === email);

    if (empresaExistente) {
        if (empresaExistente.cnpj === cnpj) {
            mostrarMensagem('Este CNPJ já está cadastrado.', 'error');
        } else {
            mostrarMensagem('Este e-mail já está cadastrado.', 'error');
        }
        return;
    }

    // Criar nova empresa
    const novaEmpresa = {
        id: Date.now(),
        razaoSocial: razaoSocial,
        cnpj: cnpj,
        email: email,
        endereco: endereco,
        telefone: telefone,
        senha: senha,
        dataCadastro: new Date().toISOString(),
        cupons: [],
        comprasNecessarias: 3 // Valor padrão
    };

    empresas.push(novaEmpresa);
    localStorage.setItem('empresas', JSON.stringify(empresas));

    // Criar/atualizar loja correspondente para aparecer no dashboard do usuário
    const lojas = JSON.parse(localStorage.getItem('lojas') || '[]');
    const lojaExistente = lojas.find(l => l.empresaId === novaEmpresa.id) || lojas.find(l => l.nome === novaEmpresa.razaoSocial);
    if (!lojaExistente) {
        lojas.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            empresaId: novaEmpresa.id,
            nome: novaEmpresa.razaoSocial,
            cnpj: novaEmpresa.cnpj,
            endereco: novaEmpresa.endereco,
            telefone: novaEmpresa.telefone,
            comprasNecessarias: novaEmpresa.comprasNecessarias,
            cupons: []
        });
        localStorage.setItem('lojas', JSON.stringify(lojas));
    }

    // Adicionar ao histórico
    const historico = JSON.parse(localStorage.getItem('historico') || '[]');
    historico.unshift({
        id: Date.now(),
        titulo: 'Empresa cadastrada',
        descricao: `Nova empresa cadastrada: ${razaoSocial}`,
        tipo: 'cadastro_empresa',
        data: new Date().toISOString()
    });
    localStorage.setItem('historico', JSON.stringify(historico));

    mostrarMensagem('Empresa cadastrada com sucesso! Redirecionando para login...', 'success');
    
    setTimeout(() => {
        mostrarForm('login');
        // Limpar formulário
        document.getElementById('empresaCadastroForm').reset();
    }, 2000);
}

function validarCNPJ(cnpj) {
    // Remove caracteres não numéricos
    cnpj = cnpj.replace(/[^\d]/g, '');
    
    // Verifica se tem 14 dígitos
    if (cnpj.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpj)) return false;
    
    // Validação dos dígitos verificadores
    let soma = 0;
    let peso = 2;
    
    // Primeiro dígito verificador
    for (let i = 11; i >= 0; i--) {
        soma += parseInt(cnpj.charAt(i)) * peso;
        peso = peso === 9 ? 2 : peso + 1;
    }
    
    let digito = 11 - (soma % 11);
    if (digito > 9) digito = 0;
    
    if (parseInt(cnpj.charAt(12)) !== digito) return false;
    
    // Segundo dígito verificador
    soma = 0;
    peso = 2;
    
    for (let i = 12; i >= 0; i--) {
        soma += parseInt(cnpj.charAt(i)) * peso;
        peso = peso === 9 ? 2 : peso + 1;
    }
    
    digito = 11 - (soma % 11);
    if (digito > 9) digito = 0;
    
    return parseInt(cnpj.charAt(13)) === digito;
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

// Verificar se já está logado como empresa
function verificarLoginEmpresa() {
    const empresaLogada = localStorage.getItem('empresaLogada');
    if (empresaLogada) {
        window.location.href = 'empresa-dashboard.html';
    }
}

// Executar verificação se estiver na página de login empresarial
if (window.location.pathname.includes('empresa-login.html')) {
    verificarLoginEmpresa();
}
