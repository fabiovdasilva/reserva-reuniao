<?php
include 'includes/db.php';
include 'includes/auth.php';
$erro = '';
if($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Verificar se é o admin local
    if($_POST['username'] === 'admin' && $_POST['password'] === '85652545') {
        $_SESSION['usuario'] = 'admin';
        $_SESSION['nome_exibicao'] = 'admin';
        $_SESSION['empresa'] = 'Administração';
        $_SESSION['is_admin'] = true;
        header("Location: index.php");
        exit();
    }
    $ldap_con = ldap_connect("192.168.2.2");
    ldap_set_option($ldap_con, LDAP_OPT_PROTOCOL_VERSION, 3);
    ldap_set_option($ldap_con, LDAP_OPT_REFERRALS, 0);
    if(@ldap_bind($ldap_con, "admin2@proelt.com.br", "Zug2022.")) {
        // Inclua o atributo "displayName" na lista de atributos desejados
        $filter = "(sAMAccountName=" . $_POST['username'] . ")";
        $attributes = ["company", "memberof", "displayName"];
        $result = ldap_search(
            $ldap_con,
            "OU=Proelt Engenharia Ltda - Usuarios, DC=proelt,DC=com,DC=br",
            $filter,
            $attributes
        );
        $info = ldap_get_entries($ldap_con, $result);
        if($info['count'] > 0) {
            // Armazena o nome de usuário para autenticação
            $_SESSION['usuario'] = $_POST['username'];
            // Armazena o nome para exibição a partir do AD; se não existir, usa o usuário
            $_SESSION['nome_exibicao'] = $info[0]['displayname'][0] ?? $_POST['username'];
            $_SESSION['empresa'] = $info[0]['company'][0] ?? 'Não informado';
            $_SESSION['is_admin'] = false;
            if(isset($info[0]['memberof'])) {
                foreach($info[0]['memberof'] as $group) {
                    if(strpos($group, 'Administradores') !== false) {
                        $_SESSION['is_admin'] = true;
                        break;
                    }
                }
            }
            header("Location: index.php");
            exit();
        }
    }
    $erro = "Credenciais inválidas!";
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Login - PROELT</title>
    <link rel="stylesheet" href="css/estilos.css">
    <link rel="shortcut icon" href="images/favicon.ico" type="image/x-icon">
</head>
<body>
    <div class="modal active">
        <h3><div class="logo"><img src="images/logo principal transparente 300x60.png" alt="Logo Proelt"></div></h3>
        <form method="POST">
            <div class="form-group">
                <label>Usuário AD:</label>
                <input type="text" name="username" required>
            </div>
            <div class="form-group">
                <label>Senha:</label>
                <input type="password" name="password" required>
            </div>
            <button type="submit" class="btn btn-primary">Entrar</button>
            <?php if($erro): ?>
                <p class="error"><?= $erro ?></p>
            <?php endif; ?>
        </form>
    </div>
</body>
</html>
