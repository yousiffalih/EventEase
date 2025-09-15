package com.eventease.backend.event;

import com.eventease.backend.event.dto.EventDetail;
import com.eventease.backend.event.dto.EventListItem;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventRepository repo;

    public EventController(EventRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<EventListItem> list() {
        return repo.findAll().stream().map(e ->
            new EventListItem(
                e.getId(), e.getTitle(), e.getDate(), e.getLocation(),
                e.getCapacity(), Math.max(0, e.getCapacity() - e.getReservedCount())
            )
        ).toList();
    }

    @GetMapping("/{id}")
    public EventDetail details(@PathVariable String id) {
        var e = repo.findById(id).orElseThrow();
        return new EventDetail(
            e.getId(), e.getTitle(), e.getDescription(), e.getDate(),
            e.getLocation(), e.getCapacity(),
            Math.max(0, e.getCapacity() - e.getReservedCount())
        );
    }
}
