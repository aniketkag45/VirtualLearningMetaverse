// ===================================
// Virtual Learning Metaverse - JavaScript Functions
// Developed by: Aniket Kag, Bhupendra Meena, Yashwani Patidar
// ===================================

// Global Variables
let currentUser = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkLogin();
    initializeFeatures();
    loadUserData();
});

// ===================================
// Authentication Functions
// ===================================

/**
 * Check if user is logged in and redirect accordingly
 */
function checkLogin() {
    const userData = sessionStorage.getItem('userData');
    const currentPage = window.location.pathname;
    
    if (userData) {
        currentUser = JSON.parse(userData);
        
        // Redirect to dashboard if on login page
        if (currentPage.includes('login.html')) {
            window.location.href = 'dashboard.html';
        }
    } else {
        // Redirect to login if trying to access protected pages
        const protectedPages = ['dashboard.html', 'courses.html', 'classroom.html'];
        const isProtected = protectedPages.some(page => currentPage.includes(page));
        
        if (isProtected) {
            window.location.href = 'login.html';
        }
    }
}

/**
 * Handle user login
 */
function handleLogin(event) {
    event.preventDefault();
    
    const userType = document.getElementById('userType').value;
    const emailOrEnrollment = document.getElementById('emailOrEnrollment').value;
    const password = document.getElementById('password').value;
    
    // Basic validation
    if (!userType || !emailOrEnrollment || !password) {
        alert('Please fill all fields');
        return false;
    }
    
    // Create user data object
    const userData = {
        userType: userType,
        identifier: emailOrEnrollment,
        name: getUserNameFromIdentifier(emailOrEnrollment),
        loginTime: new Date().toISOString()
    };
    
    // Store in session
    sessionStorage.setItem('userData', JSON.stringify(userData));
    
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
    return false;
}

/**
 * Handle user registration
 */
function handleRegister(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('phone').value;
    const userType = document.getElementById('regUserType').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;
    
    // Validation
    if (!firstName || !lastName || !email || !phone || !userType || !password || !confirmPassword) {
        alert('Please fill all required fields');
        return false;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return false;
    }
    
    if (!terms) {
        alert('Please accept the terms and conditions');
        return false;
    }
    
    // Create user data
    const userData = {
        firstName: firstName,
        lastName: lastName,
        name: `${firstName} ${lastName}`,
        email: email,
        phone: phone,
        userType: userType,
        registrationDate: new Date().toISOString()
    };
    
    // Store in session
    sessionStorage.setItem('userData', JSON.stringify(userData));
    
    // Close modal and redirect
    const modal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
    modal.hide();
    
    alert('Registration successful! Redirecting to dashboard...');
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1000);
    
    return false;
}

/**
 * Quick demo login
 */
function demoLogin(type) {
    const demoUsers = {
        student: {
            userType: 'student',
            name: 'Aniket Kag',
            identifier: '0901AD221007',
            enrollmentNumber: '0901AD221007',
            email: 'aniket.kag@example.com'
        },
        teacher: {
            userType: 'teacher',
            name: 'Prof. Sharma',
            identifier: 'prof.sharma@example.com',
            email: 'prof.sharma@example.com'
        },
        admin: {
            userType: 'admin',
            name: 'Admin User',
            identifier: 'admin@example.com',
            email: 'admin@example.com'
        }
    };
    
    const userData = demoUsers[type];
    userData.loginTime = new Date().toISOString();
    
    sessionStorage.setItem('userData', JSON.stringify(userData));
    window.location.href = 'dashboard.html';
}

/**
 * Logout function
 */
function logout() {
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('enrolledCourses');
    window.location.href = 'login.html';
}

// ===================================
// Course Functions
// ===================================

/**
 * Search courses by title or description
 */
function searchCourses() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const courseCards = document.querySelectorAll('.course-card');
    
    courseCards.forEach(card => {
        const title = card.querySelector('h4').textContent.toLowerCase();
        const description = card.querySelector('.card-text').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.parentElement.style.display = 'block';
        } else {
            card.parentElement.style.display = 'none';
        }
    });
}

/**
 * Filter courses by category
 */
