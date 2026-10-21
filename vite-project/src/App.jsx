
import { useState } from "react";
import "./App.css";

// values of student that i want to upload.........
const emptyStudentForm = {
  name: "",
  className: "CSE",
  section: "21",
  rollNo: "",
  email: "",
  phone: "",
};

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

  // Stores the student selected for preview
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // Displays temporary messages in the Student Dashboard
  const [studentPreviewMessage, setStudentPreviewMessage] =
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
    const handleSaveStudent = (event) => {
    event.preventDefault();

    const newStudent = {
      id: Date.now(),
      ...studentForm,
    };

    setStudents((currentStudents) => [
      ...currentStudents,
      newStudent,
    ]);

    setMessage(
      `Student record successfully saved for ${studentForm.name}!`
    );

    {/*Clear the form after saving */}
    setStudentForm({ ...emptyStudentForm });
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
  const handleSaveAttendance = () => {
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

    const newRecord = {
      id: Date.now(),
      date: attendanceFilters.date,
      className: attendanceFilters.className,
      section: attendanceFilters.section,

      students: attendanceList.map((student) => ({
        studentId: student.id,
        name: student.name,
        rollNo: student.rollNo,
        status: attendanceStatus[student.id],
      })),
    };

    // Replace an existing record for the same class, section, and date
    setAttendanceRecords((currentRecords) => {
      const otherRecords = currentRecords.filter(
        (record) =>
          !(
            record.className === newRecord.className &&
            record.section === newRecord.section &&
            record.date === newRecord.date
          )
      );

      return [...otherRecords, newRecord];
    });

    const presentCount = attendanceList.filter(
      (student) => attendanceStatus[student.id] === "Present"
    ).length;

    const absentCount = attendanceList.filter(
      (student) => attendanceStatus[student.id] === "Absent"
    ).length;

    setAttendanceMessage(
      `Attendance saved successfully! Present: ${presentCount}, Absent: ${absentCount}.`
    );
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
  const handleUploadAssignment = (event) => {
    event.preventDefault();

    if (!selectedAssignment) {
      setAssignmentMessage("Please select a PDF or image file first.");
      return;
    }

    const newAssignment = {
      id: Date.now(),
      name: selectedAssignment.name,
      type: selectedAssignment.type,
      size: selectedAssignment.size,
      file: selectedAssignment,
    };

    setAssignments((currentAssignments) => [
      ...currentAssignments,
      newAssignment,
    ]);

    setAssignmentMessage(
      `Assignment uploaded successfully: ${selectedAssignment.name}. This demo stores it only for the current session.`
    );

    // Clear the selected file after adding it
    setSelectedAssignment(null);
    event.currentTarget.reset();
  };
  
  // Delete a student from the active student list
  const handleDeleteStudent = (studentId) => {
    // Find the student selected for deletion
    const studentToDelete = students.find(
      (student) => student.id === studentId
    );

    // Stop if the student does not exist
    if (!studentToDelete) {
      return;
    }

    // Ask before deleting the record
    const shouldDelete = window.confirm(
      `Are you sure you want to delete ${studentToDelete.name}?`
    );

    if (!shouldDelete) {
      return;
    }

    // Remove the selected student from the students array
    setStudents((currentStudents) =>
      currentStudents.filter(
        (student) => student.id !== studentId
      )
    );

    // Remove the student from any currently displayed attendance list
    setAttendanceList((currentList) =>
      currentList.filter(
        (student) => student.id !== studentId
      )
    );

    // Remove the student's currently selected attendance status
    setAttendanceStatus((currentStatus) => {
      const updatedStatus = { ...currentStatus };
      delete updatedStatus[studentId];
      return updatedStatus;
    });

    // Display the success message
    setDeleteMessage(
      `Student ${studentToDelete.name} deleted successfully.`
    );
  };
  
  // Find the student selected for preview
  const previewStudent = students.find(
    (student) => String(student.id) === selectedStudentId
  );

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
              setStudentPreviewMessage("");
            }}
          >
            Back to Admin Dashboard
          </button>

          <section className="student-selector-section">
            <h3>Select Student</h3>

            <label htmlFor="previewStudent">
              Choose a student for preview
            </label>

            <select
              id="previewStudent"
              value={selectedStudentId}
              onChange={(event) => {
                setSelectedStudentId(event.target.value);
                setStudentPreviewMessage("");
              }}
            >
              <option value="">-- Select a student --</option>

              {students.map((student) => (
                <option
                  key={student.id}
                  value={String(student.id)}
                >
                  {student.name} - {student.rollNo}
                </option>
              ))}
            </select>

            {students.length === 0 && (
              <p>
                No students found. Go to the Admin Dashboard
                and add a student first.
              </p>
            )}
          </section>

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
                  onClick={() =>
                    setStudentPreviewMessage(
                      "My Attendance will be implemented in Step 6."
                    )
                  }
                >
                  My Attendance
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setStudentPreviewMessage(
                      "My Assignments will be implemented in Step 9."
                    )
                  }
                >
                  My Assignments
                </button>
              </div>

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
      setIsStudentDashboardOpen(true);
      setSelectedStudentId("");
      setStudentPreviewMessage("");
    }}
  >
    Preview Student Dashboard
  </button>


      <main>
        <h2>Admin Dashboard</h2>
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
