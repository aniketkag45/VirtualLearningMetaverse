package com.virtuallearningmetaverse.course;

import java.util.UUID;

public record CourseDto(UUID id, String title, String description, String category, String teacherName) {
    public static CourseDto from(CourseEntity course) {
        return new CourseDto(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getCategory(),
                course.getTeacher() == null ? null : course.getTeacher().getFullName()
        );
    }
}
