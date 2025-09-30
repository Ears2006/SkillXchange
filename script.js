// ==========================
// Users & Current User
// ==========================
let users = JSON.parse(localStorage.getItem("users")) || [
  {
    name: "You",
    offeredSkills: [
      { name: "Plumbing", category: "Home Repair" },
      { name: "Electrical", category: "Home Repair" }
    ],
    wantedSkills: ["Cooking"],
    learnedSkills: [],
    points: 10,
    bio: "",
    profilePic: "",
    photos: [] // each user gets their own photo array
  },
  {
    name: "Bryanna",
    offeredSkills: [
      { name: "Cooking", category: "Food" },
      { name: "Case Management", category: "Other" }
    ],
    wantedSkills: ["Plumbing"],
    learnedSkills: [],
    points: 10,
    bio: "",
    profilePic: "",
    photos: []
  },
  {
    name: "Maverick",
    offeredSkills: [
      { name: "Playing", category: "Other" },
      { name: "Tornadoes", category: "Other" }
    ],
    wantedSkills: ["Shooting Guns"],
    learnedSkills: [],
    points: 10,
    bio: "",
    profilePic: "",
    photos: []
  }
];

// Ensure defaults persist
if (!localStorage.getItem("users")) {
  localStorage.setItem("users", JSON.stringify(users));
}

// Remove duplicates
users = users.filter((u, i, arr) => i === arr.findIndex(x => x.name === u.name));
// Ensure learnedSkills array exists
for (const u of users) {
  if (!Array.isArray(u.learnedSkills)) u.learnedSkills = [];
}

// Ensure photos exists for all users
for (const u of users) {
  if (!Array.isArray(u.photos)) u.photos = [];
}

// Save/load helpers
function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}

let posts = JSON.parse(localStorage.getItem("posts")) || [];
if (!localStorage.getItem("posts")) {
  posts = [
    { author: "You", content: "Hello world! 🚀", timestamp: Date.now() }
  ];
  localStorage.setItem("posts", JSON.stringify(posts));
}

function savePosts() {
  localStorage.setItem("posts", JSON.stringify(posts));
}

// Active user
const savedUserName = localStorage.getItem("activeUser");
let currentUser = users.find(u => u.name === savedUserName) || users[0];

// ==========================
// DOM References
// ==========================
const profileName = document.getElementById("profile-name");
const profileBio = document.getElementById("profile-bio");
const profilePoints = document.getElementById("profile-points");
const profilePic = document.getElementById("profile-pic");

const offeredSkillsList = document.getElementById("offered-skills");
const newOfferedSkillInput = document.getElementById("new-offered-skill");
const newOfferedCategorySelect = document.getElementById("new-offered-category");
const addOfferedSkillBtn = document.getElementById("add-offered-skill-btn");

const wantedSkillsList = document.getElementById("wanted-skills");
const newWantedSkillInput = document.getElementById("new-wanted-skill");
const addWantedSkillBtn = document.getElementById("add-wanted-skill-btn");

const leaderboardList = document.getElementById("leaderboard-list");
const editNameBtn = document.getElementById("edit-name-btn");
const editBioBtn = document.getElementById("edit-bio-btn");

// ==========================
// Render Profile
// ==========================
function renderProfile(user) {
  profileName.textContent = user.name;
  profileBio.textContent = user.bio || "";
  profilePoints.textContent = `Points: ${user.points}`;
  profilePic.src = user.profilePic || "default-profile.png";
}

// ==========================
// Photos
// ==========================
const photoInput = document.getElementById("photo-input");
const addPhotoBtn = document.getElementById("add-photo-btn");
const photoGrid = document.getElementById("photo-grid");

function renderPhotos() {
  if (!photoGrid) return;
  photoGrid.innerHTML = "";
  (currentUser.photos || []).forEach((src, i) => {
    const wrap = document.createElement("div");
    wrap.className = "photo-cell";

    const img = document.createElement("img");
    img.src = src;
    img.alt = `Photo ${i + 1}`;

    // Remove button (still on thumbnail)
    const rm = document.createElement("button");
    rm.className = "photo-remove";
    rm.textContent = "×";
    rm.title = "Remove photo";
    rm.addEventListener("click", (e) => {
      e.stopPropagation(); // prevent opening modal
      currentUser.photos.splice(i, 1);
      saveUsers();
      renderPhotos();
    });

    wrap.appendChild(img);
    wrap.appendChild(rm);

    // Click thumbnail → open modal
    img.addEventListener("click", () => openPhotoModal(src));

    photoGrid.appendChild(wrap);
  });
}

