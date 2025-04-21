package com.example.gateway.Controller;

import java.io.OutputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.gateway.Model.ClientConnection;
import com.example.gateway.Model.ClientInfo;
import com.example.gateway.Model.MessageRecord;
import com.example.gateway.Model.MessageRequest;
import com.example.gateway.Model.MessageTypeRequest;
import com.example.gateway.Service.MessageHistoryService;
import com.example.gateway.TcpGatewayServer;
import com.example.gateway.WebSocketController;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class GatewayController {

    @Autowired
    private MessageHistoryService messageHistoryService;

    @PostMapping("/send")
    public String sendMessage(@RequestBody MessageRequest request) {
        try {
            UUID clientId = UUID.fromString(request.getId());
            ClientConnection client = TcpGatewayServer.getConnectedClients().get(clientId);

            if (client == null || client.getSocket().isClosed()) {
                return "Cliente não encontrado ou ligação fechada!";
            }

            byte[] messageBytes = request.getMessage().getBytes();
            OutputStream out = client.getSocket().getOutputStream();
            out.write(messageBytes);
            out.flush();

            messageHistoryService.addMessage(clientId, request.getMessage());

            return "Mensagem enviada para o cliente: " + clientId;
        } catch (Exception e) {
            return "Erro: " + e.getMessage();
        }
    }

    @GetMapping("/clients")
    public List<ClientInfo> listClients() {

        System.out.println("Listando clientes conectados: " + TcpGatewayServer.getConnectedClients().size());
        System.out.println(TcpGatewayServer.getConnectedClients().entrySet()
            .stream().map(entry -> new ClientInfo(entry.getKey().toString(), entry.getValue().getConnectedAt().toString()))
            .collect(Collectors.toList()));

        return TcpGatewayServer.getConnectedClients().entrySet()
                .stream()
                .map(entry -> new ClientInfo(entry.getKey().toString(), entry.getValue().getConnectedAt().toString()))
                .collect(Collectors.toList());
    }

    @PostMapping("/sendMessageType")
    public String sendMessageType(@RequestBody MessageTypeRequest request) {
        try {
            UUID clientId = UUID.fromString(request.getId());
            ClientConnection client = TcpGatewayServer.getConnectedClients().get(clientId);

            if (client == null || client.getSocket().isClosed()) {
                System.out.println("Cliente não encontrado ou ligação fechada!");
                return "Cliente não encontrado ou ligação fechada!";
            }

            // Seleciona uma mensagem aleatória
            String randomMessage = request.getType().getRandomMessage();
            byte[] messageBytes = request.getType().hexstr2Bytes(randomMessage);

            OutputStream out = client.getSocket().getOutputStream();
            out.write(messageBytes);
            out.flush();

            // Salva o tipo de mensagem no histórico
            MessageRecord messageRecord = new MessageRecord(LocalDateTime.now(), randomMessage, request.getType().name());
            messageHistoryService.addMessage(clientId, randomMessage, request.getType().name());

            // Notifica o frontend via WebSocket
            WebSocketController.broadcastMessageSent(clientId, messageRecord);

            System.out.println("Mensagem '" + randomMessage + "' enviada para o cliente: " + clientId);

            return "Mensagem '" + randomMessage + "' enviada para o cliente: " + clientId;
        } catch (Exception e) {
            return "Erro: " + e.getMessage();
        }
    }

    @GetMapping("/clients/{id}")
    public List<MessageRecord> getClientHistory(@PathVariable String id) {
        UUID clientId = UUID.fromString(id);
        return messageHistoryService.getMessages(clientId);
    }

    @GetMapping("/history/{id}")
    public List<MessageRecord> getHistory(@PathVariable String id) {
        try {
            UUID clientId = UUID.fromString(id);
            return messageHistoryService.getMessages(clientId);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID inválido", e);
        }
    }

}
