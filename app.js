import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  push,
  update,
  remove
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCn0Zoi0762wfN1WGcI2Gxpj40d_176pw5s",
  authDomain: "menu-stuff.firebaseapp.com",
  databaseURL:
    "https://menu-stuff-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "menu-stuff",
  storageBucket: "menu-stuff.appspot.com",
  messagingSenderId: "429754091732",
  appId: "1:429754091732:web:c2aba48b05420bcec39341",
  measurementId: "G-Q1TYJ0XSRC"
};

  const adminPassword = "allah";

  document.getElementById("accessCore").addEventListener("click", () => {
    const input = prompt("Enter admin password:");
    if (input === adminPassword) {
       showNotif("Access Granted , Logged In As Admin"); 
      const adminButtons = document.querySelectorAll('.admin-only');
      adminButtons.forEach(btn => btn.style.display = 'inline-block'); 
    } 


      
   else {
     showNotif("Access Denied , Informing Admin");

    }
  });

initializeApp(firebaseConfig);
const db = getDatabase();

const landing = document.getElementById("landing");
const subcategoriesPage = document.getElementById("subcategoriesPage");
const subcategoriesContainer = document.getElementById(
  "subcategoriesContainer"
);
const backBtn = document.getElementById("backBtn");

let currentCategoryId = null;

