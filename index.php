<?php
include 'includes/auth.php';
include 'includes/db.php';

if (preg_match('/(android|iphone|ipad|mobile)/i', $_SERVER['HTTP_USER_AGENT'])) {
    header("Location: mobile.php");
    exit;
}

if(!usuarioAtual()){
    header("Location: login.php");
    exit();
}
try {
    $salas = $pdo->query("SELECT * FROM salas")->fetchAll(PDO::FETCH_ASSOC);
} catch(PDOException $e){
    die("Erro ao carregar salas: " . $e->getMessage());
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Sistema de Reservas - PROELT</title>
    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    <!-- Animate.css para animações -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"/>
    <!-- FullCalendar CSS -->
    <link href="https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.8/main.min.css" rel="stylesheet" />
    <link href="https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@6.1.8/main.min.css" rel="stylesheet" />
    <!-- Arquivo de estilos personalizado (incluso após o Bootstrap) -->
    <link rel="stylesheet" href="css/estilos.css">
    <link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon">
</head>
<body>
    <div class="header">
        <div class="logo"><img src="images/Logo principal-branco.png" alt="Logo Proelt"></div>
        <div class="user-info">
            <!-- Exibe o nome para exibição do AD se estiver definido, senão exibe o nome de usuário -->
            <span><?= htmlspecialchars($_SESSION['nome_exibicao'] ?? usuarioAtual()) ?></span>
            <span><?= htmlspecialchars(empresaAtual()) ?></span>
            <button class="btn btn-primary" onclick="window.showReservaModal()">Nova Reserva</button>
            <?php if(isAdmin()): ?>
                <button class="btn btn-danger" onclick="showAdminModal()">Admin</button>
            <?php endif; ?>
            <a href="logout.php" class="btn btn-secondary">Sair</a>
        </div>
    </div>
    <div class="sidebar">
        <?php foreach($salas as $sala): ?>
            <div class="sala-item <?= $sala['disponivel'] ? '' : 'indisponivel' ?>" data-sala="<?= htmlspecialchars($sala['nome']) ?>" onclick="carregarCalendario('<?= htmlspecialchars($sala['nome']) ?>')">
                <?= htmlspecialchars($sala['nome']) ?>
                <?= !$sala['disponivel'] ? ' (Indisponível)' : '' ?>
            </div>
        <?php endforeach; ?>
    </div>
    <div class="main-content">
        <div class="calendar-container">
            <div id="calendar"></div>
        </div>
        <!-- Painel direito para reservas do dia -->
        <div id="rightPanel" class="right-panel">
            <div id="rightPanelContent"></div>
        </div>
    </div>
    <!-- Modal Nova Reserva -->
    <div id="reservaModal" class="modal" role="dialog" aria-modal="true">
        <h3>📅 Nova Reserva</h3>
        <form id="reservaForm" onsubmit="event.preventDefault(); submitReserva()">
            <div class="form-group">
                <label>Título:</label>
                <input type="text" name="titulo" required>
            </div>
            <div class="form-group">
                <label>Sala:</label>
                <select id="roomSelect" name="sala" required>
                    <?php foreach($salas as $sala): ?>
                        <option value="<?= $sala['nome'] ?>" <?= !$sala['disponivel'] ? 'disabled' : '' ?> <?= $sala['nome'] === 'Sala 01' ? 'selected' : '' ?>>
                            <?= $sala['nome'] ?>
                        </option>
                    <?php endforeach; ?>
                </select>
            </div>
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
            <div class="form-botoes">
                <button type="submit" class="btn btn-primary">Salvar</button>
                <button type="button" class="btn btn-secondary" onclick="hideModal('reservaModal')">Cancelar</button>
            </div>
        </form>
    </div>
    <!-- Modal Detalhes da Reserva -->
    <div id="eventModal" class="modal" role="dialog" aria-modal="true">
        <h3>Detalhes da Reserva</h3>
        <div id="eventDetails"></div>
        <div class="form-botoes">
            <button id="btnCancelar" class="btn btn-danger" onclick="cancelarReserva()" style="display: none;">Cancelar Reserva</button>
            <button class="btn btn-secondary" onclick="hideModal('eventModal')">Fechar</button>
        </div>
    </div>
    <!-- Modal Admin -->
    <?php if(isAdmin()): ?>
    <div id="adminModal" class="modal" role="dialog" aria-modal="true">
        <h3>Gerenciamento de Salas</h3>
        <div id="listaSalasAdmin"></div>
        <button class="btn btn-secondary" onclick="hideModal('adminModal')">Fechar</button>
    </div>
    <?php endif; ?>
    <!-- Modal de Diálogo para Avisos -->
    <div id="dialogModal" class="modal" role="dialog" aria-modal="true">
        <h3>Aviso</h3>
        <div class="dialog-content"></div>
        <div class="form-botoes">
            <button class="btn btn-secondary" onclick="hideDialog()">Fechar</button>
        </div>
    </div>
    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.8/index.global.min.js"></script>
    <!-- Bootstrap JS -->
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.2/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // A variável USUARIO_ATUAL continua sendo o nome de usuário para fins de comparação em reservas, etc.
        const USUARIO_ATUAL = '<?= htmlspecialchars(usuarioAtual()) ?>';
        const IS_ADMIN = <?= isAdmin() ? 'true' : 'false' ?>;
    </script>
    <script src="js/main.js"></script>
</body>
</html>
