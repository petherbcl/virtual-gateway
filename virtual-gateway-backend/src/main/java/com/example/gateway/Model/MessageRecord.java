package com.example.gateway.Model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class MessageRecord {
    private final String timestamp;
    private final String message;
    private final String type; // Novo campo para o tipo de mensagem

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public MessageRecord(String message, String type) {
        this.timestamp = LocalDateTime.now().format(formatter);
        this.message = message;
        this.type = type;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public String getMessage() {
        return message;
    }

    public String getType() {
        return type;
    }
}