function createElem(tag, className = "", text = "") {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

function createThreeDotMenu(editHandler, deleteHandler) {
  const container = createElem('div', 'three-dot-menu');

  // 3-dot button
  const btn = createElem('button', 'three-dot-btn', '⋮'); // vertical ellipsis
  container.appendChild(btn);

  // Dropdown container hidden by default
  const dropdown = createElem('div', 'three-dot-dropdown hidden');
  container.appendChild(dropdown);

  // Edit option
  const editOpt = createElem('div', 'three-dot-option', 'Edit ✏️');
  dropdown.appendChild(editOpt);
  editOpt.onclick = (e) => {
    e.stopPropagation();
    dropdown.classList.add('hidden');
    editHandler();
  };

  // Delete option
  const delOpt = createElem('div', 'three-dot-option', 'Delete 🗑️');
  dropdown.appendChild(delOpt);
  delOpt.onclick = (e) => {
    e.stopPropagation();
    dropdown.classList.add('hidden');
    deleteHandler();
  };

  // Toggle dropdown visibility on 3-dot button click
  btn.onclick = (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('hidden');
  };

  // Close dropdown if clicking outside
  document.addEventListener('click', () => {
    dropdown.classList.add('hidden');
  });

  return container;
}


function showLanding() {
  subcategoriesPage.style.animation = "slideOut .3s forwards";
  setTimeout(() => {
    subcategoriesPage.classList.add("hidden");
    landing.classList.remove("hidden");
    landing.style.animation = "slideIn .3s forwards";
    clearSubcategories();
    loadCategories();
  }, 300);
}

function showSubcategories() {
  landing.style.animation = "slideOut .3s forwards";
  setTimeout(() => {
    landing.classList.add("hidden");
    subcategoriesPage.classList.remove("hidden");
    subcategoriesPage.style.animation = "slideIn .3s forwards";
  }, 300);
}

function clearSubcategories() {
  subcategoriesContainer.innerHTML = "";
}

function toggleAdminButtons() {
  const adminButtons = document.querySelectorAll('.admin-only');
  adminButtons.forEach(btn => {
    btn.style.display = isAdminLoggedIn ? 'inline-block' : 'none';
  });
}


  // --- LOAD CATEGORIES ---
  export function loadCategories() {
    landing.innerHTML = "";
    onValue(ref(db, "categories"), (snap) => {
      const data = snap.val() || {};
      landing.innerHTML = "";

      Object.entries(data).forEach(([catId, cat]) => {
        const card = createElem("div", "section-card");
        const title = createElem("h2", "", cat.name.toUpperCase());
        card.appendChild(title);

        // Three-dot menu container
        const menuContainer = createElem("div", "three-dot-menu admin-only");
        menuContainer.style.position = "relative"; // for dropdown positioning

        // Three-dot button
        const menuBtn = createElem("button", "menu-btn", "⋮");
        menuBtn.style.fontSize = "20px";
        menuBtn.style.background = "none";
        menuBtn.style.border = "none";
        menuBtn.style.cursor = "pointer";
        menuBtn.style.color = "#ff8c00";

        menuContainer.appendChild(menuBtn);

        // Dropdown menu (hidden by default)
        const dropdown = createElem("div", "dropdown-menu");
        Object.assign(dropdown.style, {
          position: "absolute",
          top: "100%",
          right: "0",
          backgroundColor: "#222",
          border: "1px solid #555",
          borderRadius: "4px",
          display: "none",
          zIndex: "100",
          minWidth: "100px",
        });

        // Edit button inside dropdown
        const editBtn = createElem("button", "dropdown-edit", "Edit");
        Object.assign(editBtn.style, {
          display: "block",
          width: "100%",
          padding: "8px",
          background: "none",
          border: "none",
          color: "#eee",
          cursor: "pointer",
          textAlign: "left",
        });

        // Delete button inside dropdown
        const delBtn = createElem("button", "dropdown-delete", "Delete");
        Object.assign(delBtn.style, {
          display: "block",
          width: "100%",
          padding: "8px",
          background: "none",
          border: "none",
          color: "#eee",
          cursor: "pointer",
          textAlign: "left",
        });

        dropdown.appendChild(editBtn);
        dropdown.appendChild(delBtn);
        menuContainer.appendChild(dropdown);
        card.appendChild(menuContainer);

        // Toggle dropdown visibility
        menuBtn.onclick = (e) => {
          e.stopPropagation();
          dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
        };

        // Close dropdown if clicked outside
        document.addEventListener("click", () => {
          dropdown.style.display = "none";
        });

        // Edit category handler
        editBtn.onclick = (e) => {
          e.stopPropagation();

          const titleEl = title;
          const input = document.createElement("input");
          input.type = "text";
          input.value = titleEl.textContent;
          input.style.fontSize = "inherit";
          input.style.width = "60%";
          input.style.backgroundColor = "#121212";
          input.style.border = "none";
          input.style.color = "#eee";
          input.style.padding = "4px 8px";
          input.style.outline = "none";

          titleEl.replaceWith(input);
          input.focus();
          dropdown.style.display = "none";

          function save() {
            const newName = input.value.trim();
            if (!newName) {
              input.replaceWith(titleEl);
              return;
            }
            update(ref(db, `categories/${catId}`), { name: newName })
              .then(() => {
                input.replaceWith(titleEl);
                titleEl.textContent = newName.toUpperCase();
              })
              .catch((err) => {
                alert(err);
                input.replaceWith(titleEl);
              });
          }

          input.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter") save();
            else if (ev.key === "Escape") input.replaceWith(titleEl);
          });
          input.addEventListener("blur", save);
        };

        // Delete category handler
        delBtn.onclick = (e) => {
          e.stopPropagation();
          if (!confirm(`Delete category "${cat.name}"?`)) return;
          remove(ref(db, `categories/${catId}`))
            .then(loadCategories)
            .catch(alert);
          dropdown.style.display = "none";
        };

        card.onclick = () => {
          currentCategoryId = catId;
          loadSubcategories(catId);
          showSubcategories();
        };

        landing.appendChild(card);

        toggleAdminButtons();
      });

      // ADD category button
      const addBtn = createElem("div", "section-card admin-only", "+");
      Object.assign(addBtn.style, {
        justifyContent: "center",
        alignItems: "center",
        fontSize: "48px",
        color: "#ff8c00",
        userSelect: "none",
        cursor: "pointer"
      });
      addBtn.onclick = addCategoryPrompt;
      landing.appendChild(addBtn);
    }, { onlyOnce: true });
  }


  // --- LOAD SUBCATEGORIES & ITEMS ---
  export function loadSubcategories(catId) {
    clearSubcategories();
    onValue(ref(db, `categories/${catId}/subcategories`), (snap) => {
      const data = snap.val() || {};
      subcategoriesContainer.innerHTML = "";

      // LIST each subcategory
      Object.entries(data).forEach(([subId, subcat]) => {
        const dropdown = createElem("div", "dropdown");
        const header = createElem(
          "div",
          "dropdown-header",
          subcat.name.toUpperCase()
        );
        const arrow = createElem("i", "arrow");
        header.appendChild(arrow);

        // EDIT subcategory
        const editSub = createElem("button", "btn-edit admin-only", "✏️");
        editSub.onclick = (e) => {
          e.stopPropagation();
          const nn = prompt("Edit subcategory name:", subcat.name);
          if (!nn?.trim()) return;
          update(
            ref(db, `categories/${catId}/subcategories/${subId}`),
            { name: nn.trim() }
          )
            .then(() => loadSubcategories(catId))
            .catch(alert);
            toggleAdminButtons();

        };
        header.appendChild(editSub);

        // DELETE subcategory
        const delSub = createElem("button", "btn-delete admin-only", "🗑️");
        delSub.onclick = (e) => {
          e.stopPropagation();
          if (!confirm(`Delete subcategory "${subcat.name}"?`)) return;
          remove(ref(db, `categories/${catId}/subcategories/${subId}`))
            .then(() => loadSubcategories(catId))
            .catch(alert);
        };
        header.appendChild(delSub);

        // toggle open/close
        const content = createElem("div", "dropdown-content");
        header.onclick = () => {
          content.classList.toggle("open");
          arrow.classList.toggle("down");
        };

        // ITEMS
      // ITEMS
if (subcat.items) {
  Object.entries(subcat.items).forEach(([itemId, item]) => {
    const itemDiv = createElem("div", "item");
    const nameSpan = createElem("span", "item-name", item.name);
    const priceSpan = createElem("span", "item-price", `${item.price} EGP`);
    itemDiv.appendChild(nameSpan);

    // 3-dot button
    const dots = createElem("div", "dots admin-only", "⋮");
    Object.assign(dots.style, {
      position: "relative",
      cursor: "pointer",
      padding: "0 8px"
    });

    // Dropdown menu
    const menu = createElem("div", "dropdown-menu");
    menu.style.display = "none";
    menu.style.position = "absolute";
    menu.style.top = "20px";
    menu.style.right = "0";
    menu.style.background = "#222";
    menu.style.border = "1px solid #444";
    menu.style.padding = "4px 0";
    menu.style.zIndex = "999";
    menu.style.borderRadius = "6px";
    menu.style.minWidth = "90px";

    const editBtn = createElem("div", "dropdown-item", "Edit");
    const deleteBtn = createElem("div", "dropdown-item", "Delete");
    Object.assign(editBtn.style, {
      padding: "6px 12px",
      cursor: "pointer",
      color: "#eee"
    });
    Object.assign(deleteBtn.style, {
      padding: "6px 12px",
      cursor: "pointer",
      color: "#eee"
    });

    menu.appendChild(editBtn);
    menu.appendChild(deleteBtn);
    dots.appendChild(menu);
    itemDiv.appendChild(dots);

    // Toggle dropdown
    dots.onclick = (e) => {
      e.stopPropagation();
      menu.style.display = menu.style.display === "none" ? "block" : "none";
    };

    // Click outside to close
    document.addEventListener("click", () => {
      menu.style.display = "none";
    });

    // Edit item
    editBtn.onclick = () => {
      menu.style.display = "none";

      nameSpan.contentEditable = "true";
      priceSpan.contentEditable = "true";

      nameSpan.style.backgroundColor = "#121212";
      nameSpan.style.color = "#eee";
      nameSpan.style.padding = "2px 6px";
      nameSpan.style.borderRadius = "4px";

      priceSpan.style.backgroundColor = "#121212";
      priceSpan.style.color = "#eee";
      priceSpan.style.padding = "2px 6px";
      priceSpan.style.borderRadius = "4px";

      const saveBtn = createElem("button", "save-btn", "Save");
      Object.assign(saveBtn.style, {
        backgroundColor: "#333",
        color: "#eee",
        border: "none",
        padding: "5px 12px",
        borderRadius: "4px",
        cursor: "pointer",
        marginLeft: "10px"
      });

      // Prevent multiple Save buttons
      if (!itemDiv.querySelector(".save-btn")) itemDiv.appendChild(saveBtn);

      saveBtn.onclick = () => {
        const nn = nameSpan.textContent.trim();
        const pp = priceSpan.textContent.trim();
        const num = parseFloat(pp);

        if (!nn) return alert("Name can’t be empty");
        if (isNaN(num)) return alert("Bad price");

        update(
          ref(db, `categories/${catId}/subcategories/${subId}/items/${itemId}`),
          { name: nn, price: num }
        )
          .then(() => {
            loadSubcategories(catId);
          })
          .catch(alert);
      };
    };

    // Delete item
    deleteBtn.onclick = () => {
      menu.style.display = "none";
      if (!confirm(`Delete item "${item.name}"?`)) return;
      remove(
        ref(db, `categories/${catId}/subcategories/${subId}/items/${itemId}`)
      )
        .then(() => loadSubcategories(catId))
        .catch(alert);
    };

    itemDiv.appendChild(priceSpan);
    content.appendChild(itemDiv);
  });
}

// + Add Item
const addItemBtn = createElem("div", "item admin-only", "+ Add Item");
Object.assign(addItemBtn.style, {
  color: "#ff8c00",
  fontWeight: "700",
  cursor: "pointer"
});
addItemBtn.onclick = (e) => {
  e.stopPropagation();
  addItemPrompt(catId, subId);
};
content.appendChild(addItemBtn);


        dropdown.appendChild(header);
        dropdown.appendChild(content);
        subcategoriesContainer.appendChild(dropdown);
      });

      // + Add Subcategory
      const addSubBtn = createElem("div", "section-card admin-only", "+ Add Subcategory");
      Object.assign(addSubBtn.style, {
        width: "100%",
        maxWidth: "400px",
        margin: "20px auto 0",
        textAlign: "center",
        fontSize: "24px",
        color: "#ff8c00",
        cursor: "pointer"
      });
      addSubBtn.onclick = () => addSubcategoryPrompt(catId);
      subcategoriesContainer.appendChild(addSubBtn);
    }, { onlyOnce: true });
  }

