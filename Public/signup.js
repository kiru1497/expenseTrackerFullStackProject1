async function handleSignup(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmpassword = document
    .getElementById("confirmPassword")
    .value.trim();

  if (password !== confirmpassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    // ✅ FIXED (removed localhost)
    const response = await axios.post("/user/signup", {
      name,
      email,
      password,
    });

    alert("Signup Successful!");

    // ✅ FIXED route
    window.location.href = "/login";
  } catch (error) {
    console.log(error);

    const message =
      error.response?.data?.message || "Signup failed. Please try again.";

    alert(message);
  }
}
