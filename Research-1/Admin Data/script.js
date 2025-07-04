document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    myHold1.click();
  }
});
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});
document.addEventListener("keydown", function (e) {
  if (e.key === "F12") {
    e.preventDefault();
  }
});
history.pushState(null, null, location.href);
window.addEventListener("popstate", function () {
  history.pushState(null, null, location.href);
});
window.history.forward();

window.onunload = function () {
  null;
};

const Creation=document.getElementById("Creation");

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    Creation.click();
  }
});
const loginForm = document.getElementById("adminLoginForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("loginUser").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!username || !password) {
    alert("Please enter both username and password.");
    return;
  }

  try {
    const response = await fetch("/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      window.location.href = "/author"; // redirect only on success
    } else {
      const data = await response.json();
      alert(data.error || "Login failed. Invalid credentials.");
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("Server error. Please try again later.");
  }
});
