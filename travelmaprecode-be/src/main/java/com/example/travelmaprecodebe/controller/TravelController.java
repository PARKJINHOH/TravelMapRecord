package com.example.travelmaprecodebe.controller;

import com.example.travelmaprecodebe.domain.dto.NewJourneyRequestDto;
import com.example.travelmaprecodebe.domain.dto.NewTravelRequestDto;
import com.example.travelmaprecodebe.domain.dto.NewTravelResponseDto;
import com.example.travelmaprecodebe.domain.entity.Traveler;
import com.example.travelmaprecodebe.service.TravelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/travel")
@RequiredArgsConstructor
public class TravelController {
    // Todo : Travel, Journey 분리
    // @Transactional 사용.

    private final TravelService travelService;

    @GetMapping()
    public ResponseEntity<?> getTravel(@AuthenticationPrincipal Traveler traveler) {
        return ResponseEntity.ok(travelService.getTravel(traveler));
    }

    @PostMapping()
    public ResponseEntity<?> postTravel(@AuthenticationPrincipal Traveler traveler,
                                        @RequestBody @Valid NewTravelRequestDto newTravel) {
        return ResponseEntity.ok(travelService.postTravel(traveler, newTravel));
    }

    @PostMapping("/{travelId}/journey")
    public ResponseEntity<?> postJourney(@AuthenticationPrincipal Traveler traveler,
                                         @PathVariable Long travelId,
                                         @RequestBody NewJourneyRequestDto newJourney) {
        return ResponseEntity.ok(travelService.postJourney(traveler, travelId, newJourney));
    }

    @PutMapping("/{travelId}/journey/{journeyId}")
    public ResponseEntity<?> pathJourney(@AuthenticationPrincipal Traveler traveler,
                                         @PathVariable Long travelId, @PathVariable Long journeyId,
                                         @RequestBody NewJourneyRequestDto journey) {
        return ResponseEntity.ok(travelService.patchJourney(traveler, travelId, journeyId, journey));
    }

    @DeleteMapping("/{travelId}/journey/{journeyId}")
    public ResponseEntity<?> deleteJourney(@AuthenticationPrincipal Traveler traveler,
                                          @PathVariable Long travelId, @PathVariable Long journeyId) {
        try {
            List<NewTravelResponseDto> newTravelResponseDtos = travelService.deleteJourney(traveler, travelId, journeyId);
            return ResponseEntity.ok(newTravelResponseDtos);
        } catch (Exception e) {
            log.error(e.getMessage());
            return ResponseEntity.badRequest().body("관리자에게 문의해주세요");
        }
    }

    @DeleteMapping("/{travelId}")
    public ResponseEntity<?> deleteTravel(@AuthenticationPrincipal Traveler traveler,
                                          @PathVariable Long travelId) {
        try {
            List<NewTravelResponseDto> newTravelResponseDtos = travelService.deleteTravel(traveler, travelId);
            return ResponseEntity.ok(newTravelResponseDtos);
        } catch (Exception e) {
            log.error(e.getMessage());
            return ResponseEntity.badRequest().body("관리자에게 문의해주세요");
        }
    }

    @PutMapping("/orderKey")
    public ResponseEntity<?> putTravel(@AuthenticationPrincipal Traveler traveler,
                                      @RequestBody @Valid List<NewTravelRequestDto> travelList) {
        List<NewTravelResponseDto> newTravelResponseDtos = travelService.putOrderKey(traveler, travelList);
        return new ResponseEntity<>(newTravelResponseDtos, HttpStatus.OK);
    }

    @PatchMapping("/{travelId}")
    public ResponseEntity<?> patchTravel(@AuthenticationPrincipal Traveler traveler,
                                      @PathVariable Long travelId,
                                      @RequestBody @Valid NewTravelRequestDto newTravel) {
        List<NewTravelResponseDto> newTravelResponseDtos = travelService.patchTravel(traveler, travelId, newTravel);
        return new ResponseEntity<>(newTravelResponseDtos, HttpStatus.OK);
    }
}