function openPhotoModal(src) {
  const modal = document.createElement("div");
  modal.className = "photo-modal";

  const modalContent = document.createElement("div");
  modalContent.className = "photo-modal-content";

  const fullImg = document.createElement("img");
  fullImg.src = src;

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.className = "photo-modal-close";
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", () => modal.remove());

  // 3-dot menu
  const menuBtn = document.createElement("button");
  menuBtn.className = "photo-menu";
  menuBtn.textContent = "⋮";
  menuBtn.title = "Options";

  const menu = document.createElement("div");
  menu.className = "photo-menu-dropdown";
  menu.style.display = "none";

  const setProfileOption = document.createElement("div");
  setProfileOption.textContent = "Set as Profile Picture";
  setProfileOption.addEventListener("click", () => {
    currentUser.profilePic = src;
    saveUsers();
    renderProfile(currentUser);
    renderPosts();
    renderProfilePosts();
    modal.remove();
  });

  menu.appendChild(setProfileOption);

  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // don’t close modal when clicking menu
    menu.style.display = menu.style.display === "block" ? "none" : "block";
  });

  modalContent.appendChild(closeBtn);
  modalContent.appendChild(menuBtn);
  modalContent.appendChild(menu);
  modalContent.appendChild(fullImg);
  modal.appendChild(modalContent);

  // ✅ Close modal when clicking outside modalContent
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });

  document.body.appendChild(modal);
}

// Hook up Add Photo button
async function filesToDataUrls(fileList) {
  const files = Array.from(fileList);
  return Promise.all(
    files.map(
      (file) =>
        new Promise((res) => {
          const r = new FileReader();
          r.onload = () => res(r.result);
          r.readAsDataURL(file);
        })
    )
  );
}

if (addPhotoBtn && photoInput) {
  addPhotoBtn.addEventListener("click", async () => {
    if (!photoInput.files.length) return;
    const dataUrls = await filesToDataUrls(photoInput.files);
    currentUser.photos = (currentUser.photos || []).concat(dataUrls);
    saveUsers();
    renderPhotos();
    photoInput.value = "";
  });
}

// Render photos on load
renderPhotos();

async function filesToDataUrls(fileList) {
  const files = Array.from(fileList);
  return Promise.all(
    files.map(file => new Promise(res => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.readAsDataURL(file);
    }))
  );
}

if (addPhotoBtn && photoInput) {
  addPhotoBtn.addEventListener("click", async () => {
    if (!photoInput.files.length) return;
    const dataUrls = await filesToDataUrls(photoInput.files);
    currentUser.photos = (currentUser.photos || []).concat(dataUrls);
    saveUsers();
    renderPhotos();
    photoInput.value = "";
  });
}
renderPhotos();

// ==========================
// Offered Skills
// ==========================
function createOfferedSkillElement(skillObj) {
  const li = document.createElement("li");

  const left = document.createElement("div");
  left.className = "pill";
  left.textContent = `${skillObj.name} `;
  const cat = document.createElement("span");
  cat.className = "badge";
  cat.textContent = skillObj.category;
  left.appendChild(cat);

  const removeBtn = document.createElement("button");
  removeBtn.className = "remove";
  removeBtn.textContent = "×";
  removeBtn.addEventListener("click", () => {
    const idx = currentUser.offeredSkills.findIndex(
      s => s.name === skillObj.name && s.category === skillObj.category
    );
    if (idx > -1) {
      currentUser.offeredSkills.splice(idx, 1);
      currentUser.points -= 10;
      renderOfferedSkills();
      renderProfile(currentUser);
      renderLeaderboard();
      saveUsers();
    }
  });

  li.appendChild(left);
  li.appendChild(removeBtn);
  return li;
}

function renderOfferedSkills() {
  const toggleBtn = document.getElementById("offered-toggle");
  const maxVisible = 3;
  const expanded = toggleBtn.dataset.expanded === "true";

  offeredSkillsList.innerHTML = "";

  if (!currentUser.offeredSkills.length) {
    const li = document.createElement("li");
    li.textContent = "No offered skills yet.";
    offeredSkillsList.appendChild(li);
    toggleBtn.style.display = "none";
    return;
  }

  const visibleItems = expanded
    ? currentUser.offeredSkills
    : currentUser.offeredSkills.slice(0, maxVisible);

  visibleItems.forEach(s => {
    offeredSkillsList.appendChild(createOfferedSkillElement(s));
  });

  // Toggle button visibility + text
  if (currentUser.offeredSkills.length > maxVisible) {
    toggleBtn.style.display = "inline-block";
    toggleBtn.textContent = expanded ? "Show Less" : "Show More";
  } else {
    toggleBtn.style.display = "none";
  }
}

