# Workspace Agent Rules (Đồ án)

These rules define the coding standards for this workspace, aligning with Clean Architecture on the Next.js frontend and Layered Architecture on the Go backend.

## Next.js Frontend Rules (face_recognition_fe)
- **Domain Layer (`src/domain/`)**: Pure business logic, entities (models), and repository interfaces. Must not import presentation layer or data layer.
- **Data Layer (`src/data/`)**: Data Transfer Objects (DTOs) with Zod validation, mappers with safe fallback values, datasources (HTTP/WS API calls), and repository concrete implementations.
- **Presentation Layer (`src/viewmodels/`, `src/components/`, `src/app/`)**: Components, page views, and ViewModels (custom React hooks). Components must not call datasources or usecases directly, only bind to ViewModel states.
- **Export standard**: Use folder-level `index.js` exports to simplify imports.

## Go Backend Rules (face_recognition_be)
- **Layered Structure**: Separation of Controllers/Handlers (`internal/app/handler/`), Services (`internal/app/service/`), DTOs (`internal/app/dto/`), Config (`internal/app/config/`), and Utils (`internal/app/utils/`).
- **No inline DB calls or pipeline execution inside handlers**: Keep controllers clean; delegate execution to service layers.
- **CORS**: Always ensure CORS headers are properly sent to allow local React development.
