-- Events Table
CREATE TABLE events (
    event_id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

-- Participants Table
CREATE TABLE participants (
    participant_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);

-- Event-Participants Relationship Table
CREATE TABLE event_participants (
    event_id INT REFERENCES events(event_id) ON DELETE CASCADE,
    participant_id INT REFERENCES participants(participant_id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, participant_id)
);