// Toggle Handler
document.getElementById("offered-toggle").addEventListener("click", e => {
  const btn = e.target;
  btn.dataset.expanded = btn.dataset.expanded !== "true"; // toggle state
  renderOfferedSkills();
});

addOfferedSkillBtn.addEventListener("click", () => {
  const skillName = newOfferedSkillInput.value.trim();
  const category = newOfferedCategorySelect.value;
  if (!skillName || !category) return;

  const exists = currentUser.offeredSkills.some(
    s => s.name.toLowerCase() === skillName.toLowerCase() && s.category === category
  );
  if (!exists) {
    currentUser.offeredSkills.push({ name: skillName, category });
    currentUser.points += 10;
    newOfferedSkillInput.value = "";
    newOfferedCategorySelect.value = "";
    renderOfferedSkills();
    renderProfile(currentUser);
    renderLeaderboard();
    saveUsers();
  }
});


// ==========================
// Wanted Skills
// ==========================
function renderWantedSkills() {
  const toggleBtn = document.getElementById("wanted-toggle");
  const maxVisible = 3;
  const expanded = toggleBtn.dataset.expanded === "true";

  wantedSkillsList.innerHTML = "";

  if (!currentUser.wantedSkills.length) {
    const li = document.createElement("li");
    li.textContent = "No wanted skills yet.";
    wantedSkillsList.appendChild(li);
    toggleBtn.style.display = "none";
    return;
  }

  const visibleItems = expanded
    ? currentUser.wantedSkills
    : currentUser.wantedSkills.slice(0, maxVisible);

  visibleItems.forEach(s => {
    const li = document.createElement("li");

    const left = document.createElement("div");
    left.className = "pill";
    left.textContent = s;

    // remove button
    const removeBtn = document.createElement("button");
    removeBtn.className = "remove";
    removeBtn.textContent = "×";
    removeBtn.dataset.skill = s;

    // learned button
    const learnedBtn = document.createElement("button");
    learnedBtn.className = "learned";
    learnedBtn.textContent = "✓";
    learnedBtn.dataset.skill = s;

    li.appendChild(left);
    li.appendChild(removeBtn);
    li.appendChild(learnedBtn);
    wantedSkillsList.appendChild(li);
  });

  // toggle button visibility + text
  if (currentUser.wantedSkills.length > maxVisible) {
    toggleBtn.style.display = "inline-block";
    toggleBtn.textContent = expanded ? "Show Less" : "Show More";
  } else {
    toggleBtn.style.display = "none";
  }
}

// Toggle Handler
document.getElementById("wanted-toggle").addEventListener("click", e => {
  const btn = e.target;
  btn.dataset.expanded = btn.dataset.expanded !== "true"; // toggle state
  renderWantedSkills();
});

// Event delegation for remove / mark as learned
wantedSkillsList.addEventListener("click", e => {
  if (e.target.classList.contains("remove")) {
    const skillName = e.target.dataset.skill;
    const idx = currentUser.wantedSkills.indexOf(skillName);
    if (idx > -1) {
      currentUser.wantedSkills.splice(idx, 1);
      renderWantedSkills();
      renderProfile(currentUser);
      renderLeaderboard();
      saveUsers();
    }
  }

  if (e.target.classList.contains("learned")) {
    const skillName = e.target.dataset.skill;

    showConfirmModal(`Mark "${skillName}" as learned?`, () => {
      const idx = currentUser.wantedSkills.indexOf(skillName);
      if (idx > -1) {
        currentUser.wantedSkills.splice(idx, 1);
        currentUser.learnedSkills.push(skillName);

        // Give points for learning
        currentUser.points += 20;

        // Save + update UI
        saveUsers();
        renderWantedSkills();
        renderLearnedSkills();
        renderProfile(currentUser);
        renderLeaderboard();
        celebrate();
      }
    });
  }
});

