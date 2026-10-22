-- MySQL 8.0+ Database Schema for Competitive Number Prediction Game & Stars Virtual Economy
-- Authoritative, ACID-compliant, auditable virtual economy

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;


-- --------------------------------------------------------
-- 1. ADMIN SYSTEM & RBAC
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS admin_roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    permissions_json JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    is_active TINYINT(1) DEFAULT 1,
    two_factor_enabled TINYINT(1) DEFAULT 0,
    two_factor_secret VARCHAR(100) DEFAULT NULL,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP NULL DEFAULT NULL,
    last_login_at TIMESTAMP NULL DEFAULT NULL,
    last_login_ip VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES admin_roles(role_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_sessions (
    token_hash CHAR(64) PRIMARY KEY,
    admin_id INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin_session_expiry (admin_id, expires_at),
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_activity_logs (
    log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(50) NOT NULL,
    before_value_json JSON DEFAULT NULL,
    after_value_json JSON DEFAULT NULL,
    reason TEXT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin_created (admin_id, created_at),
    INDEX idx_action (action),
    INDEX idx_target (target_type, target_id),
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. USERS & SESSIONS
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(30) DEFAULT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255) DEFAULT NULL,
    status ENUM('ACTIVE', 'SUSPENDED', 'BANNED') NOT NULL DEFAULT 'ACTIVE',
    email_verified_at TIMESTAMP NULL DEFAULT NULL,
    failed_login_attempts INT UNSIGNED NOT NULL DEFAULT 0,
    locked_until TIMESTAMP NULL DEFAULT NULL,
    risk_level ENUM('NORMAL', 'MONITOR', 'SUSPICIOUS', 'BLOCKED') NOT NULL DEFAULT 'NORMAL',
    suspension_reason VARCHAR(255) DEFAULT NULL,
    device_id VARCHAR(100) DEFAULT NULL,
    registration_ip VARCHAR(45) NOT NULL,
    last_login_ip VARCHAR(45) DEFAULT NULL,
    last_login_at TIMESTAMP NULL DEFAULT NULL,
    games_played INT UNSIGNED DEFAULT 0,
    games_won INT UNSIGNED DEFAULT 0,
    games_lost INT UNSIGNED DEFAULT 0,
    total_stars_won BIGINT UNSIGNED DEFAULT 0,
    total_stars_spent BIGINT UNSIGNED DEFAULT 0,
    total_stars_purchased BIGINT UNSIGNED DEFAULT 0,
    daily_reward_streak INT UNSIGNED NOT NULL DEFAULT 0,
    last_daily_claim DATE DEFAULT NULL,
    referral_code VARCHAR(20) NOT NULL UNIQUE,
    referred_by_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_risk_level (risk_level),
    INDEX idx_device_id (device_id),
    INDEX idx_registration_ip (registration_ip),
    FOREIGN KEY (referred_by_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    token_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash CHAR(64) NOT NULL,
    failed_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_verification (user_id,expires_at),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    token_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash CHAR(64) NOT NULL,
    failed_attempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_password_reset (user_id,expires_at),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_sessions (
    session_id VARCHAR(64) PRIMARY KEY,
    user_id INT NOT NULL,
    device_id VARCHAR(100) DEFAULT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(255) DEFAULT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_expires (user_id, expires_at),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. WALLET & STARS LEDGER (IMMUTABLE ACCOUNTING)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS wallets (
    wallet_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    balance BIGINT NOT NULL DEFAULT 0,
    purchased_balance BIGINT NOT NULL DEFAULT 0,
    won_balance BIGINT NOT NULL DEFAULT 0,
    bonus_balance BIGINT NOT NULL DEFAULT 0,
    transferred_balance BIGINT NOT NULL DEFAULT 0,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_wallet_balance_positive CHECK (balance >= 0),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS star_transactions (
    transaction_id VARCHAR(40) PRIMARY KEY,
    user_id INT NOT NULL,
    wallet_id INT NOT NULL,
    type ENUM(
        'PURCHASE',
        'GAME_ENTRY',
        'GAME_WIN',
        'GAME_REFUND',
        'BONUS',
        'REFERRAL',
        'TRANSFER_SENT',
        'TRANSFER_RECEIVED',
        'ADMIN_ADJUSTMENT',
        'COMMISSION'
    ) NOT NULL,
    amount BIGINT NOT NULL,
    balance_before BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,
    reference_type VARCHAR(50) DEFAULT NULL,
    reference_id VARCHAR(50) DEFAULT NULL,
    admin_id INT DEFAULT NULL,
    notes TEXT DEFAULT NULL,
    status ENUM('COMPLETED', 'FAILED', 'REVERSED') NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_type_created (user_id, type, created_at),
    INDEX idx_reference (reference_type, reference_id),
    INDEX idx_admin_id (admin_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (wallet_id) REFERENCES wallets(wallet_id) ON DELETE RESTRICT,
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS star_packages (
    package_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    stars BIGINT UNSIGNED NOT NULL,
    bonus_stars BIGINT UNSIGNED NOT NULL DEFAULT 0,
    price_cents INT UNSIGNED NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    is_active TINYINT(1) DEFAULT 1,
    is_featured TINYINT(1) DEFAULT 0,
    sort_order INT NOT NULL DEFAULT 0,
    start_date TIMESTAMP NULL DEFAULT NULL,
    end_date TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
    payment_id VARCHAR(40) PRIMARY KEY,
    user_id INT NOT NULL,
    package_id INT NOT NULL,
    amount_cents INT UNSIGNED NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    gateway VARCHAR(50) NOT NULL,
    gateway_tx_id VARCHAR(100) NOT NULL UNIQUE,
    status ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    stars_credited BIGINT UNSIGNED NOT NULL DEFAULT 0,
    credit_transaction_id VARCHAR(40) DEFAULT NULL,
    verified_at TIMESTAMP NULL DEFAULT NULL,
    gateway_response_json JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_status (user_id, status),
    INDEX idx_gateway_tx (gateway_tx_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (package_id) REFERENCES star_packages(package_id) ON DELETE RESTRICT,
    FOREIGN KEY (credit_transaction_id) REFERENCES star_transactions(transaction_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. GAME ENGINE, MODES & AUDIT LOGS
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS game_modes (
    mode_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    number_min INT NOT NULL DEFAULT 1,
    number_max INT NOT NULL DEFAULT 100,
    entry_fee BIGINT UNSIGNED NOT NULL DEFAULT 10,
    commission_percentage DECIMAL(5,2) NOT NULL DEFAULT 10.00,
    max_attempts INT UNSIGNED NOT NULL DEFAULT 10,
    turn_duration_seconds INT UNSIGNED NOT NULL DEFAULT 30,
    match_timeout_seconds INT UNSIGNED NOT NULL DEFAULT 300,
    max_players INT UNSIGNED NOT NULL DEFAULT 2,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS game_configurations (
    configuration_id INT AUTO_INCREMENT PRIMARY KEY,
    mode_id INT NOT NULL,
    number_min INT NOT NULL DEFAULT 1,
    number_max INT NOT NULL,
    entry_fee BIGINT UNSIGNED NOT NULL,
    commission_percentage DECIMAL(5,2) NOT NULL,
    max_attempts INT UNSIGNED NOT NULL DEFAULT 12,
    turn_duration_seconds INT UNSIGNED NOT NULL DEFAULT 30,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_game_config (mode_id, number_min, number_max, entry_fee),
    FOREIGN KEY (mode_id) REFERENCES game_modes(mode_id) ON DELETE RESTRICT,
    CONSTRAINT chk_game_config_range CHECK (number_max > number_min),
    CONSTRAINT chk_game_config_commission CHECK (commission_percentage >= 0 AND commission_percentage <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS commission_rules (
    rule_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    min_entry_fee BIGINT UNSIGNED NOT NULL,
    max_entry_fee BIGINT UNSIGNED NOT NULL,
    commission_percentage DECIMAL(5,2) NOT NULL,
    promotional_tag VARCHAR(50) DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS games (
    game_id VARCHAR(40) PRIMARY KEY,
    mode_id INT NOT NULL,
    configuration_id INT NOT NULL,
    player_a_id INT NOT NULL,
    player_b_id INT DEFAULT NULL,
    secret_holder_id INT DEFAULT NULL,
    guesser_id INT DEFAULT NULL,
    entry_fee BIGINT UNSIGNED NOT NULL,
    commission_amount BIGINT UNSIGNED NOT NULL DEFAULT 0,
    prize_amount BIGINT UNSIGNED NOT NULL DEFAULT 0,
    status ENUM('WAITING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED', 'DISPUTED') NOT NULL DEFAULT 'WAITING',
    winner_id INT DEFAULT NULL,
    current_turn_player_id INT DEFAULT NULL,
    turn_deadline TIMESTAMP NULL DEFAULT NULL,
    secret_commitment_hash VARCHAR(64) NOT NULL,
    secret_salt VARCHAR(32) NOT NULL,
    secret_revealed_number INT DEFAULT NULL,
    invite_code VARCHAR(10) DEFAULT NULL,
    is_private TINYINT(1) NOT NULL DEFAULT 0,
    total_attempts INT UNSIGNED DEFAULT 0,
    server_node VARCHAR(50) DEFAULT 'node-01',
    cancellation_reason VARCHAR(255) DEFAULT NULL,
    started_at TIMESTAMP NULL DEFAULT NULL,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_player_a (player_a_id),
    INDEX idx_player_b (player_b_id),
    INDEX idx_created (created_at),
    UNIQUE KEY uq_invite_code (invite_code),
    FOREIGN KEY (mode_id) REFERENCES game_modes(mode_id) ON DELETE RESTRICT,
    FOREIGN KEY (configuration_id) REFERENCES game_configurations(configuration_id) ON DELETE RESTRICT,
    FOREIGN KEY (player_a_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (player_b_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (secret_holder_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (guesser_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (winner_id) REFERENCES users(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS platform_wallets (
    wallet_id TINYINT PRIMARY KEY,
    balance BIGINT UNSIGNED NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_platform_wallet_id CHECK (wallet_id = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT IGNORE INTO platform_wallets(wallet_id,balance) VALUES(1,0);

CREATE TABLE IF NOT EXISTS platform_transactions (
    transaction_id VARCHAR(40) PRIMARY KEY,
    game_id VARCHAR(40) NOT NULL UNIQUE,
    type ENUM('COMMISSION') NOT NULL,
    amount BIGINT UNSIGNED NOT NULL,
    balance_before BIGINT UNSIGNED NOT NULL,
    balance_after BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_platform_created(created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS game_guesses (
    guess_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    game_id VARCHAR(40) NOT NULL,
    player_id INT NOT NULL,
    attempt_number INT UNSIGNED NOT NULL,
    guess_number INT NOT NULL,
    result ENUM('HIGHER', 'LOWER', 'MATCHED') NOT NULL,
    response_time_ms INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_game_attempt (game_id, attempt_number),
    INDEX idx_player (player_id),
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE RESTRICT,
    FOREIGN KEY (player_id) REFERENCES users(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS game_events (
    event_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    game_id VARCHAR(40) NOT NULL,
    event_type ENUM(
        'MATCH_CREATED',
        'PLAYER_JOINED',
        'NUMBER_COMMITTED',
        'GAME_STARTED',
        'GUESS_SUBMITTED',
        'HIGHER_RESULT',
        'LOWER_RESULT',
        'NUMBER_MATCHED',
        'WINNER_DETERMINED',
        'REWARD_PROCESSED',
        'MATCH_CANCELLED',
        'MATCH_EXPIRED'
    ) NOT NULL,
    payload_json JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_game_event (game_id, event_id),
    INDEX idx_event_type (event_type),
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. DISPUTES, LEADERBOARDS & FRAUD MONITORING
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS disputes (
    dispute_id VARCHAR(40) PRIMARY KEY,
    user_id INT NOT NULL,
    game_id VARCHAR(40) DEFAULT NULL,
    payment_id VARCHAR(40) DEFAULT NULL,
    dispute_type ENUM('GAME_ISSUE', 'PAYMENT_ISSUE', 'MISSING_STARS', 'INCORRECT_RESULT', 'CONNECTION_ISSUE', 'SUSPICIOUS_OPPONENT') NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('PENDING', 'UNDER_REVIEW', 'RESOLVED_REFUNDED', 'RESOLVED_REJECTED', 'CLOSED') NOT NULL DEFAULT 'PENDING',
    refund_amount BIGINT UNSIGNED DEFAULT 0,
    refund_transaction_id VARCHAR(40) DEFAULT NULL,
    admin_id INT DEFAULT NULL,
    admin_notes TEXT DEFAULT NULL,
    resolved_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (game_id) REFERENCES games(game_id) ON DELETE SET NULL,
    FOREIGN KEY (payment_id) REFERENCES payments(payment_id) ON DELETE SET NULL,
    FOREIGN KEY (refund_transaction_id) REFERENCES star_transactions(transaction_id) ON DELETE SET NULL,
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS daily_rewards (
    day_number INT PRIMARY KEY,
    stars_amount BIGINT UNSIGNED NOT NULL,
    streak_bonus BIGINT UNSIGNED NOT NULL DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS daily_reward_claims (
    claim_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reward_day INT NOT NULL,
    amount BIGINT UNSIGNED NOT NULL,
    transaction_id VARCHAR(40) NOT NULL UNIQUE,
    claim_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_daily_claim (user_id,claim_date),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (reward_day) REFERENCES daily_rewards(day_number) ON DELETE RESTRICT,
    FOREIGN KEY (transaction_id) REFERENCES star_transactions(transaction_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS referrals (
    referral_id INT AUTO_INCREMENT PRIMARY KEY,
    referrer_id INT NOT NULL,
    referee_id INT NOT NULL UNIQUE,
    reward_amount BIGINT UNSIGNED NOT NULL DEFAULT 25,
    status ENUM('PENDING', 'QUALIFIED', 'REWARDED', 'FRAUD_FLAGGED') NOT NULL DEFAULT 'PENDING',
    reward_transaction_id VARCHAR(40) DEFAULT NULL,
    qualified_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (referee_id) REFERENCES users(user_id) ON DELETE RESTRICT,
    FOREIGN KEY (reward_transaction_id) REFERENCES star_transactions(transaction_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS security_alerts (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT NULL,
    alert_type VARCHAR(100) NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
    description TEXT NOT NULL,
    evidence_json JSON DEFAULT NULL,
    status ENUM('UNRESOLVED', 'MONITORING', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'UNRESOLVED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_severity_status (severity, status),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS system_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    is_sensitive TINYINT(1) DEFAULT 0,
    updated_by_admin_id INT DEFAULT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by_admin_id) REFERENCES admins(admin_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('ANNOUNCEMENT', 'PROMOTION', 'MAINTENANCE', 'UPDATE', 'REWARD') NOT NULL,
    target_audience ENUM('ALL', 'ACTIVE_USERS', 'SPECIFIC_USER', 'SEGMENT') NOT NULL DEFAULT 'ALL',
    target_user_id INT DEFAULT NULL,
    sent_by_admin_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (target_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (sent_by_admin_id) REFERENCES admins(admin_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification_receipts (
    notification_id INT NOT NULL,
    user_id INT NOT NULL,
    read_at TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (notification_id,user_id),
    FOREIGN KEY (notification_id) REFERENCES notifications(notification_id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS support_tickets (
    ticket_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category ENUM('GAME_ISSUE','PAYMENT_ISSUE','WALLET','ACCOUNT','OTHER') NOT NULL DEFAULT 'OTHER',
    subject VARCHAR(160) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('OPEN','IN_REVIEW','RESOLVED','CLOSED') NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_support_status (status,created_at),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- SEED INITIAL DATA: ROLES, DEFAULT ADMINS, MODES, RULES
-- --------------------------------------------------------

INSERT INTO admin_roles (role_id, role_name, description, permissions_json) VALUES
(1, 'SUPER_ADMIN', 'Unrestricted administrative access to all systems, settings, and finances', 
 '["*"]'),
(2, 'ADMIN', 'Full operational administration excluding core system configuration', 
 '["users:*", "games:*", "wallets:view", "disputes:*", "reports:*", "anti_fraud:*"]'),
(3, 'FINANCE_ADMIN', 'Financial audits, Star ledger adjustments, packages, payments, and refunds', 
 '["wallets:*", "payments:*", "star_packages:*", "commissions:*", "refunds:*", "reports:financial"]'),
(4, 'GAME_MODERATOR', 'Live match monitoring, game configuration, disputes, and user warnings', 
 '["games:view", "games:monitor", "disputes:resolve", "users:view", "users:suspend"]'),
(5, 'SUPPORT_ADMIN', 'Customer support, dispute tickets, password resets, and user inquiries', 
 '["users:view", "users:reset_password", "disputes:view", "disputes:resolve", "tickets:*"]');

-- Admin accounts are intentionally provisioned by the operator after setup.

INSERT INTO game_modes (mode_id, name, slug, number_min, number_max, entry_fee, commission_percentage, max_attempts, turn_duration_seconds, match_timeout_seconds, is_active) VALUES
(1, 'Classic 1v1', 'classic-1v1', 1, 100, 10, 10.00, 12, 30, 300, 1),
(2, 'Reverse 1v1', 'reverse-1v1', 1, 100, 10, 10.00, 12, 30, 300, 1),
(3, 'Double Round', 'double-round', 1, 100, 10, 10.00, 12, 30, 300, 0);

INSERT INTO game_configurations (mode_id,number_min,number_max,entry_fee,commission_percentage,max_attempts,turn_duration_seconds)
SELECT m.mode_id,r.number_min,r.number_max,f.entry_fee,
       CASE WHEN f.entry_fee < 50 THEN 10.00 WHEN f.entry_fee < 250 THEN 8.00 ELSE 5.00 END,
       CEIL(LOG2(r.number_max-r.number_min+1))+4,
       CASE WHEN m.slug='double-round' THEN 20 ELSE 30 END
FROM game_modes m
CROSS JOIN (SELECT 1 number_min,10 number_max UNION ALL SELECT 1,50 UNION ALL SELECT 1,100 UNION ALL SELECT 1,500 UNION ALL SELECT 1,1000) r
CROSS JOIN (SELECT 5 entry_fee UNION ALL SELECT 10 UNION ALL SELECT 25 UNION ALL SELECT 50 UNION ALL SELECT 100 UNION ALL SELECT 500) f;

INSERT INTO commission_rules (rule_id, name, min_entry_fee, max_entry_fee, commission_percentage, promotional_tag) VALUES
(1, 'Standard Low Entry', 1, 49, 10.00, 'DEFAULT'),
(2, 'Mid Stakes Bracket', 50, 249, 8.00, 'MID_TIER'),
(3, 'High Roller Bracket', 250, 999, 6.00, 'HIGH_ROLLER'),
(4, 'Elite Whale Bracket', 1000, 50000, 5.00, 'WHALE');

INSERT INTO star_packages (package_id, name, stars, bonus_stars, price_cents, currency, is_active, is_featured, sort_order) VALUES
(1, 'Starter Pouch', 100, 0, 99, 'USD', 1, 0, 1),
(2, 'Challenger Chest', 550, 50, 499, 'USD', 1, 1, 2),
(3, 'Champion Vault', 1200, 200, 999, 'USD', 1, 0, 3),
(4, 'High Roller Hoard', 6500, 1500, 4999, 'USD', 1, 0, 4),
(5, 'Apex Sovereign Treasury', 14000, 4000, 9999, 'USD', 1, 0, 5);

INSERT INTO daily_rewards (day_number, stars_amount, streak_bonus, is_active) VALUES
(1, 10, 0, 1),
(2, 15, 0, 1),
(3, 20, 5, 1),
(4, 30, 5, 1),
(5, 50, 10, 1),
(6, 75, 15, 1),
(7, 100, 50, 1);

INSERT INTO system_settings (setting_key, setting_value, category, description) VALUES
('platform_name', 'StarGuess Arena', 'general', 'Platform public title'),
('currency_symbol', 'USD', 'finance', 'Default financial currency'),
('maintenance_mode', 'false', 'system', 'When enabled, new matches cannot start'),
('maintenance_notice', 'System maintenance in progress. Active games will conclude normally.', 'system', 'Message shown to players'),
('registration_enabled', 'true', 'users', 'Enable new user registrations'),
('games_enabled', 'true', 'gameplay', 'Enable matchmaking and new games'),
('payments_enabled', 'true', 'finance', 'Enable in-app purchase of Star packages'),
('transfer_enabled', 'true', 'transfers', 'Enable user-to-user Star transfers'),
('transfer_min_amount', '50', 'transfers', 'Minimum Stars transferable'),
('transfer_max_daily', '2000', 'transfers', 'Maximum Stars transferable per day'),
('transfer_fee_percentage', '2.5', 'transfers', 'Commission fee charged on user transfers'),
('anti_fraud_max_winrate_threshold', '85.0', 'security', 'Trigger security alert if win rate exceeds this percentage');
