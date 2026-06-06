CREATE DATABASE biogentix_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE biogentix_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20),
    hashed_password VARCHAR(255) NOT NULL,
    role ENUM('admin','doctor','field_worker','lab_tech') DEFAULT 'field_worker',
    district VARCHAR(100),
    facility_name VARCHAR(150),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE districts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    latitude DECIMAL(10,7),
    longitude DECIMAL(10,7),
    population INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE diseases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    category ENUM('infectious','maternal','nutrition','enteric','ntd') NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color_hex VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from diseases;



INSERT INTO diseases (code, name, category, description, icon, color_hex) VALUES
('TB',         'Tuberculosis',                  'infectious', 'AI CXR detection + cough analysis + sputum',        'lungs',       '#EF4444'),
('HIV',        'HIV / AIDS',                    'infectious', 'Risk scoring + rapid antibody/antigen test',         'dna',         '#F97316'),
('MALARIA',    'Malaria',                        'infectious', 'Smear detection + fever pattern + RDT',             'bug',         '#EAB308'),
('STI',        'STI / Sexually Transmitted',    'infectious', 'Symptom + lab interpretation + multiplex test',     'shield',      '#8B5CF6'),
('MATERNAL',   'Maternal & Newborn Health',     'maternal',   'Risk scoring for maternal mortality + neonatal',    'heart',       '#EC4899'),
('MALNUTRITION','Malnutrition / Anaemia',       'nutrition',  'Hb prediction + nutrition scoring + MUAC',          'activity',    '#06B6D4'),
('DENGUE',     'Dengue / NTDs',                 'ntd',        'Symptom + region mapping + rapid NTD panels',        'zap',         '#10B981'),
('ENTERIC',    'Enteric Diseases',              'enteric',    'Diarrhea syndrome classification + stool antigen',   'droplet',     '#3B82F6');

CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_uid VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    age INT,
    gender ENUM('male','female','other') NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    district_id INT,
    village VARCHAR(100),
    is_pregnant BOOLEAN DEFAULT FALSE,
    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    blood_group VARCHAR(5),
    registered_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (district_id) REFERENCES districts(id),
    FOREIGN KEY (registered_by) REFERENCES users(id)
);

CREATE TABLE screenings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    screening_uid VARCHAR(30) UNIQUE NOT NULL,
    patient_id INT NOT NULL,
    disease_id INT NOT NULL,
    screened_by INT NOT NULL,
    district_id INT,
    screening_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    symptoms JSON,
    vitals JSON,
    kit_test_result ENUM('positive','negative','inconclusive','not_done') DEFAULT 'not_done',
    kit_test_type VARCHAR(100),
    ai_risk_score DECIMAL(5,4),
    ai_risk_level ENUM('minimal','low','medium','high','critical') DEFAULT 'low',
    ai_prediction TEXT,
    ai_confidence DECIMAL(5,4),
    ai_engine_used VARCHAR(50) DEFAULT 'rule_engine',
    final_diagnosis TEXT,
    referral_needed BOOLEAN DEFAULT FALSE,
    referral_facility VARCHAR(200),
    notes TEXT,
    status ENUM('pending','completed','referred','follow_up') DEFAULT 'pending',
    synced BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (disease_id) REFERENCES diseases(id),
    FOREIGN KEY (screened_by) REFERENCES users(id),
    FOREIGN KEY (district_id) REFERENCES districts(id)
);

CREATE TABLE symptom_responses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    screening_id INT NOT NULL,
    symptom_key VARCHAR(100) NOT NULL,
    symptom_label VARCHAR(200),
    response_value VARCHAR(50),
    severity_score INT DEFAULT 0,
    FOREIGN KEY (screening_id) REFERENCES screenings(id) ON DELETE CASCADE
);

CREATE TABLE lab_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    screening_id INT NOT NULL,
    test_name VARCHAR(150) NOT NULL,
    test_type ENUM('rapid_kit','blood_test','urine','stool','imaging','pcr','other') NOT NULL,
    result_value VARCHAR(200),
    result_unit VARCHAR(50),
    normal_range VARCHAR(100),
    is_abnormal BOOLEAN DEFAULT FALSE,
    image_path VARCHAR(500),
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (screening_id) REFERENCES screenings(id) ON DELETE CASCADE
);

CREATE TABLE outbreak_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    disease_id INT NOT NULL,
    district_id INT NOT NULL,
    alert_level ENUM('watch','warning','critical') NOT NULL,
    case_count INT DEFAULT 0,
    threshold_exceeded INT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (disease_id) REFERENCES diseases(id),
    FOREIGN KEY (district_id) REFERENCES districts(id)
);
CREATE TABLE platform_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stat_date DATE NOT NULL,
    total_screenings INT DEFAULT 0,
    high_risk_cases INT DEFAULT 0,
    districts_covered INT DEFAULT 0,
    new_patients INT DEFAULT 0,
    referrals_made INT DEFAULT 0,
    positive_cases INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (stat_date)
);
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
select * from districts;
INSERT INTO districts (name, state, latitude, longitude, population) VALUES
('Pune',       'Maharashtra', 18.5204, 73.8567, 7276000),
('Mumbai',     'Maharashtra', 19.0760, 72.8777, 12442373),
('Nashik',     'Maharashtra', 19.9975, 73.7898, 1486973),
('Nagpur',     'Maharashtra', 21.1458, 79.0882, 2497870),
('Aurangabad', 'Maharashtra', 19.8762, 75.3433, 1175116),
('Solapur',    'Maharashtra', 17.6868, 75.9064, 951558);

password is Admin@123)

INSERT INTO users (full_name, email, phone, hashed_password, role, district, facility_name) VALUES
('BioQentix Admin', 'admin@biogentix.com', '9999999999',
'$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlJbekRSQRMOGV2ygA0DKVF5e',
'admin', 'Pune', 'BioQentix HQ');

SHOW TABLES;
SELECT COUNT(*) as disease_count FROM diseases;
SELECT COUNT(*) as district_count FROM districts;


USE biogentix_db;

-- Check if users table has data
SELECT * FROM users;


SET SQL_SAFE_UPDATES = 0;
DELETE FROM users;
ALTER TABLE users AUTO_INCREMENT = 1;
SET SQL_SAFE_UPDATES = 1;
-- Clear it and start fresh
DELETE FROM users;
ALTER TABLE users AUTO_INCREMENT = 1;

-- Also verify diseases table is populated
SELECT * FROM diseases;

SHOW COLUMNS FROM users;
SELECT * FROM users;

USE biogentix_db;
SET SQL_SAFE_UPDATES = 0;
DELETE FROM users;
SET SQL_SAFE_UPDATES = 1;
ALTER TABLE users AUTO_INCREMENT = 1;

SELECT * FROM users;
USE biogentix_db;
SHOW TABLES;
SELECT COUNT(*) FROM diseases;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM districts;

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Admin123';
FLUSH PRIVILEGES;

USE biogentix_db;
SELECT id, email, role, is_active FROM users;

