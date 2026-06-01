package com.virtuallearningmetaverse.course;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record CreateCourseRequest(
        @NotBlank @Size(max = 180) String title,
        @NotBlank @Size(max = 2000) String description,
        @NotBlank @Size(max = 80) String category,
        UUID teacherId
) {}
