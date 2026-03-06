const tableBody = document.getElementById("expenseTableBody");
const expenseList = document.getElementById("expenseList");

const premiumSection = document.getElementById("premiumBanner");
const buyPremiumBtn = document.getElementById("buyPremiumBtn");
const leaderboardBtn = document.getElementById("leaderboardBtn");
const leaderboardSection = document.getElementById("leaderboardSection");
const leaderboardBody = document.getElementById("leaderboardBody");

const aiSection = document.getElementById("aiInsightsSection");
const aiContent = document.getElementById("aiInsightsContent");


// ================= RENDER EXPENSE =================

function renderExpense(expense) {
  const li = document.createElement("li");
  li.className =
    "list-group-item d-flex justify-content-between align-items-center";
  li.dataset.id = expense.id;

  li.innerHTML = `
    <span>
      <strong>${expense.category}</strong> —
      ${expense.description} —
      ₹${expense.amount}
    </span>
    <span>
      <button class="btn btn-sm btn-warning edit-btn me-2">Edit</button>
      <button class="btn btn-sm btn-danger delete-btn">Delete</button>
    </span>
  `;

  expenseList.appendChild(li);
}


// ================= ADD EXPENSE =================

tableBody.addEventListener("click", async (e) => {
  const btn = e.target.closest(".add-expense");
  if (!btn) return;

  const row = btn.closest("tr");

  const category = row.dataset.category;
  const description = row.querySelector(".description").value.trim();
  const amount = row.querySelector(".amount").value.trim();

  if (!description || !amount) {
    alert("Please enter description and amount");
    return;
  }

  try {
    const response = await axios.post("/add-expense", {
      category,
      description,
      amount
    });

    renderExpense(response.data);

    row.querySelector(".description").value = "";
    row.querySelector(".amount").value = "";

  } catch (error) {
    console.error(error);
    alert("Error adding expense");
  }
});


// ================= DELETE + EDIT =================

expenseList.addEventListener("click", async (e) => {

  const li = e.target.closest("li");
  if (!li) return;

  const id = li.dataset.id;

  // DELETE
  if (e.target.classList.contains("delete-btn")) {
    try {
      await axios.delete(`/delete-expense/${id}`);
      li.remove();
    } catch (error) {
      console.error(error);
      alert("Failed to delete expense");
    }
  }

  // EDIT
  if (e.target.classList.contains("edit-btn")) {

    const text = li.querySelector("span").innerText;
    const parts = text.split(" — ");

    const category = parts[0];
    const description = parts[1];
    const amount = parts[2].replace("₹", "");

    const newDescription = prompt("Edit description:", description);
    const newAmount = prompt("Edit amount:", amount);

    if (!newDescription || !newAmount) return;

    try {
      const response = await axios.put(`/edit-expense/${id}`, {
        category,
        description: newDescription,
        amount: newAmount
      });

      const updated = response.data;

      li.querySelector("span").innerHTML =
        `<strong>${updated.category}</strong> —
         ${updated.description} —
         ₹${updated.amount}`;

    } catch (error) {
      console.error(error);
      alert("Failed to edit expense");
    }
  }
});


// ================= BUY PREMIUM =================

if (buyPremiumBtn) {
  buyPremiumBtn.addEventListener("click", async () => {
    try {
      const response = await axios.post("/create-order");

      const paymentSessionId = response.data.paymentSessionId;

      const cashfree = Cashfree({
        mode: "sandbox"
      });

      cashfree.checkout({
        paymentSessionId: paymentSessionId,
        redirectTarget: "_self"
      });

    } catch (error) {
      console.error(error);
      alert("Failed to initiate payment");
    }
  });
}


// ================= LEADERBOARD =================

if (leaderboardBtn) {
  leaderboardBtn.addEventListener("click", async () => {

    try {
      const response = await axios.get("/leaderboard");

      leaderboardBody.innerHTML = "";

      response.data.forEach((user, index) => {

        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${user.name}</td>
          <td>₹${user.totalExpense || 0}</td>
        `;

        leaderboardBody.appendChild(row);
      });

      leaderboardSection.classList.remove("d-none");

    } catch (error) {
      console.error(error);
      alert("Failed to load leaderboard");
    }
  });
}


// ================= PAGE LOAD =================

document.addEventListener("DOMContentLoaded", async () => {

  try {

    // 1️⃣ Check user
    const userResponse = await axios.get("/user/me");

    const isPremium = userResponse.data.isPremium;

    if (isPremium) {

      // Show premium banner
      if (premiumSection) {
        premiumSection.classList.remove("d-none");
      }

      // Hide buy button
      if (buyPremiumBtn) {
        buyPremiumBtn.style.display = "none";
      }

      // ================= AI INSIGHTS =================
      if (aiSection && aiContent) {
        aiContent.innerText = "Analyzing your spending habits... 🧠"; // Loading state
        aiSection.classList.remove("d-none");

        try {
          const response = await axios.get("/ai-insights");
          aiContent.innerText = response.data.insights;
        } catch (err) {
          aiContent.innerText = "Note: AI insights are currently unavailable. Try again later!";
          console.error("AI Fetch Error:", err);
        }
      }
    }

    // 2️⃣ Load expenses
    const expenseResponse = await axios.get("/expenses");

    expenseResponse.data.forEach(expense => {
      renderExpense(expense);
    });

  } catch (error) {
    console.error("Failed to load page", error);
  }
});