package com.example.travelmaprecodebe.service;

import com.example.travelmaprecodebe.domain.dto.NewJourneyRequestDto;
import com.example.travelmaprecodebe.domain.dto.NewTravelRequestDto;
import com.example.travelmaprecodebe.domain.dto.NewTravelResponseDto;
import com.example.travelmaprecodebe.domain.entity.Travel;
import com.example.travelmaprecodebe.domain.entity.Traveler;
import com.example.travelmaprecodebe.repository.TravelRepository;
import com.example.travelmaprecodebe.repository.TravelerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TravelService {

    private final TravelRepository travelRepository;
    private final TravelerRepository travelerRepository;
    private final EntityManager em;

    public NewTravelResponseDto postTravel(Long travelerId, NewTravelRequestDto newTravel) {
        Traveler traveler = getTraveler(travelerId);
        Travel travel = traveler.addTravel(newTravel.getTitle());
        em.flush();
        em.clear();
        return new NewTravelResponseDto(travel);
    }

    public List<NewTravelResponseDto> getTravel(Long travelerId) {
        return travelRepository.findAllTravel(travelerId)
                .stream()
                .map(NewTravelResponseDto::new)
                .collect(Collectors.toList());
    }

    public List<NewTravelResponseDto> postJourney(Long travelerId, Long travelId, NewJourneyRequestDto newJourney) {
        Travel travel = travelRepository.findTravel(travelerId, travelId);
        newJourney.toEntity().addTravel(travel);
        return this.getTravel(travelerId);
    }

    public List<NewTravelResponseDto> deleteTravel(Long travelerId, Long travelId) {
        travelRepository.deleteTravel(travelerId, travelId);
        return getTravel(travelerId);
    }

    public List<NewTravelResponseDto> patchTravel(Long travelerId, Long travelId, NewTravelRequestDto newTravel) {
        travelRepository.patchTravel(travelerId, travelId, newTravel.getTitle());
        return getTravel(travelerId);
    }

    private Traveler getTraveler(Long travelerId) {
        Optional<Traveler> traveler = travelerRepository.findById(travelerId);
        if (traveler.isEmpty()) {
            throw new RuntimeException("missing traveler");
        }
        return traveler.get();
    }


}