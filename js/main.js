let calendar = null;
let salaSelecionada = null;

// Função para aplicar efeito de "shake" (usando Animate.css)
function shakeElement(element) {
    element.classList.add('animate__animated', 'animate__shakeX');
    setTimeout(() => {
        element.classList.remove('animate__animated', 'animate__shakeX');
    }, 1000);
}

// Exibe um banner de sucesso com animação
function showSuccessBanner(message) {
    const banner = document.createElement('div');
    banner.innerText = message;
    banner.className = 'alert alert-success animate__animated animate__bounceIn';
    banner.style.position = 'fixed';
    banner.style.top = '80px';
    banner.style.left = '50%';
    banner.style.transform = 'translateX(-50%)';
    banner.style.zIndex = 3000;
    document.body.appendChild(banner);
    setTimeout(() => {
        banner.classList.add('animate__fadeOut');
        setTimeout(() => { banner.remove(); }, 800);
    }, 2000);
}

// Função para exibir diálogo customizado com feedback visual
function showDialog(message) {
    const dialog = document.getElementById('dialogModal');
    dialog.querySelector('.dialog-content').innerText = message;
    dialog.classList.add('active');
    shakeElement(dialog);
}
function hideDialog() {
    document.getElementById('dialogModal').classList.remove('active');
}

// Função auxiliar para comparar usuários de forma case-insensitive
function isCurrentUserDesktop(usuarioReserva) {
    return usuarioReserva && USUARIO_ATUAL &&
           usuarioReserva.trim().toLowerCase() === USUARIO_ATUAL.trim().toLowerCase();
}

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
    document.getElementById(modalId).classList.add('active');
};
window.hideModal = function(modalId) {
    document.getElementById(modalId).classList.remove('active');
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
            showSuccessBanner('Reserva concluída com sucesso!');
        } else {
            showDialog(data.message || 'Erro na reserva!');
        }
    } catch(error) {
        console.error('Error:', error);
        showDialog('Erro ao enviar a reserva!');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o calendário com a primeira sala disponível
    const primeiraSala = document.querySelector('.sala-item:not(.indisponivel)');
    if(primeiraSala){
        selecionarSala(primeiraSala.dataset.sala);
    }
    // Fechar o painel direito se clicar fora dele
    document.addEventListener('click', function(event) {
        const rightPanel = document.getElementById('rightPanel');
        if(!rightPanel.contains(event.target) && !event.target.closest('.fc-daygrid-day')){
            hideDayPanel();
        }
    });
    
    // --- Lógica para auto-preenchimento de horário de fim e duração ---
    // Obtém os elementos do formulário de reserva:
    const dataInput = document.getElementById("data");       // Campo de data (tipo "date")
    const inicioInput = document.getElementById("inicio");   // Campo de horário de início (tipo "time")
    const fimInput = document.getElementById("fim");         // Campo de horário de fim (tipo "time")
    const duracaoInput = document.getElementById("duracao"); // Campo de duração (tipo "number")

    if (duracaoInput) {
        // Define o valor padrão para 30 minutos, caso não haja valor
        if (!duracaoInput.value) {
            duracaoInput.value = 30;
        }
        // Permite alteração em passos de 15 minutos
        duracaoInput.setAttribute("step", "15");
    }

    // Função que atualiza o campo de fim com base na data, horário de início e duração
    function updateFimTime() {
        if (!dataInput || !inicioInput || !fimInput) return;
        const dataValue = dataInput.value;      // formato "YYYY-MM-DD"
        const inicioValue = inicioInput.value;  // formato "HH:mm"
        if (dataValue && inicioValue) {
            // Separa os componentes da data
            const [year, month, day] = dataValue.split("-").map(Number);
            // Separa as horas e minutos do horário de início
            const [hours, minutes] = inicioValue.split(":").map(Number);
            // Cria um objeto Date combinando a data selecionada com o horário de início
            // Lembre que o mês é 0-indexado no JavaScript (por isso month-1)
            const inicioDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
            
            // Obtém a duração definida (padrão 30 minutos ou o valor informado)
            let duracao = 30;
            if (duracaoInput) {
                const duracaoVal = parseInt(duracaoInput.value, 10);
                if (!isNaN(duracaoVal)) {
                    duracao = duracaoVal;
                }
            }
            // Calcula o horário de fim somando a duração em minutos
            const fimDate = new Date(inicioDate.getTime() + duracao * 60000);
            // Formata o horário de fim para "HH:mm"
            const fimHours = fimDate.getHours().toString().padStart(2, "0");
            const fimMinutes = fimDate.getMinutes().toString().padStart(2, "0");
            fimInput.value = `${fimHours}:${fimMinutes}`;
        }
    }

    // Atualiza automaticamente o horário de fim sempre que a data, o início ou a duração forem alterados:
    if (dataInput) {
        dataInput.addEventListener("change", updateFimTime);
    }
    if (inicioInput) {
        // Utiliza "input" para atualizar imediatamente durante a digitação/seleção
        inicioInput.addEventListener("input", updateFimTime);
    }
    if (duracaoInput) {
        duracaoInput.addEventListener("input", () => {
            if (inicioInput.value && dataInput.value) {
                updateFimTime();
            }
        });
    }
    // --- Fim da lógica de auto-preenchimento ---
});

