import * as helpers from './helpers.js'

/**convert object schedules to iCalendar format with recurring rule
 * @param {*} events - objects contain extracted and seperated schedule
 * @return an object compatible for conversion to ics file
*/
export function jsonToICal(events) {
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
      const uid = event.subject.replace(/\s+/g, '') + event['start_date'] + event['start_time'];
      const startDate = helpers.parseDateTime(event['start_date'], event['start_time']);
      const endDate = helpers.parseDateTime(event['start_date'], event['end_time']);
  
      if (!startDate || !endDate) {
        console.error('Invalid date or time format.');
        continue;
      }
  
      icalContent +=
      `BEGIN:VEVENT
UID:${uid}
SUMMARY:${event.subject}
DTSTART:${helpers.formatICalDate(startDate)}
DTEND:${helpers.formatICalDate(endDate)}
RRULE:FREQ=WEEKLY;UNTIL=${helpers.formatICalDate(endRecurringDate)}
${event.instructor!=''?'DESCRIPTION: ':''}${event.instructor!=''?event.instructor:''}
END:VEVENT\n`;
    }
  
    icalContent += 'END:VCALENDAR';
    return icalContent;
}

/**
 * converts an object of schedules to a csv-compatible object
 * 
 * @param object - an object containing the rows of the extracted and separated schedule
 * @returns an object compatible for conversion to csv file
 */
export function jsonToCSV(output) {
    
    const timeslots = helpers.generateTimeslots(7, 22);

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
        let subjectTimeslotIdx = timeslots.indexOf(row["start_time"]);
        let dayIdx = daysOfWeek.indexOf(row["scheduled_day"]);
        let subject = row["subject_code"].toString().replace(",", "");

        // set the start_time to the end_time's timeslot value to the current subject
        // ex. (8:00 AM - 9:30 AM - <subject>)
        while (timeslots[subjectTimeslotIdx] !== row["end_time"]) {
            csv[subjectTimeslotIdx + 1][dayIdx + 1] = subject;
            subjectTimeslotIdx++;
        }

    });

    return csv.join('\n');
};


/**
 * converts an object of schedules to a Schedulemaker.io JSON format
 * @param {object} - object containing the rows of the extracted and separated schedule
 * @returns an object compatible for conversion to Schedulemaker.io via json file 
 */
export function jsonToScheduleMaker(output) {
    //temp output of json
    let events = [];
    const jsonDaysWeek = ['M', 'T', 'W', 'TH', 'F', 'S', 'SUN']
    for (let i = 0; i < output.length; i++) {
        const eventEntry = {
          title: output[i].subject,
          description: output[i].instructor,
          day: jsonDaysWeek.indexOf(output[i].scheduled_day),
          start: helpers.convert12hrTo24hr(output[i].start_time),
          end: helpers.convert12hrTo24hr(output[i].end_time),
          color: output[i].color,
          icon: null
        }
        events.push(eventEntry);
    }
    const jsonScheduleMaker = {
      "title": "My Schedule",
      "events": events,
      "settings": {
        "timeFormat": 12,
        "timeStep": 60,
        "weekLength": 7,
        "weekStart": 0,
        "minHourRange": 8,
        "adaptive": true,
        "dense": false
      }
    }
    return jsonScheduleMaker
}


/**Function to download with the preferred file type
 * @param {*} content - structured schedule depends on filetype
 * @param {string} filename - name of the sched
 * @param {string} fileType - filetype to be exported
 */
export function downloadFile(content, filename, fileType) {
  
    let contentType;
    
    if (fileType === 'csv') {
      contentType = 'text/csv';
    } 
    else if (fileType === 'ics') {
      contentType = 'text/calendar;charset=utf-8';
    } 
    else if (fileType === "json") {
      content = JSON.stringify(content, null, 2);
      contentType = "application/json"
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