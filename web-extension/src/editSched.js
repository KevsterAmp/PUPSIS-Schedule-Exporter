
import * as helpers from './utils/helpers.js';
import * as exports from './utils/exports.js';


// pre-processed content invoked from popup.js
var userSchedString = localStorage.getItem("userSched");
var userSched = JSON.parse(userSchedString);

updateTable(userSched);

// deletes the row on the table
document.getElementById("table-content").addEventListener('click', function (event) {
    if (event.target.classList.contains('deleteButton')) {
        const row = event.target.closest('tr');
        if (row) {
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
    table.textContent = ''; // safer alternative to innerHTML

    infos.forEach((info, i) => {
        const row = table.insertRow(-1);

        // Create and populate cells without using innerHTML
        const scheduleCell = row.insertCell(0);
        const scheduledDayCell = row.insertCell(1);
        const subjectCell = row.insertCell(2);
        const descriptionCell = row.insertCell(3);
        const colorCell = row.insertCell(4);
        const deleteCell = row.insertCell(5);

        // Populate schedule cell with inputs
        const startTimeInput = document.createElement('input');
        startTimeInput.type = 'time';
        startTimeInput.className = 'dateBox';
        startTimeInput.name = 'start_time';
        startTimeInput.value = helpers.convert12hrTo24hr(info.start_time);
        scheduleCell.appendChild(startTimeInput);

        const endTimeInput = document.createElement('input');
        endTimeInput.type = 'time';
        endTimeInput.className = 'dateBox';
        endTimeInput.name = 'end_time';
        endTimeInput.value = helpers.convert12hrTo24hr(info.end_time);
        scheduleCell.appendChild(endTimeInput);

        // Populate scheduled day cell with a select dropdown
        const selectDay = document.createElement('select');
        selectDay.name = 'scheduled_day';
        selectDay.className = 'scheduledDay';
        const days = [
            { value: 'M', text: 'Monday' },
            { value: 'T', text: 'Tuesday' },
            { value: 'W', text: 'Wednesday' },
            { value: 'TH', text: 'Thursday' },
            { value: 'F', text: 'Friday' },
            { value: 'S', text: 'Saturday' },
            { value: 'SUN', text: 'Sunday' }
        ];

        days.forEach(day => {
            const option = document.createElement('option');
            option.className = 'btn-txt';
            option.value = day.value;
            option.textContent = day.text;
            if (info.scheduled_day === day.value) {
                option.selected = true;
            }
            selectDay.appendChild(option);
        });
        scheduledDayCell.appendChild(selectDay);

        // Subject input
        const subjectCodeInput = document.createElement('input');
        subjectCodeInput.type = 'hidden';
        subjectCodeInput.name = 'subject_code';
        subjectCodeInput.value = info.subject_code;
        subjectCell.appendChild(subjectCodeInput);

        const subjectNameInput = document.createElement('input');
        subjectNameInput.type = 'text';
        subjectNameInput.name = 'subject_name';
        subjectNameInput.className = 'inputBox';
        subjectNameInput.placeholder = 'Subject';
        subjectNameInput.value = info.subject;
        subjectCell.appendChild(subjectNameInput);

        // Description textarea
        const descriptionTextarea = document.createElement('textarea');
        descriptionTextarea.className = 'inputBox descriptionBox';
        descriptionTextarea.name = 'description';
        descriptionTextarea.placeholder = 'Description';
        descriptionTextarea.textContent = info.instructor;
        descriptionCell.appendChild(descriptionTextarea);

        // Color input
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.id = 'colorPicker';
        colorInput.name = 'color';
        colorInput.value = info.color;
        colorCell.appendChild(colorInput);

        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'deleteButton';
        deleteButton.type = 'button';
        deleteButton.id = i.toString();
        deleteButton.textContent = 'Delete';
        deleteCell.appendChild(deleteButton);
    });
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
        const start_time = helpers.parseDateTime(curr_date, cells[0].querySelector(`[name="start_time"]`).value);
        const end_time = helpers.parseDateTime(curr_date, cells[0].querySelector(`[name="end_time"]`).value);
        //const start_date = (new Date(document.querySelector('[name="dateInput"]').value)).toLocaleDateString('en-US');

        const output = {
            start_time: helpers.convert24hrto12hr(start_time),
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

document.querySelector('#convertButton').addEventListener('click', function () {
    const output = readTable();
    let preferredFileType = document.getElementById("fileType").value;

    let data, textContent, newTag_textContent;
    if (preferredFileType === 'csv') {
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
    for (let i = 0; i < dateBoxes.length; i++) {
        if (preferredFileType === 'csv' || preferredFileType === 'json') {
            dateBoxes[i].disabled = true;
            inputBoxes[i].disabled = true;
            document.getElementById("dateInput").disabled = true;
            document.getElementById("startDateInput").disabled = true;
        } else {
            dateBoxes[i].disabled = false;
            inputBoxes[i].disabled = false;
            document.getElementById("dateInput").disabled = false;
            document.getElementById("startDateInput").disabled = false;
        }
    }

});

function editDisplayMessage(message) {
    const msg = document.getElementById('bottom-text');
    msg.style.display = 'block';
    msg.textContent = message;
    setTimeout(() => {
        msg.style.display = 'none';
    }, 5000);
}

helpers.setDefaultEndDate(4);


