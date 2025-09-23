package com.eventease.backend.user.dto;

public record AuthResponse(String token, String userId, String role) {}
