package com.example.gateway.Component;

import java.io.InputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import org.springframework.stereotype.Component;

import com.example.gateway.Controller.WebSocketController;
import com.example.gateway.Model.Meter;
import com.example.gateway.Model.PlcGtwConnection;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

@Component
public class TcpGatewayServer {

    private final int TCP_PORT = 12345;
    private final int THREAD_POOL_SIZE = 1000;
    private final int DEFAULT_METER = 5;
    private final ConcurrentHashMap<UUID, PlcGtwConnection> connectedClients = new ConcurrentHashMap<>();
    private final List<String> ipMap = new ArrayList<>();
    ServerSocket serverSocket = null;

    @PostConstruct
    public void start() {
        ExecutorService pool = Executors.newFixedThreadPool(THREAD_POOL_SIZE);
        new Thread(() -> {
            
            try {
                // Cria o ServerSocket real
                serverSocket = new ServerSocket(TCP_PORT);
                System.out.println("Gateway TCP listening on port " + TCP_PORT);

                while (true) {
                    Socket clientSocket = serverSocket.accept();
                    UUID clientId = UUID.randomUUID();

                    int ipRandom = new Random().nextInt(ipMap.size());
                    String clientIp = ipMap.get(ipRandom);
                    ipMap.remove(ipRandom);

                    PlcGtwConnection plcGtwConnection = new PlcGtwConnection(clientSocket, clientIp);
                    int meterIdStart = plcGtwConnection.getMeterIdStart();
                    List<Meter> meterList = plcGtwConnection.getMeterList();

                    for (int i = 0; i < DEFAULT_METER; i++) {
                        int meterId = meterIdStart + meterList.size();
                        meterList.add(new Meter(meterId));
                    }
                    System.out.println("Lista de meters: " + plcGtwConnection.getMeterList());

                    connectedClients.put(clientId, plcGtwConnection);
                    WebSocketController.broadcastNewClient(clientId);
                    pool.submit(() -> handleClient(clientSocket, clientId));

                    System.out.println("Listando clientes conectados: " + connectedClients.size());
                    System.out.println(connectedClients);
                }
            } catch (Exception e) {
                System.err.println("TCP Server Error: " + e.getMessage());
            } finally {
                if (serverSocket != null && !serverSocket.isClosed()) {
                    try {
                        serverSocket.close();
                    } catch (Exception ignored) {}
                }
            }
        }).start();
    }

    @PreDestroy
    public void stop() {
        System.out.println("Encerrando o servidor TCP...");
        try {
            if (serverSocket != null && !serverSocket.isClosed()) {
                serverSocket.close();
                System.out.println("ServerSocket fechado com sucesso.");
            }
        } catch (Exception e) {
            System.err.println("Erro ao fechar o ServerSocket: " + e.getMessage());
        }
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
            System.out.println("Client disconnected: " + clientId);
            try {
                clientSocket.close();
            } catch (Exception ignored) {
            }
        }
    }

    public ConcurrentHashMap<UUID, PlcGtwConnection> getConnectedClients() {
        return connectedClients;
    }

    public List<String> getIpList() {
        return ipMap;
    }
}
