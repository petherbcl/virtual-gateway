package com.example.gateway.Model;

import java.net.Socket;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class PlcGtwConnection {
    private final Socket socket;
    private final LocalDateTime connectedAt;
    private final String ip;

    private final int meterIdStart = 10 + (new Random()).nextInt(30);
    private final List<Meter> meterList = new ArrayList<>();

    public PlcGtwConnection(Socket socket, String ip) {
        this.socket = socket;
        this.connectedAt = LocalDateTime.now();
        this.ip = ip;
    }

    public Socket getSocket() {
        return socket;
    }

    public LocalDateTime getConnectedAt() {
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
