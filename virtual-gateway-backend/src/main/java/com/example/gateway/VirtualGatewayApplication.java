package com.example.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class VirtualGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(VirtualGatewayApplication.class, args);
        // new TcpGatewayServer().start();
    }
}