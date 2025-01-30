<?php
include '../includes/auth.php';
include '../includes/db.php';

header('Content-Type: application/json');

try {
    switch($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Listar reservas
            $sala = $_GET['sala'] ?? null;
            if(!$sala) throw new Exception("Sala não especificada");
            
            $stmt = $pdo->prepare("
                SELECT id, titulo, inicio as start, fim as end, cor, usuario, empresa, sala
                FROM reservas 
                WHERE sala = ?
            ");
            $stmt->execute([$sala]);
            $reservas = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode($reservas);
            break;

        case 'POST':
            // Nova reserva
            if(empty($_POST['sala']) || !in_array($_POST['sala'], ['Sala 01', 'Sala 02', 'Sala 03'])) {
                throw new Exception("Seleção de sala inválida");
            }
            $dados = $_POST;
            
            // Validação
            $required = ['titulo', 'sala', 'inicio', 'fim'];
            foreach($required as $campo) {
                if(empty($dados[$campo])) {
                    throw new Exception("Campo '$campo' obrigatório");
                }
            }
            
            // Verificar conflitos
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
                ':sala' => $dados['sala'],
                ':inicio' => $dados['inicio'],
                ':fim' => $dados['fim']
            ]);
            
            if($stmt->rowCount() > 0) {
                throw new Exception("Conflito de horário na sala selecionada");
            }
            
            // Obter cor da empresa
            $stmt = $pdo->prepare("SELECT cor FROM empresas WHERE nome = ?");
            $stmt->execute([empresaAtual()]);
            $cor = $stmt->fetchColumn();
            
            // Inserir reserva
            $stmt = $pdo->prepare("
                INSERT INTO reservas 
                (titulo, sala, inicio, fim, usuario, empresa, cor)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $dados['titulo'],
                $dados['sala'],
                $dados['inicio'],
                $dados['fim'],
                usuarioAtual(),
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
            
                // Verificar permissão
                if(usuarioAtual() !== $reserva['usuario'] && !isAdmin()) {
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