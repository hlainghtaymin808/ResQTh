### Entity Summary

| Entity | Purpose | Related FR |
| :--- | :--- | :--- |
| `Province` | Represents the province used to localize emergency information | FR-1 |
| `EmergencyCategory` | Represents the type of emergency and its urgency level | FR-2 |
| `EmergencyContact` | Represents emergency hotline/contact information | FR-3 |
| `GuidanceStep` | Represents ordered checklist steps for low-urgency situations | FR-3 |
| `OfficialFacility` | Represents an official place the user may need to visit | FR-3 |
| `IncidentNote` | Represents notes entered during a low-urgency flow | FR-3 |

### Entity Specifications

#### Entity: `Province`

| Attribute | Type | Description |
| :--- | :--- | :--- |
| `provinceId` | String | Unique identifier for a province |
| `nameEnglish` | String | Province name in English |
| `nameThai` | String | Province name in Thai |

#### Entity: `EmergencyCategory`

| Attribute | Type | Description |
| :--- | :--- | :--- |
| `categoryId` | String | Unique category identifier |
| `categoryName` | String | Name of the emergency category |
| `urgencyLevel` | String | `High` or `Low` urgency |

#### Entity: `EmergencyContact`

| Attribute | Type | Description |
| :--- | :--- | :--- |
| `contactId` | String | Unique contact identifier |
| `name` | String | Name of the emergency service |
| `phoneNumber` | String | Hotline or contact number |
| `provinceId` | String | Province associated with the contact |
| `categoryId` | String | Emergency category associated with the contact |
| `isNationalFallback` | Boolean | Indicates whether the contact is a national fallback |

#### Entity: `GuidanceStep`

| Attribute | Type | Description |
| :--- | :--- | :--- |
| `stepId` | String | Unique step identifier |
| `instruction` | String | Guidance text shown to the user |
| `stepOrder` | Integer | Display order of the step |
| `categoryId` | String | Related emergency category |

#### Entity: `OfficialFacility`

| Attribute | Type | Description |
| :--- | :--- | :--- |
| `facilityId` | String | Unique facility identifier |
| `name` | String | Name of the official facility |
| `location` | String | Facility location or address |
| `provinceId` | String | Province where the facility is located |
| `categoryId` | String | Related emergency category |

#### Entity: `IncidentNote`

| Attribute | Type | Description |
| :--- | :--- | :--- |
| `noteId` | String | Unique note identifier |
| `content` | String | User-entered incident note |
| `createdAt` | Date/Time | Time the note was created |
| `categoryId` | String | Related emergency category |

### Main Relationships

- One **Province** can be related to many **EmergencyContacts**.
- One **EmergencyCategory** can be related to many **EmergencyContacts**.
- One **EmergencyCategory** can have many **GuidanceSteps**.
- One **Province** can have many **OfficialFacilities**.
- One **EmergencyCategory** can have many **OfficialFacilities**.
- One **EmergencyCategory** can be associated with many **IncidentNotes**.