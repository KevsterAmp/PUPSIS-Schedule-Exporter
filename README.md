# PUPSIS-Schedule-Exporter

This branch is the testing branch for developers that plan to contribute on this repository. 

# How to setup extension for testing

1. Download Extension from the **Main branch**
2. Open [Test PUPSIS Schedule Page](src/School%20Year%202324%20-%20First%20Semester%20-%20PUPSIS.html) on your browser
3. on **manifest.json**, Add the file directory of the [Test PUPSIS Schedule Page](src/School%20Year%202324%20-%20First%20Semester%20-%20PUPSIS.html) on the **manifest.json matches list** as shown below:

        "matches": [
            "add the School Year 2324 - First Semester - PUPSIS.html directory here",
            "https://sis1.pup.edu.ph/student/schedule",
            "https://sis2.pup.edu.ph/student/schedule"
        ],

# Changes when opening a PR to main
### popup.js 

set **OVERRIDE_DEV to false**

    //set to false when pushing to main
    const OVERRIDE_DEV = true;


### manifest.json
Remove file directory from the **matches list** or paste the codeblock below

        "matches": [
            "https://sis1.pup.edu.ph/student/schedule",
            "https://sis2.pup.edu.ph/student/schedule"
        ],

