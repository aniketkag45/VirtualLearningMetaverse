package com.virtuallearningmetaverse.classroom;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ClassroomSessionRepository extends JpaRepository<ClassroomSessionEntity, UUID> {}
