<?php
declare(strict_types=1);

namespace StarGuess\Config;

use PDO;
use RuntimeException;

final class SslCommerzService
{
    private static function mode(): string
    {
        $mode = strtolower((string) (getenv('SSLCOMMERZ_MODE') ?: 'sandbox'));
        if (!in_array($mode, ['sandbox', 'live'], true)) throw new RuntimeException('SSLCommerz mode is invalid.');
        return $mode;
    }

    private static function credentials(): array
    {
        $id = trim((string) (getenv('SSLCOMMERZ_STORE_ID') ?: ''));
        $password = (string) (getenv('SSLCOMMERZ_STORE_PASSWORD') ?: '');
        if ($id === '' || $password === '') throw new RuntimeException('SSLCommerz merchant credentials are not configured.');
        return [$id, $password];
    }

    private static function baseUrl(): string
    {
        $url = rtrim((string) (getenv('APP_BASE_URL') ?: ''), '/');
        $parts = parse_url($url);
        if (!$parts || empty($parts['host']) || !in_array($parts['scheme'] ?? '', ['https', 'http'], true)) {
            throw new RuntimeException('Set APP_BASE_URL to the public StarGuess API origin.');
        }
        if (self::mode() === 'live' && ($parts['scheme'] !== 'https' || in_array(strtolower($parts['host']), ['localhost', '127.0.0.1'], true))) {
            throw new RuntimeException('Live SSLCommerz requires a public HTTPS APP_BASE_URL.');
        }
        return $url;
    }

    private static function gatewayOrigin(): string
    {
        return self::mode() === 'live' ? 'https://securepay.sslcommerz.com' : 'https://sandbox.sslcommerz.com';
    }

