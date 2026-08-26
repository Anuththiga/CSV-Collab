# CSV Data Collaboration Application

A full-stack web application for uploading CSV files, storing the data in PostgreSQL, browsing and searching records with pagination, editing records, and synchronizing changes between multiple browser sessions in real time using Socket.IO.

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Socket.IO Client
* CSS

### Backend

* Node.js
* Express
* TypeScript
* Sequelize
* Socket.IO
* fast-csv
* Multer

### Database

* PostgreSQL

---

## Features

### 1. CSV Upload

Users can upload a CSV file through the web interface.

The application:

* Accepts CSV files through a multipart upload.
* Stores the uploaded file temporarily on the server.
* Validates required columns.
* Validates data types.
* Validates email addresses.
* Detects duplicate IDs within the uploaded CSV.
* Prevents invalid data from being inserted.
* Stores valid records in PostgreSQL.
* Displays upload success/error feedback.

### Required CSV Columns

The CSV file must contain:

```text
id
postId
name
email
```

Example:

```csv
id,postId,name,email
1,101,John,john@example.com
2,102,Jane,jane@example.com
3,103,David,david@example.com
```

---

## 2. CSV Validation

The backend validates the uploaded data before inserting it into the database.

### Header Validation

The following columns are required:

```text
id
postId
name
email
```

If a required column is missing, the upload is rejected.

### ID Validation

`id` must be an integer.

Example of invalid data:

```csv
id,postId,name,email
abc,101,alias odio sit,john@example.com
```

### Duplicate ID Validation

IDs must be unique within the uploaded CSV.

Example:

```csv
id,postId,name,email
1,101,alias odio sit,john@example.com
1,102,Jane,jane@example.com
```

The upload will be rejected because ID `1` appears twice.

### Name Validation

Name cannot be empty.

### Email Validation

Email must be present and follow a valid email format.

---

## 3. PostgreSQL Database

CSV records are stored in PostgreSQL.

Each post contains fields such as:

```text
id
postId
name
email
pendingData
version
createdAt
updatedAt
updatedBy
```

### Version

The `version` field is used for optimistic concurrency control.

Every successful update increments the version.

Example:

```text
Initial:
version = 1

After update:
version = 2

After another update:
version = 3
```

This allows the backend to detect when two browser sessions are editing different versions of the same record.

---

## 4. List Records

The frontend displays uploaded records in a table.

The API supports pagination.

Example:

```http
GET /api/posts?page=1&limit=10
```

The response contains:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Pagination Limits

The backend ensures:

* Page is at least `1`.
* Limit is at least `1`.
* Maximum limit is `100`.
* Default limit is `10`.

---

## 5. Search

Records can be searched by:

* Name
* Email

Example:

```http
GET /api/posts?page=1&limit=10&search=john
```

PostgreSQL `ILIKE` is used for case-insensitive searching.

The frontend uses a `300ms` debounce before sending the search request to avoid unnecessary API calls.

---

## 6. Edit Records

Records can be edited directly from the table.

The user can:

* Click `Edit`.
* Modify the name.
* Modify the email.
* Click `Save`.
* Click `Cancel`.

The update API is:

```http
PUT /api/posts/:id
```

Example request:

```json
{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "version": 1
}
```

The backend updates the record and increments the version.

---

## 7. Real-Time Collaboration

The application uses Socket.IO to synchronize changes between multiple browser sessions.

When a record is successfully updated:

```text
Browser A
    |
    | PUT /api/posts/:id
    v
Backend
    |
    | Update PostgreSQL
    |
    | Socket.IO
    v
Browser B
```

Browser B receives the updated record without refreshing the page.

The Socket.IO event is:

```text
post:updated
```

Example:

```ts
socket.on('post:updated', (updatedPost) => {
    // Update the local table
});
```

---

## 8. Optimistic Concurrency Control

The application uses the `version` field to detect conflicting edits.

### Example

Initial database state:

```text
id = 1
name = John
version = 1
```

Both Browser A and Browser B load version `1`.

### Browser A

Browser A changes:

```text
John → Johnny
```

and sends:

```json
{
  "name": "Johnny",
  "version": 1
}
```

The database currently contains version `1`, so the update succeeds.

The database becomes:

```text
name = Johnny
version = 2
```

### Browser B

Browser B still has version `1`.

