CREATE TABLE user_chat_state(
user_id TEXT PRIMARY KEY,
history TEXT NOT NULL,
updated_at TIMESTAMP DEFAULT NOW()
);