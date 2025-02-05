package dev.pinner.global.utils;

import dev.pinner.exception.BusinessException;
import org.springframework.http.HttpStatus;

import java.security.SecureRandom;

public class RandomHexStringGenerator {
    public String generate(int numBytes) {
        if (numBytes <= 0) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "Number of bytes must be positive");
        }

        SecureRandom random = new SecureRandom();
        byte[] randomBytes = new byte[numBytes];
        random.nextBytes(randomBytes);

        StringBuilder hexString = new StringBuilder(2 * numBytes);
        for (byte b : randomBytes) {
            // Convert each byte to a 2-character hex string
            hexString.append(String.format("%02x", b));
        }

        return hexString.toString();
    }
}
