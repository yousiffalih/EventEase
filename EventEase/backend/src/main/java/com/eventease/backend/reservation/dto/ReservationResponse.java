package com.eventease.backend.reservation.dto;

import java.time.Instant;

public record ReservationResponse(
    String id,
    String eventId,
    String userId,
    String status,
    String reason,
    Instant createdAt
) {}
