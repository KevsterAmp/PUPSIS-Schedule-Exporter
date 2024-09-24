[![License: MIT](https://img.shields.io/badge/License-MIT-yellowgreen.svg?style=for-the-badge&color=%23FBBC04)](https://opensource.org/licenses/MIT)
![Chrome Web Store User](https://img.shields.io/chrome-web-store/v/hilepoofffgmdlappbbggkhppjijhkch?style=for-the-badge&logo=chromewebstore&logoColor=white&color=%2334A853)
![Chrome Web Store Rating](https://img.shields.io/chrome-web-store/rating/hilepoofffgmdlappbbggkhppjijhkch?style=for-the-badge&logo=chromewebstore&logoColor=white&color=%23EA4335)


***
<h1 align="center">
    <sub>
        <img src="./web-extension/src/web-icons/web-icon.png" alt="extension-icon" height="38" width="38"> 
    </sub>
    PUPSIS Schedule Exporter
</h1>
<p align="center">
A web extension that converts the schedule of students from PUPSIS to ICalendar (.ics), csv or json so that they can easily import their schedules on other popular calendar tools like Google Calendar.
</p>
<p align="center">
    <a href="https://chrome.google.com/webstore/detail/pupsis-schedule-exporter/hilepoofffgmdlappbbggkhppjijhkch">
    <img src="https://user-images.githubusercontent.com/585534/107280622-91a8ea80-6a26-11eb-8d07-77c548b28665.png" alt="PUPSIS Schedule Exporter"></a>
</p>


***



This project aims to help PUP Students to easily sync their Schedules to their desired Calendar tools.


# Features
- convert to ICalendar (.ics) format, used for easy export on popular calendar tools like Google Calendar
- convert to CSV, in a calendar style format, for users that do not use any calendar tools. 
- convert to JSON, which can be imported on [schedulemaker.io](https://schedulemaker.io/)

*Tip: it's a good idea to set the end date to the last day of their semester. This way, the recurring events will automatically stop when the semester ends.*

## TODO
- [x] Finish readme and introduction
- [x] Add guide, image tutorial 
- [x] Add image icons for web extension
- [x] Implement "End Date of Recurring Schedule" feature
- [x] Return error at empty schedule
- [x] Implement CSV feature (Implemented by @szy-kenn!)
- [x] Add UI/Styling (Thanks @egg-lou, @yam-1111, @szy-kenn!)
- [x] Implement export to schedulemaker.io via json feature
