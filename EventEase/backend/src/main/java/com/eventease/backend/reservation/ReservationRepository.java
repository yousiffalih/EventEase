package com.eventease.backend.reservation;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReservationRepository extends MongoRepository<Reservation, String> {
    List<Reservation> findByUserId(String userId);
    boolean existsByEventIdAndUserId(String eventId, String userId);
    List<Reservation> findByEventIdAndUserId(String eventId, String userId);
}
