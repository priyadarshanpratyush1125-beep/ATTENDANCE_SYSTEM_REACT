import { useEffect, useState } from "react";

// values of student that i want to upload.........
const emptyStudentForm = {
  name: "",
  className: "CSE",
  section: "21",
  rollNo: "",
  email: "",
  phone: "",
};
// Admin accounts defined directly in code
const ADMIN_ACCOUNTS = [
  {
    name: "Ayushi Agarwal",
    username: "ayushi.agarwal",
    password: "admin123",
  },
  {
    name: "Ravi Sikka",
    username: "ravi.sikka",
    password: "admin123",
  },
  {
    name: "Alok Patel",
    username: "alok.patel",
    password: "admin123",
  },
  {
    name: "Shipra Gautam",
    username: "shipra.gautam",
    password: "admin123",
  },
  {
    name: "Anil Kumar Dubey",
    username: "anil.dubey",
    password: "admin123",
  },
];
// Address of our Express backend
const API_BASE_URL = "http://localhost:5000/api";
// Base address used to open files served by Express
const BACKEND_BASE_URL = API_BASE_URL.replace(/\/api$/, "");

function App() {
  //actually it controls whether the Add Student form is visible
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);

  //basically ....It Stores the values entered into the form
  const [studentForm, setStudentForm] = useState(emptyStudentForm);

  // Stores the students added during this session....
  const [students, setStudents] = useState([]);
  
  // Controls whether the Student Dashboard is open
  const [isStudentDashboardOpen, setIsStudentDashboardOpen] =
    useState(false);

  
  // Controls whether the Login Page is visible
  const [isLoginPageOpen, setIsLoginPageOpen] = useState(true);

  // Stores messages displayed on the Login Page
  const [loginMessage, setLoginMessage] = useState("");

  // Stores Admin Login details
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  // Controls the Register New Admin form
const [isRegisterAdminOpen, setIsRegisterAdminOpen] =
  useState(false);

// Stores the new admin's form details
const [adminRegisterForm, setAdminRegisterForm] = useState({
  name: "",
  username: "",
  email: "",
  password: "",
});

