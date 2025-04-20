package com.virtualgateway.virtual_gateway.service;

import java.io.PrintWriter;
import java.net.Socket;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.virtualgateway.virtual_gateway.model.ClientConnection;
import com.virtualgateway.virtual_gateway.model.MessageRecord;

@Service
public class ClientService {

    private final Map<String, ClientConnection> clients = new ConcurrentHashMap<>();

    public void addClient(String clientId, Socket socket) {
        clients.put(clientId, new ClientConnection(clientId, socket, new ArrayList<>()));
    }

    public void removeClient(String clientId) {
        clients.remove(clientId);
    }

    public List<ClientConnection> getAllClients() {
        return new ArrayList<>(clients.values());
    }

    public Optional<ClientConnection> getClient(String clientId) {
        return Optional.ofNullable(clients.get(clientId));
    }

    public boolean sendMessageToClient(String clientId, String message) {
        ClientConnection clientConnection = clients.get(clientId);
        if (clientConnection != null) {
            try {
                PrintWriter out = new PrintWriter(clientConnection.getSocket().getOutputStream(), true);
                out.println(message);
                clientConnection.getMessages().add(new MessageRecord(new Date(), message));
                return true;
            } catch (Exception e) {
                e.printStackTrace();
                return false;
            }
        }
        return false;
    }

    public List<MessageRecord> getMessageHistory(String clientId) {
        ClientConnection clientConnection = clients.get(clientId);
        if (clientConnection != null) {
            return clientConnection.getMessages();
        }
        return Collections.emptyList();
    }
}
