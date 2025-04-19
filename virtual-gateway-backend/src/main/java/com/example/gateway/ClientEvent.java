package com.example.gateway;

public class ClientEvent {
    private String type;
    private String clientId;

    public ClientEvent() {}

    public ClientEvent(String type, String clientId) {
        this.type = type;
        this.clientId = clientId;
    }

    public String getType() {
        return type;
    }

    public String getClientId() {
        return clientId;
    }
}
