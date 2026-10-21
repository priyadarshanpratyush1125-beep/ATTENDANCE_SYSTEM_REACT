
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

  // Stores success messages(ex-if student succesfully added....)
  const [message, setMessage] = useState("");

  // Runs whenever a form field changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setStudentForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setMessage("");
  };

  // Runs when the Save Student button is clicked
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

    // Clear the form after saving
    setStudentForm({ ...emptyStudentForm });
  };

  return (
    <div className="app">
      <header>
        <h1>Student Attendance System</h1>
      </header>

      <main>
        <h2>Admin Dashboard</h2>
        // Button to open or close the form
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
        // Display the form only when the button is clicked
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

        // Show a message after saving.....
        {message && (
          <p className="success-message" role="status">
            {message}
          </p>
        )}

        //Show students currently stored in React state...
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
      </main>
    </div>
  );
}

export default App;
