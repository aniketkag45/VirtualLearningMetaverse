package com.virtuallearningmetaverse.classroom;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.UUID;

public record CreateClassroomSessionRequest(
        @NotNull UUID courseId,
        @NotBlank String title,
        @NotNull Instant scheduledAt
) {}
