package com.example.gateway.Model;

import java.util.Arrays;
import java.util.List;
import java.util.Random;

public enum MessageType {
    NEW_DEVICE("New Device", Arrays.asList(
            "000100000001001901009600010d4b464d3232303030303030333710e77a98c826",
            "000100000001001901009600010d4b464d3232303030303030333810e77a98c827",
            "000100000001001901009600010d4b464d3232303030303030333910e77a98c828",
            "000100000001001901009600010d4b464d3232303030303030333a10e77a98c829",
            "000100000001001901009600010d4b464d3232303030303030333b10e77a98c830",
            "000100000001001901009600010d4b464d3232303030303030333c10e77a98c831",
            "000100000001001901009600010d4b464d3232303030303030333d10e77a98c832",
            "000100000001001901009600010d4b464d3232303030303030333e10e77a98c833",
            "000100000001001901009600010d4b464d3232303030303030333f10e77a98c834",
            "000100000001001901009600010d4b464d3232303030303030334010e77a98c835"
    )),
    DEVICE_REMOVED("Remove Device", Arrays.asList(
            "0001000000010003020096",
            "0001000000010003020097",
            "0001000000010003020098",
            "0001000000010003020099",
            "000100000001000302009a",
            "000100000001000302009b",
            "000100000001000302009c",
            "000100000001000302009d",
            "000100000001000302009e",
            "000100000001000302009f"
    )),
    START_REPORTING_METERS("Start Reporting Meters", Arrays.asList(
            "0001000000010003030096",
            "0001000000010003030097",
            "0001000000010003030098",
            "0001000000010003030099",
            "000100000001000303009a",
            "000100000001000303009b",
            "000100000001000303009c",
            "000100000001000303009d",
            "000100000001000303009e",
            "000100000001000303009f"
    )),
    DELETE_METERS("Delete Meters", Arrays.asList(
            "0001000000010003040096",
            "0001000000010003040097",
            "0001000000010003040098",
            "0001000000010003040099",
            "000100000001000304009a",
            "000100000001000304009b",
            "000100000001000304009c",
            "000100000001000304009d",
            "000100000001000304009e",
            "000100000001000304009f"
    )),
    ENABLE_AUTO_CLOSE("Enable Auto Close", Arrays.asList(
            "0001000000010003050096",
            "0001000000010003050097",
            "0001000000010003050098",
            "0001000000010003050099",
            "000100000001000305009a",
            "000100000001000305009b",
            "000100000001000305009c",
            "000100000001000305009d",
            "000100000001000305009e",
            "000100000001000305009f"
    )),
    DISABLE_AUTO_CLOSE("Disable Auto Close", Arrays.asList(
            "0001000000010003060096",
            "0001000000010003060097",
            "0001000000010003060098",
            "0001000000010003060099",
            "000100000001000306009a",
            "000100000001000306009b",
            "000100000001000306009c",
            "000100000001000306009d",
            "000100000001000306009e",
            "000100000001000306009f"
    ));

    private final String message;
    private final List<String> messages;

    MessageType(String message, List<String> messages) {
        this.message = message;
        this.messages = messages;
    }

    public String getMessage() {
        return message;
    }

    public String getRandomMessage() {
        Random random = new Random();
        return messages.get(random.nextInt(messages.size()));
    }

    public byte[] hexstr2Bytes(String str) {
        int length = str.length();
        // builds buffer with half spice (str has two chars for each byte)
        byte[] buffer = new byte[length / 2];
        for (int i = 0; i < length; i = i + 2) {
            // gets the two chars of Hex byte
            String byteStr = str.substring(i, i + 2);
            // converts it to byteval and stores it on buffer
            int byteVal = Integer.valueOf(byteStr, 16).intValue();
            buffer[i / 2] = (byte) byteVal;
        }
        return buffer;
    }
}
