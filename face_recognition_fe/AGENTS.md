# Next.js Frontend Agent Rules (face_recognition_fe)

These are the strict architectural and styling rules for implementing features in this frontend. Any AI Agent modifying this codebase MUST follow these patterns without exception.

---

## 1. Directory Structure

All files must strictly align with the following directory structure:
- **Domain Layer (`src/domain/`)**:
  - Domain Models (Entities): `src/domain/models/{model_name}.js`
  - Repository Interfaces: `src/domain/repositories/{model_name}-repository.interface.js`
  - Use Cases: `src/domain/usecases/{usecase_name}.js`
- **Data Layer (`src/data/`)**:
  - Data Transfer Objects (DTOs): `src/data/dto/{model_name}_dto.js`
  - Mappers: `src/data/mappers/{model_name}-mapper.js`
  - DataSources: `src/data/datasources/{model_name}-datasource.js`
  - Repository Implementations: `src/data/repositories/{model_name}-repository.js`
- **Presentation Layer (`src/viewmodels/` & `src/components/` & `src/app/`)**:
  - ViewModels (React Hooks): `src/viewmodels/use-{model_name}-viewmodel.js`
  - Pages & Routes (Next.js): `src/app/page.js`
  - Components: `src/components/{component_name}.js`

---

## 2. Nullable Field Rule for DTOs & Zod Validation

- **Zod Validation**: All DTO files must define a Zod schema to validate response data from backend.
- **Resilience**: Make sure properties in DTO schema are marked as optional/nullable to prevent runtime crashes if backend responses change format.
- **Safe Defaults**: Mappers must convert DTOs to Domain models, providing safe defaults (e.g., `?? ""` or `?? []`).

---

## 3. Strict Data Flow (view => viewModel => useCase => repository => dataSource)

- **Strict Separation of Concerns**: Any data querying, fetching, or mutation must strictly flow through:
  $$\text{view} \implies \text{viewModel} \implies \text{useCase} \implies \text{repository} \implies \text{dataSource}$$
- **Components/Views**: Trigger actions and bind to the exposed state of the ViewModel. They must NEVER call UseCases, Repositories, DataSources, or API helpers directly.
- **ViewModels**: Manage view state, loading state, error states, and camera stream references.
- **UseCases**: Encapsulate the core application business rules and query options.
- **Repositories**: Map data DTOs into Domain Entities.
- **DataSources**: Abstract raw data retrieval (HTTP or WebSocket connections).
- **Index Exports**: Every directory inside domain and data layer should contain an `index.js` exporting sibling files to maintain clean imports.
