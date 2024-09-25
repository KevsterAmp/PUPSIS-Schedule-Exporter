import * as helpers from './utils/helpers.js';
import * as exports from './utils/exports.js';


// Debugging FLAGS (use when in local copy of SIS page)
const OVERRIDE_DEV = false;


function handleClickEvent(){
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const currentTab = tabs[0];
      
      //set to false when pushing to main, true when testing
        if (OVERRIDE_DEV) {
          chrome.tabs.sendMessage(currentTab.id, { type: 'getschedule' });
        }
      // checks if SIS portal is open and extracts
        else if ((/sis.*\/student\/schedule$/).test(currentTab.url)) {
          chrome.tabs.sendMessage(currentTab.id, { type: 'getschedule' });
        } 
      // opens new tab with SIS page
        else {
          chrome.tabs.create({ url: 'https://sis2.pup.edu.ph/student/schedule' }, function(newTab) {
          chrome.tabs.update(newTab.id, { active: true });
          });
        }
    });
}

/*********************************/
document.querySelector('#convertButton').addEventListener('click', function(){
  handleClickEvent();

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
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
    } else {
        document.getElementById("dateInput").disabled = false;
    }
    
});

// set the default end date (4 months from now) of the date input 
helpers.setDefaultEndDate(4);

/***********************
 * editButton
 */
document.querySelector('#editButton').addEventListener('click', function(event) {
  // Prevent the default form submission behavior
  event.preventDefault();

  handleClickEvent();

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type == "receiveschedule") {
      if (request.schedule.length < 1) {
        helpers.displayMessage("Empty schedule found", "display-text-error");
      } else {
        // process the raw infos
        let userSched =  helpers.assignColorsToSubjects(helpers.separateSchedules(request.schedule));
        console.log(userSched);

        // Store the data in localStorage
        localStorage.setItem("userSched", JSON.stringify(userSched));

        window.open("edit.html", "MyWindow", "width=1200, height=438, scrollbars=yes");
      }
    }
  });
});