// Displays registration success or error messages
const [adminRegistrationMessage, setAdminRegistrationMessage] =
  useState("");
  // Stores the authentication token returned by the backend
  const [adminToken, setAdminToken] = useState(""); 

  // Stores Student Login details
  const [studentLogin, setStudentLogin] = useState({
    rollNo: "",
    email: "",
  });


  // Stores the student selected for preview
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // Displays temporary messages in the Student Dashboard
  const [studentPreviewMessage, setStudentPreviewMessage] =
    useState("");
  
  // Controls whether the attendance options are visible
  const [isMyAttendanceOpen, setIsMyAttendanceOpen] =
    useState(false);

  // Controls whether the student's assignment list is visible
  const [isMyAssignmentsOpen, setIsMyAssignmentsOpen] =
  useState(false);

  // Determines which attendance records the student wants to view
  const [studentAttendanceView, setStudentAttendanceView] =
    useState("");



  // Stores success messages(ex-if student succesfully added....)
  const [message, setMessage] = useState("");
  
  // Controls whether the Attendance popup is visible
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);

  // Stores the selected class, section, and date
  const [attendanceFilters, setAttendanceFilters] = useState({
    className: "CSE",
    section: "21",
    date: "",
  });

  // Stores the students shown in the attendance table
  const [attendanceList, setAttendanceList] = useState([]);

  // Stores each student's selected Present/Absent status
  const [attendanceStatus, setAttendanceStatus] = useState({});

  // Stores attendance sessions saved during this app session
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  
  // Load previously saved attendance when React starts
  useEffect(() => {
    const controller = new AbortController();

    const loadAttendance = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/attendance`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load attendance."
          );
        }

        // Convert MongoDB IDs into strings for React
        const records = data.records.map((record) => ({
          ...record,
          id: String(record._id),
          students: record.students.map((student) => ({
            ...student,
            studentId: String(student.studentId),
          })),
        }));

        setAttendanceRecords(records);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error loading attendance:", error);
          setAttendanceMessage(
            "Could not load saved attendance records."
          );
        }
      }
    };

    loadAttendance();

    return () => controller.abort();
  }, []);


  // Tracks whether Show Student Records has been clicked
  const [hasSearchedAttendance, setHasSearchedAttendance] = useState(false);

  // Stores attendance-related messages
  const [attendanceMessage, setAttendanceMessage] = useState("");
  
  // Controls whether the Upload Assignment popup is visible
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false);

  // Stores the file currently selected by the admin
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Stores assignment files added during the current session
  const [assignments, setAssignments] = useState([]);

  // Stores upload success or validation messages
  const [assignmentMessage, setAssignmentMessage] = useState("");
  
  // Controls whether the Delete Student popup is visible
  const [isDeleteStudentOpen, setIsDeleteStudentOpen] = useState(false);

  // Stores the message displayed after deleting a student
  const [deleteMessage, setDeleteMessage] = useState("");
  
  // Load students from the backend when App first loads
  useEffect(() => {
    const controller = new AbortController();

    const loadStudents = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/students`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load students."
          );
        }

        // Convert MongoDB's _id into the id field
        // used by our existing React components
        const backendStudents = data.students.map((student) => ({
          ...student,
          id: String(student._id),
        }));

        setStudents(backendStudents);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error loading students:", error);

          setMessage(
            "Could not load students. Check that the backend and MongoDB are running."
          );
        }
      }
    };

    loadStudents();
    

    // Cancel the request if the component is removed
    return () => controller.abort();
  }, []);

  
  // Load saved assignments from the backend
  useEffect(() => {
    const controller = new AbortController();

    const loadAssignments = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/assignments`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load assignments."
          );
        }

        // Convert MongoDB documents for use in React
        const backendAssignments = data.assignments.map(
          (assignment) => ({
            ...assignment,
            id: String(assignment._id),
            url: `${BACKEND_BASE_URL}${assignment.fileUrl}`,
          })
        );

        setAssignments(backendAssignments);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error loading assignments:", error);
        }
      }
    };

    loadAssignments();

    return () => controller.abort();
  }, []);

  
  // Runs whenever a form field changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setStudentForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setMessage("");
  };

  {/* Runs when the Save Student button is clicked */}
    
  // Save a new student through the backend API
  const handleSaveStudent = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        `${API_BASE_URL}/students`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(studentForm),
        }
      );

      const data = await response.json();

      // Handle backend validation and duplicate errors
      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to save student."
        );
      }

      // Use the student returned by MongoDB
      const savedStudent = {
        ...data.student,
        id: String(data.student._id),
      };

      // Add the successfully saved student to the UI
      setStudents((currentStudents) => [
        savedStudent,
        ...currentStudents.filter(
          (student) => String(student.id) !== savedStudent.id
        ),
      ]);

      // Display the backend's success message
      setMessage(
        `Student record successfully saved for ${savedStudent.name}!`
      );

      // Clear the form after saving
      setStudentForm({ ...emptyStudentForm });
    } catch (error) {
      console.error("Error saving student:", error);

      setMessage(
        error.message || "Could not save student. Please try again."
      );
    }
  };

  
  // Update the selected class, section, or date
  const handleAttendanceFilterChange = (event) => {
    const { name, value } = event.target;

    setAttendanceFilters((currentFilters) => ({
      ...currentFilters,
      [name]: value,
    }));

    // Clear the old results when a filter changes
    setAttendanceList([]);
    setAttendanceStatus({});
    setHasSearchedAttendance(false);
    setAttendanceMessage("");
  };

  // Find students matching the selected class and section
  const handleShowStudentRecords = () => {
    if (!attendanceFilters.date) {
      setAttendanceMessage("Please select an attendance date.");
      setAttendanceList([]);
      setHasSearchedAttendance(false);
      return;
    }

    const matchedStudents = students.filter(
      (student) =>
        student.className === attendanceFilters.className &&
        student.section === attendanceFilters.section
    );

    setAttendanceList(matchedStudents);
    setAttendanceStatus({});
    setHasSearchedAttendance(true);
    setAttendanceMessage("");
  };

  // Record the selected attendance status for one student
  const handleAttendanceStatusChange = (studentId, status) => {
    setAttendanceStatus((currentStatus) => ({
      ...currentStatus,
      [studentId]: status,
    }));

    setAttendanceMessage("");
  };

  // Save attendance for the selected class, section, and date
  
  // Save attendance through the backend API
  const handleSaveAttendance = async () => {
    if (!attendanceFilters.date) {
      setAttendanceMessage("Please select an attendance date.");
      return;
    }

    if (attendanceList.length === 0) {
      setAttendanceMessage("No students are available to mark.");
      return;
    }

    const hasMissingStatus = attendanceList.some(
      (student) => !attendanceStatus[student.id]
    );

    if (hasMissingStatus) {
      setAttendanceMessage(
        "Please select Present or Absent for every student."
      );
      return;
    }

    // Prepare the attendance data to send to Express
    const payload = {
      date: attendanceFilters.date,
      className: attendanceFilters.className,
      section: attendanceFilters.section,

      students: attendanceList.map((student) => ({
        studentId: String(student.id),
        name: student.name,
        rollNo: student.rollNo,
        status: attendanceStatus[student.id],
      })),
    };

    try {
      const response = await fetch(
        `${API_BASE_URL}/attendance`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to save attendance."
        );
      }

      // Use the attendance record returned by MongoDB
      const savedRecord = {
        ...data.record,
        id: String(data.record._id),
        students: data.record.students.map((student) => ({
          ...student,
          studentId: String(student.studentId),
        })),
      };

      // Replace the matching class/section/date session in React state
      setAttendanceRecords((currentRecords) => [
        savedRecord,
        ...currentRecords.filter(
          (record) =>
            !(
              record.date === savedRecord.date &&
              record.className === savedRecord.className &&
              record.section === savedRecord.section
            )
        ),
      ]);

      const presentCount = payload.students.filter(
        (student) => student.status === "Present"
      ).length;

      const absentCount = payload.students.filter(
        (student) => student.status === "Absent"
      ).length;

      setAttendanceMessage(
        `Attendance saved successfully! Present: ${presentCount}, Absent: ${absentCount}.`
      );
    } catch (error) {
      console.error("Error saving attendance:", error);

      setAttendanceMessage(
        error.message || "Unable to save attendance."
      );
    }
  };

  
  // Handle file selection
  const handleAssignmentFileChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setSelectedAssignment(null);
      return;
    }

    // Accept PDF files or images
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    const isImage =
      file.type.startsWith("image/") ||
      /\.(png|jpe?g|gif|webp|bmp)$/i.test(file.name);

    if (!isPdf && !isImage) {
      setSelectedAssignment(null);
      event.target.value = "";
      setAssignmentMessage("Please select a PDF or image file.");
      return;
    }

    setSelectedAssignment(file);
    setAssignmentMessage("");
  };

  // Add the selected assignment to the current session
  
  // Upload an assignment to the backend
  const handleUploadAssignment = async (event) => {
    event.preventDefault();

    if (!selectedAssignment) {
      setAssignmentMessage(
        "Please select a PDF or image file first."
      );
      return;
    }

    // Keep the form reference before awaiting the request
    const form = event.currentTarget;

    try {
      // Prepare the selected file for upload
      const formData = new FormData();
      formData.append("file", selectedAssignment);

      const response = await fetch(
        `${API_BASE_URL}/assignments`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to upload assignment."
        );
      }

      // Use the assignment returned by the backend
      const savedAssignment = {
        ...data.assignment,
        id: String(data.assignment._id),
        url: `${BACKEND_BASE_URL}${data.assignment.fileUrl}`,
      };

      // Update the assignment list displayed in React
      setAssignments((currentAssignments) => [
        savedAssignment,
        ...currentAssignments.filter(
          (assignment) =>
            String(assignment.id) !== savedAssignment.id
        ),
      ]);

      setAssignmentMessage(
        `Assignment uploaded successfully: ${savedAssignment.name}`
      );

      // Clear the file input after a successful upload
      setSelectedAssignment(null);
      form.reset();
    } catch (error) {
      console.error("Error uploading assignment:", error);

      setAssignmentMessage(
        error.message || "Unable to upload the assignment."
      );
    }
  };

  
  // Delete a student from the active student list
  
  // Delete a student permanently through the backend API
  const handleDeleteStudent = async (studentId) => {
    const id = String(studentId);

    // Find the student selected for deletion
    const studentToDelete = students.find(
      (student) => String(student.id) === id
    );

    if (!studentToDelete) {
      setDeleteMessage("Student not found in the current list.");
      return;
    }

    // Ask for confirmation before deleting
    const shouldDelete = window.confirm(
      `Are you sure you want to delete ${studentToDelete.name}?`
    );

    if (!shouldDelete) {
      return;
    }

    try {
      // Send the DELETE request to Express
      const response = await fetch(
        `${API_BASE_URL}/students/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      // Do not update the UI if the backend reports an error
      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to delete student."
        );
      }

      // Remove the deleted student from React state
      setStudents((currentStudents) =>
        currentStudents.filter(
          (student) => String(student.id) !== id
        )
      );

      // Remove the student from any currently displayed list
      setAttendanceList((currentList) =>
        currentList.filter(
          (student) => String(student.id) !== id
        )
      );

      // Remove the student's selected attendance status
      setAttendanceStatus((currentStatus) => {
        const updatedStatus = { ...currentStatus };
        delete updatedStatus[id];
        return updatedStatus;
      });

      // Clear the selected student if it matches the deleted record
      setSelectedStudentId((currentId) =>
        currentId === id ? "" : currentId
      );

      // Show the success message
      setDeleteMessage(
        `Student ${studentToDelete.name} deleted successfully.`
      );
    } catch (error) {
      console.error("Error deleting student:", error);

      setDeleteMessage(
        error.message || "Could not delete student. Please try again."
      );
    }
  };