function filterByCategory() {
    const category = document.getElementById('categoryFilter').value;
    const level = document.getElementById('levelFilter').value;
    const courseCards = document.querySelectorAll('.course-card');
    
    courseCards.forEach(card => {
        const cardCategory = card.dataset.category || '';
        const cardLevel = card.dataset.level || '';
        
        const categoryMatch = !category || cardCategory === category;
        const levelMatch = !level || cardLevel === level;
        
        if (categoryMatch && levelMatch) {
            card.parentElement.style.display = 'block';
        } else {
            card.parentElement.style.display = 'none';
        }
    });
}

/**
 * Enroll in a course
 */
function enrollCourse(courseId, courseName) {
    // Get existing enrolled courses
    let enrolledCourses = JSON.parse(sessionStorage.getItem('enrolledCourses') || '[]');
    
    // Check if already enrolled
    if (enrolledCourses.includes(courseId)) {
        alert('You are already enrolled in this course!');
        return;
    }
    
    // Add new course
    enrolledCourses.push(courseId);
    sessionStorage.setItem('enrolledCourses', JSON.stringify(enrolledCourses));
    
    alert(`Successfully enrolled in "${courseName}"!\n\nYou can access it from your dashboard.`);
    
    // Update button
    const button = event.target;
    button.classList.remove('btn-primary');
    button.classList.add('btn-success');
    button.innerHTML = '<i class="fas fa-check me-2"></i>Enrolled';
    button.disabled = true;
}

// ===================================
// Classroom Functions
// ===================================

/**
 * Toggle classroom controls
 */
function toggleControls(controlId) {
    const control = document.getElementById(controlId);
    if (control) {
        control.style.display = control.style.display === 'none' ? 'block' : 'none';
    }
}

/**
 * Change camera view in classroom
 */
function changeView(view) {
    const camera = document.querySelector('[camera]');
    
    const views = {
        front: { position: '0 1.6 5', rotation: '0 0 0' },
        side: { position: '5 1.6 0', rotation: '0 -90 0' },
        top: { position: '0 8 0', rotation: '-90 0 0' },
        teacher: { position: '0 1.6 -2', rotation: '0 180 0' }
    };
    
    if (views[view]) {
        camera.setAttribute('position', views[view].position);
        camera.setAttribute('rotation', views[view].rotation);
    }
}

/**
 * Toggle fullscreen mode
 */
