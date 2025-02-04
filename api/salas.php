<?php
include '../includes/auth.php';
include '../includes/db.php';
header('Content-Type: application/json');

try {
    if($_SERVER['REQUEST_METHOD'] === 'GET') {
        $stmt = $pdo->query("SELECT * FROM salas");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
    elseif($_SERVER['REQUEST_METHOD'] === 'POST') {
        if(!isAdmin()) throw new Exception("Acesso negado");
        $data = json_decode(file_get_contents('php://input'), true);
        if($data['acao'] === 'toggle') {
            $stmt = $pdo->prepare("UPDATE salas SET disponivel = ? WHERE nome = ?");
            $stmt->execute([$data['status'], $data['nome']]);
            echo json_encode(['success' => true]);
        }
    }
} catch(Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
