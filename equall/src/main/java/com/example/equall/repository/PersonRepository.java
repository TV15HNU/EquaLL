package com.example.equall.repository;

import com.example.equall.model.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonRepository extends JpaRepository<Person, Long> {
    // Later we can add custom queries like: List<Person> findByGroupId(Long groupId);
}
