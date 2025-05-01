package com.example.gateway.Model;

public class ClientInfo {
    private String id;
    private String connectedAt;
    private String ip; // Novo campo para o IP

    public ClientInfo(String id, String connectedAt, String ip) {
        this.id = id;
        this.connectedAt = connectedAt;
        this.ip = ip;
    }

    public String getId() {
        return id;
    }

    public String getConnectedAt() {
        return connectedAt;
    }

    public String getIp() {
        return ip;
    }
}
