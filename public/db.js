// The code for db.js is from the Week 18 Student-Mini-Project

let db;
let budgetVersion;

// Create a new db request for IndexedDB.
const request = indexedDB.open("BudgetDB", 1 || 21);

request.onupgradeneeded = function (e) {
  console.log("Upgrade needed in IndexDB");

  const { oldVersion } = e;
  const newVersion = e.newVersion || db.version;

  console.log(`DB Updated from version ${oldVersion} to ${newVersion}`);

  db = e.target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore("BudgetStore", { autoIncrement: true });
  }
};

request.onerror = function (e) {
  console.log(`Error ${e.target.errorCode}`);
};

function checkDatabase() {
  console.log("check db invoked");

  // Open Transaction
  let transaction = db.transaction(["BudgetStore"], "readwrite");

  // Access IndexedDB
  const store = transaction.objectStore("BudgetStore");

  // Get All Records
  const getAll = store.getAll();

  // If the request was successful
  getAll.onsuccess = function () {
    // If there are items in IndexedDB, add to transactionDB when online
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((res) => {
          // If returned response is not empty
          if (res.length !== 0) {
            // Open another transaction to IndexedDB with the ability to read and write
            transaction = db.transaction(["BudgetStore"], "readwrite");

            // Assign the current IndexedDB to a variable
            const currentStore = transaction.objectStore("BudgetStore");

            // Clear IndexedDB
            currentStore.clear();
          }
        });
    }
  };
}

request.onsuccess = function (e) {
  console.log("success");
  db = e.target.result;

  // Check if app is online before reading from IndexedDB
  if (navigator.onLine) {
    console.log("Backend online! 🗄️");
    checkDatabase();
  }
};

const saveRecord = (record) => {
  console.log("Save record invoked");

  // Create a transaction in IndexedDB
  const transaction = db.transaction(["BudgetStore"], "readwrite");

  // Access IndexedDB
  const store = transaction.objectStore("BudgetStore");

  // Add record to IndexedDB
  store.add(record);
};

// Listen for online access
window.addEventListener("online", checkDatabase);
