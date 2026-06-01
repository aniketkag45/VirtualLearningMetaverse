package com.virtuallearningmetaverse.course;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<CourseEntity, UUID> {}
