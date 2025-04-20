package com.virtualgateway.virtual_gateway.websocket;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class WebSocketEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketEventPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publishClientConnected(String clientId) {
        messagingTemplate.convertAndSend("/topic/clients", "CONNECTED:" + clientId);
    }

    public void publishClientDisconnected(String clientId) {
        messagingTemplate.convertAndSend("/topic/clients", "DISCONNECTED:" + clientId);
    }
}