// --- PROMPTS ---
function addCategoryPrompt() {
  const name = prompt("Enter category name:");
  if (!name?.trim()) return alert("Name required");
  push(ref(db, "categories"), { name: name.trim(), subcategories: {} })
    .then(loadCategories)
    .catch(alert);
}

function addSubcategoryPrompt(catId) {
  const name = prompt("Enter subcategory name:");
  if (!name?.trim()) return alert("Name required");
  push(ref(db, `categories/${catId}/subcategories`), {
    name: name.trim(),
    items: {}
  })
    .then(() => loadSubcategories(catId))
    .catch(alert);
}

function addItemPrompt(catId, subId) {
  const name = prompt("Enter item name:");
  if (!name?.trim()) return alert("Name required");
  const priceStr = prompt("Enter price:");
  const price = parseFloat(priceStr);
  if (isNaN(price)) return alert("Bad price");
  push(ref(db, `categories/${catId}/subcategories/${subId}/items`), {
    name: name.trim(),
    price
  })
    .then(() => loadSubcategories(catId))
    .catch(alert);
}

// BACK
backBtn.onclick = () => {
  currentCategoryId = null;
  showLanding();
};

// INIT
loadCategories();







function showNotif(message, duration = 3000) {
  const notif = document.getElementById('notif');
  notif.textContent = message;
  notif.classList.remove('hidden');
  notif.classList.add('show');

  setTimeout(() => {
    notif.classList.remove('show');
    setTimeout(() => notif.classList.add('hidden'), 300);
  }, duration);
}





