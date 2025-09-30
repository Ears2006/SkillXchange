// Load existing users from localStorage or start with an empty array
let users = JSON.parse(localStorage.getItem("users")) || [];

// Keep track of current user
let currentUser = null;

// ==========================
// SIGNUP FORM HANDLER
// ==========================
document.getElementById("signup-form").addEventListener("submit", function(event) { 
    event.preventDefault(); // Stop page reload

    const name = document.getElementById("name").value.trim();
    const bio = document.getElementById("bio").value.trim();
    const skills = document.getElementById("skills").value
        .split(",")
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0);

    if (!name) {
        alert("Please enter your name.");
        return;
    }

    // Create new user object
    const newUser = {
        name: name,
        bio: bio,
        offeredSkills: [],
        wantedSkills: skills,
        points: skills.length * 5 // starting points based on wanted skills
    };

    // Add new user to users array and prevent duplicates
    const userToSet = addNewUser(newUser);

    // Set as current user
    setCurrentUser(userToSet);

    alert("Signup successful! (check console for details)");
    console.log("New User Created:", userToSet);

    // Redirect to main page
    window.location.href = "index.html";
});

// ==========================
// NEW USER & DUPLICATE HANDLING
// ==========================

// Save all users to localStorage whenever there's a change
function saveAllUsers() {
    localStorage.setItem("users", JSON.stringify(users));
}

// Ensure no duplicate users when adding a new one
function addNewUser(newUser) {
    const existing = users.find(user => user.name.toLowerCase() === newUser.name.toLowerCase());
    if (!existing) {
        users.push(newUser);
        saveAllUsers();
        populateUserDropdown();
        renderLeaderboard();
        alert(`User "${newUser.name}" created successfully!`);
        return newUser;
    } else {
        alert(`User "${newUser.name}" already exists.`);
        return existing;
    }
}

// ==========================
// CURRENT USER HANDLER
// ==========================
function setCurrentUser(user) {
    currentUser = user;
    saveProfile();
    renderProfile(currentUser);
    renderOfferedSkills();
    renderWantedSkills();
    renderLeaderboard();
    populateUserDropdown();
}

// ==========================
// TEMP FUNCTIONS TO SUPPORT SIGNUP PAGE
// ==========================
// Minimal versions to prevent errors

function saveProfile() {
    if (!currentUser) return;
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
}

function populateUserDropdown() {
    const userSelect = document.getElementById("userSelect");
    if (!userSelect) return; // skip if dropdown not on this page
    userSelect.innerHTML = "";
    users.forEach((user, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = user.name;
        if (currentUser && user.name === currentUser.name) {
            option.selected = true;
        }
        userSelect.appendChild(option);
    });
}

function renderLeaderboard() {
    const leaderboardList = document.getElementById("leaderboard-list");
    if (!leaderboardList) return; // skip if leaderboard not on this page
    leaderboardList.innerHTML = "";
    // sort users by points descending
    const sorted = [...users].sort((a,b) => b.points - a.points);
    sorted.forEach(user => {
        const li = document.createElement("li");
        li.textContent = `${user.name}: ${user.points} pts`;
        leaderboardList.appendChild(li);
    });
}

// Placeholder functions to prevent errors
function renderProfile(user) {}
function renderOfferedSkills() {}
function renderWantedSkills() {}
