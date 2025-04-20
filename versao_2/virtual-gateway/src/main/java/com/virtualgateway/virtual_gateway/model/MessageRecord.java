package com.virtualgateway.virtual_gateway.model;

import java.util.Date;

public class MessageRecord {

    private Date timestamp;
    private String message;

    public MessageRecord(Date timestamp, String message) {
        this.timestamp = timestamp;
        this.message = message;
    }

    public Date getTimestamp() {
        return timestamp;
    }

    public String getMessage() {
        return message;
    }
}
