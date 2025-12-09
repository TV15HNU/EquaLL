package com.example.equall.controller;

import com.example.equall.model.*;
import com.example.equall.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URI;
import java.util.*;

/**
 * Controller for Events and Participants.
 * - Create event: POST /api/groups/{groupId}/events
 * - Add participants: POST /api/groups/{groupId}/events/{eventId}/participants
 * - List events: GET /api/groups/{groupId}/events
 *
 * Duplicate-safety: before inserting a participant we check repository for existing (eventId, personId).
 */
@RestController
@RequestMapping("/api/groups/{groupId}/events")
public class EventController {

    private final GroupRepository groupRepo;
    private final PersonRepository personRepo;
    private final EventRepository eventRepo;
    private final EventParticipantRepository participantRepo;

    public EventController(GroupRepository groupRepo,
                           PersonRepository personRepo,
                           EventRepository eventRepo,
                           EventParticipantRepository participantRepo) {
        this.groupRepo = groupRepo;
        this.personRepo = personRepo;
        this.eventRepo = eventRepo;
        this.participantRepo = participantRepo;
    }

    // -------------------------------
    // DTOs (small inner classes)
    // -------------------------------
    public static class ParticipantRequest {
        private Long personId;
        private BigDecimal share = BigDecimal.ONE;

        public ParticipantRequest() {}
        public Long getPersonId() { return personId; }
        public void setPersonId(Long personId) { this.personId = personId; }
        public BigDecimal getShare() { return share; }
        public void setShare(BigDecimal share) { this.share = share; }
    }

    public static class ParticipantListRequest {
        private List<ParticipantRequest> participants = new ArrayList<>();

        public ParticipantListRequest() {}
        public List<ParticipantRequest> getParticipants() { return participants; }
        public void setParticipants(List<ParticipantRequest> participants) { this.participants = participants; }
    }

    // -------------------------------
    // 1) CREATE EVENT
    // -------------------------------
    @PostMapping
    public ResponseEntity<?> createEvent(
            @PathVariable Long groupId,
            @RequestBody Map<String, Object> body) {

        Optional<GroupEntity> maybeGroup = groupRepo.findById(groupId);
        if (maybeGroup.isEmpty()) {
            return ResponseEntity.badRequest().body("Group not found");
        }

        GroupEntity group = maybeGroup.get();
        String title = (String) body.getOrDefault("title", "Untitled Event");

        if (!body.containsKey("amount")) {
            return ResponseEntity.badRequest().body("Amount missing");
        }

        BigDecimal amount;
        try {
            amount = new BigDecimal(body.get("amount").toString());
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body("Invalid amount");
        }

        if (!body.containsKey("payerId")) {
            return ResponseEntity.badRequest().body("payerId missing");
        }

        Long payerId;
        try {
            payerId = Long.valueOf(body.get("payerId").toString());
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body("Invalid payerId");
        }

        Optional<Person> payerOpt = personRepo.findById(payerId);
        if (payerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Payer not found");
        }

        Person payer = payerOpt.get();

        Event event = new Event();
        event.setTitle(title);
        event.setAmount(amount);
        event.setPayer(payer);
        event.setGroup(group);

        Event saved = eventRepo.save(event);

        return ResponseEntity.created(URI.create("/api/groups/" + groupId + "/events/" + saved.getId()))
                .body(saved);
    }

    // -------------------------------
    // 2) ADD PARTICIPANTS (duplicate-safe)
    // -------------------------------
    /**
     * Request body:
     * {
     *   "participants": [
     *     { "personId": 1, "share": 1 },
     *     { "personId": 2, "share": 1 }
     *   ]
     * }
     */
    @PostMapping("/{eventId}/participants")
    public ResponseEntity<?> addParticipants(
            @PathVariable Long groupId,
            @PathVariable Long eventId,
            @RequestBody ParticipantListRequest request) {

        // Validate group exists
        if (groupRepo.findById(groupId).isEmpty()) {
            return ResponseEntity.badRequest().body("Group not found");
        }

        // Validate event exists
        Optional<Event> eventOpt = eventRepo.findById(eventId);
        if (eventOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Event not found");
        }
        Event event = eventOpt.get();

        List<EventParticipant> saved = new ArrayList<>();

        for (ParticipantRequest pr : request.getParticipants()) {
            if (pr == null || pr.getPersonId() == null) continue;
            Long personId = pr.getPersonId();

            // DUPLICATE CHECK (repository query)
            Optional<EventParticipant> existing = participantRepo.findByEventIdAndPersonId(eventId, personId);
            if (existing.isPresent()) {
                // skip duplicate silently (or collect info to return if you prefer)
                continue;
            }

            // Check person exists
            Optional<Person> personOpt = personRepo.findById(personId);
            if (personOpt.isEmpty()) continue;

            // Create participant
            EventParticipant ep = new EventParticipant();
            ep.setEvent(event);
            ep.setPerson(personOpt.get());
            ep.setShare(pr.getShare() == null ? BigDecimal.ONE : pr.getShare());

            EventParticipant savedEp;
            try {
                savedEp = participantRepo.save(ep);
            } catch (Exception ex) {
                // in case DB unique constraint triggers (race-condition), skip
                continue;
            }

            saved.add(savedEp);
        }

        return ResponseEntity.ok(saved);
    }

    // -------------------------------
    // 3) LIST EVENTS FOR GROUP
    // -------------------------------
    @GetMapping
    public ResponseEntity<?> getEventsForGroup(@PathVariable Long groupId) {
        List<Event> events = eventRepo.findByGroupId(groupId);
        return ResponseEntity.ok(events);
    }
}
