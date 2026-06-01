package com.virtuallearningmetaverse.course;

import com.virtuallearningmetaverse.common.ApiResponse;
import com.virtuallearningmetaverse.user.UserEntity;
import com.virtuallearningmetaverse.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
    private final CourseRepository courses;
    private final UserRepository users;

    public CourseController(CourseRepository courses, UserRepository users) {
        this.courses = courses;
        this.users = users;
    }

    @GetMapping
    public ApiResponse<List<CourseDto>> listCourses() {
        return ApiResponse.ok("Courses fetched", courses.findAll().stream().map(CourseDto::from).toList());
    }

    @PostMapping
    public ApiResponse<CourseDto> createCourse(@Valid @RequestBody CreateCourseRequest request) {
        UserEntity teacher = request.teacherId() == null ? null : users.findById(request.teacherId()).orElse(null);
        CourseEntity course = new CourseEntity(request.title(), request.description(), request.category(), teacher);
        courses.save(course);
        return ApiResponse.ok("Course created", CourseDto.from(course));
    }
}
