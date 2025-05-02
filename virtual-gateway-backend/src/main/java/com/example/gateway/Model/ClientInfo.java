package com.example.gateway.Model;

import java.util.ArrayList;
import java.util.List;

public class ClientInfo {
    private String id;
    private String connectedAt;
    private String ip;
    private final List<Meter> meterList = new ArrayList<>(); 

    public ClientInfo(String id, String connectedAt, String ip) {
        this.id = id;
        this.connectedAt = connectedAt;
        this.ip = ip;
    }

    public ClientInfo(String id, String connectedAt, String ip, List<Meter> meterList) {
        this.id = id;
        this.connectedAt = connectedAt;
        this.ip = ip;
        this.meterList.addAll(meterList);
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

    public int getTotalMeter() {
        return meterList.size();
    }

    public List<Meter> getMeterList() {
        return meterList;
    }

}
