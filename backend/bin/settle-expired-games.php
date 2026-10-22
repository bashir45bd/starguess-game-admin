<?php
declare(strict_types=1);

use StarGuess\Config\Database;

require_once __DIR__ . '/../config/Database.php';
date_default_timezone_set('UTC');
$db=Database::connection();
$ids=$db->query("SELECT game_id FROM games WHERE (status='WAITING' AND player_b_id IS NULL AND created_at<DATE_SUB(UTC_TIMESTAMP(),INTERVAL 5 MINUTE)) OR (status='IN_PROGRESS' AND turn_deadline IS NOT NULL AND turn_deadline<=UTC_TIMESTAMP()) ORDER BY created_at LIMIT 100")->fetchAll(PDO::FETCH_COLUMN);

function ledger(PDO $db,int $userId,int $amount,string $type,string $gameId,string $note): void {
    $q=$db->prepare('SELECT wallet_id,balance FROM wallets WHERE user_id=? FOR UPDATE');$q->execute([$userId]);$w=$q->fetch();if(!$w)throw new RuntimeException('Player wallet is missing.');$before=(int)$w['balance'];$after=$before+$amount;if($after<0)throw new RuntimeException('Wallet balance would become negative.');
    if($type==='GAME_WIN')$db->prepare('UPDATE wallets SET balance=?,won_balance=won_balance+?,version=version+1 WHERE wallet_id=?')->execute([$after,$amount,$w['wallet_id']]);else $db->prepare('UPDATE wallets SET balance=?,version=version+1 WHERE wallet_id=?')->execute([$after,$w['wallet_id']]);
    $db->prepare("INSERT INTO star_transactions(transaction_id,user_id,wallet_id,type,amount,balance_before,balance_after,reference_type,reference_id,notes,status) VALUES(?,?,?,?,?,?,?,?,?,?, 'COMPLETED')")->execute(['TX_'.bin2hex(random_bytes(15)),$userId,$w['wallet_id'],$type,$amount,$before,$after,'GAME',$gameId,$note]);
}
function commission(PDO $db,string $game,int $amount): void {
    $q=$db->query('SELECT balance FROM platform_wallets WHERE wallet_id=1 FOR UPDATE');$before=(int)$q->fetchColumn();$db->prepare('UPDATE platform_wallets SET balance=? WHERE wallet_id=1')->execute([$before+$amount]);$db->prepare("INSERT INTO platform_transactions(transaction_id,game_id,type,amount,balance_before,balance_after) VALUES(?,?,'COMMISSION',?,?,?)")->execute(['TX_COM_'.bin2hex(random_bytes(12)),$game,$amount,$before,$before+$amount]);
}

$settled=0;
foreach($ids as $gameId){
    $db->beginTransaction();
    try{
        $q=$db->prepare("SELECT g.*,c.commission_percentage,(g.status='WAITING' AND g.player_b_id IS NULL AND g.created_at<DATE_SUB(UTC_TIMESTAMP(),INTERVAL 5 MINUTE)) stale_waiting,(g.status='IN_PROGRESS' AND g.turn_deadline IS NOT NULL AND g.turn_deadline<=UTC_TIMESTAMP()) expired_turn FROM games g JOIN game_configurations c ON c.configuration_id=g.configuration_id WHERE g.game_id=? FOR UPDATE");$q->execute([$gameId]);$g=$q->fetch();
        if(!$g){$db->rollBack();continue;}
        if((int)$g['stale_waiting']===1){
            if(!(int)$g['is_private']){ledger($db,(int)$g['player_a_id'],(int)$g['entry_fee'],'GAME_REFUND',$gameId,'Unmatched quick game timeout refund');$db->prepare('UPDATE users SET total_stars_spent=GREATEST(0,total_stars_spent-?) WHERE user_id=?')->execute([$g['entry_fee'],$g['player_a_id']]);}
            $db->prepare("UPDATE games SET status='CANCELLED',cancellation_reason='Matchmaking timed out',completed_at=UTC_TIMESTAMP() WHERE game_id=? AND status='WAITING'")->execute([$gameId]);$db->prepare("INSERT INTO game_events(game_id,event_type,payload_json) VALUES(?,'MATCH_CANCELLED',JSON_OBJECT('reason','timeout'))")->execute([$gameId]);$settled++;$db->commit();continue;
        }
        if((int)$g['expired_turn']===1){
            $loser=(int)$g['current_turn_player_id'];$a=(int)$g['player_a_id'];$b=(int)$g['player_b_id'];if(!in_array($loser,[$a,$b],true)){$db->rollBack();continue;}$winner=$loser===$a?$b:$a;$pool=(int)$g['entry_fee']*2;$cut=(int)floor($pool*(float)$g['commission_percentage']/100);$prize=$pool-$cut;
            $db->prepare("UPDATE games SET status='COMPLETED',winner_id=?,commission_amount=?,prize_amount=?,completed_at=UTC_TIMESTAMP(),cancellation_reason='Turn deadline expired' WHERE game_id=? AND status='IN_PROGRESS'")->execute([$winner,$cut,$prize,$gameId]);ledger($db,$winner,$prize,'GAME_WIN',$gameId,'Opponent missed turn deadline');$db->prepare('UPDATE users SET games_played=games_played+1,games_won=games_won+1,total_stars_won=total_stars_won+? WHERE user_id=?')->execute([$prize,$winner]);$db->prepare('UPDATE users SET games_played=games_played+1,games_lost=games_lost+1 WHERE user_id=?')->execute([$loser]);commission($db,$gameId,$cut);$db->prepare("INSERT INTO game_events(game_id,event_type,payload_json) VALUES(?,'WINNER_DETERMINED',JSON_OBJECT('winner_id',?,'reason','timeout')),(?,'REWARD_PROCESSED',JSON_OBJECT('reward',?))")->execute([$gameId,$winner,$gameId,$prize]);$settled++;
        }
        $db->commit();
    }catch(Throwable $e){if($db->inTransaction())$db->rollBack();error_log('Game settlement failed for '.$gameId.': '.$e->getMessage());}
}
fwrite(STDOUT,"Settled {$settled} expired game(s).\n");
