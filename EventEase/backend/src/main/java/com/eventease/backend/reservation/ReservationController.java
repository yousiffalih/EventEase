package com.eventease.backend.reservation;

import com.eventease.backend.event.Event;
import com.eventease.backend.event.EventRepository;
import com.eventease.backend.reservation.dto.RejectRequest;
import com.eventease.backend.reservation.dto.ReservationRequest;
import com.eventease.backend.reservation.dto.ReservationResponse;
import com.eventease.backend.user.User;
import com.eventease.backend.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationRepository reservationRepo;
    private final EventRepository eventRepo;
    private final UserRepository userRepo;

    public ReservationController(
        ReservationRepository reservationRepo,
        EventRepository eventRepo,
        UserRepository userRepo
    ) {
        this.reservationRepo = reservationRepo;
        this.eventRepo = eventRepo;
        this.userRepo = userRepo;
    }

    // --- إنشاء حجز جديد ---
    @PostMapping
    public ResponseEntity<?> create(@RequestBody ReservationRequest request) {
        // Validate user exists
        if (!userRepo.existsById(request.userId())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("User not found or not authenticated");
        }

        Event event = eventRepo.findById(request.eventId())
            .orElse(null);
        
        if (event == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Event not found");
        }

        // Check for duplicate reservation
        if (reservationRepo.existsByEventIdAndUserId(request.eventId(), request.userId())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body("You already have a reservation for this event");
        }

        // Check capacity with synchronized block to prevent race conditions
        synchronized (this) {
            // Reload event to get latest state
            event = eventRepo.findById(request.eventId())
                .orElseThrow(() -> new RuntimeException("Event not found"));
                
            if (event.getReservedCount() >= event.getCapacity()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("No more places available");
            }

            Reservation reservation = new Reservation();
            reservation.setEventId(request.eventId());
            reservation.setUserId(request.userId());
            reservation.setStatus("PENDING");
            reservationRepo.save(reservation);

            // 🟢 تحديث عدد المحجوزين
            event.setReservedCount(event.getReservedCount() + 1);
            eventRepo.save(event);

            return ResponseEntity.ok(toResponse(reservation));
        }
    }

    // --- جميع الحجوزات الخاصة بالأدمن مع تفاصيل المستخدم ---
    @GetMapping("/admin/all")
    public ResponseEntity<List<ReservationResponse>> listAll() {
        List<ReservationResponse> responses = reservationRepo.findAll().stream()
            .map(this::toResponse)
            .toList();
        return ResponseEntity.ok(responses);
    }

    // --- لستة الحجوزات حسب المستخدم ---
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ReservationResponse>> listByUser(@PathVariable String userId) {
        var reservations = reservationRepo.findByUserId(userId).stream()
            .map(this::toResponse)
            .toList();
        return ResponseEntity.ok(reservations);
    }

    // --- قبول الحجز ---
    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable String id) {
        var reservation = reservationRepo.findById(id)
            .orElse(null);
        
        if (reservation == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Reservation not found");
        }

        reservation.setStatus("APPROVED");
        reservationRepo.save(reservation);
        return ResponseEntity.ok(toResponse(reservation));
    }

    // --- رفض الحجز ---
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable String id, @RequestBody RejectRequest body) {
        var reservation = reservationRepo.findById(id)
            .orElse(null);
        
        if (reservation == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Reservation not found");
        }

        reservation.setStatus("REFUSED");
        reservation.setReason(body.reason());
        reservationRepo.save(reservation);

        return ResponseEntity.ok(toResponse(reservation));
    }

    // --- إلغاء الحجز ---
    @DeleteMapping("/{id}")
    public ResponseEntity<String> cancel(@PathVariable String id) {
        var reservation = reservationRepo.findById(id)
            .orElse(null);
        
        if (reservation == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Reservation not found");
        }

        // 🟢 نخصم واحد من المحجوزين لما المستخدم يلغي الحجز
        eventRepo.findById(reservation.getEventId()).ifPresent(event -> {
            event.setReservedCount(Math.max(0, event.getReservedCount() - 1));
            eventRepo.save(event);
        });

        reservationRepo.delete(reservation);
        return ResponseEntity.ok("Reservation cancelled successfully");
    }

    // 🧠 تحويل Reservation إلى Response مع بيانات المستخدم
    private ReservationResponse toResponse(Reservation r) {
        User user = userRepo.findById(r.getUserId()).orElse(null);
        String username = user != null ? user.getUsername() : "Unknown";
        String email = user != null ? user.getEmail() : "Unknown";

        return new ReservationResponse(
            r.getId(),
            r.getEventId(),
            r.getUserId(),
            r.getStatus(),
            r.getReason(),
            r.getCreatedAt(),
            username,
            email
        );
    }
}
