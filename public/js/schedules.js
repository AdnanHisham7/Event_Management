async function fetchParticipants() {
  try {
    const response = await fetch("/api/participants"); // Adjust if needed
    const participants = await response.json();

    const participantSelect = document.getElementById("participants");
    participantSelect.innerHTML = ""; // Clear existing options

    participants.forEach((participant) => {
      const option = document.createElement("option");
      option.value = participant.participant_id;
      option.textContent = `${participant.name} (${participant.email})`;
      participantSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching participants:", error);
  }
}

document
  .getElementById("schedule-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const eventName = document.getElementById("event_name").value;
    const date = document.getElementById("date").value;
    const startTime = document.getElementById("start_time").value;
    const endTime = document.getElementById("end_time").value;
    const participantIds = Array.from(
      document.getElementById("participants").selectedOptions
    ).map((option) => option.value);

    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_name: eventName,
          date,
          start_time: startTime,
          end_time: endTime,
          participant_ids: participantIds,
        }),
      });

      if (response.ok) {
        alert("Schedule created successfully!");
        fetchSchedules(); // Refresh schedule list
        event.target.reset(); // Reset form
        document.getElementById('schedule-modal').classList.toggle('hidden');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error creating schedule:", error);
    }
  });

// Fetch participants on page load
fetchParticipants();

async function fetchSchedules() {
  try {
    const response = await fetch("/api/schedules");
    const schedules = await response.json();

    const scheduleList = document.getElementById("schedule-list");
    scheduleList.innerHTML = ""; // Clear previous content

    schedules.forEach((schedule) => {
      // Create the event card
      console.log(schedule);
      const eventCard = document.createElement("div");
      eventCard.className = "bg-white shadow-lg rounded-lg overflow-hidden";
      const [year, month, day] = schedule.date.split("T")[0].split("-");
      const formattedDate = `${day}-${month}-${year}`;

      let randomImage = getRandomImage();
      Promise.all([randomImage])
        .then((res) => {
          const imgSrc = res[0];
          eventCard.innerHTML = `
      <img src='${imgSrc}' alt="Card Image" class="w-full h-48 object-cover">
      <div class="p-4">
        <h3 class="font-bold text-xl mb-2">${schedule.event_name}</h3>
        <p class="flex text-xs gap-2"><span class="bg-blue-900 rounded-xl text-gray-100 px-2 py-1"><i class="fa-regular fa-calendar mr-1"></i>${formattedDate}</span> <span class="bg-yellow-600 rounded-xl text-gray-100 px-2 py-1"><i class="fa-regular fa-clock mr-1"></i> ${schedule.start_time} - ${
            schedule.end_time
          }</span></p>
        
        <div class="mt-2">
        <h3 class="text-lg font-medium">Participants:</h3>
        <ul class="list-disc list-inside">
          ${
            schedule.participants && schedule.participants.length > 0
              ? schedule.participants
                  .map(
                    (p) =>
                      `<li>${p.participant_name} (${p.participant_email})</li>`
                  )
                  .join("")
              : "<li>No participants</li>"
          }
        </ul>
        
        ${
          schedule.participants && schedule.participants.length === 0
            ? `<button class="bg-blue-500 text-white px-4 py-2 mt-2 rounded hover:bg-blue-600" onclick="showAssignForm(${schedule.event_id})">Assign Participants</button>
          
          <div id="assign-form-${schedule.event_id}" class="hidden mt-4">
            <select id="participant-select-${schedule.event_id}" class="w-full mt-1 p-2 border border-gray-300 rounded" multiple></select>
            <button class="bg-green-500 text-white px-4 py-2 mt-2 rounded hover:bg-green-600" onclick="assignParticipants(${schedule.event_id})">Add Selected</button>
          </div>`
            : ""
        }
      </div>`;
        })
        .catch((err) => {
          console.log("some error occcured :", err);
        });

      // Event details
      //       eventCard.innerHTML = `
      //   <h2 class="text-xl font-semibold">${schedule.event_name}</h2>
      //   <p class="text-gray-600">${schedule.date} | ${schedule.start_time} - ${
      //         schedule.end_time
      //       }</p>
      //   <div class="mt-2">
      //     <h3 class="text-lg font-medium">Participants:</h3>
      //     <ul class="list-disc list-inside">
      //       ${
      //         schedule.participants && schedule.participants.length > 0
      //           ? schedule.participants
      //               .map(
      //                 (p) => `<li>${p.participant_name} (${p.participant_email})</li>`
      //               )
      //               .join("")
      //           : "<li>No participants</li>"
      //       }
      //     </ul>
      //     ${
      //       schedule.participants && schedule.participants.length === 0
      //         ? `
      //         <button class="bg-blue-500 text-white px-4 py-2 mt-2 rounded hover:bg-blue-600" onclick="showAssignForm(${schedule.event_id})">
      //           Assign Participants
      //         </button>
      //         <div id="assign-form-${schedule.event_id}" class="hidden mt-4">
      //           <select id="participant-select-${schedule.event_id}" class="w-full mt-1 p-2 border border-gray-300 rounded" multiple></select>
      //           <button class="bg-green-500 text-white px-4 py-2 mt-2 rounded hover:bg-green-600" onclick="assignParticipants(${schedule.event_id})">
      //             Add Selected
      //           </button>
      //         </div>
      //         `
      //         : ""
      //     }
      //   </div>
      // `;

      scheduleList.appendChild(eventCard);
    });
  } catch (error) {
    console.error("Error fetching schedules:", error);
  }
}

