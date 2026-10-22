## What I've Done So Far

I have created a separate `backend` folder inside the main project..... Keeping the backend separate from React helps me understand how the frontend and backend
I set up a basic Express server, installed the required packages, configured the development scripts, and added a test API endpoint to check whether the backend is working.

## Technologies and Packages

- **Node.js** — Runs JavaScript outside the browser and allows me to build the backend.
- **Express.js** — Helps create the server and define API endpoints without writing everything from scratch.
- **CORS** — Allows my React frontend, running on a different local port, to send requests to the backend.
- **dotenv** — Loads environment variables from a `.env` file, which will be useful when configuring the database connection.
- **Nodemon** — Automatically restarts the backend server when I make changes during development.

## Project Structure

```c
backend/
├── node_modules/
├── package.json
├── package-lock.json
├── .gitignore
└── server.js
```

`node_modules/` contains the installed packages. It is excluded from Git, while `package.json` and `package-lock.json` keep track of the project's dependencies.

## Understanding `server.js`

The `server.js` file is the entry point of my backend. It brings together the basic configuration needed to receive HTTP requests and send responses.

Here's what I've implemented so far:

**1. Importing packages**

I've used ES module imports to bring in Express, CORS, and dotenv configuration.

**2. Creating the Express application**

The Express application is created using `express()`. I've also configured the server to use port `5000` by default, unless another port is provided through an environment variable.

**3. Configuring middleware**

I've added CORS configuration for my local React application at `http://localhost:5173` and enabled `express.json()` so the server can read JSON request bodies.

**4. Creating a basic route**

The root route (`/`) displays a simple message confirming that the backend server is running.

**5. Creating a health-check API**

The `GET /api/health` endpoint returns a JSON response confirming that the API is working. This gives me a simple way to test the backend before connecting it to the frontend.

**6. Starting the server**

Finally, `app.listen()` starts the server and listens for incoming requests on the configured port.

## Running the Backend

From the `backend` directory, I can start the development server using:

```bash
npm run dev
```

To run it without Nodemon, I can use:

```bash
npm start
```

Once the server is running, I can test these URLs in my browser:

- `http://localhost:5000` — Checks the basic server route.
- `http://localhost:5000/api/health` — Checks the API health endpoint.

The health endpoint returns:

```json
{
  "success": true,
  "message": "Backend API is working"
}
```

## What I Learned

This stage helped me understand that a backend is more than just another folder in a project. It is a separate application that listens for requests, processes them, and sends responses.

I also learned why dependencies, middleware, API routes, environment variables, and package configuration matter when setting up a Node.js project.

