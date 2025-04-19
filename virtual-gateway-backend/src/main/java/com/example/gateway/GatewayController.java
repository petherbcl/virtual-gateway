package com.example.gateway;

import java.io.OutputStream;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
                return "Cliente não encontrado ou ligação fechada!";
            }

            byte[] messageBytes = request.getType().getMessage().getBytes();
            OutputStream out = client.getSocket().getOutputStream();
            out.write(messageBytes);
            out.flush();

            messageHistoryService.addMessage(clientId, request.getType().getMessage());

            return "Mensagem '" + request.getType().getMessage() + "' enviada para o cliente: " + clientId;
        } catch (Exception e) {
            return "Erro: " + e.getMessage();
        }
    }

    @GetMapping("/history/{id}")
    public List<MessageRecord> getClientHistory(@PathVariable String id) {
        UUID clientId = UUID.fromString(id);
        return messageHistoryService.getMessages(clientId);
    }

}
