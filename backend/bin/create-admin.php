<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/Database.php';
use StarGuess\Config\Database;

if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
if ($argc !== 4) {
    fwrite(STDERR, "Usage: php create-admin.php <username> <email> <full-name>\nYou will be prompted for a password of at least 14 characters.\n");
    exit(2);
}
[, $username, $email, $fullName] = $argv;
$password = getenv('ADMIN_BOOTSTRAP_PASSWORD') ?: (string)readline('New admin password (14+ characters): ');
if (!preg_match('/^[A-Za-z0-9_.-]{3,50}$/', $username) || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 14) {
    fwrite(STDERR, "Invalid username/email or password shorter than 14 characters.\n"); exit(2);
}
$pdo = Database::connection();
$role = $pdo->query("SELECT role_id FROM admin_roles WHERE role_name='SUPER_ADMIN'")->fetchColumn();
if (!$role) { fwrite(STDERR, "Run schema.sql first so roles exist.\n"); exit(1); }
$q = $pdo->prepare('INSERT INTO admins (username,email,password_hash,role_id,full_name,is_active) VALUES (?,?,?,?,?,1)');
try {
    $q->execute([$username, strtolower($email), password_hash($password, PASSWORD_DEFAULT), $role, $fullName]);
    fwrite(STDOUT, "Administrator created.\n");
} catch (Throwable $e) {
    fwrite(STDERR, "Could not create administrator. Username or email may already exist.\n"); exit(1);
}
