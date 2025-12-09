package com.example.equall.repository;

import com.example.equall.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    // find events by group id (handy for group view)
    List<Event> findByGroupId(Long groupId);
}
