package com.example.travelmaprecodebe.domain.entity;


import com.example.travelmaprecodebe.domain.AuditEntity;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.Set;

@Entity
@Getter
@Table(name = "JOURNEY")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Journey extends AuditEntity {

    @Id
    @JoinColumn(name = "JOURNEY_ID")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    private int orderKey;

    @NotNull
    private LocalDate date;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TRAVEL_ID")
    private Travel travel;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "GEOLOCATION_ID")
    private GeoLocation geoLocation;

    @ElementCollection
    @JoinColumn(name = "HASHTAG")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Set<String> hashtags;

    public void addTravel(Travel travel) {
        if (this.travel != null) {
            this.travel.getJourneys().remove(this);
        }

        this.travel = travel;
        travel.getJourneys().add(this);
    }

    @Builder
    public Journey(int orderKey, LocalDate date, GeoLocation geoLocation, Set<String> hashtags) {
        this.orderKey = orderKey;
        this.date = date;
        this.geoLocation = geoLocation;
        this.hashtags = hashtags;
    }

    public Journey( LocalDate date, GeoLocation geoLocation, Set<String> hashtags, int orderKey) {
        this.date = date;
        this.hashtags = hashtags;
        this.geoLocation = geoLocation;
        this.orderKey = orderKey;
    }
}
