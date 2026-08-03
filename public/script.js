document.addEventListener("DOMContentLoaded", () => {
  const checkboxes = document.querySelectorAll(".status-checkbox");

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", async (e) => {
      const id = e.target.dataset.id;
      const newStatus = e.target.checked;

      try {
        const response = await fetch(`/api/todos/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        const data = await response.json();

        if (!data.success) {
          alert("Could not update the todo. Please try again.");
          e.target.checked = !newStatus;
          return;
        }

        const textSpan = e.target
          .closest(".todo-item")
          .querySelector(".todo-text");

        if (newStatus) {
          textSpan.classList.add("completed");
        } else {
          textSpan.classList.remove("completed");
        }
      } catch (err) {
        console.error("Error updating status:", err);
        alert("Network error. Please try again.");
        e.target.checked = !newStatus;
      }
    });
  });
});