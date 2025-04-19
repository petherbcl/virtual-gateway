package com.example.gateway.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import com.example.gateway.Model.MessageRecord;

@Service
public class MessageHistoryService {

    private final ConcurrentHashMap<UUID, List<MessageRecord>> history = new ConcurrentHashMap<>();

    public void addMessage(UUID clientId, String message) {
        history.computeIfAbsent(clientId, k -> new ArrayList<>())
               .add(new MessageRecord(LocalDateTime.now(), message));
    }

    public List<MessageRecord> getMessages(UUID clientId) {
        return history.getOrDefault(clientId, new ArrayList<>());
    }
}
