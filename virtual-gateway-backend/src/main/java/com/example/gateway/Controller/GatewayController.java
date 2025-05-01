package com.example.gateway.Controller;

import java.io.OutputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;
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
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.example.gateway.Component.TcpGatewayServer;
import com.example.gateway.Model.ClientInfo;
import com.example.gateway.Model.MessageRecord;
import com.example.gateway.Model.MessageType;
import com.example.gateway.Model.MessageTypeRequest;
import com.example.gateway.Model.Meter;
import com.example.gateway.Model.PlcGtwConnection;
import com.example.gateway.Service.MessageHistoryService;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class GatewayController {

    @Autowired
    private TcpGatewayServer tcpGatewayServer;

    @Autowired
    private MessageHistoryService messageHistoryService;

    @GetMapping("/clients")
    public List<ClientInfo> listClients() {

        System.out.println("Listando clientes conectados: " + tcpGatewayServer.getConnectedClients().size());

        return tcpGatewayServer.getConnectedClients().entrySet()
                .stream()
                .map(entry -> new ClientInfo(
                entry.getKey().toString(),
                entry.getValue().getConnectedAt().toString(),
                entry.getValue().getIp() // Adiciona o IP
        ))
                .collect(Collectors.toList());
    }

    @PostMapping("/resetConnections")
    public String resetConnections() {
        try {
            // Fecha todos os sockets dos clientes conectados
            tcpGatewayServer.getConnectedClients().forEach((clientId, plcGtwConnection) -> {
                try {
                    plcGtwConnection.getSocket().close();
                    System.out.println("Conexão fechada para o cliente: " + clientId);
                } catch (Exception e) {
                    System.err.println("Erro ao fechar o socket do cliente " + clientId + ": " + e.getMessage());
                }
            });

            // Limpa a lista de clientes conectados
            tcpGatewayServer.getConnectedClients().clear();
            System.out.println("Lista de conexões resetada.");
            return "Todas as conexões foram fechadas e a lista foi resetada com sucesso.";
        } catch (Exception e) {
            System.err.println("Erro ao resetar conexões: " + e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao resetar conexões", e);
        }
    }

    @PostMapping("/sendMessageType")
    public String sendMessageType(@RequestBody MessageTypeRequest request) {
        try {
            String messageType = request.getType().name();
            UUID clientId = UUID.fromString(request.getId());
            PlcGtwConnection client = tcpGatewayServer.getConnectedClients().get(clientId);
            String messageToSend = "0001";
            String dlmsMsg;
            byte[] messageBytes = null;

            if (client == null || client.getSocket().isClosed()) {
                System.out.println("Cliente não encontrado ou ligação fechada!");
                return "Cliente não encontrado ou ligação fechada!";
            }

            switch (messageType) {
                case "NEW_DEVICE" -> {
                    // Adiciona um novo dispositivo à lista de medidores do cliente
                    int meterId = client.getMeterIdStart() + client.getMeterList().size() + 1;
                    Meter newMeter = new Meter(meterId);
                    client.getMeterList().add(newMeter);
                    System.out.println("Novo dispositivo adicionado: " + newMeter);

                    messageToSend += "0001" + "0000";
                    dlmsMsg = "01" + MessageType.decimalToHex(newMeter.getDeviceId(),4) + MessageType.decimalToHex(newMeter.getCapabilities(),4);
                    String dlmsIdSize = MessageType.decimalToHex(newMeter.getDlmsId().length(), 2);
                    dlmsMsg += dlmsIdSize + MessageType.stringToHex(newMeter.getDlmsId(),1) + newMeter.getEui48();

                    messageToSend += MessageType.decimalToHex(dlmsMsg.length()/2, 4) + dlmsMsg;

                    messageBytes = MessageType.hexstr2Bytes(messageToSend);

                }
                case "DEVICE_REMOVED" -> {}
                case "START_REPORTING_METERS" -> {}
                case "DELETE_METERS" -> {}
                case "ENABLE_AUTO_CLOSE" -> {}
                case "DISABLE_AUTO_CLOSE" -> {}
                default -> {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de mensagem inválido: " + messageType);
                }
            }


            OutputStream out = client.getSocket().getOutputStream();
            out.write(messageBytes);
            out.flush();

            // Salva o tipo de mensagem no histórico
            MessageRecord messageRecord = new MessageRecord(LocalDateTime.now(), messageToSend, request.getType().name());
            messageHistoryService.addMessage(clientId, messageToSend, request.getType().name());

            // Notifica o frontend via WebSocket
            WebSocketController.broadcastMessageSent(clientId, messageRecord);

            System.out.println("Mensagem '" + messageToSend + "' enviada para o cliente: " + clientId);

            return "Mensagem '" + messageToSend + "' enviada para o cliente: " + clientId;
        } catch (Exception e) {
            return "Erro: " + e.getMessage();
        }
    }

    @GetMapping("/clients/{id}")
    public ClientInfo getClientHistory(@PathVariable String id) {
        UUID clientId = UUID.fromString(id);
        PlcGtwConnection client = tcpGatewayServer.getConnectedClients().get(clientId);
        return new ClientInfo(clientId.toString(), client.getConnectedAt().toString(), client.getIp());
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

    @PostMapping("/open-connections")
    public Map<String, String> openConnections(@RequestBody Map<String, Integer> request) {
        int count = request.getOrDefault("count", 1);
        String ip = "127.0.0.1";
        int port = 12345;
        RestTemplate restTemplate = new RestTemplate();

        try {
            for (int i = 0; i < count; i++) {
                ip = generateRandomIP();
                tcpGatewayServer.getIpList().add(ip);
                String url = String.format("http://localhost:8080/start-socket?ip=%s&port=%d", ip, port);
                restTemplate.postForObject(url, null, String.class);
                System.out.println("Conexão aberta com o IP: " + tcpGatewayServer.getIpList());
            }
            return Map.of("message", "Ligações abertas com sucesso!");
        } catch (Exception e) {
            System.out.println("Erro ao abrir ligações: " + e.getMessage());
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao abrir ligações", e);
        }
    }

    private String generateRandomIP() {
        Random random = new Random();
        return String.format("%d.%d.%d.%d",
                random.nextInt(256),
                random.nextInt(256),
                random.nextInt(256),
                random.nextInt(256));
    }

    @PostMapping("/clients/{id}/close")
    public String closeClientSocket(@PathVariable String id) {
        try {
            UUID clientId = UUID.fromString(id);
            PlcGtwConnection client = tcpGatewayServer.getConnectedClients().get(clientId);

            if (client == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado");
            }

            // Fecha o socket do cliente
            client.getSocket().close();
            tcpGatewayServer.getConnectedClients().remove(clientId);
            // WebSocketController.broadcastClientDisconnected(clientId);

            System.out.println("Cliente desconectado: " + clientId);
            return "Cliente desconectado com sucesso.";
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "ID inválido", e);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao fechar o socket", e);
        }
    }
}
