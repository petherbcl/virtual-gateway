package com.example.gateway.Model;

public class ClientInfo {
    private String id;
    private String connectedAt;

    public ClientInfo(String id, String connectedAt) {
        this.id = id;
        this.connectedAt = connectedAt;
    }

    public String getId() {
        return id;
    }

    public String getConnectedAt() {
        return connectedAt;
    }
}
