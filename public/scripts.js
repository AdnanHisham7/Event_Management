document.addEventListener("DOMContentLoaded", () => {
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
  function deleteEvent() {
    // Send the DELETE request to the backend
    fetch(`/api/events/${eventIdToDelete}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message === "Event deleted successfully") {
          alert("Event deleted successfully");
          // Remove the event from the UI
          const eventItem = document.getElementById(`event-${eventIdToDelete}`);
          eventItem.remove();
          closeModal(); // Close the modal
        } else {
          alert("Failed to delete event");
        }
      })
      .catch((error) => {
        console.error("Error deleting event:", error);
        alert("Error deleting event");
      });
  }

  const eventList = document.getElementById("eventList");
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
      document.getElementById("modalEventName").value = event.event_name;
      document.getElementById("modalEventDate").value = event.date;
      document.getElementById("modalStartTime").value = event.start_time;
      document.getElementById("modalEndTime").value = event.end_time;
      editingEventId = event.event_id; // Store the event id for PUT request
    } else {
      modalTitle.textContent = "Add Event";
      modalForm.reset();
      editingEventId = null; // Clear the event id when adding
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
      displayEvents(events);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  }

  function displayEvents(events) {
    eventList.innerHTML = ""; // Clear the current list
    events.forEach((event) => {
      const listItem = document.createElement("li");
      listItem.setAttribute("data-id", event.event_id);
      listItem.innerHTML = `
                ${event.event_name} (${event.date})
                <button class="edit-btn text-blue-500 ml-2">Edit</button>
            `;
      eventList.appendChild(listItem);
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

  // Handle Edit Button Click
  eventList.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) {
      const eventId = e.target.parentElement.getAttribute("data-id");
      // Fetch the specific event to edit
      fetch(`/api/events/${eventId}`)
        .then((res) => res.json())
        .then((event) => openModal("edit", event)) // Open modal in edit mode with event data
        .catch((error) => console.error("Error fetching event:", error));
    }
  });

  // Button and Modal Event Listeners
  addEventButton.addEventListener("click", () => openModal("add")); // Open modal in add mode
  cancelModal.addEventListener("click", closeModal); // Close modal when cancel button is clicked

  // Initial Fetch
  fetchEvents();
});
