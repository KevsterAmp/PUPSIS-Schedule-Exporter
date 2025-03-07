import * as helpers from './utils/helpers.js';
import * as exports from './utils/exports.js';


// Debugging FLAGS
const OVERRIDE_DEV = false;


function handleClickEvent() {
  // "activeTab" permission is temporarily granted for the active tab in response to user action
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    const currentTab = tabs[0];

    // Check if the URL matches the expected pattern
    if (OVERRIDE_DEV) {
      // Send message to the content script to extract schedule
      browser.tabs.sendMessage(currentTab.id, { type: 'getschedule' })
        .catch((error) => {
          console.error('Error sending message to content script:', error);
        });
    } else if ((/sis.*\/student\/schedule$/).test(currentTab.url)) {
      // Send message to the content script to extract schedule
      browser.tabs.sendMessage(currentTab.id, { type: 'getschedule' })
        .catch((error) => {
          console.error('Error sending message to content script:', error);
        });
    } else {
      // If the user is not on the schedule page, open the SIS portal
      browser.tabs.create({ url: 'https://sis2.pup.edu.ph/student/schedule' });
    }
  }).catch((error) => {
    console.error('Error querying active tab:', error);
  });
}


/*********************************/
document.querySelector('#convertButton').addEventListener('click', function () {
  handleClickEvent();

  browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === "receiveschedule") {
      if (request.schedule.length < 1) {
        helpers.displayMessage("Empty schedule found", "display-text-error");
      }
      else {
        const output = helpers.separateSchedules(request.schedule);
        console.log(request.schedule);
        // This will first convert the data into the preferred file format 
        // and then proceed to initiate the download of the converted data
        let data, textContent, newTag_textContent;
        if (preferredFileType === 'csv') {
          data = exports.jsonToCSV(output);
          textContent = "CSV";
        }
        else if (preferredFileType === 'ics') {
          data = exports.jsonToICal(output);

          console.log('---------------');
          console.log(data)
          textContent = "ICalendar";
        }
        else if (preferredFileType === 'json') {
          data = helpers.assignColorsToSubjects(output);
          data = exports.jsonToScheduleMaker(data);
          textContent = "JSON";
        }
        exports.downloadFile(data, "schedule", preferredFileType);
        newTag_textContent = `${textContent} file (.${preferredFileType}) downloaded!`;
        // change the text content depending on the preferred file type
        helpers.displayMessage(newTag_textContent);
      }

    }
  });


});

const fileTypeSelect = document.getElementById("fileType");
let preferredFileType = fileTypeSelect.value;

// change the value of fileTypeSelect whenever the value of the selection is changed
fileTypeSelect.addEventListener("change", (e) => {
  preferredFileType = e.target.value;
  if (preferredFileType === 'csv' || preferredFileType == 'json') {
    document.getElementById("dateInput").disabled = true;
    document.getElementById("startDateInput").disabled = true;
  } else {
    document.getElementById("dateInput").disabled = false;
    document.getElementById("startDateInput").disabled = false;
  }

});

// set the default end date (4 months from now) of the date input 
helpers.setDefaultEndDate(4);
helpers.setDefaultStartDate();

/***********************
 * editButton
 */
document.querySelector('#editButton').addEventListener('click', function (event) {
  // Prevent the default form submission behavior
  event.preventDefault();

  handleClickEvent();

  browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type == "receiveschedule") {
      if (request.schedule.length < 1) {
        helpers.displayMessage("Empty schedule found", "display-text-error");
      } else {
        // process the raw infos
        let userSched = helpers.assignColorsToSubjects(helpers.separateSchedules(request.schedule));
        console.log(userSched);

        // Store the data in localStorage
        localStorage.setItem("userSched", JSON.stringify(userSched));

        window.open("edit.html", "MyWindow", "width=1200, height=438, scrollbars=yes");
      }
    }
  });
});



