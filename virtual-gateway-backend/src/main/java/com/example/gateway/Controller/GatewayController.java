package com.example.gateway.Controller;

import java.io.OutputStream;
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
import com.example.gateway.Model.MessageTypeRequest;
import com.example.gateway.Model.Meter;
import com.example.gateway.Model.PlcGtwConnection;
import com.example.gateway.Model.Util;

@RestController
@RequestMapping("/api")
@CrossOrigin
public class GatewayController {

    @Autowired
    private TcpGatewayServer tcpGatewayServer;

    @GetMapping("/clients")
    public List<ClientInfo> listClients() {

        System.out.println("Listando clientes conectados: " + tcpGatewayServer.getConnectedClients().size());

        return tcpGatewayServer.getConnectedClients().entrySet()
                .stream()
                .map(entry -> new ClientInfo(
                entry.getKey().toString(),
                entry.getValue().getConnectedAt(),
                entry.getValue().getIp(),
                entry.getValue().getMeterList().size()
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
            String messageType = request.getType();
            UUID clientId = UUID.fromString(request.getId());
            String meterId = request.getMeterId();
            System.out.println("Enviando mensagem\ntipo: " + messageType + "\ncliente: " + clientId+"\nmedidor: " + meterId);


            PlcGtwConnection client = tcpGatewayServer.getConnectedClients().get(clientId);
            String messageToSend = "0001";
            String dlmsMsg;
            byte[] messageBytes = null;
            Meter meterRec = null;

            if (client == null || client.getSocket().isClosed()) {
                System.out.println("Cliente não encontrado ou ligação fechada!");
                return "Cliente não encontrado ou ligação fechada!";
            }

            switch (messageType) {
                case "NEW_DEVICE" -> {
                    // Adiciona um novo dispositivo à lista de medidores do cliente
                    int newMeterId = client.getMeterIdStart() + client.getMeterList().size() + 1;
                    meterRec = new Meter(newMeterId);
                    client.getMeterList().add(meterRec);
                    System.out.println("Novo dispositivo adicionado: " + meterRec);

                    messageToSend += "0001" + "0000";
                    dlmsMsg = "01" + Util.decimalToHex(meterRec.getDeviceId(),4) + Util.decimalToHex(meterRec.getCapabilities(),4);
                    String dlmsIdSize = Util.decimalToHex(meterRec.getDlmsId().length(), 2);
                    dlmsMsg += dlmsIdSize + Util.stringToHex(meterRec.getDlmsId(),1) + meterRec.getEui48();

                    messageToSend += Util.decimalToHex(dlmsMsg.length()/2, 4) + dlmsMsg;

                    messageBytes = Util.hexstr2Bytes(messageToSend);

                }
                case "DEVICE_REMOVED" -> {
                    
                    meterRec = client.getMeterList().stream()
                            .filter(meter -> meter.getDeviceId() == Integer.parseInt(meterId))
                            .findFirst()
                            .orElse(null);

                    meterRec.setConnected(false);
                    System.out.println("Dispositivo removido: " + meterRec);

                    messageToSend += "0001" + "0000";
                    dlmsMsg = "02" + Util.decimalToHex(meterRec.getDeviceId(),4);
                    messageToSend += Util.decimalToHex(dlmsMsg.length()/2, 4) + dlmsMsg;
                    messageBytes = Util.hexstr2Bytes(messageToSend);

                }
                case "START_REPORTING_METERS" -> {
                    meterRec = client.getMeterList().stream()
                            .filter(meter -> meter.getDeviceId() == Integer.parseInt(meterId))
                            .findFirst()
                            .orElse(null);

                    messageToSend += "0000" + "0001";
                    dlmsMsg = "03";
                    messageToSend += Util.decimalToHex(dlmsMsg.length()/2, 4) + dlmsMsg;
                    messageBytes = Util.hexstr2Bytes(messageToSend);
                }
                case "DELETE_METERS" -> {
                    meterRec = client.getMeterList().stream()
                            .filter(meter -> meter.getDeviceId() == Integer.parseInt(meterId))
                            .findFirst()
                            .orElse(null);

                    messageToSend += "0000" + "0001";
                    dlmsMsg = "04" + Util.decimalToHex(meterRec.getDeviceId(),4);
                    messageToSend += Util.decimalToHex(dlmsMsg.length()/2, 4) + dlmsMsg;
                    messageBytes = Util.hexstr2Bytes(messageToSend);
                }
                case "ENABLE_AUTO_CLOSE" -> {
                    meterRec = client.getMeterList().stream()
                            .filter(meter -> meter.getDeviceId() == Integer.parseInt(meterId))
                            .findFirst()
                            .orElse(null);

                    messageToSend += "0000" + "0001";
                    dlmsMsg = "05" + Util.decimalToHex(meterRec.getDeviceId(),4);
                    messageToSend += Util.decimalToHex(dlmsMsg.length()/2, 4) + dlmsMsg;
                    messageBytes = Util.hexstr2Bytes(messageToSend);
                }
                case "DISABLE_AUTO_CLOSE" -> {
                    meterRec = client.getMeterList().stream()
                            .filter(meter -> meter.getDeviceId() == Integer.parseInt(meterId))
                            .findFirst()
                            .orElse(null);

                    messageToSend += "0000" + "0001";
                    dlmsMsg = "06" + Util.decimalToHex(meterRec.getDeviceId(),4);
                    messageToSend += Util.decimalToHex(dlmsMsg.length()/2, 4) + dlmsMsg;
                    messageBytes = Util.hexstr2Bytes(messageToSend);
                }
                case "EVENT_NOTIFICATION_REQUEST" -> {
                    meterRec = client.getMeterList().stream()
                            .filter(meter -> meter.getDeviceId() == Integer.parseInt(meterId))
                            .findFirst()
                            .orElse(null);

                    messageToSend += "0000" + "0001";
                    dlmsMsg = "C2" + Util.decimalToHex(meterRec.getDeviceId(),4);
                    messageToSend += Util.decimalToHex(dlmsMsg.length()/2, 4) + dlmsMsg;
                    messageBytes = Util.hexstr2Bytes(messageToSend);
                }
                case "GLO_EVENT_NOTIFICATION_REQUEST" -> {
                    meterRec = client.getMeterList().stream()
                            .filter(meter -> meter.getDeviceId() == Integer.parseInt(meterId))
                            .findFirst()
                            .orElse(null);

                    messageToSend += "0000" + "0001";
                    dlmsMsg = "CA" + Util.decimalToHex(meterRec.getDeviceId(),4);
                    messageToSend += Util.decimalToHex(dlmsMsg.length()/2, 4) + dlmsMsg;
                    messageBytes = Util.hexstr2Bytes(messageToSend);
                }
                default -> {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de mensagem inválido: " + messageType);
                }
            }


            OutputStream out = client.getSocket().getOutputStream();
            out.write(messageBytes);
            out.flush();

            // Salva o tipo de mensagem no histórico
            meterRec.getMessageHistory().add(new MessageRecord(messageToSend, messageType));

            // Notifica o frontend via WebSocket
            WebSocketController.broadcastMessageSent(clientId);

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
        return new ClientInfo(clientId.toString(), client.getConnectedAt(), client.getIp(), client.getMeterList());
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
