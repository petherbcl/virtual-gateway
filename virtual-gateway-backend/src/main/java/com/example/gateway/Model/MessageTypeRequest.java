package com.example.gateway.Model;

public class MessageTypeRequest {
    private String id;
    private MessageType type;
    private String meterId;

    public MessageTypeRequest() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public MessageType getType() {
        return type;
    }

    public void setType(MessageType type) {
        this.type = type;
    }

    public String getMeterId() {
        return meterId;
    }

    public void setMeterId(String meterId) {
        this.meterId = meterId;
    }
}
