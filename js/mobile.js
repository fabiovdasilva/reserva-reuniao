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
  
    function formatDate(date) {
      const options = { weekday: 'long', month: 'short', day: 'numeric' };
      return date.toLocaleDateString('pt-BR', options);
    }
  
    function updateSelectedDate() {
      selectedDateEl.textContent = formatDate(currentDate);
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
      toggleSideMenu();
      loadEvents();
    }
  
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
  
    // Retorna para hoje e exibe Agenda
    window.goToToday = function() {
      currentDate = new Date();
      updateSelectedDate();
      showAgendaView();
    }
  
    // Abre e fecha modal de nova reserva
    window.openReservationModal = function() {
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
      fetch(`api/reservas.php?sala=${encodeURIComponent(selectedSala)}`)
        .then(response => response.json())
        .then(data => {
          eventsData = data;
          displayEvents();
        })
        .catch(err => {
          console.error(err);
          eventListEl.innerHTML = '<p>Erro ao carregar eventos.</p>';
        });
    }
  
    function displayEvents() {
      eventListEl.innerHTML = '';
      // Filtra os eventos do dia atual
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
        card.dataset.id = evento.id;
        card.innerHTML = `
          <h4>${evento.titulo || 'Sem título'}</h4>
          <p><strong>Responsável:</strong> ${evento.usuario || 'N/A'}</p>
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
      eventDetailsEl.innerHTML = `
        <p><strong>Título:</strong> ${evento.titulo || 'Sem título'}</p>
        <p><strong>Responsável:</strong> ${evento.usuario || 'N/A'}</p>
        <p><strong>Empresa:</strong> ${evento.empresa || 'N/A'}</p>
        <p><strong>Início:</strong> ${new Date(evento.start).toLocaleString()}</p>
        <p><strong>Fim:</strong> ${new Date(evento.end).toLocaleString()}</p>
        <p><strong>Sala:</strong> ${evento.sala}</p>
      `;
      document.getElementById('cancelReservationBtn').dataset.id = evento.id;
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
          alert('Reserva cancelada com sucesso!');
        } else {
          alert(data.message || 'Erro ao cancelar reserva.');
        }
      })
      .catch(err => {
        console.error(err);
        alert('Erro na requisição.');
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
          alert('Reserva realizada com sucesso!');
        } else {
          alert(data.message || 'Erro na reserva.');
        }
      })
      .catch(err => {
        console.error(err);
        alert('Erro ao enviar reserva.');
      });
    }
    
    // Gera um calendário mensal simples
    function generateMonthlyCalendar() {
      monthlyCalendarEl.innerHTML = '';
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // Espaços em branco para os dias anteriores ao início do mês
      const startDayOfWeek = firstDay.getDay(); // 0 (Dom) a 6 (Sáb)
      for (let i = 0; i < startDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day empty';
        monthlyCalendarEl.appendChild(emptyCell);
      }
      
      // Cria os dias do mês
      for (let d = 1; d <= lastDay.getDate(); d++) {
        const dayCell = document.createElement('div');
        dayCell.className = 'day';
        const cellDate = new Date(year, month, d);
        dayCell.textContent = d;
        if (isToday(cellDate)) {
          dayCell.classList.add('today');
        }
        dayCell.addEventListener('click', () => {
          currentDate = cellDate;
          updateSelectedDate();
          showAgendaView();
        });
        monthlyCalendarEl.appendChild(dayCell);
      }
    }
    
    function isToday(date) {
      const today = new Date();
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear();
    }
    
    updateSelectedDate();
  });
  