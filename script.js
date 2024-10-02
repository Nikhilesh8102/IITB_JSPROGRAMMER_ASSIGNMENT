import data from './data.js'; // import the chemicals data from data.js file

let chemicalsData = data; // assign it to a variable which can be re assigned (using let)

const table = document.querySelector('tbody');
const editingRow = null;
let noOfRows = chemicalsData.length;
let modifiedData = chemicalsData;
let clickedRow = null;
let clickedSortButtonName = null;

/*****************************************LOCAL STORAGE****************************************/

// load from the localStorage and assign the data loaded to chemicalsData
function loadFromLocalStorage() {
    const storedData = localStorage.getItem('chemicalsData');
    if (storedData) {
        chemicalsData = JSON.parse(storedData);
        modifiedData = JSON.parse(storedData);
        noOfRows = modifiedData.length;
    }
}

// Save data to local storage
function saveToLocalStorage() {
    localStorage.setItem('chemicalsData', JSON.stringify(modifiedData));
}

loadFromLocalStorage();
populateTable(chemicalsData);

// this function is called on intial load and also whenever any modification is made to the table data
function populateTable(chemicalsData) {
    chemicalsData.forEach((chemical) => {
        const newRow = document.createElement("tr");
        newRow.setAttribute("data-index", chemical.id); // data index is used to store data attributes in html, id is being used cause it helps in unique identification of rows
        newRow.innerHTML = `
            <td><i class="fa-solid fa-check" style="color: #aaaaaa;"></i></td>
            <td>${chemical.id}</td>
            <td>${chemical.chemical_name}</td>
            <td>${chemical.vendor}</td>
            <td class="editable" data-field="density">${parseFloat(chemical.density).toFixed(2)}</td>
            <td class="editable" data-field="viscosity">${parseFloat(chemical.viscosity).toFixed(2)}</td>
            <td>${chemical.packaging}</td>
            <td data-field="pack_size">${chemical.pack_size}</td>
            <td>${chemical.unit}</td>
            <td class="editable" data-field="quantity">${parseFloat(chemical.quantity).toFixed(2)}</td>
        `;

        // Add an event listener to each editable cell
        newRow.querySelectorAll('.editable').forEach(td => {
            td.addEventListener('click', (event) => {
                makeEdit(event, chemical.id, td.getAttribute('data-field'));
            });
        });

        table.appendChild(newRow); // append each existing row to the table
    });
}

/*****************************************TABLE FUNCTIONALITIES****************************************/

// addInputRow function for managing the adding of a row functionality
function addInputRow() {
    const newRow = document.createElement("tr");
    newRow.className = "new-rows";
    newRow.setAttribute("data-index", noOfRows + 1);
    newRow.innerHTML = `
      
      <td><i class="fa-solid fa-check" style="color: #aaaaaa;"></i></td>
      <td>${++noOfRows}</td>
      <td><input class="new-input add-row" id="chemical-name" name="chemical_name" type="text" autofocus /></td>
      <td><input class="new-input add-row" id="vendor" name="vendor" type="text" /></td>
      <td ><input class="new-input add-row" id="density" name="density" type="text" /></td>
      <td><input class="new-input add-row" id="viscosity" name="viscosity" type="text" /></td>
      <td><input class="new-input add-row" id="packaging" name="packaging" type="text" /></td>
      <td><input class="new-input add-row" id="pack-size" name="pack_size" type="text" /></td>
      <td><input class="new-input add-row" id="unit" name="unit" type="text" /></td>
      <td><input class="new-input add-row" id="quantity" name="quantity" type="text" /></td>`;
    table.appendChild(newRow); // add the newly added row to the table
}

