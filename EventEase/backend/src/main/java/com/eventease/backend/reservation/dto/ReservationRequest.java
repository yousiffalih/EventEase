package com.eventease.backend.reservation.dto;

public record ReservationRequest(
    String eventId,
    String userId
) {}
