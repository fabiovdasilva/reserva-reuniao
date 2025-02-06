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
    <div class="title"><img src="images/Logo principal-branco.png" alt="Logo Proelt" style="width: 150px; height: auto;"></div>
    <div class="add-icon" onclick="openReservationModal()"><i class="material-icons">add</i></div>
  </header>
  
  <!-- Conteúdo Principal -->
  <main class="mobile-main">
    <!-- Agenda View -->
    <div id="agendaView" class="view active">
      <div class="date-picker">
        <button id="prevDay"><i class="material-icons">chevron_left</i></button>
        <span id="selectedDate">Hoje</span>
        <button id="nextDay"><i class="material-icons">chevron_right</i></button>
      </div>
      <!-- Exibe a sala em um container separado -->
      <div class="room-display">
         <span id="selectedRoom">Sala 01</span>
      </div>
      <div id="eventList" class="event-list">
        <!-- Eventos do dia carregados via JS -->
      </div>
    </div>
    
    <!-- Calendário Mensal View -->
    <div id="calendarView" class="view">
      <div class="calendar-container">
         <div id="monthlyCalendar" class="monthly-calendar">
           <!-- Calendário gerado via JS -->
         </div>
         <!-- Resumo do dia com reservas de todas as salas -->
         <div id="daySummary" class="day-summary"></div>
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
        <div class="form-group">
          <label for="data">Data:</label>
          <input type="date" id="data" name="data" required>
        </div>
        <div class="form-group">
          <label for="inicio">Início:</label>
          <input type="time" id="inicio" name="inicio" required>
        </div>         
        <div class="form-group">
          <label for="fim">Fim:</label>
          <input type="time" id="fim" name="fim" required>
        </div>
        <div class="form-group">
          <label for="duracao">Duração (minutos):</label>
          <input type="number" id="duracao" name="duracao" value="30" step="15" min="15">
        </div>
        <button type="submit" class="btn btn-primary">Salvar</button>
        <button type="button" class="btn btn-secondary" onclick="closeReservationModal()">Cancelar</button>
      </form>
    </div>
  </div>
  
  <!-- Modal para Detalhes da Reserva -->
  <div id="eventModal" class="modal">
    <div class="modal-content">
      <div id="eventDetails"></div>
    </div>
  </div>
  
  <!-- Modal de Notificação -->
  <div id="notificationModal" class="modal notification-modal">
    <div class="modal-content">
      <p id="notificationMessage"></p>
    </div>
  </div>
  
  <!-- Define o usuário atual para uso no JS -->
  <script>const currentUser = '<?= usuarioAtual() ?>';</script>
  <script src="js/mobile.js"></script>
</body>
</html>