// Exibe o painel direito com reservas do dia com animação de transição
function showDayPanel(dateStr) {
    const rightPanel = document.getElementById('rightPanel');
    const panelContent = document.getElementById('rightPanelContent');
    panelContent.innerHTML = '<div class="spinner"></div>';
    rightPanel.classList.add('active');
    rightPanel.classList.add('animate__animated', 'animate__fadeInRight');
    
    // Buscar reservas para o dia
    fetch(`api/reservas.php?sala=${encodeURIComponent(salaSelecionada)}`)
        .then(response => response.json())
        .then(reservas => {
            const reservasDoDia = reservas.filter(r => r.start.startsWith(dateStr));
            if(reservasDoDia.length === 0){
                panelContent.innerHTML = '<p>Sem reservas para este dia.</p>';
                return;
            }
            reservasDoDia.sort((a, b) => new Date(a.start) - new Date(b.start));
            let html = `<h4>Reservas para ${dateStr}</h4>`;
            reservasDoDia.forEach(r => {
                html += `
                    <div class="card-reserva animate__animated animate__fadeIn">
                        <strong>${r.title}</strong><br>
                        Início: ${new Date(r.start).toLocaleTimeString()}<br>
                        Fim: ${new Date(r.end).toLocaleTimeString()}<br>
                        Responsável: ${r.nome_exibicao}<br>
                        Empresa: ${r.empresa}
                    </div>
                `;
            });
            panelContent.innerHTML = html;
        })
        .catch(error => {
            console.error(error);
            panelContent.innerHTML = '<p>Erro ao carregar reservas.</p>';
        });
}
function hideDayPanel() {
    const rightPanel = document.getElementById('rightPanel');
    rightPanel.classList.remove('active');
}

function atualizarSelecaoSala() {
    document.querySelectorAll('.sala-item').forEach(item => {
        item.classList.remove('selecionada');
        if(item.dataset.sala === salaSelecionada){
            item.classList.add('selecionada');
        }
    });
}

// Carrega o calendário e configura o dateClick para exibir o painel direito
function carregarCalendario(sala) {
    salaSelecionada = sala;
    if(calendar){
        calendar.destroy();
    }
    calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
        locale: 'pt-br',
        initialView: 'dayGridMonth',
        events: `api/reservas.php?sala=${encodeURIComponent(sala)}`,
        dateClick: function(info){
            showDayPanel(info.dateStr);
        },
        eventDidMount: function(info){
            info.el.style.backgroundColor = info.event.extendedProps.cor;
            info.el.style.border = 'none';
            info.el.style.borderRadius = '4px';
            info.el.style.color = '#fff';
            info.el.style.padding = '2px 5px';
        },
        eventClick: function(info){
            const start = info.event.start?.toLocaleString() || 'Não definido';
            const end = info.event.end?.toLocaleString() || 'Não definido';
            const details = `
                <p><strong>Título:</strong> ${info.event.title}</p>
                <p><strong>Início:</strong> ${start}</p>
                <p><strong>Fim:</strong> ${end}</p>
                <p><strong>Sala:</strong> ${info.event.extendedProps.sala}</p>
                <p><strong>Responsável:</strong> ${info.event.extendedProps.nome_exibicao}</p>
                <p><strong>Empresa:</strong> ${info.event.extendedProps.empresa}</p>
            `;
            document.getElementById('eventDetails').innerHTML = details;
            document.getElementById('eventModal').dataset.eventId = info.event.id;
            // Comparação case-insensitive usando o campo 'usuario' (sAMAccountName)
            const podeCancelar = isCurrentUserDesktop(info.event.extendedProps.usuario) || IS_ADMIN;
            document.getElementById('btnCancelar').style.display = podeCancelar ? 'block' : 'none';
            showModal('eventModal');
        }
    });
    calendar.render();
    atualizarSelecaoSala();
}

// Função de cancelamento de reserva
window.cancelarReserva = async function(){
    const eventId = document.getElementById('eventModal').dataset.eventId;
    if(!eventId) return;
    try{
        const response = await fetch(`api/reservas.php?id=${eventId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if(data.success){
            calendar.refetchEvents();
            hideModal('eventModal');
            showSuccessBanner('Reserva cancelada com sucesso!');
        } else {
            showDialog(data.message || 'Erro ao cancelar reserva');
        }
    } catch(error){
        console.error('Erro:', error);
        showDialog('Erro ao processar solicitação');
    }
};
