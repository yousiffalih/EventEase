package com.eventease.backend.reservation;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "reservations")
@CompoundIndex(name = "uniq_event_user", def = "{'eventId':1,'userId':1}", unique = true)
public class Reservation {
    @Id
    private String id;

    private String eventId;
    private String userId;  // حالياً ثابت أو ناخذه من الهيدر لاحقاً

    private String status;  // PENDING | APPROVED | REFUSED
    private String reason;  // سبب الرفض (إذا موجود)

    private Instant createdAt = Instant.now();

    // --- Getters & Setters ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
