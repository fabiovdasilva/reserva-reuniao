<?php
// Define o fuso horário para Brasília
date_default_timezone_set('America/Sao_Paulo');

include '../includes/auth.php';
include '../includes/db.php';
header('Content-Type: application/json');

try {
    switch($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            if(isset($_GET['dia']) && !isset($_GET['sala'])) {
                $dia = $_GET['dia'];
                $stmt = $pdo->prepare("
                    SELECT id, titulo as title, inicio as start, fim as end, cor, usuario, nome_exibicao, empresa, sala
                    FROM reservas
                    WHERE DATE(inicio) = ?
                ");
                $stmt->execute([$dia]);
                $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($reservas);
                break;
            }
            $sala = $_GET['sala'] ?? null;
            if(!$sala) throw new Exception("Sala não especificada");
            if(isset($_GET['dia'])) {
                $dia = $_GET['dia'];
                $stmt = $pdo->prepare("
                    SELECT id, titulo as title, inicio as start, fim as end, cor, usuario, nome_exibicao, empresa, sala
                    FROM reservas
                    WHERE sala = ? AND DATE(inicio) = ?
                ");
                $stmt->execute([$sala, $dia]);
                $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($reservas);
            } else {
                $stmt = $pdo->prepare("
                    SELECT id, titulo as title, inicio as start, fim as end, cor, usuario, nome_exibicao, empresa, sala
                    FROM reservas
                    WHERE sala = ?
                ");
                $stmt->execute([$sala]);
                $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode($reservas);
            }
            break;
        case 'POST':
            if(empty($_POST['sala']) || !in_array($_POST['sala'], ['Sala 01', 'Sala 02', 'Sala 03', 'Sala 04'])) {
                throw new Exception("Seleção de sala inválida");
            }
            $dados = $_POST;
            $required = ['titulo', 'sala', 'inicio', 'fim'];
            foreach($required as $campo) {
                if(empty($dados[$campo])) {
                    throw new Exception("Campo '$campo' obrigatório");
                }
            }
            // Se os campos de horário não contiverem data, tenta combiná-los com o campo "data"
            if(strpos($dados['inicio'], ' ') === false && !empty($_POST['data'])) {
                $dados['inicio'] = $_POST['data'] . ' ' . $dados['inicio'] . ':00';
            }
            if(strpos($dados['fim'], ' ') === false && !empty($_POST['data'])) {
                $dados['fim'] = $_POST['data'] . ' ' . $dados['fim'] . ':00';
            }
            // Validação dos formatos de data/hora – espera-se "Y-m-d H:i:s"
            $inicio_dt = DateTime::createFromFormat('Y-m-d H:i:s', $dados['inicio']);
            $fim_dt = DateTime::createFromFormat('Y-m-d H:i:s', $dados['fim']);
            if(!$inicio_dt) {
                throw new Exception("Formato de início inválido: " . $dados['inicio']);
            }
            if(!$fim_dt) {
                throw new Exception("Formato de fim inválido: " . $dados['fim']);
            }
            if($fim_dt <= $inicio_dt) {
                throw new Exception("O horário de fim deve ser posterior ao horário de início");
            }
            // Validação para agendamento em dias anteriores ou para horários já passados
            $now = new DateTime();
            // Define uma tolerância em minutos para reservas muito próximas do horário atual
            $tolerance = 2; // minutos
            if ($inicio_dt < (clone $now)->modify("+{$tolerance} minutes")) {
                if ($inicio_dt->format('Y-m-d') < $now->format('Y-m-d')) {
                    throw new Exception("Não é permitido agendar para dias anteriores");
                } else {
                    throw new Exception("O horário de início deve ser, no mínimo, {$tolerance} minutos no futuro");
                }
            }
            $stmt = $pdo->prepare("
                SELECT id
                FROM reservas
                WHERE sala = :sala
                AND (
                    (inicio < :fim AND fim > :inicio)
                    OR (inicio BETWEEN :inicio AND :fim)
                    OR (fim BETWEEN :inicio AND :fim)
                )
            ");
            $stmt->execute([
                ':sala'   => $dados['sala'],
                ':inicio' => $dados['inicio'],
                ':fim'    => $dados['fim']
            ]);
            if($stmt->rowCount() > 0) {
                throw new Exception("Conflito de horário na sala selecionada");
            }
            $stmt = $pdo->prepare("SELECT cor FROM empresas WHERE nome = ?");
            $stmt->execute([empresaAtual()]);
            $cor = $stmt->fetchColumn();
            // INSERÇÃO: armazena o sAMAccountName (usuarioAtual) e o displayName do AD (na sessão)
            $stmt = $pdo->prepare("
                INSERT INTO reservas
                (titulo, sala, inicio, fim, usuario, nome_exibicao, empresa, cor)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $dados['titulo'],
                $dados['sala'],
                $dados['inicio'],
                $dados['fim'],
                usuarioAtual(),
                $_SESSION['nome_exibicao'],
                empresaAtual(),
                $cor
            ]);
            echo json_encode(['success' => true]);
            break;
        case 'DELETE':
            $id = $_GET['id'] ?? null;
            if(!$id) throw new Exception("ID não especificado");
            $stmt = $pdo->prepare("SELECT usuario FROM reservas WHERE id = ?");
            $stmt->execute([$id]);
            $reserva = $stmt->fetch();
            if(!$reserva) throw new Exception("Reserva não encontrada");
            if(strtolower(trim(usuarioAtual())) !== strtolower(trim($reserva['usuario'])) && !isAdmin()){
                throw new Exception("Acesso não autorizado");
            }
            $stmt = $pdo->prepare("DELETE FROM reservas WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Método não permitido']);
    }
} catch(Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
