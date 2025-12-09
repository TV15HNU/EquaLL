package com.example.equall.repository;

import com.example.equall.model.EventParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventParticipantRepository extends JpaRepository<EventParticipant, Long> {

    List<EventParticipant> findByEventId(Long eventId);

    Optional<EventParticipant> findByEventIdAndPersonId(Long eventId, Long personId);
}
