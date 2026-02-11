async function handleSignup(event){
    event.preventDefault(); 

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmpassword = document.getElementById("confirmPassword").value.trim(); 

    if(password !== confirmpassword){
        alert("Passwords do not match!"); 
        return; 
    }

    axios.post("http://localhost:3000/user/signup", {
        name,
        email,
        password
    })
    .then(function(response){
        console.log(response.data); 

        alert("Signup Successful!"); 
    })
    .catch(function(error){
        console.log(error); 

        const message =
        error.response?.data?.message ||
        "Signup failed. Please try again.";

      alert(message);
    })
}