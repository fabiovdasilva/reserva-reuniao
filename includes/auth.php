<?php
session_start();
function isAdmin() {
    return $_SESSION['is_admin'] ?? false;
}
function usuarioAtual() {
    return $_SESSION['usuario'] ?? null;
}
function empresaAtual() {
    return $_SESSION['empresa'] ?? null;
}
// Nova função para retornar o nome de exibição do AD
function nomeExibicaoAtual() {
    return $_SESSION['nome_exibicao'] ?? null;
}
?>
