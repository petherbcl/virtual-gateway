package com.example.gateway.Model;

import java.util.Random;

import com.google.gson.Gson;

public class Meter {
    
    private int deviceId;
    private int capabilities;
    private String dlmsId;
    private String eui48;

    public Meter(int deviceId) {
        this.deviceId = deviceId;
        this.capabilities = 1;
        this.dlmsId = generateRandomDlmsId();
        this.eui48 = generateRandomEui48();
    }

    private String generateRandomDlmsId() {
        Random random = new Random();

        // Gera 3 caracteres maiúsculos
        StringBuilder manufCode = new StringBuilder();
        for (int i = 0; i < 3; i++) {
            manufCode.append((char) ('A' + random.nextInt(26)));
        }

        // Gera 5 números para o model code
        int modelCode = random.nextInt(1000000);

        // Gera 4 números para o ano (superior a 2000)
        int manufYear = 2000 + random.nextInt(100); // Gera um ano entre 2000 e 2099

        return manufCode.toString() + String.format("%05d", modelCode) + manufYear;
    }

    private String generateRandomEui48() {
        Random random = new Random();
        StringBuilder eui48Builder = new StringBuilder();

        // Gera 12 caracteres alfanuméricos
        for (int i = 0; i < 12; i++) {
            char randomChar;
            if (random.nextBoolean()) {
                // Gera um número (0-9)
                randomChar = (char) ('0' + random.nextInt(10));
            } else {
                // Gera uma letra maiúscula (A-F)
                randomChar = (char) ('a' + random.nextInt(5));
            }
            eui48Builder.append(randomChar);
        }

        return eui48Builder.toString();
    }
    

    public int getDeviceId() {
        return deviceId;
    }

    public int getCapabilities() {
        return capabilities;
    }

    public String getDlmsId() {
        return dlmsId;
    }

    public String getEui48() {
        return eui48;
    }

    @Override
    public String toString() {
        Gson gson = new Gson();
        return gson.toJson(this);
    }
}