function toggleFullscreen() {
    const scene = document.querySelector('a-scene');
    
    if (!document.fullscreenElement) {
        scene.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

/**
 * Interactive classroom tools
 */
function raiseHand() {
    alert('✋ Hand raised! The teacher will call on you shortly.');
}

function toggleMic() {
    const button = event.target.closest('button');
    const icon = button.querySelector('i');
    
    if (icon.classList.contains('fa-microphone')) {
        icon.classList.remove('fa-microphone');
        icon.classList.add('fa-microphone-slash');
        button.classList.remove('btn-primary');
        button.classList.add('btn-danger');
    } else {
        icon.classList.remove('fa-microphone-slash');
        icon.classList.add('fa-microphone');
        button.classList.remove('btn-danger');
        button.classList.add('btn-primary');
    }
}

function toggleVideo() {
    const button = event.target.closest('button');
    const icon = button.querySelector('i');
    
    if (icon.classList.contains('fa-video')) {
        icon.classList.remove('fa-video');
        icon.classList.add('fa-video-slash');
        button.classList.remove('btn-primary');
        button.classList.add('btn-danger');
    } else {
        icon.classList.remove('fa-video-slash');
        icon.classList.add('fa-video');
        button.classList.remove('btn-danger');
        button.classList.add('btn-primary');
    }
}

function openChat() {
    alert('💬 Chat feature - Coming soon!\n\nYou will be able to:\n• Send text messages\n• Share files\n• Create discussion groups');
}

function shareScreen() {
    alert('🖥️ Screen sharing feature - Coming soon!\n\nYou will be able to:\n• Share your screen\n• Present slides\n• Demonstrate applications');
}

function leaveClass() {
    if (confirm('Are you sure you want to leave the classroom?')) {
        window.location.href = 'dashboard.html';
    }
}

// ===================================
// Dashboard Functions
// ===================================

/**
 * Load user data on dashboard
 */
function loadUserData() {
    const userData = sessionStorage.getItem('userData');
    
    if (userData && document.getElementById('userNameDisplay')) {
        const user = JSON.parse(userData);
        
        // Update user name displays
        const nameElements = document.querySelectorAll('#userNameDisplay, .user-name');
        nameElements.forEach(el => {
            el.textContent = user.name || 'Student';
        });
        
        // Update enrollment number
        const enrollmentElements = document.querySelectorAll('.enrollment-number');
        enrollmentElements.forEach(el => {
            el.textContent = user.enrollmentNumber || user.identifier || 'N/A';
        });
        
        // Load enrolled courses
        loadEnrolledCourses();
    }
}

/**
 * Load enrolled courses
 */
function loadEnrolledCourses() {
    const enrolledCourses = JSON.parse(sessionStorage.getItem('enrolledCourses') || '[]');
    
    // Update enrollment count
    const countElement = document.querySelector('.quick-stats .text-primary');
    if (countElement) {
        countElement.textContent = enrolledCourses.length;
    }
}

/**
 * Join a class directly
 */
function joinClass(classId) {
    sessionStorage.setItem('currentClass', classId);
    window.location.href = 'classroom.html';
}

// ===================================
// Utility Functions
// ===================================

/**
 * Get user name from identifier (email or enrollment)
 */
function getUserNameFromIdentifier(identifier) {
    // Check if it's an enrollment number
    if (/^\d{13}$/.test(identifier)) {
        const enrollmentMap = {
            '0901AD221007': 'Aniket Kag',
            '0901AD221020': 'Bhupendra Meena',
            '0901AD221075': 'Yashwani Patidar'
        };
        return enrollmentMap[identifier] || 'Student';
    }
    
    // Extract name from email
    const emailName = identifier.split('@')[0];
    return emailName.split('.').map(part => 
        part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
}

/**
 * Smooth scroll to element
 */
function smoothScroll(targetId) {
    const target = document.getElementById(targetId);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Format date for display
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Format time for display
 */
function formatTime(timeString) {
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-US', options);
}

/**
 * Validate email format
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate phone number format
 */
function validatePhone(phone) {
    const re = /^\d{10}$/;
    return re.test(phone.replace(/[\s\-\(\)]/g, ''));
}

/**
 * Show loading spinner
 */
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading"></div>';
    }
}

/**
 * Hide loading spinner
 */
function hideLoading(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = content;
    }
}

// ===================================
// Initialize Features
// ===================================

/**
 * Initialize all interactive features
 */
function initializeFeatures() {
    // Animate elements on scroll
    animateOnScroll();
    
    // Initialize tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Set current date on dashboard
    const currentDateElement = document.getElementById('currentDate');
    if (currentDateElement) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        currentDateElement.textContent = new Date().toLocaleDateString('en-US', options);
    }
}

/**
 * Animate elements when they come into view
 */
function animateOnScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-slide-in');
            }
        });
    }, { threshold: 0.1 });
    
    // Observe all feature cards and stat items
    document.querySelectorAll('.feature-card, .stat-item, .course-card').forEach(el => {
        observer.observe(el);
    });
}

// ===================================
// Export functions for global use
// ===================================

// Make functions available globally
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.demoLogin = demoLogin;
window.logout = logout;
window.searchCourses = searchCourses;
window.filterByCategory = filterByCategory;
window.enrollCourse = enrollCourse;
window.toggleControls = toggleControls;
window.changeView = changeView;
window.toggleFullscreen = toggleFullscreen;
window.raiseHand = raiseHand;
window.toggleMic = toggleMic;
window.toggleVideo = toggleVideo;
window.openChat = openChat;
window.shareScreen = shareScreen;
window.leaveClass = leaveClass;
window.joinClass = joinClass;
window.smoothScroll = smoothScroll;

console.log('Virtual Learning Metaverse - Initialized Successfully');
console.log('Developed by: Aniket Kag, Bhupendra Meena, Yashwani Patidar');
