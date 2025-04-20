package com.virtualgateway.virtual_gateway.tcp;

import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

import org.springframework.stereotype.Component;

import com.virtualgateway.virtual_gateway.service.ClientService;
import com.virtualgateway.virtual_gateway.websocket.WebSocketEventPublisher;

@Component
public class TcpGatewayServer {

    private static final int PORT = 12345;
    private static final int MAX_CONNECTIONS = 1000;

    private final ExecutorService threadPool = Executors.newFixedThreadPool(MAX_CONNECTIONS);
    private final WebSocketEventPublisher eventPublisher;
    private final ClientService clientService;
    private ServerSocket serverSocket;

    public TcpGatewayServer(WebSocketEventPublisher eventPublisher, ClientService clientService) {
        this.eventPublisher = eventPublisher;
        this.clientService = clientService;
    }

    @PostConstruct
    public void start() {
        try {
            serverSocket = new ServerSocket(PORT);
            System.out.println("TCP Server started on port " + PORT);

            threadPool.submit(() -> {
                while (!serverSocket.isClosed()) {
                    try {
                        Socket clientSocket = serverSocket.accept();
                        String clientId = UUID.randomUUID().toString();
                        TcpClientHandler handler = new TcpClientHandler(clientSocket, clientId, eventPublisher, clientService);
                        threadPool.submit(handler);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            });
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @PreDestroy
    public void stop() {
        try {
            if (serverSocket != null && !serverSocket.isClosed()) {
                serverSocket.close();
            }
            threadPool.shutdownNow();
            System.out.println("TCP Server stopped.");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
