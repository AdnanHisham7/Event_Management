async function fetchParticipants() {
    try {
      const response = await fetch("/api/participants");
      const participants = await response.json();
      renderParticipants(participants);
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  }
  
  function renderParticipants(participants) {
    console.log(participants)
    const participantList = document.getElementById("participantList");
    participantList.innerHTML = ""; // Clear previous participants
  
    participants.forEach((participant) => {
      const participantItem = document.createElement("li");
      participantItem.id = `participant-${participant.participant_id}`;
      participantItem.className = "mb-2 flex justify-between items-center";
      participantItem.innerHTML = `
        <span>${participant.name} (${participant.email})</span>
        <button class="text-red-500 delete-participant-btn" data-id="${participant.participant_id}">Delete</button>
      `;
      participantList.appendChild(participantItem);
    });
  
    // Attach event listeners for delete buttons
    document.querySelectorAll(".delete-participant-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const participantId = e.target.getAttribute("data-id");
        deleteParticipant(participantId);
      });
    });
  }

  document.getElementById("participantForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("participantName").value;
    const email = document.getElementById("participantEmail").value;

    console.log(name, email)
  
    try {
      const response = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      console.log('response',response)
      if (response.ok) {
        alert("Participant added successfully");
        fetchParticipants();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to add participant");
      }
    } catch (error) {
      console.error("Error adding participant:", error);
    }
  });

  async function deleteParticipant(participantId) {
    try {
      const response = await fetch(`/api/participants/${participantId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        alert("Participant removed successfully");
        fetchParticipants();
      } else {
        alert("Failed to remove participant");
      }
    } catch (error) {
      console.error("Error deleting participant:", error);
    }
  }
  

  fetchParticipants();


