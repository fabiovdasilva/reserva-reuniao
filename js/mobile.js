document.addEventListener('DOMContentLoaded', () => {
  const selectedDateEl = document.getElementById('selectedDate');
  const prevDayBtn = document.getElementById('prevDay');
  const nextDayBtn = document.getElementById('nextDay');
  const eventListEl = document.getElementById('eventList');
  const reservationModal = document.getElementById('reservationModal');
  const reservationForm = document.getElementById('reservationForm');
  const eventModal = document.getElementById('eventModal');
  const eventDetailsEl = document.getElementById('eventDetails');
  const agendaView = document.getElementById('agendaView');
  const calendarView = document.getElementById('calendarView');
  const monthlyCalendarEl = document.getElementById('monthlyCalendar');
  
  let currentDate = new Date();
  let selectedSala = 'Sala 01';
  let eventsData = [];


  document.querySelector('.fc-today-button').textContent = 'Hoje';

  
  // Função auxiliar para comparação case-insensitive e sem espaços extras
  function isCurrentUser(usuarioReserva) {
    return usuarioReserva && currentUser &&
           usuarioReserva.trim().toLowerCase() === currentUser.trim().toLowerCase();
  }
  
  function formatDate(date) {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('pt-BR', options);
  }
  
  function updateSelectedDate() {
    selectedDateEl.textContent = formatDate(currentDate);
    document.getElementById('selectedRoom').textContent = selectedSala;
    loadEvents();
  }
  
  prevDayBtn.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    updateSelectedDate();
  });
  
  nextDayBtn.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    updateSelectedDate();
  });
  
  // Menu lateral de salas
  window.toggleSideMenu = function() {
    const sideMenu = document.getElementById('sideMenu');
    sideMenu.classList.toggle('active');
  }
  
  window.selectSala = function(sala) {
    selectedSala = sala;
    document.getElementById('roomSelect').value = sala;
    
    // Atualiza o visual do menu lateral
    document.querySelectorAll('.side-menu ul li').forEach(item => {
      if(item.dataset.sala === sala){
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    
    toggleSideMenu();
    updateSelectedDate();
  }
  
  // Fecha o menu lateral ao clicar fora dele
  document.addEventListener('click', function(event) {
    const sideMenu = document.getElementById('sideMenu');
    if(sideMenu.classList.contains('active')) {
      if (!event.target.closest('#sideMenu') && !event.target.closest('.menu-icon')) {
        sideMenu.classList.remove('active');
      }
    }
  });
  
  // Exibir Agenda View
  window.showAgendaView = function() {
    agendaView.classList.add('active');
    calendarView.classList.remove('active');
    document.getElementById('navAgenda').classList.add('active');
    document.getElementById('navCalendario').classList.remove('active');
    document.getElementById('navDia').classList.remove('active');
    loadEvents();
  }
  
  // Exibir Calendário View
  window.showCalendarView = function() {
    calendarView.classList.add('active');
    agendaView.classList.remove('active');
    document.getElementById('navCalendario').classList.add('active');
    document.getElementById('navAgenda').classList.remove('active');
    document.getElementById('navDia').classList.remove('active');
    generateMonthlyCalendar();
  }
  
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
  
  // Retorna para hoje e exibe Agenda
  window.goToToday = function() {
    currentDate = new Date();
    updateSelectedDate();
    showAgendaView();
  }
  
  // Abre e fecha modal de nova reserva
  window.openReservationModal = function() {
    // Define a data padrão para hoje (formato YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    if (dataInput) {
      dataInput.value = today;
    }
    // Opcional: reseta os campos do formulário para evitar dados antigos
    reservationForm.reset();
    // Após reset, se houver valores para "início" e "duração", atualiza o "fim"
    updateFimTime();
    
    reservationModal.classList.add('active');
  }
  
  window.closeReservationModal = function() {
    reservationModal.classList.remove('active');
  }
  
  reservationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    submitReservation();
  });
  
  function loadEvents() {
    // Carrega eventos para a sala selecionada e data atual (Agenda)
    const dateStr = currentDate.toISOString().split('T')[0];
    const cacheKey = `events_${selectedSala}_${dateStr}`;
    const cachedData = localStorage.getItem(cacheKey);
    
    if(cachedData) {
      // Utiliza os dados do cache
      eventsData = JSON.parse(cachedData);
      displayEvents();
    }
  
    fetch(`api/reservas.php?sala=${encodeURIComponent(selectedSala)}&dia=${dateStr}`)
      .then(response => response.json())
      .then(data => {
        eventsData = data;
        displayEvents();
        localStorage.setItem(cacheKey, JSON.stringify(data));
      })
      .catch(err => {
        console.error(err);
        if(!cachedData){
          eventListEl.innerHTML = '<p>Erro ao carregar eventos.</p>';
        }
      });
  }
  
  function displayEvents() {
    eventListEl.innerHTML = '';
    const dateStr = currentDate.toISOString().split('T')[0];
    let filteredEvents = eventsData.filter(evento => evento.start.startsWith(dateStr));
    
    if (filteredEvents.length === 0) {
      eventListEl.innerHTML = '<p>Nenhuma reserva encontrada.</p>';
      return;
    }
    filteredEvents.sort((a, b) => new Date(a.start) - new Date(b.start));
    filteredEvents.forEach(evento => {
      const card = document.createElement('div');
      card.className = 'event-card';
      // Verifica se a reserva é do usuário atual (comparando o sAMAccountName)
      if (isCurrentUser(evento.usuario)) {
        card.classList.add('mine');
      }
      card.innerHTML = `
        <h4>${evento.title || 'Sem título'}</h4>
        <p><strong>Responsável:</strong> ${evento.nome_exibicao || 'N/A'}</p>
        <p><strong>Empresa:</strong> ${evento.empresa || 'N/A'}</p>
        <p><strong>Início:</strong> ${new Date(evento.start).toLocaleString()}</p>
        <p><strong>Fim:</strong> ${new Date(evento.end).toLocaleString()}</p>
        <p><strong>Sala:</strong> ${evento.sala}</p>
      `;
      card.addEventListener('click', () => {
        openEventModal(evento);
      });
      eventListEl.appendChild(card);
    });
  }
  
  // Modal de detalhes do evento
  function openEventModal(evento) {
    let detailsHtml = `
      <p><strong>Título:</strong> ${evento.title || 'Sem título'}</p>
      <p><strong>Responsável:</strong> ${evento.nome_exibicao || 'N/A'}</p>
      <p><strong>Empresa:</strong> ${evento.empresa || 'N/A'}</p>
      <p><strong>Início:</strong> ${new Date(evento.start).toLocaleString()}</p>
      <p><strong>Fim:</strong> ${new Date(evento.end).toLocaleString()}</p>
      <p><strong>Sala:</strong> ${evento.sala}</p>
    `;
    // Se a reserva for do usuário atual, exibe botão para cancelar
    if (isCurrentUser(evento.usuario)) {
       detailsHtml += `
       <div class="form-buttons">
          <button id="cancelReservationBtn" class="btn btn-danger" onclick="cancelReservation()" data-id="${evento.id}">Cancelar Reserva</button>
          <button type="button" class="btn btn-secondary" onclick="closeEventModal()">Fechar</button>
       </div>`;
    } else {
       detailsHtml += `
       <div class="form-buttons">
          <button type="button" class="btn btn-secondary" onclick="closeEventModal()">Fechar</button>
       </div>`;
    }
    eventDetailsEl.innerHTML = detailsHtml;
    eventModal.classList.add('active');
  }
  
  window.closeEventModal = function() {
    eventModal.classList.remove('active');
  }
  
  window.cancelReservation = function() {
    const eventId = document.getElementById('cancelReservationBtn').dataset.id;
    if (!eventId) return;
    fetch(`api/reservas.php?id=${eventId}`, {
      method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        closeEventModal();
        loadEvents();
        showNotification('Reserva cancelada com sucesso!');
      } else {
        showNotification(data.message || 'Erro ao cancelar reserva.');
      }
    })
    .catch(err => {
      console.error(err);
      showNotification('Erro na requisição.');
    });
  }
  
  function submitReservation() {
    const formData = new FormData(reservationForm);
    fetch('api/reservas.php', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        closeReservationModal();
        loadEvents();
        showNotification('Reserva realizada com sucesso!');
      } else {
        showNotification(data.message || 'Erro na reserva.');
      }
    })
    .catch(err => {
      console.error(err);
      showNotification('Erro ao enviar reserva.');
    });
  }
  
  function generateMonthlyCalendar() {
    monthlyCalendarEl.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Espaços em branco para os dias anteriores ao início do mês
    const startDayOfWeek = firstDay.getDay();
    for (let i = 0; i < startDayOfWeek; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'day empty';
      monthlyCalendarEl.appendChild(emptyCell);
    }
    
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dayCell = document.createElement('div');
      dayCell.className = 'day';
      const cellDate = new Date(year, month, d);
      dayCell.textContent = d;
      if (isToday(cellDate)) {
        dayCell.classList.add('today');
      }
      dayCell.addEventListener('click', () => {
        showCalendarDaySummary(cellDate);
      });
      monthlyCalendarEl.appendChild(dayCell);
    }
  }
  
  function showCalendarDaySummary(date) {
    document.querySelectorAll('.monthly-calendar .day').forEach(day => {
      day.classList.remove('selected');
    });
    const dayCells = Array.from(document.querySelectorAll('.monthly-calendar .day'));
    const clickedCell = dayCells.find(cell => parseInt(cell.textContent) === date.getDate());
    if(clickedCell) clickedCell.classList.add('selected');
  
    const daySummaryEl = document.getElementById('daySummary');
    daySummaryEl.innerHTML = '<p>Carregando reservas...</p>';
    daySummaryEl.style.opacity = 0;
    
    const dateStr = date.toISOString().split('T')[0];
    
    fetch(`api/reservas.php?dia=${dateStr}`)
      .then(response => response.json())
      .then(data => {
        if (data.length === 0) {
          daySummaryEl.innerHTML = '<p>Nenhuma reserva encontrada.</p>';
        } else {
          daySummaryEl.innerHTML = '';
          data.sort((a, b) => new Date(a.start) - new Date(b.start));
          data.forEach(evento => {
            const card = document.createElement('div');
            card.className = 'event-card';
            if (isCurrentUser(evento.usuario)) {
              card.classList.add('mine');
            }
            card.innerHTML = `
              <h4>${evento.title || 'Sem título'}</h4>
              <p><strong>Sala:</strong> ${evento.sala}</p>
              <p><strong>Início:</strong> ${new Date(evento.start).toLocaleString()}</p>
              <p><strong>Fim:</strong> ${new Date(evento.end).toLocaleString()}</p>
            `;
            card.addEventListener('click', () => {
              openEventModal(evento);
            });
            daySummaryEl.appendChild(card);
          });
        }
        daySummaryEl.style.transition = 'opacity 0.5s';
        daySummaryEl.style.opacity = 1;
      })
      .catch(err => {
        console.error(err);
        daySummaryEl.innerHTML = '<p>Erro ao carregar reservas.</p>';
        daySummaryEl.style.opacity = 1;
      });
  }
  
  function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  }
  
  function showNotification(message) {
    const notifModal = document.getElementById('notificationModal');
    const notifMessage = document.getElementById('notificationMessage');
    notifMessage.textContent = message;
    notifModal.classList.add('active');
    setTimeout(() => {
      notifModal.classList.remove('active');
    }, 3000);
  }
  
  updateSelectedDate();
});
