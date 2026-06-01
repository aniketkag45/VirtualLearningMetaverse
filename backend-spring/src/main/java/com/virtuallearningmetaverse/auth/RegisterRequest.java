package com.virtuallearningmetaverse.auth;

import com.virtuallearningmetaverse.user.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @Email @NotBlank String email,
        @NotBlank @Size(min = 2, max = 120) String fullName,
        @NotBlank @Size(min = 8, max = 120) String password,
        @NotNull UserRole role
) {}
