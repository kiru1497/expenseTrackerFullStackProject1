async function handleLogin(event){
    event.preventDefault(); 

    const loginDetails = {
        email: event.target.email.value, 
        password: event.target.password.value
    }

    try {
        const response = await axios.post("http://localhost:3000/user/login",
            loginDetails);

            if(response.status == 200){
                alert("login successful!"); 

                window.location.href = "/expense.html";
            }
    } catch (error) {
        if(error.response){
             if(error.response.status === 404){
                alert("User not found (Email is wrong)");
            }

            else if(error.response.status === 401){
                alert("Incorrect password");
            }

            else{
                alert("Something went wrong");
            }
        }
        else {
            alert("Server not reachable");
        }
    }
}