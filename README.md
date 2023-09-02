# PUPSIS-Schedule-Exporter

This branch is the testing branch for developers wanting to contribute to this project. 

# How to test extension
1. Download Extension from the **Main branch**
2. Open [Test PUPSIS Schedule Page](src/School%20Year%202324%20-%20First%20Semester%20-%20PUPSIS.html) on your browser
3. on **manifest.json**, Add the file directory of the [Test PUPSIS Schedule Page](src/School%20Year%202324%20-%20First%20Semester%20-%20PUPSIS.html) on the **manifest.json matches list** as shown below:

        "matches": [
            "add the School Year 2324 - First Semester - PUPSIS.html directory here",
            "https://sis1.pup.edu.ph/student/schedule",
            "https://sis2.pup.edu.ph/student/schedule"
        ],

# Changes when pushing to main
### popup.js 

remove the comments on the if else function when pushing to main

    // if ((/sis.*\/student\/schedule$/).test(currentTab.url)) {
    //   chrome.tabs.sendMessage(currentTab.id, { type: 'getschedule' });
    // } 
    
    // else {
    //   // navigates to sis portal
    //   chrome.tabs.create({ url: 'https://sis2.pup.edu.ph/student/schedule' }, function(newTab) {
    //   chrome.tabs.update(newTab.id, { active: true });
    //   });
    // }

add "//" at the start or remove this line when pushing to main

    chrome.tabs.sendMessage(currentTab.id, { type: 'getschedule' });

### manifest.json
Remove file directory from the **matches list** or paste the codeblock below

        "matches": [
            "https://sis1.pup.edu.ph/student/schedule",
            "https://sis2.pup.edu.ph/student/schedule"
        ],

