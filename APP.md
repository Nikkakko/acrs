Full-Stack Developer Test Project
Aesthetic Center Reservation System
Project Overview
The goal of this project is to build a simple reservation system for an
aesthetic / beauty center.
The system allows:
• Managing staff (specialists)
• Managing services
• Creating and visualizing reservations in a time-based schedule view
This is an MVP with no authentication, payments, or customer management.
Tech Stack
• Frontend: React.js
• Backend: Node.js Express
• Database: PostgreSQL
1
Core Pages

1. Schedule Page (Main Page)
   The Schedule page displays a time-based calendar view with:
   • Columns = specialists
   • Rows = time slots (e.g. 30-minute intervals)
   • One selected date at a time
   Schedule with reservations
   Creating a Reservation
   • User clicks on the intersection of a specialist and a time slot
   (e.g. Giorgi Giorgadze at 11:00)
   • A modal window opens with:
   o Date (pre-filled)
   o Start time (pre-filled)
   o Specialist (pre-filled)
   o Duration (selectable, e.g. minutes)
   o List of services (searchable + selectable, multiple allowed)
   After clicking Save:
   • The reservation is stored in the database
   • The reservation immediately appears on the schedule diagram
   2
   New reservation
   Reservation Display Rules
   Each reservation block on the schedule shows:
   • Main service name
   • If multiple services are selected → additional services shown as a
   bulleted list
   • Time range (e.g. 08:30 – 09:30)
   • Specialist short name
   Color logic:
   • The reservation color is taken from the first selected service
   Other Behavior
   • Changing the date updates the schedule page accordingly
   Editing a Reservation
   • User can edit an existing reservation by clicking on it in the schedule
   diagram
   • Clicking a reservation opens the same reservation modal used for
   creation, pre-filled with:
   o Date
   o Start time
   o Specialist
   o Duration
   o Selected services
   3
   Deleting a Reservation
   • The reservation modal contains a Delete button
   • Clicking Delete:
   o Removes the reservation from the database
   o Immediately removes it from the schedule view
   • Show a simple confirmation (e.g. “Are you sure?”)
   Save Behavior
   • Clicking Save updates the existing reservation
   • Changes are immediately reflected on the schedule
   Drag & Drop Move
   • A reservation block on the schedule can be dragged and dropped to:
   o another time slot (same specialist column)
   o another specialist column
   • On drop, the system updates:
   o specialistId (if dropped to another specialist)
   o startTime
   o endTime (recalculated from duration)
   • Reservations snap to the schedule grid with 30-min steps
   • Drop is not allowed if it creates an overlap with another reservation for
   the same specialist.
   • If conflict happens, reservation returns to its original position
   • While dragging, show a lightweight preview (ghost) of the reservation.
   • Cursor feedback:
   o valid drop zone → allowed
   o invalid drop zone → not allowed
   Data Persistence
   • Drag & drop must save changes (call backend update).
   • UI should update immediately
   4
2. Staff Page
   The Staff page displays a list of specialists.
   Staff List
   Each staff member shows:
   • Profile photo
   • Name
   • Surname
   Staff list
   Features:
   • Search by name or surname
   • Edit and delete actions available per staff member
   Add / Edit Staff
   Clicking “Add New” opens a modal with:
   • Name
   • Last name
   • Photo upload
   The same modal can be reused for editing an existing staff member.
   5
   New staff
   6
3. Services Page
   The Services page manages all available services.
   Services List
   Each service displays:
   • Color indicator
   • Service name
   • Price
   Services list
   Features:
   • Search by service name and custom fields
   • Edit and delete actions per service
   Custom Fields (Dynamic Columns)
   A “+” button is available in the table header.
   When the user clicks the “+” button:
   • A modal window opens where the user can define a new custom field by
   providing Field Name:
   • After saving, a new column is added to the services table grid with the
   specified field name.
   7
   New column
   Column Ordering
   • User can drag & drop table columns to change their order
   • The column order must be saved and preserved after page reload
   Add / Edit Service
   Clicking “Add New” opens a modal with:
   • Name
   • Price
   • Color (used to color reservations on the schedule)
   • Custom fields (if user create custom fields/columns, these fields appear on
   Add/Edit Service modal form to set values)
   Color selection should match the design (predefined palette).
   Edit Service with custom field
   8
   Data & Logic Notes
   • One reservation:
   o Belongs to one specialist
   o Has one or multiple services
   o Has a start time and duration
   • Reservation end time = start time + duration
   • No overlapping reservations allowed for the same specialist
   • Services are independent entities and reused across reservations
   Expected Result
   • Fully working MVP matching the provided designs
   • Clean, readable code
   • Simple REST API
   • PostgreSQL schema designed for future extension
   • A video recording demonstrating the usage of the application, covering all
   features described in the project
   9
