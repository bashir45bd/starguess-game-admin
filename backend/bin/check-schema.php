<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/Database.php';
$db=\StarGuess\Config\Database::connection();
foreach(['payments','star_packages','email_verification_tokens','password_reset_tokens','game_configurations','games','platform_wallets','system_settings'] as $table){
    $q=$db->prepare('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name=?');$q->execute([$table]);
    echo $table.': '.((int)$q->fetchColumn()===1?'present':'MISSING').PHP_EOL;
}
