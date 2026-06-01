package com.virtuallearningmetaverse.classroom;

import com.virtuallearningmetaverse.common.ApiResponse;
import com.virtuallearningmetaverse.course.CourseEntity;
import com.virtuallearningmetaverse.course.CourseRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classroom-sessions")
public class ClassroomSessionController {
    private final ClassroomSessionRepository sessions;
    private final CourseRepository courses;

    public ClassroomSessionController(ClassroomSessionRepository sessions, CourseRepository courses) {
        this.sessions = sessions;
        this.courses = courses;
    }

    @GetMapping
    public ApiResponse<List<ClassroomSessionDto>> list() {
        return ApiResponse.ok("Classroom sessions fetched", sessions.findAll().stream().map(ClassroomSessionDto::from).toList());
    }

    @PostMapping
    public ApiResponse<ClassroomSessionDto> create(@Valid @RequestBody CreateClassroomSessionRequest request) {
        CourseEntity course = courses.findById(request.courseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        ClassroomSessionEntity session = new ClassroomSessionEntity(course, request.title(), request.scheduledAt());
        sessions.save(session);
        return ApiResponse.ok("Classroom session created", ClassroomSessionDto.from(session));
    }
}
