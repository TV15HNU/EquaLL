package com.example.equall.controller;

import com.example.equall.model.*;
import com.example.equall.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URI;
import java.util.*;

/**
 * EventController - simplified participants payload:
 * Accepts participants as array of personIds or objects with personId.
 * Example bodies:
 * { "participants": [1,2] }
 * { "participants": [ { "personId": 1 }, { "personId": 2 } ] }
 *
 * Duplicate-safe and ignores 'share' (uses default share = 1).
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
    // CREATE EVENT (same as before)
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
    // ADD PARTICIPANTS (no shares, duplicates safe)
    // Body examples:
    // { "participants": [1,2] }
    // { "participants": [ {"personId":1}, {"personId":2} ] }
    // -------------------------------
    @PostMapping("/{eventId}/participants")
    public ResponseEntity<?> addParticipants(
            @PathVariable Long groupId,
            @PathVariable Long eventId,
            @RequestBody Map<String, Object> body) {

        // validate group
        if (groupRepo.findById(groupId).isEmpty()) {
            return ResponseEntity.badRequest().body("Group not found");
        }

        // validate event
        Optional<Event> eventOpt = eventRepo.findById(eventId);
        if (eventOpt.isEmpty()) return ResponseEntity.badRequest().body("Event not found");
        Event event = eventOpt.get();

        // parse participants entry
        if (!body.containsKey("participants")) {
            return ResponseEntity.badRequest().body("Missing 'participants' in body");
        }

        Object pObj = body.get("participants");
        if (!(pObj instanceof List)) return ResponseEntity.badRequest().body("'participants' must be an array");

        List<?> list = (List<?>) pObj;
        List<EventParticipant> saved = new ArrayList<>();

        for (Object item : list) {
            Long personId = null;

            if (item instanceof Number) {
                personId = ((Number) item).longValue();
            } else if (item instanceof Map) {
                Object pid = ((Map<?,?>) item).get("personId");
                if (pid instanceof Number) personId = ((Number) pid).longValue();
                else if (pid != null) {
                    try { personId = Long.valueOf(pid.toString()); } catch (Exception ignored) {}
                }
            } else if (item instanceof String) {
                try { personId = Long.valueOf((String) item); } catch (Exception ignored) {}
            }

            if (personId == null) continue;

            // check person exists
            Optional<Person> personOpt = personRepo.findById(personId);
            if (personOpt.isEmpty()) continue;

            // duplicate check (eventId + personId)
            Optional<EventParticipant> existing = participantRepo.findByEventIdAndPersonId(eventId, personId);
            if (existing.isPresent()) {
                // skip duplicate
                continue;
            }

            // create participant with default share = 1
            EventParticipant ep = new EventParticipant();
            ep.setEvent(event);
            ep.setPerson(personOpt.get());
            ep.setShare(BigDecimal.ONE);

            try {
                EventParticipant savedEp = participantRepo.save(ep);
                saved.add(savedEp);
            } catch (Exception ex) {
                // unique constraint or other db error -> skip
                continue;
            }
        }

        return ResponseEntity.ok(saved);
    }

    // -------------------------------
    // LIST EVENTS FOR GROUP
    // -------------------------------
    @GetMapping
    public ResponseEntity<?> getEventsForGroup(@PathVariable Long groupId) {
        List<Event> events = eventRepo.findByGroupId(groupId);
        return ResponseEntity.ok(events);
    }
}