//saveInputData function for managing the saving functionality of the table rows
function saveInputData() {
    const allRows = document.querySelectorAll(".new-rows");
    allRows.forEach((eachRow) => {
        const inputs = eachRow.querySelectorAll("input");
        const newData = { id: eachRow.getAttribute("data-index") }; // save ids of all existing and newly added rows in the chemicalsData array
        inputs.forEach((input) => {
            const td = input.parentElement;
            td.textContent = input.value;
            newData[input.name] = input.value;
        });
        eachRow.classList.remove("new-rows"); // once the work is done new-rows class has to be removed from the latest added rows
        modifiedData.push(newData);
    });

    chemicalsData = modifiedData;
    noOfRows = chemicalsData.length; //update the no of rows to the current length of chemicals data array
    saveToLocalStorage(); // Save updated data to local storage
    alert("The latest version of data is saved")
}


//function for handling making an edit to a field
function makeEdit(event, id, field) {
    const td = event.target; // event.target gives the clicked <td> element
    const currentValue = td.innerText;
    const input = document.createElement("input"); // Create a new input element
    input.type = "text";
    input.value = currentValue; // Set the input value to the current cell value
    input.onblur = function () {
        saveEdit(td, id, Number(input.value), field); // Save when the input loses focus
    };
    input.onkeydown = function (e) {
        if (e.key === "Enter") {
            saveEdit(td, id, Number(input.value), field); // Save when 'Enter' is pressed
        }
    };

    // Clear the cell and add the input field
    td.innerHTML = "";
    td.appendChild(input);
    input.focus();
}

//function for saving the edited changes to the table in the chemicals data array and also to the local storage
function saveEdit(td, id, newValue, field) {

    td.innerText = newValue.toFixed(2); // Set the new value in the table cell

    const chemical = modifiedData.find(chem => chem.id === id);
    // If the chemical is found, update the specific field with the new value
    if (chemical) {
        chemical[field] = newValue.toFixed(2);
        saveToLocalStorage();
    }

}

//function to handle sorting of columns in ascending or descending order 
function handleSort(e) {

    const name = e.target.getAttribute("name");
    if (name === clickedSortButtonName) {
        modifiedData.reverse(); // reverse the contents of the array
    } else {
        clickedSortButtonName = name;
        modifiedData.sort(compareValues(name)); // compare the values for sorting
    }
    clickedSortButtonName = name;

    renderTable(modifiedData); // render the table with sorted array
}

function renderTable(data) {
    table.innerHTML = "";
    populateTable(data);
}

function compareValues(key) {

    return function (a, b) {
        const valA = isNaN(a[key]) ? a[key] : parseFloat(a[key]);
        const valB = isNaN(b[key]) ? b[key] : parseFloat(b[key]);
        return valA > valB ? 1 : valA < valB ? -1 : 0;
    };
}

//function to handle moving of a row up
function moveRowUp() {
    if (!clickedRow) return; // early return if no row is selected

    const previousRow = clickedRow.previousElementSibling;

    // Remove "no-operation" class from the down button
    downBtn.classList.remove('no-operation');

    if (previousRow) {
        // Disable the up button if we're at the top row
        if (!previousRow.previousElementSibling) {
            upBtn.classList.add('no-operation');
        }

        // Get the index of the current row
        const id = clickedRow.getAttribute('data-index');
        const index = modifiedData.findIndex((obj) => obj.id == id);

        // Swap the objects in the array
        const previousObj = modifiedData[index - 1];
        modifiedData[index - 1] = modifiedData[index];
        modifiedData[index] = previousObj;

        // Move the clicked row before the previous row
        table.insertBefore(clickedRow, previousRow); // kind of swaps the two rows, specificslly places clicked row before previous row
    }
}

//function to handle moving of a row down
function moveRowDown() {
    if (!clickedRow) return; // early return if no row is selected

    const nextRow = clickedRow.nextElementSibling;

    // Remove "no-operation" class from the up button
    upBtn.classList.remove('no-operation');

    if (nextRow) {
        // Disable the down button if we're at the last row
        if (!nextRow.nextElementSibling) {
            downBtn.classList.add('no-operation');
        }

        // Get the index of the current row
        const id = clickedRow.getAttribute('data-index');
        const index = modifiedData.findIndex((obj) => obj.id == id);

        // Swap the objects in the array
        const nextObj = modifiedData[index + 1];
        modifiedData[index + 1] = modifiedData[index];
        modifiedData[index] = nextObj;

        // Move the next row before the clicked row
        table.insertBefore(nextRow, clickedRow); // kind of swaps the two rows, specificslly places next row before clicked row
    }
}


