## at this point  PROBLEM is solved as  i have created database basically main cause is our Student Attendance System currently stores students using React state:

const [students, setStudents] = useState([]);
The problem is that this array exists only while your React application is running. Refreshing the browser clears the student records.
i add a database to store the records permanently.