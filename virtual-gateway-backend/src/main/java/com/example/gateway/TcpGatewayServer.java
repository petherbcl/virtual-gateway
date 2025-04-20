package com.example.gateway;

import java.io.InputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import com.example.gateway.Controller.WebSocketController;
import com.example.gateway.Model.ClientConnection;

public class TcpGatewayServer {

    private static final int TCP_PORT = 12345;
    private static final int THREAD_POOL_SIZE = 1000;
    private static final ConcurrentHashMap<UUID, ClientConnection> connectedClients = new ConcurrentHashMap<>();

    public void start() {
        ExecutorService pool = Executors.newFixedThreadPool(THREAD_POOL_SIZE);

        new Thread(() -> {
            try (ServerSocket serverSocket = new ServerSocket(TCP_PORT)) {
                System.out.println("Gateway TCP listening on port " + TCP_PORT);

                while (true) {
                    Socket clientSocket = serverSocket.accept();
                    UUID clientId = UUID.randomUUID();
                    connectedClients.put(clientId, new ClientConnection(clientSocket));
                    WebSocketController.broadcastNewClient(clientId);

                    pool.submit(() -> handleClient(clientSocket, clientId));
                }
            } catch (Exception e) {
                System.err.println("TCP Server Error: " + e.getMessage());
            }
        }).start();
    }

    private void handleClient(Socket clientSocket, UUID clientId) {
        try (InputStream in = clientSocket.getInputStream()) {
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = in.read(buffer)) != -1) {
                byte[] receivedData = new byte[bytesRead];
                System.arraycopy(buffer, 0, receivedData, 0, bytesRead);
                System.out.println("[RECEIVED] [" + clientId + "] " + new String(receivedData));
            }
        } catch (Exception e) {
            System.err.println("Communication error: " + e.getMessage());
        } finally {
            connectedClients.remove(clientId);
            WebSocketController.broadcastClientDisconnected(clientId);
            try {
                clientSocket.close();
            } catch (Exception ignored) {}
        }
    }

    public static ConcurrentHashMap<UUID, ClientConnection> getConnectedClients() {
        return connectedClients;
    }
}
