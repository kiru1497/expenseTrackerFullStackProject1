const tableBody = document.getElementById("expenseTableBody");
const expenseList = document.getElementById("expenseList");

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

    // clear inputs
    row.querySelector(".description").value = "";
    row.querySelector(".amount").value = "";

  } catch (error) {
    console.error(error);
    alert("Error adding expense");
  }
});

expenseList.addEventListener("click", async (e) => {

  const li = e.target.closest("li");
  if (!li) return;

  const id = li.dataset.id;

  // ------------------ DELETE ------------------
  if (e.target.classList.contains("delete-btn")) {

    try {
      await axios.delete(`/delete-expense/${id}`);
      li.remove();
    } catch (error) {
      console.error(error);
      alert("Failed to delete expense");
    }
  }

  // ------------------ EDIT ------------------
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

document.addEventListener("DOMContentLoaded", async () => {

  try {

    const response = await axios.get("/expenses");

    response.data.forEach(expense => {
      renderExpense(expense);
    });

  } catch (error) {
    console.error("Failed to fetch expenses", error);
  }

});

// ================= PREMIUM PAYMENT =================

document.addEventListener("DOMContentLoaded", () => {

  const buyPremiumBtn = document.getElementById("buyPremiumBtn");

  if (!buyPremiumBtn) return;

  buyPremiumBtn.addEventListener("click", async () => {

    try {

      // 1️⃣ Call backend to create order
      const response = await axios.post("/create-order");

      const paymentSessionId = response.data.paymentSessionId;

      // 2️⃣ Initialize Cashfree
      const cashfree = Cashfree({
        mode: "sandbox"
      });

      // 3️⃣ Open checkout
      cashfree.checkout({
        paymentSessionId: paymentSessionId,
        redirectTarget: "_self"
      });

    } catch (error) {
      console.error(error);
      alert("Failed to initiate payment");
    }

  });

});