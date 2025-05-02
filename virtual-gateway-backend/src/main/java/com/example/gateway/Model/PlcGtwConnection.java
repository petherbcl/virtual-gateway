package com.example.gateway.Model;

import java.net.Socket;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class PlcGtwConnection {
    private final Socket socket;
    private final String connectedAt;
    private final String ip;

    private final int meterIdStart = 10 + (new Random()).nextInt(30);
    private final List<Meter> meterList = new ArrayList<>();

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public PlcGtwConnection(Socket socket, String ip) {
        this.socket = socket;
        this.connectedAt = LocalDateTime.now().format(formatter);
        this.ip = ip;
    }

    public Socket getSocket() {
        return socket;
    }

    public String getConnectedAt() {
        return connectedAt;
    }

    public String getIp() {
        return ip;
    }

    public List<Meter> getMeterList() {
        return meterList;
    }

    public int getMeterIdStart() {
        return meterIdStart;
    }

    @Override 
    public String toString(){
        return "PlcGtwConnection{" +
                "socket=" + socket +
                ", connectedAt=" + connectedAt +
                ", ip='" + ip + '\'' +
                '}';
    }

}