It changes:

```text
John → Jonathan
```

and sends:

```json
{
  "name": "Jonathan",
  "version": 1
}
```

The backend compares:

```text
Client version:   1
Database version: 2
```

Because the versions do not match, the backend returns:

```http
409 Conflict
```

This prevents Browser B from silently overwriting Browser A's changes.

---

## 9. Conflict Data

When a conflict occurs, the backend returns both versions.

Example:

```json
{
  "message": "Conflict detected. This post was already updated.",
  "conflict": true,
  "data": {
    "current": {
      "id": 1,
      "name": "Johnny",
      "email": "john@example.com",
      "version": 2
    },
    "requested": {
      "name": "Jonathan",
      "email": "john@example.com",
      "version": 1
    }
  }
}
```

The frontend converts the `409` response into a `ConflictError`.

---

## 10. Conflict Diff UI

The application provides a conflict modal showing:

```text
Current Version        Your Changes
------------------------------------
Johnny                 Jonathan
john@example.com       john@example.com
Version 2              Version 1
```

The user can see what was changed by another browser compared with their own changes.

The UI provides options such as:

```text
Keep Current
Keep My Changes
Cancel
```

### Current Status

The conflict detection and diff information are implemented.

The final conflict resolution actions still need to be connected to the backend.

---

## 11. Conflict Resolution

The intended final flow is:

```text
User A
  |
  | Update record
  v
Database version 2
  |
  | Socket.IO
  v
User B sees latest version
```

If User B was editing an older version:

```text
User B
  |
  | Save version 1
  v
Backend
  |
  | Database is version 2
  v
409 Conflict
  |
  v
Conflict UI
  |
  +---- Keep Current
  |
  +---- Keep My Changes
  |
  +---- Cancel
```

When the user chooses a version, the selected version should be saved and broadcast through Socket.IO so that all connected browsers are updated.

---

# API Endpoints

## Upload CSV

```http
POST /api/csv/upload
```

Form-data:

```text
file: <CSV file>
```

---

## Get Posts

```http
GET /api/posts
```

Query parameters:

```text
page
limit
search
```

Example:

```http
GET /api/posts?page=1&limit=10&search=john
```

---

## Update Post

```http
PUT /api/posts/:id
```

Request:

```json
{
  "name": "Updated Name",
  "email": "updated@example.com",
  "version": 1
}
```

Possible responses:

```text
200 OK
400 Bad Request
404 Not Found
409 Conflict
500 Internal Server Error
```

# Running the Backend

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:8080
```

---

# Running the Frontend

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The Vite development server normally runs on:

```text
http://localhost:5173
```

---

# CORS

The backend allows the frontend origin:

```text
http://localhost:5173
```

Express CORS:

```ts
app.use(
    cors({
        origin: 'http://localhost:5173',
    })
);
```

Socket.IO also uses the same origin:

```ts
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
    },
});
```

---

# Testing Real-Time Collaboration

To test real-time updates:

1. Start the backend.
2. Start the frontend.
3. Open the application in Browser A.
4. Open the same application in Browser B.
5. Confirm both browsers display the same dataset.
6. Edit a record in Browser A.
7. Save the record.
8. Browser B should update automatically without refreshing.
9. Confirm the version number changes in both browsers.

---

# Testing Conflict Detection

1. Open Browser A and Browser B.
2. Load the same record.
3. Click `Edit` on the same record in both browsers.
4. Browser A changes the record.
5. Browser A saves.
6. Browser B changes its older version.
7. Browser B clicks `Save`.
8. The backend should return `409 Conflict`.
9. The frontend should display the conflict information.
10. The user can compare the current database version with their changes.

---

# Security and Validation Considerations

The application currently performs server-side CSV validation.

Recommended additional production considerations include:

* File size limits.
* CSV row limits.
* Authentication and authorization.
* Rate limiting.
* Stronger input sanitization.
* Database transactions for bulk imports.
* Unique database constraints.
* Secure file storage.
* Validation of MIME type and file extension.
* Audit logging.
* User-specific `updatedBy` values instead of a hardcoded user.

The REST API handles data operations such as uploading, searching, pagination, and updating records.

Socket.IO handles real-time synchronization between connected browser sessions.

The `version` field provides optimistic concurrency control so that an older browser session cannot silently overwrite a newer version of a record.
