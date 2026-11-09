
# ResQTh – Final Project Report

## 1. Project Overview

### 1.1 Introduction

ResQTh is an intelligent emergency response and post-incident action guide designed to support foreign residents and visitors in Thailand during emergency situations.

During an emergency, people may experience difficulties identifying the appropriate emergency service, communicating their situation, understanding local emergency procedures, or finding nearby emergency facilities. These difficulties can become more challenging for people who are unfamiliar with Thailand or do not speak Thai.

ResQTh aims to address these challenges by providing an accessible platform that helps users identify emergency situations, access relevant information, and understand the appropriate actions to take.

### 1.2 Project Objectives

The main objectives of ResQTh are:

- To help users identify and select different emergency situations.
- To provide relevant emergency information and recommended actions based on the urgency of a situation.
- To support English and Thai natural-language input.
- To help users share their location with trusted contacts.
- To help users identify nearby emergency facilities.
- To make emergency information easier to access and understand.

### 1.3 Target Users

The primary target users are:

- Foreign residents living in Thailand.
- International tourists and visitors.
- People who may be unfamiliar with Thai emergency services and procedures.

---

## 2. Minimum Viable Product (MVP) Scope

The Minimum Viable Product (MVP) of ResQTh focuses on providing the essential features needed to help users access emergency information and guidance.

Rather than developing a fully integrated emergency response system, the MVP demonstrates the core user experience and main functional requirements through an interactive prototype.

The MVP covers the following features:

### 2.1 Location Detection

Users can select their province manually or allow the browser to request their current location. This helps provide location-related emergency information.

### 2.2 Emergency Category Selection

Users can select from different emergency categories, such as medical emergencies, accidents, fire, crime, and other emergency situations.

### 2.3 Emergency Information and Action Guidance

The system presents relevant emergency information and recommended actions depending on the selected emergency category and urgency level.

High-urgency situations emphasize quick access to emergency hotlines and essential information, while lower-urgency situations provide checklists and further guidance.

### 2.4 Natural-Language Input

Users can describe their situation in English or Thai using natural-language input.

The prototype uses keyword-based interpretation to suggest an emergency category, province, and urgency level. Users can review and adjust the suggestions.

### 2.5 Trusted Contact Location Sharing

The prototype demonstrates an interface for selecting a trusted contact, choosing a sharing duration, and managing the sharing status.

The current implementation demonstrates the interaction flow rather than actual real-time location transmission between devices.

### 2.6 Nearby Emergency Facilities

Users can explore nearby emergency facility information through a map-style interface. The current prototype uses sample facility data to demonstrate the feature.

### 2.7 MVP Limitations

The MVP is intended to demonstrate the main features and user interactions. It does not yet provide a fully integrated production system.

Some functions, including natural-language interpretation, trusted-contact sharing, and nearby facility information, use simplified or simulated implementations.

Future development can focus on connecting these features to reliable external services and implementing the complete system architecture.

---

## 3. Functional Requirements

The project is based on six main functional requirements.

| ID | Functional Requirement | Description |
|---|---|---|
| FR-1 | Detect User Location | Allows users to identify their location through GPS or manual province selection. |
| FR-2 | Select Emergency Category | Allows users to select an emergency category relevant to their situation. |
| FR-3 | Display Emergency Information | Provides emergency hotlines, information, and recommended actions based on the emergency situation and urgency. |
| FR-4 | Natural-Language Input | Allows users to describe an emergency in Thai or English and receive suggested category, province, and urgency information. |
| FR-5 | Share Live Location | Allows users to share their location with a trusted contact for a selected duration. |
| FR-6 | Find Nearby Emergency Facilities | Helps users identify nearby emergency facilities and view location-related information. |

---

## 4. System Design

### 4.1 Use-Case Design

The use-case diagram illustrates the interactions between users and the ResQTh system.

The main use cases include:

- Detect user location.
- Select emergency category.
- Display emergency information.
- Submit natural-language input.
- Share live location with a trusted contact.
- Find nearby emergency facilities.

These use cases represent the main interactions supported by the system.

### 4.2 System Architecture

ResQTh follows a proposed client-server architecture consisting of three main layers:

**Presentation Layer**

Responsible for the user interface and user interactions. It allows users to select emergency categories, enter descriptions, view information, and access the system's features.

