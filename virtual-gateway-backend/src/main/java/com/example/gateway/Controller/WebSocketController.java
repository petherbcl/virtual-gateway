package com.example.gateway.Controller;

import java.util.UUID;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.example.gateway.Model.ClientEvent;

@Controller
public class WebSocketController {

    private static SimpMessagingTemplate messagingTemplate;

    public WebSocketController(SimpMessagingTemplate template) {
        messagingTemplate = template;
    }

    public static void broadcastNewClient(UUID clientId) {
        messagingTemplate.convertAndSend("/topic/clients", new ClientEvent("connected", clientId.toString()));
    }

    public static void broadcastClientDisconnected(UUID clientId) {
        messagingTemplate.convertAndSend("/topic/clients", new ClientEvent("disconnected", clientId.toString()));
    }

    public static void broadcastMessageSent(UUID clientId) {
        messagingTemplate.convertAndSend("/topic/messages/" + clientId, true);
    }
}
