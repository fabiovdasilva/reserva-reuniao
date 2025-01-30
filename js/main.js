let calendar = null;
let salaSelecionada = null;

// Funções globais
window.showReservaModal = function() {
    document.getElementById('reservaForm').reset();
    document.getElementById('roomSelect').value = salaSelecionada;
    showModal('reservaModal');
};

window.selecionarSala = function(sala) {
    carregarCalendario(sala);
};

window.showModal = function(modalId) {
    document.getElementById(modalId).style.display = 'block';
};

window.hideModal = function(modalId) {
    document.getElementById(modalId).style.display = 'none';
};

window.submitReserva = async function() {
    const formData = new FormData(document.getElementById('reservaForm'));
    
    try {
        const response = await fetch('api/reservas.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if(data.success) {
            calendar.refetchEvents();
            hideModal('reservaModal');
        } else {
            alert(data.message || 'Erro na reserva!');
        }
    } catch(error) {
        console.error('Error:', error);
    }
};



document.addEventListener('DOMContentLoaded', () => {
    // Inicialização do calendário com a primeira sala disponível
    const primeiraSala = document.querySelector('.sala-item:not(.indisponivel)');
    if(primeiraSala) {
        selecionarSala(primeiraSala.dataset.sala);
    }
});

function carregarCalendario(sala) {
    salaSelecionada = sala;
    
    if(calendar) {
        calendar.destroy();
    }

    calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
        locale: 'pt-br',
        initialView: 'dayGridMonth',
        events: `api/reservas.php?sala=${encodeURIComponent(sala)}`,
        eventDidMount: function(info) {
            info.el.style.backgroundColor = info.event.extendedProps.cor;
            info.el.style.border = 'none';
            info.el.style.borderRadius = '4px';
            info.el.style.color = '#fff';
            info.el.style.padding = '2px 5px';
        },
        eventClick: function(info) {
            const start = info.event.start?.toLocaleString() || 'Não definido';
            const end = info.event.end?.toLocaleString() || 'Não definido';
            
            const details = `
                <p><strong>Título:</strong> ${info.event.title}</p>
                <p><strong>Início:</strong> ${start}</p>
                <p><strong>Fim:</strong> ${end}</p>
                <p><strong>Sala:</strong> ${info.event.extendedProps.sala}</p>
                <p><strong>Responsável:</strong> ${info.event.extendedProps.usuario}</p>
            `;
            document.getElementById('eventDetails').innerHTML = details;
            document.getElementById('eventModal').dataset.eventId = info.event.id;
        
            // Verificar permissão para cancelar
            const podeCancelar = (info.event.extendedProps.usuario === USUARIO_ATUAL) || IS_ADMIN;
            document.getElementById('btnCancelar').style.display = podeCancelar ? 'block' : 'none';
            
            showModal('eventModal');
        }
    });

    calendar.render();
    atualizarSelecaoSala();
}

function atualizarSelecaoSala() {
    document.querySelectorAll('.sala-item').forEach(item => {
        item.classList.remove('selecionada');
        if(item.dataset.sala === salaSelecionada) {
            item.classList.add('selecionada');
        }
    });
}

// Função de cancelamento de reserva
window.cancelarReserva = async function() {
    const eventId = document.getElementById('eventModal').dataset.eventId;
    
    if(!eventId) return;
    
    try {
        const response = await fetch(`api/reservas.php?id=${eventId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if(data.success) {
            calendar.refetchEvents();
            hideModal('eventModal');
            alert('Reserva cancelada com sucesso!');
        } else {
            alert(data.message || 'Erro ao cancelar reserva');
        }
    } catch(error) {
        console.error('Erro:', error);
        alert('Erro ao processar solicitação');
    }
};


// Funções do Admin
window.showAdminModal = async function() {
    try {
        const response = await fetch('api/salas.php');
        const salas = await response.json();
        
        const lista = salas.map(sala => `
            <div class="sala-admin">
                ${sala.nome} - 
                <span class="status">${sala.disponivel ? 'Disponível' : 'Indisponível'}</span>
                <button class="btn ${sala.disponivel ? 'btn-danger' : 'btn-primary'}" 
                    onclick="toggleSalaStatus('${sala.nome}', ${sala.disponivel})">
                    ${sala.disponivel ? 'Desativar' : 'Ativar'}
                </button>
            </div>
        `).join('');
        
        document.getElementById('listaSalasAdmin').innerHTML = lista;
        showModal('adminModal');
    } catch(error) {
        console.error('Erro:', error);
    }
};

window.toggleSalaStatus = async function(nome, status) {
    try {
        const response = await fetch('api/salas.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                action: 'toggle',
                nome: nome,
                status: !status
            })
        });
        
        if(response.ok) {
            location.reload();
        }
    } catch(error) {
        console.error('Erro:', error);
    }
};