// Add wanted skill
addWantedSkillBtn.addEventListener("click", () => {
  const skillName = newWantedSkillInput.value.trim();
  const errorEl = document.getElementById("wanted-skill-error");
  errorEl.textContent = ""; // clear previous errors
  errorEl.style.color = "#f44336"; // red by default

  // validation rules
  if (!skillName) {
    errorEl.textContent = "Skill name cannot be empty.";
    return;
  }
  if (skillName.length > 30) {
    errorEl.textContent = "Skill name must be under 30 characters.";
    return;
  }
  if (!/^[a-zA-Z0-9 ]+$/.test(skillName)) {
    errorEl.textContent = "Only letters, numbers and spaces are allowed.";
    return;
  }

  const exists = currentUser.wantedSkills.some(
    s => s.toLowerCase() === skillName.toLowerCase()
  );
  if (exists) {
    errorEl.textContent = `"${skillName}" is already on your list.`;
    return;
  }

  // ✅ if valid, add skill
  currentUser.wantedSkills.push(skillName);
  newWantedSkillInput.value = "";
  renderWantedSkills();
  renderProfile(currentUser);
  renderLeaderboard();
  saveUsers();

  // optional: success feedback
  errorEl.textContent = "✅ Skill added!";
  errorEl.style.color = "#22c55e"; // green
  setTimeout(() => {
    errorEl.textContent = "";
    errorEl.style.color = "#f44336"; // back to red
  }, 2000);
});

// ==========================
// Learned Skills
// ==========================
function renderLearnedSkills() {
  const list = document.getElementById("learned-skills");
  const toggleBtn = document.getElementById("learned-toggle");
  const maxVisible = 3;
  const expanded = toggleBtn.dataset.expanded === "true";

  if (!list) return;

  list.innerHTML = "";
  if (!currentUser.learnedSkills.length) {
    const li = document.createElement("li");
    li.textContent = "No learned skills yet.";
    list.appendChild(li);
    toggleBtn.style.display = "none";
    return;
  }

  const visibleItems = expanded
    ? currentUser.learnedSkills
    : currentUser.learnedSkills.slice(0, maxVisible);

  visibleItems.forEach(skill => {
    const li = document.createElement("li");
    li.className = "pill";  // ✅ make it bold like wanted/offered
    li.textContent = `✅ ${skill}`;
    list.appendChild(li);
  });

  // toggle button visibility + text
  if (currentUser.learnedSkills.length > maxVisible) {
    toggleBtn.style.display = "inline-block";
    toggleBtn.textContent = expanded ? "Show Less" : "Show More";
  } else {
    toggleBtn.style.display = "none";
  }
}

// Toggle Handler
document.getElementById("learned-toggle").addEventListener("click", e => {
  const btn = e.target;
  btn.dataset.expanded = btn.dataset.expanded !== "true"; // toggle state
  renderLearnedSkills();
});



