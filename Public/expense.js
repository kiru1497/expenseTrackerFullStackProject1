const tableBody = document.getElementById("expenseTableBody");
const expenseList = document.getElementById("expenseList");

const premiumSection = document.getElementById("premiumBanner");
const buyPremiumBtn = document.getElementById("buyPremiumBtn");
const leaderboardBtn = document.getElementById("leaderboardBtn");
const leaderboardSection = document.getElementById("leaderboardSection");
const leaderboardBody = document.getElementById("leaderboardBody");

const aiSection = document.getElementById("aiInsightsSection");
const aiContent = document.getElementById("aiInsightsContent");

// 🚪 LOGOUT

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    try {
      const response = await axios.post("/user/logout");

      if (response.status === 200) {
        window.location.href = "/login.html";
      }
    } catch (error) {
      console.log(error);

      alert("Logout failed");
    }
  });
}

// ================= PAGINATION =================

const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const lastPageBtn = document.getElementById("lastPageBtn");
const pageInfo = document.getElementById("pageInfo");

let currentPage = 1;
const expensesPerPage = 10;

// ================= REPORT ELEMENTS =================

const reportSection = document.getElementById("reportSection");
const reportTableBody = document.getElementById("reportTableBody");

const dailyBtn = document.getElementById("dailyReportBtn");
const weeklyBtn = document.getElementById("weeklyReportBtn");
const monthlyBtn = document.getElementById("monthlyReportBtn");
const downloadBtn = document.getElementById("downloadReportBtn");

let allExpenses = [];
let isPremiumUser = false;

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

// ================= PAGINATION RENDER =================

function renderExpensesPage(page) {
  expenseList.innerHTML = "";

  const start = (page - 1) * expensesPerPage;
  const end = start + expensesPerPage;

  const pageExpenses = allExpenses.slice(start, end);

  pageExpenses.forEach((exp) => renderExpense(exp));

  const totalPages = Math.ceil(allExpenses.length / expensesPerPage);

  pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
}

// ================= PAGINATION BUTTONS =================

if (prevPageBtn) {
  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderExpensesPage(currentPage);
    }
  });
}

if (nextPageBtn) {
  nextPageBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(allExpenses.length / expensesPerPage);

    if (currentPage < totalPages) {
      currentPage++;
      renderExpensesPage(currentPage);
    }
  });
}

if (lastPageBtn) {
  lastPageBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(allExpenses.length / expensesPerPage);

    currentPage = totalPages;

    renderExpensesPage(currentPage);
  });
}

// ================= RENDER REPORT =================

function renderReport(expenses) {
  if (!reportTableBody) return;

  reportTableBody.innerHTML = "";

  expenses.forEach((exp) => {
    const row = document.createElement("tr");

    const date = new Date(exp.createdAt).toLocaleDateString();

    row.innerHTML = `
      <td>${date}</td>
      <td>${exp.description}</td>
      <td>${exp.category}</td>
      <td>₹${exp.amount}</td>
    `;

    reportTableBody.appendChild(row);
  });
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
    const response = await axios.post("/expense/add-expense", {
      category,
      description,
      amount,
      note: null,
    });

    const expense = response.data;

    // MongoDB returns _id instead of id
    expense.id = expense._id;

    allExpenses.push(expense);

    // Move to latest page automatically
    currentPage = Math.ceil(allExpenses.length / expensesPerPage);

    renderExpensesPage(currentPage);

    // Clear fields
    row.querySelector(".description").value = "";
    row.querySelector(".amount").value = "";
  } catch (error) {
    console.error("ADD EXPENSE ERROR:", error);

    if (error.response) {
      console.error("Server Response:", error.response.data);
    }

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
      await axios.delete(`/expense/delete-expense/${id}`);

      allExpenses = allExpenses.filter((exp) => exp.id != id);

      renderExpensesPage(currentPage);
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
      const response = await axios.put(`/expense/edit-expense/${id}`, {
        category,
        description: newDescription,
        amount: newAmount,
      });

      const updated = response.data;

      const index = allExpenses.findIndex((exp) => exp.id == id);

      if (index !== -1) {
        allExpenses[index] = updated;
      }

      renderExpensesPage(currentPage);
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
      const response = await axios.post("/payment/create-order");

      const paymentSessionId = response.data.paymentSessionId;

      const cashfree = Cashfree({
        mode: "sandbox",
      });

      cashfree.checkout({
        paymentSessionId: paymentSessionId,
        redirectTarget: "_self",
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
      const response = await axios.get("/expense/leaderboard");

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

// ================= REPORT FILTERS =================

if (dailyBtn) {
  dailyBtn.addEventListener("click", () => {
    if (!isPremiumUser) return;

    const today = new Date().toDateString();

    const filtered = allExpenses.filter(
      (exp) => new Date(exp.createdAt).toDateString() === today,
    );

    renderReport(filtered);
  });
}

if (weeklyBtn) {
  weeklyBtn.addEventListener("click", () => {
    if (!isPremiumUser) return;

    const now = new Date();
    const weekAgo = new Date();

    weekAgo.setDate(now.getDate() - 7);

    const filtered = allExpenses.filter((exp) => {
      const date = new Date(exp.createdAt);

      return date >= weekAgo && date <= now;
    });

    renderReport(filtered);
  });
}

if (monthlyBtn) {
  monthlyBtn.addEventListener("click", () => {
    if (!isPremiumUser) return;

    const now = new Date();

    const filtered = allExpenses.filter((exp) => {
      const date = new Date(exp.createdAt);

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });

    renderReport(filtered);
  });
}

// ================= DOWNLOAD CSV =================

if (downloadBtn) {
  downloadBtn.addEventListener("click", async () => {
    if (!isPremiumUser) return;

    try {
      const response = await axios.get("/expense/download");

      const fileURL = response.data.signedUrl;

      // Option 1: open in new tab
      window.open(fileURL, "_blank");

      // Option 2 (optional): show link
      alert("File ready! Download from: " + fileURL);
    } catch (error) {
      console.error(error);
      alert("Failed to download report");
    }
  });
}

// ================= PAGE LOAD =================

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const userResponse = await axios.get("/user/me");

    const isPremium = userResponse.data.isPremium;

    isPremiumUser = isPremium;

    if (isPremium) {
      if (premiumSection) premiumSection.classList.remove("d-none");

      if (buyPremiumBtn) buyPremiumBtn.style.display = "none";

      if (reportSection) reportSection.classList.remove("d-none");

      if (downloadBtn) downloadBtn.disabled = false;

      // AI INSIGHTS
      if (aiSection && aiContent) {
        aiContent.innerText = "Analyzing your spending habits... 🧠";

        aiSection.classList.remove("d-none");

        try {
          const response = await axios.get("/expense/ai-insights");

          aiContent.innerText = response.data.insights;
        } catch (err) {
          aiContent.innerText =
            "Note: AI insights are currently unavailable. Try again later!";

          console.error("AI Fetch Error:", err);
        }
      }
    } else {
      if (reportSection) reportSection.style.display = "none";

      if (downloadBtn) downloadBtn.disabled = true;
    }

    const expenseResponse = await axios.get("/expense/expenses");

    allExpenses = expenseResponse.data.map((expense) => ({
      ...expense,
      id: expense._id,
    }));

    renderExpensesPage(currentPage);
  } catch (error) {
    console.error("Failed to load page", error);
  }
});
