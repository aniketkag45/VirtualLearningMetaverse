package com.virtuallearningmetaverse.classroom;

import com.virtuallearningmetaverse.course.CourseEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "classroom_sessions")
public class ClassroomSessionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    private CourseEntity course;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false)
    private Instant scheduledAt;

    @Column(nullable = false)
    private boolean active = false;

    protected ClassroomSessionEntity() {}

    public ClassroomSessionEntity(CourseEntity course, String title, Instant scheduledAt) {
        this.course = course;
        this.title = title;
        this.scheduledAt = scheduledAt;
    }

    public UUID getId() { return id; }
    public CourseEntity getCourse() { return course; }
    public String getTitle() { return title; }
    public Instant getScheduledAt() { return scheduledAt; }
    public boolean isActive() { return active; }
}
