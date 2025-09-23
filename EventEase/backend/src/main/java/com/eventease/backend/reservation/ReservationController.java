package com.eventease.backend.reservation;

import com.eventease.backend.event.Event;
import com.eventease.backend.event.EventRepository;
import com.eventease.backend.reservation.dto.RejectRequest;
import com.eventease.backend.reservation.dto.ReservationRequest;
import com.eventease.backend.reservation.dto.ReservationResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationRepository reservationRepo;
    private final EventRepository eventRepo;

    public ReservationController(ReservationRepository reservationRepo, EventRepository eventRepo) {
        this.reservationRepo = reservationRepo;
        this.eventRepo = eventRepo;
    }

    // --- إنشاء حجز جديد ---
    @PostMapping
    public ResponseEntity<ReservationResponse> create(@RequestBody ReservationRequest request) {
        Event event = eventRepo.findById(request.eventId())
            .orElseThrow(() -> new RuntimeException("Event not found"));

        if (event.getReservedCount() >= event.getCapacity()) {
            throw new RuntimeException("No more places available");
        }

        Reservation reservation = new Reservation();
        reservation.setEventId(request.eventId());
        reservation.setUserId(request.userId());
        reservation.setStatus("PENDING");

        reservation = reservationRepo.save(reservation);

        // نحدث عدد المحجوزين
        event.setReservedCount(event.getReservedCount() + 1);
        eventRepo.save(event);

        return ResponseEntity.ok(new ReservationResponse(
            reservation.getId(),
            reservation.getEventId(),
            reservation.getUserId(),
            reservation.getStatus(),
            reservation.getReason(),
            reservation.getCreatedAt()
        ));
    }

    // --- لستة الحجوزات حسب المستخدم ---
    // --- لستة الحجوزات حسب المستخدم ---
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReservationResponse>> listByUser(@PathVariable String userId) {
        var reservations = reservationRepo.findByUserId(userId).stream().map(r ->
            new ReservationResponse(
                r.getId(),
                r.getEventId(),
                r.getUserId(),
                r.getStatus(),
                r.getReason(),
                r.getCreatedAt()
            )
        ).toList();
        return ResponseEntity.ok(reservations);
    }


    // --- قبول الحجز ---
    @PostMapping("/{id}/approve")
    public ResponseEntity<ReservationResponse> approve(@PathVariable String id) {
        var reservation = reservationRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));

        reservation.setStatus("APPROVED");
        reservationRepo.save(reservation);

        return ResponseEntity.ok(new ReservationResponse(
            reservation.getId(),
            reservation.getEventId(),
            reservation.getUserId(),
            reservation.getStatus(),
            reservation.getReason(),
            reservation.getCreatedAt()
        ));
    }

    // --- رفض الحجز ---
    // --- رفض الحجز ---
    @PostMapping("/{id}/reject")
    public ResponseEntity<ReservationResponse> reject(@PathVariable String id, @RequestBody RejectRequest body) {
        var reservation = reservationRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));

        reservation.setStatus("REFUSED");
        reservation.setReason(body.reason());
        reservationRepo.save(reservation);

        return ResponseEntity.ok(new ReservationResponse(
            reservation.getId(),
            reservation.getEventId(),
            reservation.getUserId(),
            reservation.getStatus(),
            reservation.getReason(),
            reservation.getCreatedAt()
        ));
    }

}
