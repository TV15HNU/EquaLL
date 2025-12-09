package com.example.equall.repository;

import com.example.equall.model.GroupEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GroupRepository extends JpaRepository<GroupEntity, Long> {
    // You can add custom query methods here later, e.g. findByName(...)
}
