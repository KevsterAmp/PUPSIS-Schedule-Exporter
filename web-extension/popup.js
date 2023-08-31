document.querySelector('#convertButton').addEventListener('click', function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    chrome.tabs.sendMessage(tabs[0].id, {type: 'getschedule'});
  });
});
  
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === "receiveschedule") {
    const output = separateSchedules(request.schedule);
    downloadCSV(output);
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


function convertToCSV(data) {
  const csvRows = [];

  // Adding the header row
  const headers = Object.keys(data[0]);
  csvRows.push(headers.join(','));

  // Adding data rows
  for (const row of data) {
      const values = headers.map(header => {
      const value = row[header];
      return value.includes(',') ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
  }

  // Joining rows with newline characters
  return csvRows.join('\n');
  }


function downloadCSV(csvContent) {
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'schedule.csv';
  link.click();
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
  return convertToCSV(csvObject);
}

function formatTime(timeString) {
  const [time, period] = timeString.match(/(\d+:\d+)([APMapm]+)/).slice(1);
  const formattedTime = `${time} ${period.toUpperCase()}`;
  return formattedTime;
}
