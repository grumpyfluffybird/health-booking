CREATE TABLE doctor_availability (
    id          BIGSERIAL PRIMARY KEY,
    doctor_id   BIGINT      NOT NULL REFERENCES doctors (id) ON DELETE CASCADE,
    day_of_week VARCHAR(10) NOT NULL,
    start_time  TIME        NOT NULL,
    end_time    TIME        NOT NULL
);
