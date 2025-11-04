// References to DOM elements
const mainContent = document.getElementById("mainContent");
const masterModal = document.getElementById("masterModal");
const masterInput = document.getElementById("masterInput");
const unlockBtn = document.getElementById("unlockBtn");
const addForm = document.getElementById("addForm");
const openFormBtn = document.getElementById("openFormBtn");
const section = document.querySelector("main section");

// Password storage
let passwords = JSON.parse(localStorage.getItem("passwords")) || [];
let masterPassword;

// Hash function for master password
function hashPassword(password) {
  return CryptoJS.SHA256(password).toString();
}

// AES encryption/decryption
function encryptPassword(password, masterPassword) {
  return CryptoJS.AES.encrypt(password, masterPassword).toString();
}

function decryptPassword(ciphertext, masterPassword) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, masterPassword);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    console.error("Decryption failed:", err);
    return null;
  }
}

// Unlock vault using master password
unlockBtn.addEventListener("click", () => {
  const input = masterInput.value.trim();
  if (!input) {
    alert("Please enter your master password.");
    return;
  }

  const storedHash = localStorage.getItem("masterHash");
  const inputHash = hashPassword(input);

  if (!storedHash) {
    // First time: save master password hash
    localStorage.setItem("masterHash", inputHash);
    masterPassword = input;
    masterModal.classList.add("hidden");
    mainContent.classList.remove("hidden");
    loadPasswords();
    alert("Master password set successfully!");
  } else if (inputHash === storedHash) {
    // Correct password
    masterPassword = input;
    masterModal.classList.add("hidden");
    mainContent.classList.remove("hidden");
    loadPasswords();
  } else {
    // Wrong password
    alert("Incorrect master password. Try again.");
  }
});

// Load and display passwords
function loadPasswords() {
  section.innerHTML = "";

  if (passwords.length === 0) {
    section.innerHTML = `<p class="text-center text-white text-lg col-span-full">No passwords saved yet.</p>`;
    return;
  }

  passwords.forEach((item, index) => {
    const decryptedPassword = decryptPassword(item.password, masterPassword) || "********";

    section.innerHTML += `
      <div class="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between">
        <div>
          <h2 class="text-xl font-semibold mb-2">${item.site}</h2>
          <p class="text-gray-700 mb-4">
            Password: <span id="pw-${index}">********</span>
          </p>
        </div>
        <div class="flex justify-end space-x-2">
          <button onclick="togglePassword(${index}, '${decryptedPassword}')"
                  class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
            See
          </button>
          <button onclick="copyPassword('${decryptedPassword}')"
                  class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
            Copy
          </button>
          <button onclick="deletePassword(${index})"
                  class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    `;
  });
}

// Toggle password visibility
function togglePassword(index, password) {
  const pwSpan = document.getElementById(`pw-${index}`);
  if (pwSpan.textContent === "********") {
    pwSpan.textContent = password;
  } else {
    pwSpan.textContent = "********";
  }
}

// Copy password to clipboard with auto-clear
function copyPassword(password) {
  navigator.clipboard.writeText(password).then(() => {
    alert("Password copied to clipboard!");

    // Clear clipboard after 10 seconds
    setTimeout(() => {
      navigator.clipboard.writeText("");
      console.log("Clipboard cleared for security.");
    }, 10000);
  }).catch((err) => {
    console.error("Failed to copy password:", err);
  });
}

// Delete a password
function deletePassword(index) {
  if (confirm("Are you sure you want to delete this password?")) {
    passwords.splice(index, 1);
    localStorage.setItem("passwords", JSON.stringify(passwords));
    loadPasswords();
  }
}

// Open/close Add Password modal
openFormBtn.addEventListener("click", () => {
  addForm.classList.remove("hidden");
});

function closeForm() {
  addForm.classList.add("hidden");
}

// Save a new password
function saveNewPassword() {
  const site = document.getElementById("siteInput").value.trim();
  const pass = document.getElementById("passInput").value.trim();

  if (!site || !pass) {
    alert("Please fill in both fields!");
    return;
  }

  // Encrypt password before saving
  const encryptedPass = encryptPassword(pass, masterPassword);

  passwords.push({ site, password: encryptedPass });
  localStorage.setItem("passwords", JSON.stringify(passwords));

  document.getElementById("siteInput").value = "";
  document.getElementById("passInput").value = "";
  closeForm();

  loadPasswords();
}
//Unlock on Enter key press
masterInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") unlockBtn.click();
});

//Form submission on Enter key press
const form = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevent default page reload
  const formData = new FormData(form);

  const response = await fetch(form.action, {
    method: "POST",
    body: formData,
    headers: { Accept: "application/json" },
  });

  if (response.ok) {
    formMessage.textContent = "Message sent successfully!";
    formMessage.classList.remove("text-red-500");
    formMessage.classList.add("text-green-500");
    form.reset();
  } else {
    formMessage.textContent = "Oops! Something went wrong.";
    formMessage.classList.remove("text-green-500");
    formMessage.classList.add("text-red-500");
  }
});

