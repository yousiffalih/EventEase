package com.eventease.backend.event.dto;

import java.time.Instant;

public record EventListItem(
    String id, String title, Instant date, String location,
    int capacity, int available
) {}
