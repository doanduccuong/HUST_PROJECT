# Golang Backend Agent Rules (face_recognition_be)

These are the strict architectural and styling rules for implementing features in this backend. Any AI Agent modifying this codebase MUST follow these patterns without exception.

---

## 1. Architectural Integrity

We strictly enforce the **Layered Architecture (Handler-Service-DTO)** pattern. Code must be cleanly separated into the following layers inside the `internal/app/` directory:

1. **DTO Layer (`internal/app/dto/`)**
   - Contains all Request/Response payload structures (Data Transfer Objects).
   - *Rule*: Do NOT define DTO structs inline inside the handler files. Move all payload schemas here to maintain a clean boundary.

2. **Service Layer (`internal/app/service/`)**
   - Implements the core business logic (e.g. wrapper around RetinaFace, MaskClassifier, and verification logic).
   - *Rule*: Keep this layer agnostic of the HTTP transport protocol (do not handle `http.ResponseWriter` or `*http.Request`).

3. **Handler / Controller Layer (`internal/app/handler/`)**
   - Receives request inputs via Chi HTTP endpoints.
   - Parses request JSON/parameters, runs basic validation, and calls the service layer.
   - Returns clean JSON responses and maps service errors to standard HTTP status codes.

---

## 2. Go Coding Standards & Idioms

- **Error Handling**: Follow idiomatic Go error handling. Functions in services must return `(Result, error)`. Handlers must check and log errors before responding.
- **Naming Conventions**: Use `camelCase` for JSON keys in API payloads and `PascalCase` for Go struct properties.
- **CORS Middleware**: Ensure all HTTP handlers are wrapped with a CORS middleware to enable easy local development.
