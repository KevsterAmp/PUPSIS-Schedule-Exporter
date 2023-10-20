
import * as helpers from './utils/helpers.js';
import * as exports from './utils/exports.js';


// pre-processed content invoked from popup.js
var userSchedString = localStorage.getItem("userSched");
var userSched = JSON.parse(userSchedString);

updateTable(userSched);

// deletes the row on the table
document.getElementById("table-content").addEventListener('click', function(event){
    if(event.target.classList.contains('deleteButton')){
        const row = event.target.closest('tr');
        if(row){
            row.remove()
        }
    }
})

/**Displays the infos array on the html content
    * @param {Array <infos : string>}
    * @return {void} - actual content on the edit window
 */
function updateTable(infos) {
    const table = document.querySelector("#table-content tbody");

    // Clear existing table content
   table.innerHTML = '';

    for (let i=0; i < infos.length; i++) {
        const info = infos[i];
        const row = table.insertRow(-1);

        // Create cells for the row
        const scheduleCell = row.insertCell(0);
        const scheduledDay_cell = row.insertCell(1)
        const subjectCell = row.insertCell(2);
        const descriptionCell = row.insertCell(3);
        const colorCell = row.insertCell(4);
        const deleteCell = row.insertCell(5);
        

        // Populate the cells with content
        scheduleCell.innerHTML = `
        <input type="time" class="dateBox" name="start_time" value="${helpers.convert12hrTo24hr(info.start_time)}">
        <input type="time" class="dateBox" name="end_time" value="${helpers.convert12hrTo24hr(info.end_time)}">
    `;
        scheduledDay_cell.innerHTML = `
        <select name="scheduled_day" class="scheduledDay">
            <option class="btn-txt" value="M" ${info.scheduled_day === 'M' ? 'selected' : ''}>Monday</option>
            <option class="btn-txt" value="T" ${info.scheduled_day === 'T' ? 'selected' : ''}>Tuesday</option>
            <option class="btn-txt" value="W" ${info.scheduled_day === 'W' ? 'selected' : ''}>Wednesday</option>
            <option class="btn-txt" value="TH" ${info.scheduled_day === 'TH' ? 'selected' : ''}>Thursday</option>
            <option class="btn-txt" value="F" ${info.scheduled_day === 'F' ? 'selected' : ''}>Friday</option>
            <option class="btn-txt" value="S" ${info.scheduled_day === 'S' ? 'selected' : ''}>Saturday</option>
            <option class="btn-txt" value="SUN" ${info.scheduled_day === 'SUN' ? 'selected' : ''}>Sunday</option>
        </select>
    `;
        subjectCell.innerHTML = `
        <input type="hidden" name="subject_code" value="${info.subject_code}">
        <input type="text" name="subject_name" class="inputBox" placeholder="Subject" value="${info.subject}">
    `;
        descriptionCell.innerHTML = `<textarea class="inputBox descriptionBox" name="description" placeholder="Description">${info.instructor}</textarea>`;
        colorCell.innerHTML = `<input type="color" id="colorPicker" name="color"  value="${info.color}">`;
        deleteCell.innerHTML = `<button class="deleteButton" type="button" id="${i}">Delete</button>`;
    }
}

/** reads the table content on edit.html window
 * @param {void}
 * @returns {Array <output : object>}
 */
function readTable() {
    const tableContent = document.getElementById('table-content');
    const rows = tableContent.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    const jsonArray = [];

    for (const row of rows) {
        const cells = row.getElementsByTagName('td');
        // time
        const currentDate = new Date();
        const curr_date = `${currentDate.getMonth() + 1}/${currentDate.getDate()}/${currentDate.getFullYear()}`;
        const start_time = helpers.parseDateTime( curr_date, cells[0].querySelector(`[name="start_time"]`).value);
        const end_time = helpers.parseDateTime(curr_date, cells[0].querySelector(`[name="end_time"]`).value);
        //const start_date = (new Date(document.querySelector('[name="dateInput"]').value)).toLocaleDateString('en-US');

        const output = {
            start_time : helpers.convert24hrto12hr(start_time),
            end_time: helpers.convert24hrto12hr(end_time),
            scheduled_day: cells[1].querySelector('select[name="scheduled_day"]').value,
            start_date: helpers.getDayDate(cells[1].querySelector('select[name="scheduled_day"]').value),
            subject_code: cells[2].querySelector(`[name="subject_code"]`).value,
            subject: cells[2].querySelector(`[name="subject_name"]`).value,
            instructor: (cells[3].querySelector(`[name="description"]`).value),
            color: cells[4].querySelector(`[name="color"]`).value
        };
        jsonArray.push(output);

    }

    return jsonArray;
}

window.addEventListener('beforeunload', function (e) {
    // Cancel the default behavior (prompt) unless a condition is met
    if (changesMade) {
        e.preventDefault();
        e.returnValue = ''; // Required for older browsers
    }
});

var changesMade = true; // (set to true when changes are made)

// Prompt the user when they try to close the window
window.onbeforeunload = function () {
    if (changesMade) {
        return 'You have unsaved changes. Are you sure you want to exit?';
    }
};



// file handling

document.querySelector('#convertButton').addEventListener('click', function(){
    const output = readTable();
    let preferredFileType = document.getElementById("fileType").value;

    let data, textContent, newTag_textContent;
    if (preferredFileType === 'csv') {
      output = 
      data = exports.jsonToCSV(output);
      textContent = "CSV";
    } 
    else if (preferredFileType === 'ics') {
      const remove_rawLine = (array) => array.map(obj => ({ ...obj, instructor: (obj.instructor).replace(/\r?\n/g, "\\n") }));
      data = exports.jsonToICal(remove_rawLine(output));
      textContent = "ICalendar";
    }
    else if (preferredFileType === 'json') {
      data = exports.jsonToScheduleMaker(output);
      textContent = "JSON";
    }
    exports.downloadFile(data, "schedule", preferredFileType);
    newTag_textContent = `${textContent} file (.${preferredFileType}) downloaded!`;
    // change the text content depending on the preferred file type
    editDisplayMessage(newTag_textContent);
});

  const fileTypeSelect = document.getElementById("fileType");
  // change the state of the "dateBox" elements whenever the value of the selection is changed
  fileTypeSelect.addEventListener("change", (e) => {
      let preferredFileType = e.target.value;

      const dateBoxes = document.getElementsByClassName("dateBox");
      const inputBoxes = document.getElementsByClassName("inputBox");
  
      // Iterate through all "dateBox" elements and set their "disabled" property
      for (let i=0; i<dateBoxes.length; i++) {
          if (preferredFileType === 'csv' || preferredFileType === 'json') {
              dateBoxes[i].disabled = true;
              inputBoxes[i].disabled = true;
              document.getElementById("dateInput").disabled = true;
          } else {
              dateBoxes[i].disabled = false;
              inputBoxes[i].disabled = false;
              document.getElementById("dateInput").disabled = false;
          }
      }

  });
  
function editDisplayMessage(message){
    const msg = document.getElementById('bottom-text');
    msg.style.display = 'block';
    msg.textContent = message;
    setTimeout(() => {
        msg.style.display = 'none';
    }, 5000);
}

  helpers.setDefaultEndDate(4);


  