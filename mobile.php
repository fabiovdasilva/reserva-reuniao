<?php
// mobile.php
include 'includes/auth.php';
include 'includes/db.php';

if (!usuarioAtual()) {
    header("Location: login.php");
    exit;
}

// Recupera as salas disponíveis
$stmt = $pdo->query("SELECT * FROM salas");
$salas = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sistema de Reservas - Mobile - PROELT</title>
  <!-- Estilos Mobile -->
  <link rel="stylesheet" href="css/mobile.css">
  <!-- Ícones do Material Design -->
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</head>
<body>
  <!-- Menu Lateral de Salas -->
  <div id="sideMenu" class="side-menu">
    <div class="side-menu-header">
      <span>Salas</span>
      <button onclick="toggleSideMenu()"><i class="material-icons">close</i></button>
    </div>
    <ul>
      <?php foreach ($salas as $sala): ?>
        <li class="sala-item <?= $sala['disponivel'] ? '' : 'indisponivel' ?>" data-sala="<?= htmlspecialchars($sala['nome']) ?>" onclick="selectSala('<?= htmlspecialchars($sala['nome']) ?>')">
          <?= htmlspecialchars($sala['nome']) ?>
          <?= !$sala['disponivel'] ? ' (Indisponível)' : '' ?>
        </li>
      <?php endforeach; ?>
    </ul>
  </div>
  
  <!-- Cabeçalho Mobile -->
  <header class="mobile-header">
    <div class="menu-icon" onclick="toggleSideMenu()"><i class="material-icons">menu</i></div>
    <div class="title">PROELT</div>
    <div class="add-icon" onclick="openReservationModal()"><i class="material-icons">add</i></div>
  </header>
  
  <!-- Conteúdo Principal -->
  <main class="mobile-main">
    <!-- Agenda View -->
    <div id="agendaView" class="view active">
      <div class="date-picker">
        <button id="prevDay"><i class="material-icons">chevron_left</i></button>
        <div id="selectedDate">Hoje</div>
        <button id="nextDay"><i class="material-icons">chevron_right</i></button>
      </div>
      <div id="eventList" class="event-list">
        <!-- Eventos do dia carregados via JS -->
      </div>
    </div>
    <!-- Calendário Mensal View -->
    <div id="calendarView" class="view">
      <div id="monthlyCalendar" class="monthly-calendar">
        <!-- Calendário gerado via JS -->
      </div>
    </div>
  </main>
  
  <!-- Navegação Inferior -->
  <nav class="mobile-bottom-nav">
    <button id="navAgenda" class="nav-button" onclick="showAgendaView()">
      <i class="material-icons">event_note</i>
      <span>Agenda</span>
    </button>
    <button id="navCalendario" class="nav-button" onclick="showCalendarView()">
      <i class="material-icons">calendar_today</i>
      <span>Calendário</span>
    </button>
    <button id="navDia" class="nav-button" onclick="goToToday()">
      <i class="material-icons">today</i>
      <span>Dia</span>
    </button>
  </nav>
  
  <!-- Modal para Nova Reserva -->
  <div id="reservationModal" class="modal">
    <div class="modal-content">
      <h3>Nova Reserva</h3>
      <form id="reservationForm">
        <label>Título:</label>
        <input type="text" name="titulo" required>
        <label>Sala:</label>
        <select name="sala" required id="roomSelect">
          <?php foreach ($salas as $sala): ?>
            <option value="<?= htmlspecialchars($sala['nome']) ?>" <?= !$sala['disponivel'] ? 'disabled' : '' ?>>
              <?= htmlspecialchars($sala['nome']) ?>
            </option>
          <?php endforeach; ?>
        </select>
        <label>Início:</label>
        <input type="datetime-local" name="inicio" required>
        <label>Fim:</label>
        <input type="datetime-local" name="fim" required>
        <div class="form-buttons">
          <button type="submit" class="btn btn-primary">Salvar</button>
          <button type="button" class="btn btn-secondary" onclick="closeReservationModal()">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
  
  <!-- Modal para Detalhes da Reserva -->
  <div id="eventModal" class="modal">
    <div class="modal-content">
      <h3>Detalhes da Reserva</h3>
      <div id="eventDetails"></div>
      <div class="form-buttons">
        <button id="cancelReservationBtn" class="btn btn-danger" onclick="cancelReservation()">Cancelar Reserva</button>
        <button type="button" class="btn btn-secondary" onclick="closeEventModal()">Fechar</button>
      </div>
    </div>
  </div>
  
  <script src="js/mobile.js"></script>
</body>
</html>
