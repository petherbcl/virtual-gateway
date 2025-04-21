package com.example.gateway.Model;

import java.time.LocalDateTime;

public class MessageRecord {
    private final LocalDateTime timestamp;
    private final String message;
    private final String type; // Novo campo para o tipo de mensagem

    public MessageRecord(LocalDateTime timestamp, String message, String type) {
        this.timestamp = timestamp;
        this.message = message;
        this.type = type;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getMessage() {
        return message;
    }

    public String getType() {
        return type;
    }
}