// Get elements
const adminIcon = document.getElementById('adminIcon');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminLoginCancel = document.getElementById('adminLoginCancel');
const adminLoginError = document.getElementById('adminLoginError');
const adminControls = document.getElementById('adminControls');

let isAdminLoggedIn = false;

// Show login form when clicking icon
adminIcon.addEventListener('click', () => {
  if (isAdminLoggedIn) {
    // If already logged in, toggle admin controls visibility
    adminControls.style.display = adminControls.style.display === 'none' ? 'block' : 'none';
    return;
  }
  adminLoginForm.style.display = 'block';
  adminLoginError.style.display = 'none';
});

// Cancel login form
adminLoginCancel.addEventListener('click', () => {
  adminLoginForm.style.display = 'none';
  adminLoginError.style.display = 'none';
});

// Login button
adminLoginBtn.addEventListener('click', () => {
  const username = document.getElementById('adminUser').value.trim();
  const password = document.getElementById('adminPass').value.trim();

  // Hardcoded admin creds (change as you want)
  if (username === 'admin' && password === '12345') {
    isAdminLoggedIn = true;
    adminLoginForm.style.display = 'none';
    adminLoginError.style.display = 'none';
    adminControls.style.display = 'block';
    alert('Logged in as admin, Seif');
  } else {
    adminLoginError.style.display = 'block';
  }
});

// Admin buttons click handlers (example)
document.getElementById('addCategoryBtn').addEventListener('click', () => {
  alert('Add Category button clicked');
  // Your logic here
});

document.getElementById('addSubcategoryBtn').addEventListener('click', () => {
  alert('Add Subcategory button clicked');
  // Your logic here
});

document.getElementById('addItemBtn').addEventListener('click', () => {
  alert('Add Item button clicked');
  // Your logic here
});















