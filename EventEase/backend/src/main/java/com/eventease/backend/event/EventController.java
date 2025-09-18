package com.eventease.backend.event;

import com.eventease.backend.event.dto.EventDetail;
import com.eventease.backend.event.dto.EventListItem;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventRepository repo;

    public EventController(EventRepository repo) {
        this.repo = repo;
    }

    // ✅ لستة الأحداث
    @GetMapping
    public List<EventListItem> list() {
        return repo.findAll().stream().map(e ->
            new EventListItem(
                e.getId(), e.getTitle(), e.getDate(), e.getLocation(),
                e.getCapacity(), Math.max(0, e.getCapacity() - e.getReservedCount())
            )
        ).toList();
    }

    // ✅ تفاصيل حدث واحد
    @GetMapping("/{id}")
    public ResponseEntity<EventDetail> details(@PathVariable String id) {
        return repo.findById(id)
            .map(e -> ResponseEntity.ok(new EventDetail(
                e.getId(), e.getTitle(), e.getDescription(), e.getDate(),
                e.getLocation(), e.getCapacity(),
                Math.max(0, e.getCapacity() - e.getReservedCount())
            )))
            .orElse(ResponseEntity.notFound().build());
    }




}
