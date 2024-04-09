async function setup() {
  const sendElement = document.getElementById("send");
  const userInput = document.getElementById("userInput");
  const memoryDiv = document.getElementById("memory");

  sendElement.addEventListener("click", async () => {
    const memory = userInput.value; // Get the user input
    const url = `/api/memory?memory=${encodeURIComponent(memory)}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const result = await response.text(); // Assuming response is plain text
      memoryDiv.textContent = result; // Display result
    } catch (error) {
      console.error("Error:", error);
      memoryDiv.textContent = "Error fetching memory.";
    }
  });
}

setup();
