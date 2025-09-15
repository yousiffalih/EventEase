package com.eventease.backend.event.dto;

import java.time.Instant;

public record EventDetail(
    String id, String title, String description, Instant date,
    String location, int capacity, int available
) {}