    private static function postForm(string $url, array $fields): array
    {
        if (!function_exists('curl_init')) throw new RuntimeException('PHP cURL is required for SSLCommerz.');
        $curl = curl_init($url);
        curl_setopt_array($curl, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($fields, '', '&', PHP_QUERY_RFC3986),
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_TIMEOUT => 25,
            CURLOPT_SSL_VERIFYPEER => true,
            CURLOPT_SSL_VERIFYHOST => 2,
            CURLOPT_HTTPHEADER => ['Accept: application/json', 'Content-Type: application/x-www-form-urlencoded'],
        ]);
        $body = curl_exec($curl);
        $status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
        $error = curl_error($curl);
        curl_close($curl);
        if (!is_string($body) || $status < 200 || $status >= 300) {
            error_log('SSLCommerz request failed; HTTP ' . $status . ($error !== '' ? ', transport error' : ''));
            throw new RuntimeException('Payment provider could not be reached. Try again later.');
        }
        $decoded = json_decode($body, true);
        if (!is_array($decoded)) throw new RuntimeException('Payment provider returned an invalid response.');
        return $decoded;
    }

    private static function getJson(string $url): array
    {
        if (!function_exists('curl_init')) throw new RuntimeException('PHP cURL is required for SSLCommerz.');
        $curl = curl_init($url);
        curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER=>true,CURLOPT_FOLLOWLOCATION=>false,CURLOPT_CONNECTTIMEOUT=>10,CURLOPT_TIMEOUT=>25,CURLOPT_SSL_VERIFYPEER=>true,CURLOPT_SSL_VERIFYHOST=>2,CURLOPT_HTTPHEADER=>['Accept: application/json']]);
        $body=curl_exec($curl);$status=(int)curl_getinfo($curl,CURLINFO_RESPONSE_CODE);$error=curl_error($curl);curl_close($curl);
        if(!is_string($body)||$status<200||$status>=300){error_log('SSLCommerz validation failed; HTTP '.$status.($error!==''?', transport error':''));throw new RuntimeException('Payment provider validation is unavailable.');}
        $decoded=json_decode($body,true);if(!is_array($decoded))throw new RuntimeException('Payment provider returned an invalid validation response.');return $decoded;
    }

    public static function initiate(PDO $db, array $user, int $packageId, string $phone): array
    {
        [$storeId, $storePassword] = self::credentials();
        $base = self::baseUrl();
        $phone = preg_replace('/[^0-9+]/', '', $phone) ?? '';
        if (!preg_match('/^(?:\+?8801|01)[3-9][0-9]{8}$/', $phone)) {
            throw new RuntimeException('Enter a valid Bangladesh mobile number for checkout.');
        }

        $q = $db->prepare('SELECT package_id,name,stars,bonus_stars,price_cents,currency FROM star_packages WHERE package_id=? AND is_active=1');
        $q->execute([$packageId]);
        $package = $q->fetch();
        if (!$package || (int) $package['price_cents'] < 1) throw new RuntimeException('This Stars package is unavailable.');
        $amount = number_format(((int) $package['price_cents']) / 100, 2, '.', '');
        $currency = strtoupper((string) $package['currency']);
        if (!preg_match('/^[A-Z]{3}$/', $currency)) throw new RuntimeException('The package currency is invalid.');

        $paymentId = 'PAY_' . bin2hex(random_bytes(14));
        $transactionId = 'SG' . strtoupper(bin2hex(random_bytes(12)));
        $snapshot = ['package_id' => (int) $package['package_id'], 'stars' => (int) $package['stars'], 'bonus_stars' => (int) $package['bonus_stars']];
        $db->prepare('INSERT INTO payments(payment_id,user_id,package_id,amount_cents,currency,gateway,gateway_tx_id,status,gateway_response_json) VALUES(?,?,?,?,?,?,?,\'PENDING\',?)')
            ->execute([$paymentId, $user['user_id'], $packageId, $package['price_cents'], $currency, 'SSLCOMMERZ', $transactionId, json_encode(['package_snapshot' => $snapshot], JSON_THROW_ON_ERROR)]);

        $endpoint = self::gatewayOrigin() . '/gwprocess/v4/api.php';
        try {
            $response = self::postForm($endpoint, [
                'store_id' => $storeId,
                'store_passwd' => $storePassword,
                'total_amount' => $amount,
                'currency' => $currency,
                'tran_id' => $transactionId,
                'success_url' => $base . '/api/v1/payments/sslcommerz/success',
                'fail_url' => $base . '/api/v1/payments/sslcommerz/fail',
                'cancel_url' => $base . '/api/v1/payments/sslcommerz/cancel',
                'ipn_url' => $base . '/api/v1/payments/sslcommerz/ipn',
                'cus_name' => substr((string) $user['username'], 0, 50),
                'cus_email' => substr((string) $user['email'], 0, 100),
                'cus_add1' => 'Not provided',
                'cus_city' => 'Dhaka',
                'cus_postcode' => '1200',
                'cus_country' => 'Bangladesh',
                'cus_phone' => $phone,
                'shipping_method' => 'NO',
                'product_name' => substr((string) $package['name'], 0, 100),
                'product_category' => 'Digital Goods',
                'product_profile' => 'non-physical-goods',
                'value_a' => $paymentId,
            ]);
            $redirect = (string) ($response['GatewayPageURL'] ?? $response['redirectGatewayURL'] ?? '');
            $allowedHost = self::mode() === 'live' ? 'securepay.sslcommerz.com' : 'sandbox.sslcommerz.com';
            $redirectParts = parse_url($redirect);
            if (($response['status'] ?? '') !== 'SUCCESS' || ($redirectParts['scheme'] ?? '') !== 'https' || strtolower((string) ($redirectParts['host'] ?? '')) !== $allowedHost) {
                throw new RuntimeException('SSLCommerz could not start this checkout. Verify the merchant and package currency settings.');
            }
            $db->prepare('UPDATE payments SET gateway_response_json=? WHERE payment_id=? AND status=\'PENDING\'')
                ->execute([json_encode(['package_snapshot' => $snapshot, 'sessionkey' => (string) ($response['sessionkey'] ?? '')], JSON_THROW_ON_ERROR), $paymentId]);
            return ['payment_id' => $paymentId, 'status' => 'PENDING', 'checkout_url' => $redirect];
        } catch (\Throwable $e) {
            $db->prepare('UPDATE payments SET status=\'FAILED\' WHERE payment_id=? AND status=\'PENDING\'')->execute([$paymentId]);
            throw $e;
        }
    }

    public static function processCallback(PDO $db, array $post): array
    {
        [$storeId, $storePassword] = self::credentials();
        $transactionId = trim((string) ($post['tran_id'] ?? ''));
        $validationId = trim((string) ($post['val_id'] ?? ''));
        if ($transactionId === '' || $validationId === '' || strlen($transactionId) > 40 || strlen($validationId) > 100) {
            throw new RuntimeException('Payment callback is incomplete.');
        }
        $q = $db->prepare('SELECT payment_id,gateway_tx_id FROM payments WHERE gateway=\'SSLCOMMERZ\' AND gateway_tx_id=?');
        $q->execute([$transactionId]);
        $payment = $q->fetch();
        if (!$payment) throw new RuntimeException('Payment order was not found.');

        $url = self::gatewayOrigin() . '/validator/api/validationserverAPI.php';
        $validation = self::getJson($url . '?' . http_build_query(['val_id'=>$validationId,'store_id'=>$storeId,'store_passwd'=>$storePassword,'format'=>'json'], '', '&', PHP_QUERY_RFC3986));
        if (!in_array(($validation['status'] ?? ''), ['VALID', 'VALIDATED'], true) ||
            !hash_equals($transactionId, (string) ($validation['tran_id'] ?? ''))) {
            throw new RuntimeException('SSLCommerz transaction could not be validated.');
        }

        $db->beginTransaction();
        try {
            $q = $db->prepare('SELECT payment_id,user_id,package_id,amount_cents,currency,status,gateway_response_json FROM payments WHERE payment_id=? FOR UPDATE');
            $q->execute([$payment['payment_id']]);
            $order = $q->fetch();
            if (!$order) throw new RuntimeException('Payment order was not found.');
            if ($order['status'] === 'SUCCESS') { $db->commit(); return ['payment_id' => $order['payment_id'], 'status' => 'SUCCESS']; }
            if ($order['status'] !== 'PENDING') throw new RuntimeException('This payment order is no longer pending.');

            $snapshot = json_decode((string) $order['gateway_response_json'], true) ?: [];
            $stars = (int) ($snapshot['package_snapshot']['stars'] ?? 0);
            $bonus = (int) ($snapshot['package_snapshot']['bonus_stars'] ?? 0);
            $validatedCurrency = strtoupper((string) ($validation['currency_type'] ?? $validation['currency'] ?? ''));
            $validatedAmount = $validation['currency_amount'] ?? $validation['amount'] ?? null;
            $amountCents = is_numeric($validatedAmount) ? (int) round((float) $validatedAmount * 100) : -1;
            if ($stars < 1 || $bonus < 0 || $validatedCurrency !== strtoupper((string) $order['currency']) || $amountCents !== (int) $order['amount_cents'] || (string) ($validation['risk_level'] ?? '0') === '1') {
                throw new RuntimeException('Validated payment details do not match the Stars order.');
            }

            $walletQuery = $db->prepare('SELECT wallet_id,balance FROM wallets WHERE user_id=? FOR UPDATE');
            $walletQuery->execute([$order['user_id']]);
            $wallet = $walletQuery->fetch();
            if (!$wallet) throw new RuntimeException('Wallet is unavailable.');
            $credit = $stars + $bonus;
            $before = (int) $wallet['balance'];
            $after = $before + $credit;
            $db->prepare('UPDATE wallets SET balance=?,purchased_balance=purchased_balance+?,bonus_balance=bonus_balance+?,version=version+1 WHERE wallet_id=?')
                ->execute([$after, $stars, $bonus, $wallet['wallet_id']]);
            $db->prepare('UPDATE users SET total_stars_purchased=total_stars_purchased+? WHERE user_id=?')->execute([$stars, $order['user_id']]);
            $transaction = 'TX_' . bin2hex(random_bytes(15));
            $db->prepare('INSERT INTO star_transactions(transaction_id,user_id,wallet_id,type,amount,balance_before,balance_after,reference_type,reference_id,notes,status) VALUES(?,?,?,\'PURCHASE\',?,?,?,?,?,?,\'COMPLETED\')')
                ->execute([$transaction, $order['user_id'], $wallet['wallet_id'], $credit, $before, $after, 'PAYMENT', $order['payment_id'], 'Verified SSLCommerz Stars purchase']);
            $safeValidation = array_intersect_key($validation, array_flip(['status', 'tran_id', 'val_id', 'amount', 'currency', 'currency_type', 'currency_amount', 'bank_tran_id', 'risk_level']));
            $db->prepare('UPDATE payments SET status=\'SUCCESS\',stars_credited=?,credit_transaction_id=?,verified_at=UTC_TIMESTAMP(),gateway_response_json=? WHERE payment_id=?')
                ->execute([$credit, $transaction, json_encode(['package_snapshot' => ['stars' => $stars, 'bonus_stars' => $bonus], 'validation' => $safeValidation], JSON_THROW_ON_ERROR), $order['payment_id']]);
            $db->commit();
            return ['payment_id' => $order['payment_id'], 'status' => 'SUCCESS'];
        } catch (\Throwable $e) {
            if ($db->inTransaction()) $db->rollBack();
            throw $e;
        }
    }
}
