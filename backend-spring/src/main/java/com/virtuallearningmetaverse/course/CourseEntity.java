package com.virtuallearningmetaverse.course;

import com.virtuallearningmetaverse.user.UserEntity;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "courses")
public class CourseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    @Column(nullable = false, length = 80)
    private String category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private UserEntity teacher;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected CourseEntity() {}

    public CourseEntity(String title, String description, String category, UserEntity teacher) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.teacher = teacher;
    }

    public UUID getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public UserEntity getTeacher() { return teacher; }
    public Instant getCreatedAt() { return createdAt; }
}