**Application Logic Layer**

Responsible for processing user input, determining relevant emergency information, handling urgency-related logic, and coordinating the system's main functions.

**Data Layer**

Responsible for storing and managing information such as emergency categories, hotline details, facility information, and user-related data.

The current prototype primarily demonstrates the front-end presentation and interaction flows. The complete proposed architecture represents the intended direction for future development.

### 4.3 User Interface Design

The interface is designed to make emergency information easy to access.

The design emphasizes:

- Clear navigation.
- Accessible emergency categories.
- Visible urgency indicators.
- Easy access to emergency hotlines.
- Simple input and interaction flows.
- Map-style presentation of nearby facilities.

The prototype also demonstrates different screens and interaction flows to illustrate how users would interact with the system.

---

## 5. Technology Stack and Tools

The project uses the following technologies and development tools:

| Technology / Tool | Purpose |
|---|---|
| HTML | Defines the structure of the web interface. |
| CSS | Controls the visual appearance, layout, and styling. |
| JavaScript | Implements user interactions and front-end logic. |
| OpenStreetMap | Supports the map-related interface. |
| Nominatim | Supports reverse geocoding of location information. |
| Git and GitHub | Used for version control and project collaboration. |
| Visual Studio Code | Used as the development environment. |

---

## 6. Implementation

The ResQTh prototype was developed as a web-based interface using HTML, CSS, and JavaScript.

The implementation focuses on demonstrating the main functional requirements and the expected user experience.

### 6.1 Location Detection

The prototype provides manual province selection and a browser-based location request. It also uses reverse geocoding to obtain location-related information when available.

### 6.2 Emergency Category Selection

The interface provides multiple emergency categories. Users can select a category to access relevant emergency information and guidance.

### 6.3 Emergency Information and Guidance

The system demonstrates different information displays based on the selected emergency situation and urgency level.

For high-urgency situations, the interface emphasizes emergency hotline access and essential information. For lower-urgency situations, it provides checklists and additional guidance.

### 6.4 Natural-Language Input

The prototype allows users to describe an emergency in English or Thai.

A keyword-based JavaScript parser processes the input and suggests relevant emergency categories, province information, and urgency levels. Users can review and modify the suggested results.

### 6.5 Trusted Contact Location Sharing

The prototype demonstrates the location-sharing workflow, including contact selection, sharing duration, and sharing status.

The current implementation is a simulated interaction flow and does not establish actual real-time location transmission between users.

### 6.6 Nearby Emergency Facilities

The prototype provides a map-style interface for exploring emergency facilities.

Sample facility information and calculated distances are used to demonstrate how the feature could work. These sample entries should not be treated as verified live facility listings.

---

## 7. Testing and Evaluation

The prototype provides interactive demonstrations of the main functional requirements.

The main areas considered during the development and review of the prototype include:

- Location selection and location permission interaction.
- Emergency category selection.
- Display of emergency information based on urgency.
- English and Thai natural-language input.
- Trusted-contact sharing interface.
- Nearby emergency facility display.

The prototype demonstrates the intended user flows and interactions.

---

### 8.1 Current Limitations

- Natural-language interpretation currently uses keyword-based logic rather than a fully integrated AI model.
- Trusted-contact location sharing is demonstrated through a simulated interface.
- Nearby emergency facilities use sample data rather than a verified live facility database.

### 8.2 Future Improvements

Future development could include:

- Integration with an AI model to improve natural-language understanding.
- Integration with verified emergency facility databases and mapping services.
- Development of a backend system and database.
- Improved offline access to essential emergency information.
- More extensive usability, functionality, and performance testing.

---

## 9. Conclusion

ResQTh was developed to address the difficulties that foreign residents and visitors may experience when accessing emergency information in Thailand.

The project brings together several important functions, including location detection, emergency category selection, emergency information and action guidance, natural-language input, trusted-contact location sharing, and nearby emergency facility discovery.

Through the development of the interactive prototype, the project demonstrates how these features can be organized into an accessible emergency assistance platform.

Although some functions remain simulated and further development is required, the MVP establishes the foundation for a more complete emergency assistance system.

Overall, ResQTh demonstrates the application of software engineering concepts in designing a system that aims to improve access to emergency information and support users during difficult situations.
