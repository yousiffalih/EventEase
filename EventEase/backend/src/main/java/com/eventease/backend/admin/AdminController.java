package com.eventease.backend.admin;

import com.eventease.backend.reservation.Reservation;
import com.eventease.backend.reservation.ReservationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final ReservationRepository reservationRepository;

    public AdminController(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    // 🔹 عرض كل الحجوزات
    @GetMapping("/reservations")
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    // 🔹 الموافقة على حجز
    @PutMapping("/reservations/{id}/approve")
    public Reservation approveReservation(@PathVariable String id) {
        var res = reservationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));
        res.setStatus("APPROVED");
        return reservationRepository.save(res);
    }

    // 🔹 رفض حجز
    @PutMapping("/reservations/{id}/reject")
    public Reservation rejectReservation(@PathVariable String id) {
        var res = reservationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));
        res.setStatus("REJECTED");
        return reservationRepository.save(res);
    }
}
