document.querySelector('#convertButton').addEventListener('click', function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentTab = tabs[0];
    
    //set to false when pushing to main, true when testing
    const OVERRIDE_DEV = false;
    if (!OVERRIDE_DEV) {
      if ((/sis.*\/student\/schedule$/).test(currentTab.url)) {
        chrome.tabs.sendMessage(currentTab.id, { type: 'getschedule' });
      } 
      
      else {
        // navigates to sis portal
        chrome.tabs.create({ url: 'https://sis2.pup.edu.ph/student/schedule' }, function(newTab) {
        chrome.tabs.update(newTab.id, { active: true });
        });
      }
    }
    else {
      chrome.tabs.sendMessage(currentTab.id, { type: 'getschedule' });
    }
  });
});


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  const alertBox = document.querySelector("#display-box");
  let newTag = document.querySelector(".display-text");

  if(!newTag){
    const displayText = document.createElement("p");
    displayText.className = "display-text";
    alertBox.appendChild(displayText);
    newTag = displayText;
  }

  if (request.type === "receiveschedule") {
    if (request.schedule.length < 1) {
      newTag.textContent = "Empty schedule found";
      newTag.classList.add("display-text-error");
    }

    else {

      const output = separateSchedules(request.schedule);

      // This will first convert the data into the preferred file format 
      // and then proceed to initiate the download of the converted data
      let data;
      let textContent;
      if (preferredFileType === 'csv') {
        data = jsonToCSV(output);
        textContent = "CSV";
      } 
      else if (preferredFileType === 'ics') {
        data = jsonToICal(output);
        textContent = "ICalendar";
      }
      else if (preferredFileType === 'json') {
        //insert json function here
        textContent = "JSON";
      }
      downloadFile(data, "schedule", preferredFileType);

      // change the text content depending on the preferred file type
      newTag.textContent = `${textContent} file (.${preferredFileType}) downloaded!`;
    }
    alertBox.appendChild(newTag);
  }
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

/**
 *  sets the default value of the date input element
 * 
 * @param {number} endDateInMonths - the added month value from now  
 */
function setDefaultEndDate(endDateInMonths) {
    const dateInputElement = document.getElementById("dateInput");
    const newDate = new Date();
    newDate.setMonth(newDate.getMonth() + endDateInMonths);
    dateInputElement.value = newDate.toISOString().slice(0, 10);
    console.log("set default");
}

// set the default end date (4 months from now) of the date input 
setDefaultEndDate(4);

function getDayDate(dayOfWeek) {
  const today = new Date();
  const currentDay = today.getDay(); // 0 (Sunday) to 6 (Saturday)
  const daysOfWeek = ["SUN", "M", "T", "W", "TH", "F", "S"];
  
  const targetDayIndex = daysOfWeek.indexOf(dayOfWeek);
  if (targetDayIndex === -1) {
    return null; // Invalid dayOfWeek input
  }

  const daysUntilTargetDay = targetDayIndex - currentDay + (targetDayIndex <= currentDay ? 7 : 0);
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysUntilTargetDay);
  
  return targetDate.toLocaleDateString();
}


function separateSchedules(data) {
  let csvObject = [];
  for (let i = 0; i < data.length; i++) {
      let entry = data[i].schedule;
      let x = entry.split(" ");

      let days = x[0].split("/");
      let times = x[1].split("/");
      if (days.length === 1) {
          const output = {
              subject_code: data[i].subject_code,
              subject: data[i].subject,
              "Start Date": getDayDate(days[0]),
              "Scheduled Day": days[0], 
              "All Day Event": "FALSE",
              "Start Time": formatTime(times[0].split("-")[0]),
              "End Time": formatTime(times[0].split("-")[1]),
              Location: "",
              Description: ""
          }
          csvObject.push(output);
      }
      else {
          for (let j = 0; j < days.length; j++) {
              const output = {
                  subject_code: data[i].subject_code,
                  subject: data[i].subject,
                  "Start Date": getDayDate(days[j]),
                  "Scheduled Day": days[j],
                  "All Day Event": "FALSE",
                  "Start Time": formatTime(times[j].split("-")[0]),
                  "End Time": formatTime(times[j].split("-")[1]),
                  Location: "",
                  Description: ""
              }
              csvObject.push(output);
          }
      }
  }
  return csvObject;
}


