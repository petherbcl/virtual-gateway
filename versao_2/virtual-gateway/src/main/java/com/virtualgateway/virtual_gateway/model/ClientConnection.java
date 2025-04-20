package com.virtualgateway.virtual_gateway.model;

import java.net.Socket;
import java.util.List;

public class ClientConnection {

    private String clientId;
    private transient Socket socket; // Socket não será serializado no JSON
    private List<MessageRecord> messages;

    public ClientConnection(String clientId, Socket socket, List<MessageRecord> messages) {
        this.clientId = clientId;
        this.socket = socket;
        this.messages = messages;
    }

    public String getClientId() {
        return clientId;
    }

    public Socket getSocket() {
        return socket;
    }

    public List<MessageRecord> getMessages() {
        return messages;
    }
}