function deleteRow() {
    if (clickedRow) {
        const idToDelete = clickedRow.getAttribute('data-index');
        modifiedData = modifiedData.filter((chemical) => chemical.id != idToDelete); // filter out the array based on the id of a chemical in the array

        clickedRow.remove();
        saveToLocalStorage(); // Save updated data to local storage
        clickedRow = null;
    } else {
        alert("No Row Selected")
    }
}


const addBtn = document.querySelector(".add-btn");
const downBtn = document.querySelector(".down-btn");
const upBtn = document.querySelector(".up-btn");
const deleteBtn = document.querySelector(".delete-btn");
const refreshBtn = document.querySelector(".refresh-btn");
const saveBtn = document.querySelector(".save-btn");

/********************************************EVENT LISTENERS **************************************/


addBtn.addEventListener("click", function (e) {
    addInputRow();
});

saveBtn.addEventListener("click", function (e) {
    saveInputData();
});

//function to rollback to previous saved data
refreshBtn.addEventListener("click", (e) => {

    table.innerHTML = "";
    modifiedData = chemicalsData;
    noOfRows = modifiedData.length;
    populateTable(chemicalsData);
    saveToLocalStorage(chemicalsData); // save the current data to local storage
    alert("Table data set to last check point")
})


let previousRow = null;

//using event delegation handling the correct row highlighting iff the first column is clicked in a row.
document.querySelector("tbody").addEventListener("click", (e) => {
    const clickedTd = e.target.closest("td"); // find the closest table data cell

    if (clickedTd && clickedTd.cellIndex === 0) {  // Make sure click is on the first column
        clickedTd.children[0].style.color = '#0032c8';  // Change tick mark color to blue

        const clickedTr = clickedTd.closest("tr");
        upBtn.classList.remove('no-operation');
        downBtn.classList.remove('no-operation');

        if (clickedRow === clickedTr) {
            // Deselect the row if clicked again
            previousRow = clickedTr;
            clickedRow.classList.remove("highlight-row");
            clickedRow = null;
        } else {
            // If there's already a selected row, revert its tick mark to grey
            if (previousRow) {
                previousRow.children[0].children[0].style.color = "#aaaaaa";  // Set previous tick mark to grey
            }

            clickedRow?.classList?.remove("highlight-row");  // Remove highlight from the previously clicked row (if any)

            // Update tick mark color for the current row and highlight it
            clickedRow = clickedTr;
            clickedRow.children[0].children[0].style.color = "#0032c8";  // Set current tick mark to blue
            clickedRow.classList.add("highlight-row");

            // Store the current row as the previously selected row
            previousRow = clickedRow;
        }
        if (clickedRow.getAttribute('data-index') == modifiedData[0].id) {
            upBtn.classList.add('no-operation');   // to indicate the row is uppermost make the uparrow gray
        }
        if (clickedRow.getAttribute('data-index') == modifiedData[modifiedData.length - 1].id) {
            downBtn.classList.add('no-operation');  // to indicate the row is lowermost make the downarrow gray
        }
    }
});

//if a row is clicked then any click outside the table or tooolbar means make the row normal again
document.addEventListener("click", (e) => {
    const isInsideTable = e.target.closest("#table");
    const isInsideToolbar = e.target.closest(".toolbar");
    if (!isInsideTable && !isInsideToolbar) {
        clickedRow?.classList.remove("highlight-row");
        clickedRow.children[0].children[0].style.color = "#aaaaaa";
        clickedRow = null;
    }
});

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("fa-sort")) {
        handleSort(e);
    }
});

upBtn.addEventListener("click", function () {
    moveRowUp();
});

downBtn.addEventListener("click", function () {
    moveRowDown();
});

deleteBtn.addEventListener("click", function (e) {
    deleteRow();
});

