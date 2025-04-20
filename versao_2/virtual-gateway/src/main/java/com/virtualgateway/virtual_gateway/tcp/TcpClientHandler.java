package com.virtualgateway.virtual_gateway.tcp;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;

import com.virtualgateway.virtual_gateway.service.ClientService;
import com.virtualgateway.virtual_gateway.websocket.WebSocketEventPublisher;

public class TcpClientHandler implements Runnable {

    private final Socket clientSocket;
    private final String clientId;
    private final WebSocketEventPublisher eventPublisher;
    private final ClientService clientService;

    public TcpClientHandler(Socket clientSocket, String clientId, WebSocketEventPublisher eventPublisher, ClientService clientService) {
        this.clientSocket = clientSocket;
        this.clientId = clientId;
        this.eventPublisher = eventPublisher;
        this.clientService = clientService;
    }

    @Override
    public void run() {
        try {
            clientService.addClient(clientId, clientSocket);
            eventPublisher.publishClientConnected(clientId);

            BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
            PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true);

            String message;
            while ((message = in.readLine()) != null) {
                System.out.println("Received from " + clientId + ": " + message);
                // Aqui poderias também guardar mensagens recebidas
            }
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            clientService.removeClient(clientId);
            eventPublisher.publishClientDisconnected(clientId);
            try {
                clientSocket.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