// Register a new admin in MongoDB
const handleRegisterAdmin = async (event) => {
  event.preventDefault();
  setAdminRegistrationMessage("");

  if (!adminToken) {
    setAdminRegistrationMessage(
      "Please log in again before registering an admin."
    );
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(adminRegisterForm),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Unable to register the admin."
      );
    }

    setAdminRegistrationMessage(
      `Admin ${data.admin.name} registered successfully!`
    );

    // Clear the form after successful registration
    setAdminRegisterForm({
      name: "",
      username: "",
      email: "",
      password: "",
    });
  } catch (error) {
    console.error("Admin registration error:", error);

    setAdminRegistrationMessage(
      error.message || "Registration failed. Please try again."
    );
  }
};
// Handle Admin Login through the backend API
const handleAdminLogin = async (event) => {
  event.preventDefault();
  setLoginMessage("");

  try {
    const response = await fetch(
      `${API_BASE_URL}/admin/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: adminUsername.trim(),
          password: adminPassword,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Invalid admin username or password."
      );
    }

    // Save the token returned by the backend
    setAdminToken(data.token);

    // Open the existing Admin Dashboard
    setIsLoginPageOpen(false);
    setIsStudentDashboardOpen(false);
    setLoginMessage("");

    // Clear the login fields
    setAdminUsername("");
    setAdminPassword("");
  } catch (error) {
    console.error("Admin login error:", error);

    setLoginMessage(
      error.message || "Unable to log in. Check the backend connection."
    );
  }
};


  
  // Handle Student Login
  const handleStudentLogin = (event) => {
    event.preventDefault();

    // Find a student matching the entered roll number and email
    const matchedStudent = students.find(
      (student) =>
        String(student.rollNo).trim().toLowerCase() ===
          studentLogin.rollNo.trim().toLowerCase() &&
        student.email.trim().toLowerCase() ===
          studentLogin.email.trim().toLowerCase()
    );

    // Display an error if no matching student exists
    if (!matchedStudent) {
      setLoginMessage(
        "Student not found. Check your roll number and email."
      );
      return;
    }

    // Remember the selected student's ID
    setSelectedStudentId(String(matchedStudent.id));

    // Open the Student Dashboard
    setIsStudentDashboardOpen(true);
    setIsLoginPageOpen(false);

    // Reset the Student Dashboard's temporary view states
    setIsMyAttendanceOpen(false);
    setStudentAttendanceView("");
    setIsMyAssignmentsOpen(false);
    setStudentPreviewMessage("");
    setLoginMessage("");

    // Clear the login fields
    setStudentLogin({
      rollNo: "",
      email: "",
    });
  };


  // Find the student selected for preview
  const previewStudent = students.find(
    (student) => String(student.id) === selectedStudentId
  );
  
  // Get today's date in local YYYY-MM-DD format
  const now = new Date();

  const todayString =
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  // Get the current year and month, for example 2026-10
  const currentMonth = todayString.slice(0, 7);

  // Get attendance records belonging only to the selected student
  const selectedStudentAttendance = attendanceRecords.flatMap(
    (record) =>
      record.students
        .filter(
          (entry) =>
            String(entry.studentId) === selectedStudentId
        )
        .map((entry) => ({
          ...entry,
          date: record.date,
          className: record.className,
          section: record.section,
        }))
  );

  // Keep records matching today's date
  const todayAttendance = selectedStudentAttendance.filter(
    (record) => record.date === todayString
  );

  // Keep records matching the current calendar month
  const monthlyAttendance = selectedStudentAttendance.filter(
    (record) => record.date.startsWith(currentMonth)
  );

  
  // Show the Login Page first
  if (isLoginPageOpen) {
    return (
      <div className="app login-page">
        <header>
          <h1>Student Attendance System</h1>
          <p>Login to continue</p>
        </header>

        <main className="login-grid">

          {/* Admin Login section */}
          <section className="login-card">
            <h2>Admin Login</h2>

            <form onSubmit={handleAdminLogin}>
              <label>
                Admin Username
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(event) =>
                    setAdminUsername(event.target.value)
                  }
                  placeholder="Enter admin username"
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(event) =>
                    setAdminPassword(event.target.value)
                  }
                  placeholder="Enter password"
                  required
                />
              </label>

              <button type="submit">
                Login as Admin
              </button>
            </form>

           <p className="login-hint">
               Use your registered admin username and password.
          </p>
          </section>

          {/* Student Login section */}
          <section className="login-card">
            <h2>Student Login</h2>

            <form onSubmit={handleStudentLogin}>
              <label>
                Roll Number
                <input
                  type="text"
                  value={studentLogin.rollNo}
                  onChange={(event) =>
                    setStudentLogin((current) => ({
                      ...current,
                      rollNo: event.target.value,
                    }))
                  }
                  placeholder="Enter roll number"
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={studentLogin.email}
                  onChange={(event) =>
                    setStudentLogin((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="Enter registered email"
                  required
                />
              </label>

              <button type="submit">
                Login as Student
              </button>
            </form>

            <p className="login-hint">
              Use the roll number and email added by Admin.
            </p>
          </section>

        </main>

        {/* Display login errors */}
        {loginMessage && (
          <p className="login-message" role="status">
            {loginMessage}
          </p>
        )}
      </div>
    );
  }



  // Display the Student Dashboard when preview is enabled
  if (isStudentDashboardOpen) {
    return (
      <div className="app">
        <header>
          <h1>Student Attendance System</h1>
        </header>

        <main className="student-dashboard">
          <h2>Student Dashboard</h2>

          <p>
            Welcome to the Student Dashboard.
          </p>

          {/* Return to the Admin Dashboard */}
          
<button
  type="button"
  onClick={() => {
    setIsStudentDashboardOpen(false);
    setIsLoginPageOpen(true);

    setSelectedStudentId("");
    setStudentPreviewMessage("");
    setIsMyAttendanceOpen(false);
    setStudentAttendanceView("");
    setIsMyAssignmentsOpen(false);
    setLoginMessage("");
  }}
>
  Logout
</button>


         

          {/* Show the selected student's basic profile */}
          {previewStudent && (
            <section className="student-profile">
              <h3>Welcome, {previewStudent.name}</h3>

              <p>
                <strong>Class:</strong> {previewStudent.className}
              </p>

              <p>
                <strong>Section:</strong> {previewStudent.section}
              </p>

              <p>
                <strong>Roll Number:</strong> {previewStudent.rollNo}
              </p>

              <p>
                <strong>Email:</strong> {previewStudent.email}
              </p>

              {/* These buttons will be implemented in later steps */}
              <div className="student-dashboard-actions">             
                <button
                  type="button"
                  onClick={() => {
                  setIsMyAttendanceOpen((isOpen) => !isOpen);
                  setStudentPreviewMessage("");
                  }}
                >
                  {isMyAttendanceOpen
                   ? "Close My Attendance"
                   : "My Attendance"}
                  </button>

                <button
                  type="button"
                  onClick={() => {
                  setIsMyAssignmentsOpen((isOpen) => !isOpen);
                  setStudentPreviewMessage("");
                }}
                >
                {isMyAssignmentsOpen
                    ? "Close My Assignments"
                    : "My Assignments"}
                </button>

                            
              </div>
              
{/* Attendance options */}
{isMyAttendanceOpen && (
  <section className="student-attendance-options">
    <h3>My Attendance</h3>

    <p>Choose which attendance record you want to view.</p>

    <div className="student-dashboard-actions">
      <button
        type="button"
        onClick={() => {
          setStudentAttendanceView("today");
          setStudentPreviewMessage("");
        }}
      >
        Show Today's Attendance
      </button>

      <button
        type="button"
        onClick={() => {
          setStudentAttendanceView("monthly");
          setStudentPreviewMessage("");
        }}
      >
        Show All Attendance (Monthly)
      </button>
    </div>

    {/* Today's attendance table */}
    {studentAttendanceView === "today" && (
      <section className="student-attendance-results">
        <h4>Today's Attendance</h4>
        <p>Date: {todayString}</p>

        {todayAttendance.length === 0 ? (
          <p>No attendance record found for today.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Class</th>
                <th>Section</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {todayAttendance.map((record, index) => (
                <tr key={`${record.date}-${index}`}>
                  <td>{record.date}</td>
                  <td>{record.className}</td>
                  <td>{record.section}</td>
                  <td>{record.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    )}

    {/* Monthly attendance table */}
    {studentAttendanceView === "monthly" && (
      <section className="student-attendance-results">
        <h4>Monthly Attendance</h4>
        <p>Month: {currentMonth}</p>

        {monthlyAttendance.length === 0 ? (
          <p>No attendance records found for this month.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Class</th>
                <th>Section</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {monthlyAttendance.map((record, index) => (
                <tr key={`${record.date}-${index}`}>
                  <td>{record.date}</td>
                  <td>{record.className}</td>
                  <td>{record.section}</td>
                  <td>{record.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    )}
  </section>
)}


{/* Student assignment list */}
{isMyAssignmentsOpen && (
  <section className="student-assignment-options">
    <h3>My Assignments</h3>

    {assignments.length === 0 ? (
      <p>No assignments have been uploaded yet.</p>
    ) : (
      <ul>
        {assignments.map((assignment) => (
          <li key={assignment.id}>
            <strong>{assignment.name}</strong>
            {" "}
            ({Math.ceil(assignment.size / 1024)} KB)
            {" — "}

            <a
              href={assignment.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open
            </a>

            {" | "}

            <a
              href={assignment.url}
              download={assignment.name}
            >
              Download
            </a>
          </li>
        ))}
      </ul>
    )}

    <p className="assignment-note">
  Assignments are stored by the backend.
</p>
  </section>
)}


              {studentPreviewMessage && (
                <p role="status">
                  {studentPreviewMessage}
                </p>
              )}
            </section>
          )}
        </main>
      </div>
    );
  }
  return (
    <div className="app">
      <header>
        <h1>Student Attendance System</h1>
      </header>
      
  
<button
  type="button"
  onClick={() => {
    setIsLoginPageOpen(true);
    setLoginMessage("");
  }}
>
  Logout
</button>



      <main>
        <h2>Admin Dashboard</h2>
        {/* Register New Admin button */}
<button
  type="button"
  onClick={() => {
    setIsRegisterAdminOpen((isOpen) => !isOpen);
    setAdminRegistrationMessage("");
  }}
>
  {isRegisterAdminOpen
    ? "Close Registration Form"
    : "Register New Admin"}
</button>
        {/* Button to open or close the form */}
          <button
          type="button"
          onClick={() => {
            setIsAddStudentOpen((isOpen) => !isOpen);
            setMessage("");
          }}
        >
          {isAddStudentOpen
            ? "Close Add Student Form"
            : "Add Student"}
        </button>
        
  <button
    type="button"
    onClick={() => {
      setIsAttendanceOpen(true);
      setMessage("");
      setAttendanceMessage("");
      setAttendanceList([]);
      setAttendanceStatus({});
      setHasSearchedAttendance(false);
    }}
  >
    Attendance
  </button>
  
<button
  type="button"
  onClick={() => {
    setIsAssignmentOpen(true);
    setAssignmentMessage("");
  }}
>
  Upload Assignment
</button>

<button
  type="button"
  onClick={() => {
    setIsDeleteStudentOpen(true);
    setDeleteMessage("");
  }}
>
  Delete Student
</button>



  <p className="record-count">
    Attendance sessions saved in this session: {attendanceRecords.length}
  </p>

        {/* Display the form only when the button is clicked */}
        {isAddStudentOpen && (
          <section className="form-section">
            <h3>Add Student</h3>

            <form onSubmit={handleSaveStudent}>
              <label>
                Student Name
                <input
                  type="text"
                  name="name"
                  value={studentForm.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Class
                <select
                  name="className"
                  value={studentForm.className}
                  onChange={handleChange}
                  required
                >
                  <option value="CSE">CSE</option>
                  <option value="ECE">ECE</option>
                  <option value="IT">IT</option>
                </select>
              </label>

              <label>
                Section
                <select
                  name="section"
                  value={studentForm.section}
                  onChange={handleChange}
                  required
                >
                  <option value="21">21</option>
                  <option value="22">22</option>
                  <option value="23">23</option>
                </select>
              </label>

              <label>
                Roll Number
                <input
                  type="text"
                  name="rollNo"
                  value={studentForm.rollNo}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={studentForm.email}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Phone Number
                <input
                  type="tel"
                  name="phone"
                  value={studentForm.phone}
                  onChange={handleChange}
                  required
                />
              </label>

              <button type="submit">
                Save Student
              </button>
            </form>
          </section>
        )}
        {/*Show a message after saving.....*/}
        {message && (
          <p className="success-message" role="status">
            {message}
          </p>
        )}

        {/*Show students currently stored in React state...*/}
        {students.length > 0 && (
          <section>
            <h3>Added Students</h3>

            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Roll Number</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.className}</td>
                    <td>{student.section}</td>
                    <td>{student.rollNo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
        
  {/* Upload Assignment popup */}
  {isAssignmentOpen && (
    <div className="modal-backdrop">
      <section
        className="assignment-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="assignment-title"
      >
        <div className="modal-heading">
          <h3 id="assignment-title">Upload Assignment</h3>

          <button
            type="button"
            onClick={() => setIsAssignmentOpen(false)}
          >
            Close
          </button>
        </div>

        <form
          className="assignment-form"
          onSubmit={handleUploadAssignment}
        >
          <label htmlFor="assignmentFile">
            Select PDF or Image
          </label>

          <input
            id="assignmentFile"
            name="assignmentFile"
            type="file"
            accept="application/pdf,image/*"
            onChange={handleAssignmentFileChange}
          />

          {selectedAssignment && (
            <p>
              Selected file: {selectedAssignment.name}
            </p>
          )}

          <button type="submit">
            Upload Assignment
          </button>
        </form>

        {/* Show upload success or error messages */}
        {assignmentMessage && (
          <p className="assignment-message" role="status">
            {assignmentMessage}
          </p>
        )}

        {/* Display assignments added in the current session */}
        {assignments.length > 0 && (
          <section className="assignment-list">
            <h4>Assignments Added</h4>

            <ul>
              {assignments.map((assignment) => (
                <li key={assignment.id}>
                  {assignment.name}
                  {" "}
                  ({Math.ceil(assignment.size / 1024)} KB)
                </li>
              ))}
            </ul>
          </section>
        )}
      </section>
    </div>
  )}

      </main>
      
  {/* Delete Student popup */}
  {isDeleteStudentOpen && (
    <div className="modal-backdrop">
      <section
        className="delete-student-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-student-title"
      >
        {/* Popup heading and close button */}
        <div className="modal-heading">
          <h3 id="delete-student-title">
            Delete Student
          </h3>

          <button
            type="button"
            onClick={() => setIsDeleteStudentOpen(false)}
          >
            Close
          </button>
        </div>

        {/* Display deletion messages */}
        {deleteMessage && (
          <p className="delete-message" role="status">
            {deleteMessage}
          </p>
        )}

        {/* Show a message if there are no students */}
        {students.length === 0 ? (
          <p>No students have been added yet.</p>
        ) : (
          <div className="delete-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Roll Number</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.className}</td>
                    <td>{student.section}</td>
                    <td>{student.rollNo}</td>
                    <td>{student.email}</td>
                    <td>{student.phone}</td>

                    <td>
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() =>
                          handleDeleteStudent(student.id)
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )}

      
  {/* Attendance popup */}
  {isAttendanceOpen && (
    <div className="modal-backdrop">
      <section
        className="attendance-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="attendance-title"
      >
        <div className="modal-heading">
          <h3 id="attendance-title">Mark Attendance</h3>

          <button
            type="button"
            onClick={() => setIsAttendanceOpen(false)}
          >
            Close
          </button>
        </div>

        {/* Filters for class, section, and date */}
        <div className="attendance-filters">
          <label>
            Class
            <select
              name="className"
              value={attendanceFilters.className}
              onChange={handleAttendanceFilterChange}
            >
              <option value="CSE">CSE</option>
              <option value="ECE">ECE</option>
              <option value="IT">IT</option>
            </select>
          </label>

          <label>
            Section
            <select
              name="section"
              value={attendanceFilters.section}
              onChange={handleAttendanceFilterChange}
            >
              <option value="21">21</option>
              <option value="22">22</option>
              <option value="23">23</option>
            </select>
          </label>

          <label>
            Date
            <input
              type="date"
              name="date"
              value={attendanceFilters.date}
              onChange={handleAttendanceFilterChange}
            />
          </label>
        </div>

        {/* Find matching students */}
        <button
          type="button"
          onClick={handleShowStudentRecords}
        >
          Show Student Records
        </button>

        {/* Display a message if no matching students exist */}
        {hasSearchedAttendance && attendanceList.length === 0 && (
          <p>No students found for this class and section.</p>
        )}

        {/* Show the attendance table when students are found */}
        {attendanceList.length > 0 && (
          <section className="attendance-table-section">
            <h4>Student Records</h4>

            <p>
              Class: {attendanceFilters.className} |
              Section: {attendanceFilters.section} |
              Date: {attendanceFilters.date}
            </p>

            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Roll Number</th>
                  <th>Attendance</th>
                </tr>
              </thead>

              <tbody>
                {attendanceList.map((student) => (
                  <tr key={student.id}>
                    <td>{student.name}</td>
                    <td>{student.rollNo}</td>

                    <td>
                      <select
                        value={attendanceStatus[student.id] || ""}
                        onChange={(event) =>
                          handleAttendanceStatusChange(
                            student.id,
                            event.target.value
                          )
                        }
                        aria-label={`Attendance status for ${student.name}`}
                      >
                        <option value="">Select status</option>
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              type="button"
              onClick={handleSaveAttendance}
            >
              Save Attendance
            </button>
          </section>
        )}

        {/* Show validation and save messages inside the popup */}
        {attendanceMessage && (
          <p className="attendance-message" role="status">
            {attendanceMessage}
          </p>
        )}
      </section>
    </div>
  )}

    </div>
  );
}

export default App;
