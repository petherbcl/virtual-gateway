package com.example.gateway.Model;

public enum MessageType {
    NEW_DEVICE("New Device"),
    DEVICE_REMOVED("Device Removed"),
    DEVICE_DELETED("Device Deleted");

    private final String message;

    MessageType(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
