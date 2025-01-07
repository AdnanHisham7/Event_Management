document.addEventListener("DOMContentLoaded", () => {
  // !events
  let eventIdToDelete = null; // Store the event ID to be deleted

  // Function to show the confirmation modal
  function confirmDelete(eventId) {
    eventIdToDelete = eventId;
    const modal = document.getElementById("deleteModal");
    modal.classList.remove("hidden");
  }

  // Function to close the confirmation modal
  function closeModal() {
    const modal = document.getElementById("deleteModal");
    modal.classList.add("hidden");
  }

  // Function to delete the event
  async function deleteEvent() {
    try {
      const response = await fetch(`/api/events/${eventIdToDelete}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.message === "Event deleted successfully") {
        alert("Event deleted successfully");
        // Remove the event from the UI
        const eventItem = document.getElementById(`event-${eventIdToDelete}`);
        eventItem.remove();
        const modal = document.getElementById("deleteModal");
        modal.classList.add("hidden");
      } else {
        alert("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Error deleting event");
    }
  }

  const eventModal = document.getElementById("eventModal");
  const modalForm = document.getElementById("modalForm");
  const modalTitle = document.getElementById("modalTitle");
  const addEventButton = document.getElementById("addEventButton");
  const cancelModal = document.getElementById("cancelModal");
  let editingEventId = null;

  // Open Modal
  function openModal(mode, event = null) {
    if (mode === "edit") {
      modalTitle.textContent = "Edit Event";

      // Format the date for the input field
      const formattedDate = new Date(event.date).toISOString().split("T")[0];

      document.getElementById("modalEventName").value = event.event_name;
      document.getElementById("modalEventDate").value = formattedDate;
      document.getElementById("modalStartTime").value = event.start_time;
      document.getElementById("modalEndTime").value = event.end_time;
      editingEventId = event.event_id; // Store the event ID for PUT request
    } else {
      modalTitle.textContent = "Add Event";
      modalForm.reset();
      editingEventId = null; // Clear the event ID when adding
    }
    eventModal.classList.remove("hidden"); // Show the modal
  }

  // Close Modal
  function closeModal() {
    eventModal.classList.add("hidden"); // Hide the modal
  }

  // Fetch and Display Events
  async function fetchEvents() {
    try {
      const response = await fetch("/api/events");
      const events = await response.json();
      renderEvents(events);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }

  function renderEvents(events) {
    const eventList = document.getElementById("eventList");
    eventList.innerHTML = ""; // Clear previous events

    events.forEach((event) => {
      const [year, month, day] = event.date.split("T")[0].split("-");
      const formattedDate = `${day}-${month}-${year}`;

      const eventItem = document.createElement("li");
      eventItem.id = `event-${event.event_id}`;
      eventItem.className = "mb-2 flex justify-between items-center";
      eventItem.innerHTML = `<span>${event.event_name} (${formattedDate})</span>
        <div>
          <button class="text-blue-500 edit-btn mr-2" data-id="${event.event_id}">Edit</button>
          <button class="text-red-500 delete-btn" data-id="${event.event_id}">Delete</button>
        </div>`;

      eventList.appendChild(eventItem);
    });

    // Attach dynamic event listeners
    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const eventId = e.target.getAttribute("data-id");
        fetch(`/api/events/${eventId}`)
          .then((res) => res.json())
          .then((event) => openModal("edit", event))
          .catch((error) => console.error("Error fetching event:", error));
      });
    });

    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const eventId = e.target.getAttribute("data-id");
        confirmDelete(eventId);
      });
    });
  }

  // Form Submission
  modalForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const eventData = {
      event_name: document.getElementById("modalEventName").value,
      date: document.getElementById("modalEventDate").value,
      start_time: document.getElementById("modalStartTime").value,
      end_time: document.getElementById("modalEndTime").value,
    };

    try {
      if (editingEventId) {
        // Update Event (PUT request)
        const response = await fetch(`/api/events/${editingEventId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });
        if (response.ok) alert("Event updated successfully!");
      } else {
        // Create Event (POST request)
        const response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });
        if (response.ok) alert("Event added successfully!");
      }
      closeModal();
      fetchEvents(); // Reload the events after adding/updating
    } catch (error) {
      console.error("Error saving event:", error);
    }
  });

  // Bind modal buttons
  document
    .getElementById("confirmDelete")
    .addEventListener("click", deleteEvent);
  document.getElementById("cancelDelete").addEventListener("click", () => {
    const modal = document.getElementById("deleteModal");
    modal.classList.add("hidden");
  });

  addEventButton.addEventListener("click", () => openModal("add")); // Open modal in add mode
  cancelModal.addEventListener("click", closeModal); // Close modal when cancel button is clicked

  // Initial Fetch
  fetchEvents();
});
