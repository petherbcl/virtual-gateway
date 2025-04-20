package com.virtualgateway.virtual_gateway.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.virtualgateway.virtual_gateway.model.ClientConnection;
import com.virtualgateway.virtual_gateway.model.MessageRecord;
import com.virtualgateway.virtual_gateway.service.ClientService;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "*")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @GetMapping
    public List<ClientConnection> getAllClients() {
        return clientService.getAllClients();
    }

    @GetMapping("/{clientId}")
    public ResponseEntity<ClientConnection> getClient(@PathVariable String clientId) {
        return clientService.getClient(clientId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{clientId}/send")
    public ResponseEntity<String> sendMessageToClient(@PathVariable String clientId, @RequestBody String message) {
        boolean success = clientService.sendMessageToClient(clientId, message);
        if (success) {
            return ResponseEntity.ok("Message sent successfully.");
        } else {
            return ResponseEntity.badRequest().body("Failed to send message.");
        }
    }

    @GetMapping("/{clientId}/messages")
    public List<MessageRecord> getMessageHistory(@PathVariable String clientId) {
        return clientService.getMessageHistory(clientId);
    }
}
