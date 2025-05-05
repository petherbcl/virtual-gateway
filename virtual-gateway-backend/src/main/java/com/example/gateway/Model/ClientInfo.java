package com.example.gateway.Model;

import java.util.ArrayList;
import java.util.List;

public class ClientInfo {
    private String id;
    private String connectedAt;
    private String ip;
    private int port;
    private int totalMeter;
    private final List<Meter> meterList = new ArrayList<>();

    public ClientInfo(String id, String connectedAt, String ip, int port, int totalMeter) {
        this.id = id;
        this.connectedAt = connectedAt;
        this.ip = ip;
        this.port = port;
        this.totalMeter = totalMeter;
    }

    public ClientInfo(String id, String connectedAt, String ip, int port, List<Meter> meterList) {
        this.id = id;
        this.connectedAt = connectedAt;
        this.ip = ip;
        this.port = port;
        this.meterList.addAll(meterList);
        this.totalMeter = meterList.size();
    }

    public String getId() {
        return id;
    }

    public String getConnectedAt() {
        return connectedAt;
    }

    public String getIp() {
        return ip;
    }

    public int getPort() {
        return port;
    }

    public int getTotalMeter() {
        return this.totalMeter;
    }

    public List<Meter> getMeterList() {
        return meterList;
    }

}
