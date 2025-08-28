// Sistema de Edição de Perfil Empresarial - Fidelix

document.addEventListener('DOMContentLoaded', function() {
    verificarLogin();
    carregarDadosEmpresa();
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
    const empresaLogada = localStorage.getItem('empresaLogada');
    if (!empresaLogada) {
        window.location.href = 'empresa-login.html';
    }
}

function carregarDadosEmpresa() {
    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    const empresa = empresas.find(e => e.id === empresaLogada.id);
    
    if (!empresa) {
        mostrarMensagem('Empresa não encontrada.', 'error');
        return;
    }
    
    // Preencher formulário
    document.getElementById('razaoSocial').value = empresa.razaoSocial || '';
    document.getElementById('cnpj').value = formatarCNPJ(empresa.cnpj) || '';
    document.getElementById('email').value = empresa.email || '';
    document.getElementById('telefone').value = empresa.telefone || '';
    document.getElementById('endereco').value = empresa.endereco || '';
    
    // Carregar informações da empresa
    document.getElementById('dataCadastro').textContent = formatarData(empresa.dataCadastro);
    document.getElementById('totalCupons').textContent = empresa.cupons ? empresa.cupons.length : 0;
    document.getElementById('comprasNecessarias').textContent = empresa.comprasNecessarias || 3;
}

function aplicarMascaras() {
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
}

function salvarPerfil() {
    const razaoSocial = document.getElementById('razaoSocial').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const endereco = document.getElementById('endereco').value.trim();
    const senhaAtual = document.getElementById('senhaAtual').value.trim();
    const novaSenha = document.getElementById('novaSenha').value.trim();
    const confirmarSenha = document.getElementById('confirmarSenha').value.trim();
    
    // Validações básicas
    if (!razaoSocial || !email || !telefone || !endereco) {
        mostrarMensagem('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    if (razaoSocial.length < 3) {
        mostrarMensagem('A razão social deve ter pelo menos 3 caracteres.', 'error');
        return;
    }
    
    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mostrarMensagem('Por favor, insira um e-mail válido.', 'error');
        return;
    }
    
    // Verificar se o email já está sendo usado por outra empresa
    const empresaLogada = JSON.parse(localStorage.getItem('empresaLogada'));
    const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
    const emailExistente = empresas.find(e => e.email === email && e.id !== empresaLogada.id);
    
    if (emailExistente) {
        mostrarMensagem('Este e-mail já está sendo usado por outra empresa.', 'error');
        return;
    }
    
    // Validação de senha (se for alterar)
    if (novaSenha || senhaAtual || confirmarSenha) {
        if (!senhaAtual) {
            mostrarMensagem('Digite sua senha atual para alterar a senha.', 'error');
            return;
        }
        
        if (!novaSenha) {
            mostrarMensagem('Digite a nova senha.', 'error');
            return;
        }
        
        if (novaSenha.length < 6) {
            mostrarMensagem('A nova senha deve ter pelo menos 6 caracteres.', 'error');
            return;
        }
        
        if (novaSenha !== confirmarSenha) {
            mostrarMensagem('As senhas não coincidem.', 'error');
            return;
        }
        
        // Verificar senha atual
        const empresa = empresas.find(e => e.id === empresaLogada.id);
        if (empresa.senha !== senhaAtual) {
            mostrarMensagem('Senha atual incorreta.', 'error');
            return;
        }
    }
    
    // Atualizar dados da empresa
    const empresaIndex = empresas.findIndex(e => e.id === empresaLogada.id);
    if (empresaIndex !== -1) {
        const dadosAtualizados = {
            ...empresas[empresaIndex],
            razaoSocial: razaoSocial,
            email: email,
            telefone: telefone,
            endereco: endereco,
            dataAtualizacao: new Date().toISOString()
        };
        
        // Atualizar senha se fornecida
        if (novaSenha) {
            dadosAtualizados.senha = novaSenha;
        }
        
        empresas[empresaIndex] = dadosAtualizados;
        localStorage.setItem('empresas', JSON.stringify(empresas));
        
        // Atualizar dados da sessão
        const sessaoAtualizada = {
            id: empresaLogada.id,
            razaoSocial: razaoSocial,
            cnpj: empresaLogada.cnpj,
            email: email,
            dataCadastro: empresaLogada.dataCadastro,
            tipo: 'empresa'
        };
        localStorage.setItem('empresaLogada', JSON.stringify(sessaoAtualizada));
        
        // Atualizar loja correspondente
        const lojas = JSON.parse(localStorage.getItem('lojas') || '[]');
        const lojaIndex = lojas.findIndex(l => l.empresaId === empresaLogada.id);
        if (lojaIndex !== -1) {
            lojas[lojaIndex] = {
                ...lojas[lojaIndex],
                nome: razaoSocial,
                endereco: endereco,
                telefone: telefone
            };
            localStorage.setItem('lojas', JSON.stringify(lojas));
        }
        
        mostrarMensagem('Perfil atualizado com sucesso!', 'success');
        
        setTimeout(() => {
            window.location.href = 'empresa-dashboard.html';
        }, 1500);
    } else {
        mostrarMensagem('Erro ao atualizar perfil. Empresa não encontrada.', 'error');
    }
}

function formatarCNPJ(cnpj) {
    if (!cnpj) return '';
    cnpj = cnpj.replace(/\D/g, '');
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
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
