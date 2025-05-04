package com.example.gateway.Model;

public class Util {
    
    public static byte[] hexstr2Bytes(String str) {
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

    public static String stringToHex(String input, int length) {
        StringBuilder hexString = new StringBuilder();
        for (char c : input.toCharArray()) {
            hexString.append(String.format("%0" + length + "x", (int) c));
        }
        return hexString.toString();
    }

    public static String decimalToHex(int decimal, int length) {
        return String.format("%0"+length+"x", decimal); // Converte o número decimal para hexadecimal
    }
}
