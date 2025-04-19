package com.example.gateway;

import java.net.Socket;
import java.time.LocalDateTime;

public class ClientConnection {
    private final Socket socket;
    private final LocalDateTime connectedAt;

    public ClientConnection(Socket socket) {
        this.socket = socket;
        this.connectedAt = LocalDateTime.now();
    }

    public Socket getSocket() {
        return socket;
    }

    public LocalDateTime getConnectedAt() {
        return connectedAt;
    }
}
