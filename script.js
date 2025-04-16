    // User data
    const users = {
        admin: [
            { username: 'admin', password: 'admin123' }
        ],
        teachers: [
            { username: 'teacher1', password: 'pass1', name: 'John Smith', subject: 'Mathematics' },
            { username: 'teacher2', password: 'pass2', name: 'Sarah Johnson', subject: 'Science' },
            { username: 'teacher3', password: 'pass3', name: 'Michael Brown', subject: 'English' },
            { username: 'teacher4', password: 'pass4', name: 'Emily Davis', subject: 'History' },
            { username: 'teacher5', password: 'pass5', name: 'Robert Wilson', subject: 'Computer Science' }
        ],
        students: [
            { username: 'student1', password: 'pass1', name: 'Alice Cooper' },
            { username: 'student2', password: 'pass2', name: 'Bob Martin' },
            { username: 'student3', password: 'pass3', name: 'Carol White' },
            { username: 'student4', password: 'pass4', name: 'David Lee' },
            { username: 'student5', password: 'pass5', name: 'Eve Anderson' }
        ]
    };

    // Initialize attendance data structure
    let attendanceData = {
        Mathematics: {},
        Science: {},
        English: {},
        History: {},
        'Computer Science': {}
    };

    // Load attendance data from localStorage
    function loadAttendanceData() {
        const savedData = localStorage.getItem('attendanceData');
        if (savedData) {
            attendanceData = JSON.parse(savedData);
        } else {
            initializeAttendanceData();
        }
    }

    // Save attendance data to localStorage
    function saveAttendanceData() {
        localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
    }

    // Initialize attendance data
    function initializeAttendanceData() {
        const subjects = ['Mathematics', 'Science', 'English', 'History', 'Computer Science'];
        const totalClasses = 35;

        subjects.forEach(subject => {
            users.students.forEach(student => {
                if (!attendanceData[subject][student.username]) {
                    attendanceData[subject][student.username] = {
                        present: 0,
                        total: totalClasses,
                        dates: [], // Array to store date-wise attendance
                        classesHeld: 0 // Track total classes held
                    };
                }
            });
        });
        saveAttendanceData(); // Save initial data
    }

    // Current logged in user
    let currentUser = null;

    // DOM Elements
    const loginForm = document.getElementById('loginForm');
    const dashboard = document.getElementById('dashboard');
    const teacherDashboard = document.getElementById('teacherDashboard');
    const studentDashboard = document.getElementById('studentDashboard');
    const userNameSpan = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    const studentSelect = document.getElementById('studentSelect');
    const subjectSelect = document.getElementById('subjectSelect');
    const attendanceDate = document.getElementById('attendanceDate');
    const markPresentBtn = document.getElementById('markPresent');
    const markAbsentBtn = document.getElementById('markAbsent');
    const attendanceTable = document.getElementById('attendanceTable');
    const studentAttendanceTable = document.getElementById('studentAttendanceTable');
    const adminDashboard = document.getElementById('adminDashboard');
    const teacherList = document.getElementById('teacherList').querySelector('tbody');
    const studentList = document.getElementById('studentList').querySelector('tbody');
    const addTeacherBtn = document.getElementById('addTeacher');
    const addStudentBtn = document.getElementById('addStudent');
    const subjectType = document.getElementById('subjectType');
    const customSubject = document.getElementById('customSubject');
    const teacherSubject = document.getElementById('teacherSubject');

    // Initialize the system
    loadAttendanceData(); // Load saved data instead of initializing new data

    // Set default date to today
    attendanceDate.value = getCurrentDate();

    // Format date to YYYY-MM-DD
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    // Get current date
    function getCurrentDate() {
        return formatDate(new Date());
    }

    // Validate date for attendance
    function validateAttendanceDate(date) {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Allow marking attendance for any date (past or future)
        return true;
    }

    // Check if attendance already exists for a date
    function checkAttendanceExists(student, subject, date) {
        const attendance = attendanceData[subject][student];
        return attendance.dates.some(record => record.date === date);
    }

    // Sort dates in descending order (newest first)
    function sortDates(dates) {
        return dates.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Get month name from date
    function getMonthName(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleString('default', { month: 'long' });
    }

    // Group attendance by month
    function groupAttendanceByMonth(dates) {
        const grouped = {};
        dates.forEach(record => {
            const month = getMonthName(record.date);
            if (!grouped[month]) {
                grouped[month] = [];
            }
            grouped[month].push(record);
        });
        return grouped;
    }

    // Update attendance count based on dates
    function updateAttendanceCount(student, subject) {
        const attendance = attendanceData[subject][student];
        attendance.present = attendance.dates.filter(record => record.status === 'Present').length;
        attendance.classesHeld = attendance.dates.length;
        saveAttendanceData(); // Save after updating count
    }

    // Populate student and subject dropdowns
    function populateDropdowns() {
        // Populate student dropdown
        studentSelect.innerHTML = '<option value="">Select Student</option>';
        users.students.forEach(student => {
            const option = document.createElement('option');
            option.value = student.username;
            option.textContent = student.name;
            studentSelect.appendChild(option);
        });

        // Populate subject dropdown with only teacher's subject
        subjectSelect.innerHTML = '<option value="">Select Subject</option>';
        if (currentUser && currentUser.subject) {
            const option = document.createElement('option');
            option.value = currentUser.subject;
            option.textContent = currentUser.subject;
            subjectSelect.appendChild(option);
        }
    }

    // Calculate attendance percentage
    function calculateAttendancePercentage(present, classesHeld) {
        if (classesHeld === 0) return 0;
        return ((present / classesHeld) * 100).toFixed(2);
    }

    // Get attendance status
    function getAttendanceStatus(percentage, classesHeld) {
        if (classesHeld === 0) {
            return 'N/A';
        }
        return percentage >= 75 ? 'Permitted' : 'Debarred';
    }

    // Update attendance for a specific date
    function updateAttendanceForDate(student, subject, date, isPresent) {
        const attendance = attendanceData[subject][student];
        const existingRecord = attendance.dates.find(record => record.date === date);

        if (existingRecord) {
            // Update existing record
            existingRecord.status = isPresent ? 'Present' : 'Absent';
        } else {
            // Add new record
            attendance.dates.push({
                date: date,
                status: isPresent ? 'Present' : 'Absent'
            });
        }

        updateAttendanceCount(student, subject);
        updateAttendanceTable();
        saveAttendanceData();
    }

    // Update attendance table
    function updateAttendanceTable() {
        const tbody = attendanceTable.querySelector('tbody');
        tbody.innerHTML = '';

        if (currentUser && currentUser.subject) {
            const subject = currentUser.subject;
            const selectedDate = attendanceDate.value;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selectedDateObj = new Date(selectedDate);
            selectedDateObj.setHours(0, 0, 0, 0);

            // Remove the automatic marking of absent for future dates
            Object.keys(attendanceData[subject]).forEach(studentUsername => {
                const student = users.students.find(s => s.username === studentUsername);
                const attendance = attendanceData[subject][studentUsername];
                const dateRecord = attendance.dates.find(d => d.date === selectedDate);
                const isPresent = dateRecord ? dateRecord.status === 'Present' : false;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="attendance-toggle">
                            <label class="switch">
                                <input type="checkbox" 
                                    class="attendance-toggle-input"
                                    data-student="${studentUsername}"
                                    data-subject="${subject}"
                                    ${isPresent ? 'checked' : ''}>
                                <span class="slider round"></span>
                            </label>
                            <span class="student-name">${student.name}</span>
                        </div>
                    </td>
                    <td>${subject}</td>
                    <td>Date: ${selectedDate}<br>
                        Status: ${dateRecord ? (isPresent ? 'Present' : 'Absent') : 'Not Marked'}</td>
                    <td>${getAttendanceStatus(calculateAttendancePercentage(attendance.present, attendance.classesHeld), attendance.classesHeld)}</td>
                `;
                tbody.appendChild(row);
            });

            document.querySelectorAll('.attendance-toggle-input').forEach(toggle => {
                toggle.addEventListener('change', (e) => {
                    const student = e.target.dataset.student;
                    const subject = e.target.dataset.subject;
                    const date = attendanceDate.value;
                    const isPresent = e.target.checked;

                    const attendance = attendanceData[subject][student];
                    const dateIndex = attendance.dates.findIndex(d => d.date === date);
                    
                    if (dateIndex !== -1) {
                        attendance.dates[dateIndex].status = isPresent ? 'Present' : 'Absent';
                    } else {
                        attendance.dates.push({
                            date: date,
                            status: isPresent ? 'Present' : 'Absent'
                        });
                    }

                    updateAttendanceCount(student, subject);
                    saveAttendanceData();
                    updateAttendanceTable();
                });
            });
        }
    }

    // Add event listener for date change
    attendanceDate.addEventListener('change', () => {
        updateAttendanceTable();
    });

    // Update student attendance table
    function updateStudentAttendanceTable(studentUsername) {
        const tbody = studentAttendanceTable.querySelector('tbody');
        tbody.innerHTML = '';

        Object.keys(attendanceData).forEach(subject => {
            const attendance = attendanceData[subject][studentUsername];
            const percentage = calculateAttendancePercentage(attendance.present, attendance.classesHeld);
            const status = getAttendanceStatus(percentage, attendance.classesHeld);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${subject}</td>
                <td>${attendance.present}</td>
                <td>${attendance.classesHeld}</td>
                <td>${attendance.classesHeld > 0 ? percentage + '%' : 'N/A'}</td>
                <td class="status-${status.toLowerCase()}">${status}</td>
            `;
            tbody.appendChild(row);

            // Add date-wise attendance details
            if (attendance.dates.length > 0) {
                const sortedDates = sortDates([...attendance.dates]);
                const groupedAttendance = groupAttendanceByMonth(sortedDates);
                
                const detailsRow = document.createElement('tr');
                detailsRow.className = 'attendance-details';
                let detailsHtml = '<td colspan="5"><strong>Date-wise Attendance:</strong><br>';
                
                for (const [month, records] of Object.entries(groupedAttendance)) {
                    detailsHtml += `<div class="month-group"><strong>${month}:</strong><br>`;
                    records.forEach(record => {
                        detailsHtml += `${record.date}: ${record.status}<br>`;
                    });
                    detailsHtml += '</div>';
                }
                
                detailsHtml += '</td>';
                detailsRow.innerHTML = detailsHtml;
                tbody.appendChild(detailsRow);
            }
        });
    }

    // Login form submission
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const userType = document.getElementById('userType').value;

        let user;
        if (userType === 'admin') {
            user = users.admin.find(a => a.username === username && a.password === password);
        } else if (userType === 'teacher') {
            user = users.teachers.find(t => t.username === username && t.password === password);
        } else {
            user = users.students.find(s => s.username === username && s.password === password);
        }

        if (user) {
            currentUser = user;
            document.querySelector('.container').classList.add('hidden');
            dashboard.classList.remove('hidden');
            userNameSpan.textContent = user.name || user.username;

            if (userType === 'admin') {
                adminDashboard.classList.remove('hidden');
                teacherDashboard.classList.add('hidden');
                studentDashboard.classList.add('hidden');
                updateTeacherList();
                updateStudentList();
            } else if (userType === 'teacher') {
                teacherDashboard.classList.remove('hidden');
                adminDashboard.classList.add('hidden');
                studentDashboard.classList.add('hidden');
                updateAttendanceTable();
            } else {
                studentDashboard.classList.remove('hidden');
                adminDashboard.classList.add('hidden');
                teacherDashboard.classList.add('hidden');
                updateStudentAttendanceTable(user.username);
            }
        } else {
            alert('Invalid credentials!');
        }
    });

    // Mark attendance buttons
    markPresentBtn.addEventListener('click', () => {
        const student = studentSelect.value;
        const subject = subjectSelect.value;
        const date = attendanceDate.value;

        if (student && subject && date) {
            if (!validateAttendanceDate(date)) {
                alert('Cannot mark attendance for past dates!');
                return;
            }

            if (checkAttendanceExists(student, subject, date)) {
                alert('Attendance already marked for this date!');
                return;
            }

            if (attendanceData[subject][student].classesHeld < attendanceData[subject][student].total) {
                attendanceData[subject][student].dates.push({
                    date: date,
                    status: 'Present'
                });
                updateAttendanceCount(student, subject);
                updateAttendanceTable();
                saveAttendanceData(); // Save after marking attendance
            } else {
                alert('Maximum classes reached for this subject!');
            }
        } else {
            alert('Please select student, subject and date!');
        }
    });

    markAbsentBtn.addEventListener('click', () => {
        const student = studentSelect.value;
        const subject = subjectSelect.value;
        const date = attendanceDate.value;

        if (student && subject && date) {
            if (!validateAttendanceDate(date)) {
                alert('Cannot mark attendance for past dates!');
                return;
            }

            if (checkAttendanceExists(student, subject, date)) {
                alert('Attendance already marked for this date!');
                return;
            }

            if (attendanceData[subject][student].classesHeld < attendanceData[subject][student].total) {
                attendanceData[subject][student].dates.push({
                    date: date,
                    status: 'Absent'
                });
                updateAttendanceCount(student, subject);
                updateAttendanceTable();
                saveAttendanceData(); // Save after marking attendance
            } else {
                alert('Maximum classes reached for this subject!');
            }
        } else {
            alert('Please select student, subject and date!');
        }
    });

    // Logout button
    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        document.querySelector('.container').classList.remove('hidden');
        dashboard.classList.add('hidden');
        loginForm.reset();
    });

    // Update teacher list
    function updateTeacherList() {
        teacherList.innerHTML = '';
        users.teachers.forEach(teacher => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${teacher.name}</td>
                <td>${teacher.username}</td>
                <td>${teacher.subject}</td>
                <td>
                    <button class="remove-btn" onclick="removeTeacher('${teacher.username}')">Remove</button>
                </td>
            `;
            teacherList.appendChild(row);
        });
    }

    // Update student list
    function updateStudentList() {
        studentList.innerHTML = '';
        users.students.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.name}</td>
                <td>${student.username}</td>
                <td>
                    <button class="remove-btn" onclick="removeStudent('${student.username}')">Remove</button>
                </td>
            `;
            studentList.appendChild(row);
        });
    }

    // Add teacher
    addTeacherBtn.addEventListener('click', () => {
        const name = document.getElementById('teacherName').value;
        const username = document.getElementById('teacherUsername').value;
        const password = document.getElementById('teacherPassword').value;
        let subject;

        if (subjectType.value === 'custom') {
            subject = customSubject.value.trim();
            if (!subject) {
                alert('Please enter a subject name!');
                return;
            }
        } else {
            subject = teacherSubject.value;
        }

        if (name && username && password && subject) {
            if (users.teachers.some(t => t.username === username)) {
                alert('Username already exists!');
                return;
            }

            // Check if subject already exists
            const subjectExists = users.teachers.some(t => t.subject === subject);
            if (!subjectExists) {
                // Initialize attendance data for the new subject
                attendanceData[subject] = {};
                users.students.forEach(student => {
                    attendanceData[subject][student.username] = {
                        present: 0,
                        total: 35,
                        dates: []
                    };
                });
            }

            users.teachers.push({
                username,
                password,
                name,
                subject
            });

            saveUserData();
            saveAttendanceData();
            updateTeacherList();
            clearTeacherForm();
        } else {
            alert('Please fill all fields!');
        }
    });

    // Add student
    addStudentBtn.addEventListener('click', () => {
        const name = document.getElementById('studentName').value;
        const username = document.getElementById('studentUsername').value;
        const password = document.getElementById('studentPassword').value;

        if (name && username && password) {
            if (users.students.some(s => s.username === username)) {
                alert('Username already exists!');
                return;
            }

            users.students.push({
                username,
                password,
                name
            });

            // Initialize attendance data for the new student
            Object.keys(attendanceData).forEach(subject => {
                attendanceData[subject][username] = {
                    present: 0,
                    total: 35,
                    dates: []
                };
            });
            saveUserData();
            saveAttendanceData();

            updateStudentList();
            clearStudentForm();
        } else {
            alert('Please fill all fields!');
        }
    });

    // Remove teacher
    function removeTeacher(username) {
        const teacher = users.teachers.find(t => t.username === username);
        if (teacher) {
            users.teachers = users.teachers.filter(t => t.username !== username);
            saveUserData();
            updateTeacherList();
        }
    }

    // Remove student
    function removeStudent(username) {
        users.students = users.students.filter(s => s.username !== username);
        Object.keys(attendanceData).forEach(subject => {
            delete attendanceData[subject][username];
        });
        saveUserData();
        saveAttendanceData();
        updateStudentList();
    }

    // Clear forms
    function clearTeacherForm() {
        document.getElementById('teacherName').value = '';
        document.getElementById('teacherUsername').value = '';
        document.getElementById('teacherPassword').value = '';
        document.getElementById('customSubject').value = '';
        subjectType.value = 'existing';
        customSubject.classList.remove('visible');
        teacherSubject.classList.remove('hidden');
    }

    function clearStudentForm() {
        document.getElementById('studentName').value = '';
        document.getElementById('studentUsername').value = '';
        document.getElementById('studentPassword').value = '';
    }

    // Add this after the existing event listeners
    subjectType.addEventListener('change', () => {
        if (subjectType.value === 'custom') {
            customSubject.classList.add('visible');
            teacherSubject.classList.add('hidden');
        } else {
            customSubject.classList.remove('visible');
            teacherSubject.classList.remove('hidden');
        }
    });

    // Add these functions after the loadAttendanceData function
    function saveUserData() {
        localStorage.setItem('userData', JSON.stringify(users));
    }

    function loadUserData() {
        const savedData = localStorage.getItem('userData');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            users.admin = parsedData.admin || users.admin;
            users.teachers = parsedData.teachers || users.teachers;
            users.students = parsedData.students || users.students;
        }
    }

    // Update the initialization
    function initializeSystem() {
        loadUserData();
        loadAttendanceData();
    }

    // Call initializeSystem instead of loadAttendanceData
    initializeSystem(); 