// Function to convert JSON data to iCalendar format with recurring rule
function jsonToICal(events) {
  let icalContent = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PUPSIS TO ICS//Event Calendar//EN\n`;

  const currentDate = new Date();
  let endRecurringDate = "";
  let dateInput = document.getElementById("dateInput").value;

  if (dateInput === "") {
    endRecurringDate = new Date();
    endRecurringDate.setMonth(currentDate.getMonth() + 4);
  }

  else {
    endRecurringDate = new Date(dateInput);
  }

  for (const event of events) {
    const uid = event.subject.replace(/\s+/g, '') + event['Start Date'] + event['Start Time'];
    const startDate = parseDateTime(event['Start Date'], event['Start Time']);
    const endDate = parseDateTime(event['Start Date'], event['End Time']);

    if (!startDate || !endDate) {
      console.error('Invalid date or time format.');
      continue;
    }

    icalContent +=
`BEGIN:VEVENT
UID:${uid}
SUMMARY:${event.subject}
DTSTART:${formatICalDate(startDate)}
DTEND:${formatICalDate(endDate)}
RRULE:FREQ=WEEKLY;UNTIL=${formatICalDate(endRecurringDate)}
END:VEVENT\n`;
  }

  icalContent += 'END:VCALENDAR';
  return icalContent;
}


// Function to parse date and time strings
function parseDateTime(dateStr, timeStr) {
  const [month, day, year] = dateStr.split('/').map(Number);
  const [time, meridian] = timeStr.split(/(?=[APap][Mm])/); // Split at AM or PM marker
  let [hours, minutes] = time.split(':').map(Number);

  // Adjust hours for AM/PM
  if (meridian && meridian.toLowerCase() === 'pm' && hours !== 12) {
    hours += 12;
  } else if (meridian && meridian.toLowerCase() === 'am' && hours === 12) {
    hours = 0;
  }

  const parsedDate = new Date(year, month - 1, day, hours, minutes);

  if (isNaN(parsedDate)) {
    console.error(`Failed to parse date: ${dateStr} ${timeStr}`);
    return null;
  }

  return parsedDate;
}


// Function to format date as iCalendar date-time format (yyyyMMddTHHmmssZ)
function formatICalDate(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Function to download with the preferred file type
function downloadFile(content, filename, fileType) {
  
  let contentType;
  
  if (fileType === 'csv') {
    contentType = 'text/csv';
  } else if (fileType === 'ics') {
    contentType = 'text/calendar;charset=utf-8';
  }

  const blob = new Blob([content], {type: contentType});
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename + `.${fileType.toLowerCase()}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function formatTime(timeString) {
  const [time, period] = timeString.match(/(\d+:\d+)([APMapm]+)/).slice(1);
  const formattedTime = `${time} ${period.toUpperCase()}`;
  return formattedTime;
}

// converts 24-hr to 12-hr format
function strtimeAMPM(date) {
    let hour = date.getHours();
    let min = date.getMinutes();

    let ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    hour = hour === 0 ? 12 : hour;

    return `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")} ${ampm}`;

}

// generate an array of 30-minute timeslots from a given range
function generateTimeslots(startHour, endHour) {

    const date = new Date();
    date.setHours(0, 0, 0, 0);

    const timeslots = [];

    for (let i = 0; i < 48; i++) {

        if (date.getHours() >= endHour) {
            break;
        }

        if (date.getHours() >= startHour) {
            timeslots.push(strtimeAMPM(date));
        } 
        
        date.setMinutes(date.getMinutes() + 30);
    }

    return timeslots;
}

/**
 * converts an object of schedules to a csv-compatible object
 * 
 * @param object - an object containing the rows of the extracted and separated schedule
 * @returns an object compatible for conversion to csv file
 */
function jsonToCSV(output) {
    
    const timeslots = generateTimeslots(7, 22);

    const fullDaysOfWeek = [
        "Sunday", "Monday", "Tuesday", 
        "Wednesday", "Thursday", "Friday", "Saturday"
    ];

    const daysOfWeek = ["SUN", "M", "T", "W", "TH", "F", "S"];

    // get the days of the week as the header
    const headers = ["", [...fullDaysOfWeek]];

    const csv = [];
    csv[0] = headers;

    // 2d array [timeslots][7];
    for (let i = 0; i < timeslots.length; i++) {
        if (i + 1 < timeslots.length) {
            csv.push([`${timeslots[i]} - ${timeslots[i+1]}`, "", "", "", "", "", "", ""]);
        }
    }

    output.forEach(row => {
        
        // get all the needed values from the current row
        let subjectTimeslotIdx = timeslots.indexOf(row["Start Time"]);
        let dayIdx = daysOfWeek.indexOf(row["Scheduled Day"]);
        let subject = row["subject_code"].toString().replace(",", "");

        // set the start time to the end time's timeslot value to the current subject
        // ex. (8:00 AM - 9:30 AM - <subject>)
        while (timeslots[subjectTimeslotIdx] !== row["End Time"]) {
            csv[subjectTimeslotIdx + 1][dayIdx + 1] = subject;
            subjectTimeslotIdx++;
        }

    });

    return csv.join('\n');
};