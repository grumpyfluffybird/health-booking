CREATE TABLE doctors (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    specialty  VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(512)
);

CREATE TABLE admins (
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE appointments (
    id               BIGSERIAL PRIMARY KEY,
    patient_name     VARCHAR(255)        NOT NULL,
    patient_phone    VARCHAR(50)         NOT NULL,
    patient_email    VARCHAR(255)        NOT NULL,
    doctor_id        BIGINT              NOT NULL REFERENCES doctors (id),
    appointment_date DATE                NOT NULL,
    appointment_time TIME                NOT NULL,
    status           VARCHAR(20)         NOT NULL DEFAULT 'PENDING',
    notes            TEXT,
    created_at       TIMESTAMP           NOT NULL DEFAULT NOW()
);
