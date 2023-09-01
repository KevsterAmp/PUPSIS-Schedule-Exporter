document.querySelector('#convertButton').addEventListener('click', function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentTab = tabs[0];
    
    if ((/sis.*\/student\/schedule$/).test(currentTab.url)) {
      chrome.tabs.sendMessage(currentTab.id, { type: 'getschedule' });
    } else {
      // navigates to sis portal
      chrome.tabs.create({ url: 'https://sis2.pup.edu.ph/student/schedule' }, function(newTab) {
        chrome.tabs.update(newTab.id, { active: true });
      });
    }
  });
});


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  const alertBox = document.querySelector("#display-box");
  const newTag = document.createElement("p");
  newTag.className = "display-text";

  if (request.type === "receiveschedule") {
    if (request.schedule.length < 1) {
      newTag.textContent = "Empty schedule found";
    }

    else {
      const output = separateSchedules(request.schedule);
      const iCalData = jsonToICal(output);
      downloadICS(iCalData, "schedule");

      newTag.textContent = "ICalendar file (.ics) downloaded!";
    }

    alertBox.appendChild(newTag);
  }
});


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
              subject: data[i].subject,
              "Start Date": getDayDate(days[0]),
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
                  subject: data[i].subject,
                  "Start Date": getDayDate(days[j]),
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
  

// Function to download .ics file
function downloadICS(content, filename) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename + '.ics';
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
