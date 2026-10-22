<?php
declare(strict_types=1);

namespace StarGuess\Config;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailerException;

require_once __DIR__ . '/../vendor/PHPMailer/src/Exception.php';
require_once __DIR__ . '/../vendor/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/../vendor/PHPMailer/src/SMTP.php';

final class EmailService
{
    /**
     * Sends OTP via PHPMailer SMTP or saves locally to backend/logs/otp.log
     */
    public static function sendCode(string $to, string $subject, string $code): bool
    {
        // 1. Always record OTP locally in logs/otp.log for immediate access during local testing
        $logDir = dirname(__DIR__) . '/logs';
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0777, true);
        }

        $timestamp = date('Y-m-d H:i:s');
        $logLine = "[{$timestamp}] OTP for {$to} is: {$code} (Subject: {$subject})\n";
        @file_put_contents($logDir . '/otp.log', $logLine, FILE_APPEND);
        @file_put_contents($logDir . '/verification_codes.log', $logLine, FILE_APPEND);

        // 2. Prepare PHPMailer configuration
        $from = getenv('MAIL_FROM') ?: 'no-reply@starguess.local';
        $fromName = getenv('MAIL_FROM_NAME') ?: 'StarGuess Support';
        $host = trim((string)(getenv('SMTP_HOST') ?: ''));

        // If SMTP is configured in .env, attempt live transmission via PHPMailer
        if ($host !== '') {
            try {
                $mail = new PHPMailer(true);
                $mail->CharSet = 'UTF-8';
                $mail->isSMTP();
                $mail->Host = $host;
                $mail->Port = (int)(getenv('SMTP_PORT') ?: 587);
                $mail->Timeout = 5;

                $encryption = strtolower((string)(getenv('SMTP_ENCRYPTION') ?: 'tls'));
                if ($encryption === 'ssl') {
                    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
                } elseif ($encryption === 'tls') {
                    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                } else {
                    $mail->SMTPSecure = '';
                    $mail->SMTPAutoTLS = false;
                }

                $user = (string)(getenv('SMTP_USER') ?: '');
                $pass = (string)(getenv('SMTP_PASS') ?: '');
                if ($user !== '' || $pass !== '') {
                    $mail->SMTPAuth = true;
                    $mail->Username = $user;
                    $mail->Password = $pass;
                }

                $mail->setFrom($from, $fromName);
                $mail->addAddress($to);
                $mail->isHTML(true);
                $mail->Subject = $subject;
                $mail->Body = "
                    <div style='font-family: Arial, sans-serif; background: #0f172a; color: #f8fafc; padding: 28px; border-radius: 12px; max-width: 500px; margin: auto;'>
                        <h2 style='color: #fbbf24; margin-top: 0; text-align: center;'>STAR GUESS</h2>
                        <h3 style='color: #f1f5f9; text-align: center;'>Email Verification Code</h3>
                        <p style='font-size: 14px; text-align: center;'>Enter the six-digit verification code below to verify your account:</p>
                        <div style='background: #1e293b; padding: 18px; border-radius: 8px; text-align: center; margin: 24px 0; border: 1px solid #334155;'>
                            <span style='font-size: 34px; font-weight: bold; letter-spacing: 10px; color: #38bdf8;'>{$code}</span>
                        </div>
                        <p style='color: #94a3b8; font-size: 12px; text-align: center;'>This code will expire in 15 minutes. If you did not request this, please disregard.</p>
                    </div>";
                $mail->AltBody = "Your StarGuess verification code is: {$code}\r\nThis code expires in 15 minutes.";

                $mail->send();
                return true;
            } catch (\Throwable $e) {
                error_log('PHPMailer error: ' . $e->getMessage());
                // Fall back cleanly to the logged local OTP
                return true;
            }
        }

        // In local mode without external SMTP, local log in backend/logs/otp.log was already created
        return true;
    }
}
