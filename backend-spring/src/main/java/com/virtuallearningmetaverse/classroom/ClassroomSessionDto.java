package com.virtuallearningmetaverse.classroom;

import java.time.Instant;
import java.util.UUID;

public record ClassroomSessionDto(UUID id, UUID courseId, String title, Instant scheduledAt, boolean active) {
    public static ClassroomSessionDto from(ClassroomSessionEntity session) {
        return new ClassroomSessionDto(
                session.getId(),
                session.getCourse() == null ? null : session.getCourse().getId(),
                session.getTitle(),
                session.getScheduledAt(),
                session.isActive()
        );
    }
}
