package com.example.gateway;

public class MessageTypeRequest {
    private String id;
    private MessageType type;

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
}