async function getRandomImage() {
  const urls = [
    "https://cdn.pixabay.com/photo/2020/02/03/00/12/fiber-4814456_960_720.jpg",
    "https://cdn.pixabay.com/photo/2017/08/12/06/06/fiber-optics-2633604_640.jpg",
    "https://cdn.pixabay.com/photo/2023/02/06/03/24/cable-7771045_640.jpg",
    "https://cdn.pixabay.com/photo/2020/11/05/13/42/wire-sculpture-5715170_640.jpg",
    "https://cdn.pixabay.com/photo/2016/12/01/13/15/light-bulbs-1875268_640.jpg",
    "https://cdn.pixabay.com/photo/2020/10/05/08/34/cherries-5628562_640.jpg",
    "https://cdn.pixabay.com/photo/2019/08/08/16/51/lwl-4393369_640.jpg",
    "https://cdn.pixabay.com/photo/2015/03/13/20/42/plug-672231_640.jpg",
  ];

  const randomIndex = Number(Math.random().toFixed(1).split(".")[1]);
  return urls[randomIndex];
}
// Fetch schedules on page load
fetchSchedules();

async function showAssignForm(eventId) {
  const form = document.getElementById(`assign-form-${eventId}`);
  const participantSelect = document.getElementById(
    `participant-select-${eventId}`
  );

  // Toggle form visibility
  form.classList.toggle("hidden");

  // Fetch participants only if the dropdown is empty
  if (participantSelect.options.length === 0) {
    try {
      const response = await fetch("/api/participants");
      const participants = await response.json();

      participants.forEach((participant) => {
        const option = document.createElement("option");
        option.value = participant.participant_id;
        option.textContent = `${participant.name} (${participant.email})`;
        participantSelect.appendChild(option);
      });
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  }
}

async function assignParticipants(eventId) {
  const participantSelect = document.getElementById(
    `participant-select-${eventId}`
  );
  const selectedIds = Array.from(participantSelect.selectedOptions).map(
    (option) => option.value
  );

  if (selectedIds.length === 0) {
    alert("Please select at least one participant to assign.");
    return;
  }

  try {
    const response = await fetch(`/api/schedules/${eventId}/participants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participant_ids: selectedIds }),
    });

    if (response.ok) {
      alert("Participants assigned successfully!");
      fetchSchedules(); // Refresh the schedule list
    } else {
      const error = await response.json();
      console.error("Server Error:", error);
      alert(`Error: ${error.error || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Network Error:", error);
    alert("Network Error: Could not assign participants.");
  }
}
