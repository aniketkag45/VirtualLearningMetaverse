package com.virtuallearningmetaverse.auth;

import com.virtuallearningmetaverse.user.UserRole;
import java.util.UUID;

public record AuthResponse(
        String accessToken,
        String tokenType,
        UUID userId,
        String email,
        String fullName,
        UserRole role
) {}
