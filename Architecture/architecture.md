# ResQTh System Architecture

## 1. Architecture Overview

ResQTh uses a combination of layered, client-server, MVC, and monolithic architectural styles. These styles are used together because each addresses a different aspect of the system.

- Client-Server: defines how the client communicates with the server.
- Layered Architecture: organizes the internal responsibilities of the server.
- MVC: organizes the structure of the client-side user interface.
- Monolithic Architecture: defines how the server application is deployed.

These architectural styles complement each other rather than conflict with one another.

### Layered Architecture

The server side of ResQTh is organized into three main layers:

- Presentation Layer:	receives requests from the client and handles request/response processing, input validation, and communication with the business logic layer.

-Application Logic Layer:	handles the main system rules and processing, including location processing, emergency category handling, urgency determination, emergency information retrieval, fallback decisions, and natural-language interpretation.

- Data Layer:	 manages access to information such as provinces, emergency categories, emergency contacts, guidance steps, official facilities, and incident notes.

The layers follow a clear flow:

Presentation → Application Logic → Data

This separation keeps each layer focused on its own responsibility and reduces unnecessary coupling between request handling, system rules, and data management.

### MVC Architecture

The client side of ResQTh follows the Model-View-Controller (MVC) pattern to separate the user interface from interaction handling and client-side state.

- View: displays the screens that users interact with, including location selection, emergency category selection, natural-language input, emergency results, checklists, and guidance screens.

- Controller: handles user actions and screen flow, such as selecting a category, changing a province, submitting natural-language input, navigating between screens, and validating user interaction.

- Model: maintains the client-side state needed by the interface, such as the selected province, emergency category, urgency level, temporary incident notes, and the current response state.

MVC helps keep the user interface organized by separating what the user sees, how user actions are handled, and what information the client currently holds.

### Client-Server Architecture

ResQTh follows a client-server structure.

The client provides the user-facing interface and uses MVC to organize its screens, interaction handling, and local state.

The server receives requests from the client, applies the required business rules, accesses the necessary data, and returns the appropriate response.

The client and server may communicate through request/response interfaces. The system may also interact with external services required for functions such as location processing and natural-language interpretation.

This structure separates user interaction from server-side processing and data responsibilities.

### Monolithic Structure

The ResQTh server application is designed as a monolith rather than a collection of microservices.

The system contains a small set of closely related core functions and is developed by one student team within one semester. There is currently no requirement for individual parts of the server to be deployed or scaled independently.

Although the server is deployed as a single application, it can still contain separate layers and modules with clearly defined responsibilities.