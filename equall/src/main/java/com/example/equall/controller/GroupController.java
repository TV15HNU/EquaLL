package com.example.equall.controller;

import com.example.equall.model.GroupEntity;
import com.example.equall.model.Person;
import com.example.equall.repository.GroupRepository;
import com.example.equall.repository.PersonRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupRepository groupRepo;
    private final PersonRepository personRepo;

    public GroupController(GroupRepository groupRepo, PersonRepository personRepo) {
        this.groupRepo = groupRepo;
        this.personRepo = personRepo;
    }

    /**
     * Create a group.
     * Body example: { "name": "Trip Goa" }
     */
    @PostMapping
    public ResponseEntity<GroupEntity> createGroup(@RequestBody Map<String, String> body) {
        String name = body.getOrDefault("name", "Unnamed Group");
        GroupEntity g = new GroupEntity();
        g.setName(name);
        GroupEntity saved = groupRepo.save(g);
        return ResponseEntity.created(URI.create("/api/groups/" + saved.getId())).body(saved);
    }

    /**
     * Add a person to a group.
     * Body example: { "name": "Alice" }
     */
    @PostMapping("/{groupId}/people")
    public ResponseEntity<?> addPerson(@PathVariable Long groupId, @RequestBody Map<String, String> body) {
        Optional<GroupEntity> maybeGroup = groupRepo.findById(groupId);
        if (maybeGroup.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        String name = body.getOrDefault("name", "").trim();
        if (name.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "name is required"));
        }

        GroupEntity group = maybeGroup.get();
        Person p = new Person();
        p.setName(name);
        p.setGroup(group);
        Person saved = personRepo.save(p);

        // Return created person
        return ResponseEntity.created(URI.create("/api/groups/" + groupId + "/people/" + saved.getId())).body(saved);
    }

    /**
     * Get group details including list of people in the group.
     * Returns a JSON object:
     * { "id": 1, "name": "Trip", "people": [ { person... }, ... ] }
     */
    @GetMapping("/{groupId}")
    public ResponseEntity<?> getGroupWithPeople(@PathVariable Long groupId) {
        Optional<GroupEntity> maybeGroup = groupRepo.findById(groupId);
        if (maybeGroup.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        GroupEntity group = maybeGroup.get();

        // fetch all persons and filter by group id (simple approach)
        List<Person> allPeople = personRepo.findAll();
        List<Person> peopleInGroup = allPeople.stream()
                .filter(p -> p.getGroup() != null && Objects.equals(p.getGroup().getId(), groupId))
                .collect(Collectors.toList());

        Map<String, Object> resp = new HashMap<>();
        resp.put("id", group.getId());
        resp.put("name", group.getName());
        resp.put("people", peopleInGroup);

        return ResponseEntity.ok(resp);
    }
}
