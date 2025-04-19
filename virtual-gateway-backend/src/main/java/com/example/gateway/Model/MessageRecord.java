package com.example.gateway.Model;

import java.time.LocalDateTime;

public class MessageRecord {
    private final LocalDateTime timestamp;
    private final String message;

    public MessageRecord(LocalDateTime timestamp, String message) {
        this.timestamp = timestamp;
        this.message = message;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getMessage() {
        return message;
    }
}
