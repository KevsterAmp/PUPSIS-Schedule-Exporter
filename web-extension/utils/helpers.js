
// Function helpers for popup.js 

/**
 *  sets the default value of the date input element
 * 
 * @param {number} endDateInMonths - the added month value from now  
 * @return {void} sets the calendar element end date by 4 months
*/
export function setDefaultEndDate(endDateInMonths) {
  const dateInputElement = document.getElementById("dateInput");
  const newDate = new Date();
  newDate.setMonth(newDate.getMonth() + endDateInMonths);
  dateInputElement.value = newDate.toISOString().slice(0, 10);
  console.log("set default");
}


export function getDayDate(dayOfWeek) {
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

export function separateSchedules(data) {
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
        instructor: data[i].instructor != '' ? `Instructor: ${fnameFormat(data[i].instructor)}` : '',
        start_date: getDayDate(days[0]),
        scheduled_day: days[0],
        start_time: formatTime(times[0].split("-")[0]),
        end_time: formatTime(times[0].split("-")[1])
      }
      csvObject.push(output);
    }
    else {
      for (let j = 0; j < days.length; j++) {
        const output = {
          subject_code: data[i].subject_code,
          subject: data[i].subject,
          instructor: data[i].instructor != '' ? `Instructor: ${fnameFormat(data[i].instructor)}` : '',
          start_date: getDayDate(days[j]),
          scheduled_day: days[j],
          start_time: formatTime(times[j].split("-")[0]),
          end_time: formatTime(times[j].split("-")[1])
        }
        csvObject.push(output);
      }
    }
  }
  return csvObject;
}

// Function to parse date and time strings
export function parseDateTime(dateStr, timeStr) {
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
export function formatICalDate(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export function formatTime(timeString) {
  const [time, period] = timeString.match(/(\d+:\d+)([APMapm]+)/).slice(1);
  const formattedTime = `${time} ${period.toUpperCase()}`;
  return formattedTime;
}

/**converts 24-hr to 12-hr format
 * @param {number} date 
*/
export function convert24hrto12hr(date) {
  let hour = date.getHours();
  let min = date.getMinutes();

  let ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour === 0 ? 12 : hour;

  return `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")} ${ampm}`;

}

/**
 *  generate an array of 30-minute timeslots from a given range
 * @param {*} startHour 
 * @param {*} endHour 
 * @returns {Array {<number>}} Timeslots
 */
export function generateTimeslots(startHour, endHour) {

  const date = new Date();
  date.setHours(0, 0, 0, 0);

  const timeslots = [];

  for (let i = 0; i < 48; i++) {

    if (date.getHours() >= endHour) {
      break;
    }

    if (date.getHours() >= startHour) {
      timeslots.push(convert24hrto12hr(date));
    }

    date.setMinutes(date.getMinutes() + 30);
  }

  return timeslots;
}

/**
 * 
 * @param {time} - time in 12hr format  
 * @returns {string}- time in 24hr format
 */
export function convert12hrTo24hr(time12hr) {
  // Split the input time into hours, minutes, and AM/PM parts
  const parts = time12hr.match(/(\d+):(\d+) (AM|PM)/);

  if (!parts || parts.length !== 4) {
    // Invalid input format
    return "Invalid time format";
  }

  let hours = parseInt(parts[1]);
  const minutes = parseInt(parts[2]);
  const period = parts[3];

  if (hours === 12) {
    // 12 AM should be converted to 00:00
    if (period === "AM") {
      hours = 0;
    }
  } else if (period === "PM") {
    // Convert PM hours to 24-hour format
    hours += 12;
  }

  // Format the result as HH:mm
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * 
 * @param {object} - the array of schedules created by separateSchedules function
 * @returns {Array <{color : string}>}- object with added color format
 */
export function assignColorsToSubjects(output) {
  const subjects = output.map(item => item.subject);
  const uniqueSubjects = [...new Set(subjects)];
  const colors = [
    '#FF5733', // Dark Coral
    '#3377FF', // Medium Blue
    '#FF338A', // Dark Pink
    '#3333FF', // Dark Slate Blue
    '#FF33A4', // Dark Magenta
    '#33B0FF', // Deep Sky Blue
    '#FF9D33', // Dark Orange
    '#3367FF', // Royal Blue
    '#FF336A', // Red-Orange
    '#33FFD4', // Medium Aquamarine
    '#FF3333', // Dark Red
  ];

  const colorMap = {};

  uniqueSubjects.forEach((subject, index) => {
    colorMap[subject] = colors[index];
  });

  return output.map(item => ({
    ...item,
    color: colorMap[item.subject],
  }));
}


/**Converts the extracted name into First Name, Surname format
 * @param {string} name - Extracted name
 * @returns {string} formatted_name - Named formatted on FNAME, SURNAME format
 */
export function fnameFormat(name) {
  const formatted_name = name.split(',').reverse().join(' ').split(' ').map(namePart => namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase()).join(' ');
  return formatted_name
}

/**displays the message on the popup container
 * @param {string} message - Content to be displayed on the p tag
 * @returns {void} displays the message on the popup container
 */
export function displayMessage(message, alertClass=""){
    const alertBox = document.querySelector("#display-box");
    let newTag = document.querySelector(".display-text");

    if (!newTag) {
      newTag = document.createElement("p");
      newTag.className = `display-text`;
    }

    if(alertClass!=""){
      newTag.classList.add(alertClass);
    }
    
    newTag.textContent = message;
    alertBox.appendChild(newTag);
   

}   