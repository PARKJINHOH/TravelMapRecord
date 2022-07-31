package com.example.travelmaprecodebe.domain.traveler;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.util.HashMap;
import java.util.Map;

@Data
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class ResponseDto {
    Map<String, Object> data = new HashMap<>();
    String message;

    public ResponseDto(String message) {
        this.message = message;
    }

    public ResponseDto(Map<String, Object> data) {
        this.data = data;
    }
}