// ==========================
// Featured Skills Snapshot
// ==========================
function renderFeaturedSkills() {
  const offeredBox = document.getElementById("featured-offered");
  const wantedBox = document.getElementById("featured-wanted");
  if (!offeredBox || !wantedBox) return;

  offeredBox.innerHTML = "";
  wantedBox.innerHTML = "";

  currentUser.offeredSkills.slice(0, 3).forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.name} (${s.category})`;
    offeredBox.appendChild(li);
  });
  if (!currentUser.offeredSkills.length) {
    offeredBox.innerHTML = "<li>No offered skills yet.</li>";
  }

  currentUser.wantedSkills.slice(0, 3).forEach(s => {
    const li = document.createElement("li");
    li.textContent = s;
    wantedBox.appendChild(li);
  });
  if (!currentUser.wantedSkills.length) {
    wantedBox.innerHTML = "<li>No wanted skills yet.</li>";
  }
}

// ==========================
// Posts (Feed + Profile)
// ==========================
const feedContainer = document.getElementById("feed-container");

function renderPosts() {
  if (!feedContainer) return;
  feedContainer.innerHTML = "";

  [...posts].sort((a, b) => b.timestamp - a.timestamp).forEach(post => {
    const card = document.createElement("div");
    card.className = "card";

    const postHeader = document.createElement("div");
    postHeader.className = "post-header";

    const img = document.createElement("img");
    img.src = users.find(u => u.name === post.author)?.profilePic || "default-profile.png";
    img.className = "post-avatar";

    const authorLink = document.createElement("a");
    authorLink.href = "#";
    authorLink.textContent = post.author;
    authorLink.addEventListener("click", e => {
      e.preventDefault();
      const found = users.find(u => u.name === post.author);
      if (found) {
        currentUser = found;
        renderProfile(currentUser);
        renderFeaturedSkills();
        renderProfilePosts();
        renderLeaderboard();
        showTab("user-profile");
        localStorage.setItem("activeTab", "user-profile");
        localStorage.setItem("activeUser", currentUser.name);
      }
    });

    postHeader.appendChild(img);
    postHeader.appendChild(authorLink);
    card.appendChild(postHeader);

    const content = document.createElement("p");
    content.textContent = post.content;

    const time = document.createElement("small");
    time.className = "muted";
    time.textContent = new Date(post.timestamp).toLocaleString();

    card.appendChild(content);
    card.appendChild(time);
    feedContainer.appendChild(card);
  });
}

function renderProfilePosts() {
  const container = document.getElementById("profile-posts");
  if (!container) return;
  container.innerHTML = "";

  const userPosts = posts.filter(p => p.author === currentUser.name);

  if (!userPosts.length) {
    const p = document.createElement("p");
    p.className = "hint";
    p.textContent = "You haven't made any posts yet.";
    container.appendChild(p);
    return;
  }

  [...userPosts].sort((a, b) => b.timestamp - a.timestamp).forEach(post => {
    const card = document.createElement("div");
    card.className = "card";

    const postHeader = document.createElement("div");
    postHeader.className = "post-header";

    const img = document.createElement("img");
    img.src = users.find(u => u.name === post.author)?.profilePic || "default-profile.png";
    img.className = "post-avatar";

    const authorLink = document.createElement("a");
    authorLink.href = "#";
    authorLink.textContent = post.author;
    authorLink.addEventListener("click", e => {
      e.preventDefault();
      const found = users.find(u => u.name === post.author);
      if (found) {
        currentUser = found;
        renderProfile(currentUser);
        renderFeaturedSkills();
        renderProfilePosts();
        renderLeaderboard();
        showTab("user-profile");
        localStorage.setItem("activeTab", "user-profile");
        localStorage.setItem("activeUser", currentUser.name);
      }
    });

    postHeader.appendChild(img);
    postHeader.appendChild(authorLink);
    card.appendChild(postHeader);

    const content = document.createElement("p");
    content.textContent = post.content;

    const time = document.createElement("small");
    time.className = "muted";
    time.textContent = new Date(post.timestamp).toLocaleString();

    card.appendChild(content);
    card.appendChild(time);
    container.appendChild(card);
  });
}

// Add post (Home)
const addPostBtn = document.getElementById("add-post-btn");
const newPostInput = document.getElementById("new-post-content");

if (addPostBtn && newPostInput) {
  addPostBtn.addEventListener("click", () => {
    const content = newPostInput.value.trim();
    if (!content) return;
    const newPost = { author: currentUser.name, content, timestamp: Date.now() };
    posts.push(newPost);
    savePosts();
    renderPosts();
    renderProfilePosts();
    newPostInput.value = "";
  });
}

// ==========================
// Leaderboard
// ==========================
function renderLeaderboard() {
  console.log("Rendering leaderboard… users:", users); // 👈 DEBUG

  leaderboardList.innerHTML = "";
  [...users].sort((a, b) => b.points - a.points).forEach(u => {
    console.log("Rendering user:", u.name, "points:", u.points); // 👈 DEBUG
    const li = document.createElement("li");
    const nameLink = document.createElement("a");
    nameLink.href = "#";
    nameLink.textContent = u.name;
    nameLink.addEventListener("click", e => {
      e.preventDefault();
      currentUser = u;
      renderProfile(currentUser);
      renderFeaturedSkills();
      renderProfilePosts();
      renderLeaderboard();
      showTab("user-profile");
      localStorage.setItem("activeTab", "user-profile");
      localStorage.setItem("activeUser", currentUser.name);
    });

    li.appendChild(nameLink);
    const pts = document.createElement("span");
    pts.textContent = `: ${u.points} pts`;
    li.appendChild(pts);

    if (u.name === currentUser.name) {
      li.style.fontWeight = "800";
    }
    leaderboardList.appendChild(li);
  });
}

console.log("Leaderboard HTML:", leaderboardList.innerHTML);


// ==========================
// Inline Edit (Name & Bio)
// ==========================
editNameBtn.addEventListener("click", () => {
  const isEditing = editNameBtn.textContent === "Save";
  if (isEditing) {
    const input = document.getElementById("edit-name-input");
    if (input && input.value.trim()) currentUser.name = input.value.trim();
    saveUsers();
    renderProfile(currentUser);
    renderLeaderboard();
    editNameBtn.textContent = "Edit";
  } else {
    const input = document.createElement("input");
    input.type = "text";
    input.id = "edit-name-input";
    input.value = currentUser.name;
    profileName.textContent = "";
    profileName.appendChild(input);
    input.focus();
    editNameBtn.textContent = "Save";
  }
});

editBioBtn.addEventListener("click", () => {
  const isEditing = editBioBtn.textContent === "Save";
  if (isEditing) {
    const textarea = document.getElementById("edit-bio-textarea");
    currentUser.bio = textarea ? textarea.value.trim() : "";
    saveUsers();
    renderProfile(currentUser);
    editBioBtn.textContent = "Edit";
  } else {
    const textarea = document.createElement("textarea");
    textarea.id = "edit-bio-textarea";
    textarea.value = currentUser.bio || "";
    textarea.rows = 3;
    profileBio.textContent = "";
    profileBio.appendChild(textarea);
    textarea.focus();
    editBioBtn.textContent = "Save";
  }
});

// ==========================
// Tabs (Top Navigation)
// ==========================
const tabLinks = [...document.querySelectorAll(".tab-link")];
const tabs = [...document.querySelectorAll(".tab-content")];

function showTab(id) {
  tabs.forEach(t => t.style.display = (t.id === id ? "block" : "none"));
  tabLinks.forEach(a => a.classList.toggle("active", a.dataset.tab === id));
  if (id === "user-profile") {
    renderFeaturedSkills();
    renderProfilePosts();
  }
}

tabLinks.forEach(a => {
  a.addEventListener("click", e => {
    e.preventDefault();
    const id = a.dataset.tab;
    showTab(id);
    localStorage.setItem("activeTab", id);
  });
});

// 🎉 Fireworks celebration
    function celebrate() {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.7 }
      });
    }
// SHOW confirm modal 
    function showConfirmModal(message, onConfirm) {
  // create overlay
  const overlay = document.createElement("div");
  overlay.className = "confirm-overlay";

  const box = document.createElement("div");
  box.className = "confirm-box";

  const msg = document.createElement("p");
  msg.textContent = message;

  const btnRow = document.createElement("div");
  btnRow.className = "confirm-buttons";

  const yesBtn = document.createElement("button");
  yesBtn.textContent = "Yes";
  yesBtn.className = "btn";
  yesBtn.addEventListener("click", () => {
    onConfirm();
    overlay.remove();
  });

  const noBtn = document.createElement("button");
  noBtn.textContent = "Cancel";
  noBtn.className = "btn";
  noBtn.style.background = "#ccc";
  noBtn.addEventListener("click", () => overlay.remove());

  btnRow.appendChild(yesBtn);
  btnRow.appendChild(noBtn);

  box.appendChild(msg);
  box.appendChild(btnRow);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}


// ==========================
// Init
// ==========================
renderProfile(currentUser);
renderOfferedSkills();
renderWantedSkills();
renderLearnedSkills();
renderLeaderboard();
renderFeaturedSkills();
renderProfilePosts();
renderPosts();

const lastTab = localStorage.getItem("activeTab") || "home";
showTab(lastTab);

// ==========================
// Profile Sub-Tabs
// ==========================
(function () {
  const subTabLinks = document.querySelectorAll(".profile-subnav-vertical a[data-subtab]");
  const subTabPanes = document.querySelectorAll(".profile-pane");

  if (!subTabLinks.length || !subTabPanes.length) return;

  function showSubtab(idToShow) {
    subTabPanes.forEach(p => p.style.display = "none");
    subTabLinks.forEach(a => a.classList.remove("active"));

    const targetPane = document.getElementById(idToShow);
    if (targetPane) targetPane.style.display = "block";

    const activeLink = [...subTabLinks].find(a => a.dataset.subtab === idToShow);
    if (activeLink) activeLink.classList.add("active");

    localStorage.setItem("profileActiveSubtab", idToShow);
  }

  subTabLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const target = link.dataset.subtab;
      if (target) showSubtab(target);
    });
  });

  const last = localStorage.getItem("profileActiveSubtab") || "profile-home";
  showSubtab(last);
})();
