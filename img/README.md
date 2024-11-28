# Installation guide:
### Chrome / Microsoft Edge
#### 1. Click the **"Code"** button on this repository and then **"Download ZIP"**
<img src="chrome/step_1.png">

#### 2. Extract the .zip file using WINRAR (or any apps for unzipping)
<img src="chrome/step_2.png">

#### 3. Click the **three dots** on the upper right side of your browser <br> &nbsp;&nbsp;&nbsp; Click on **"Extensions"** <br> &nbsp;&nbsp;&nbsp; Click on **"Manage Extensions"**
<img src="chrome/step_3.png">

#### 4. Click **"Developer Mode"** on the upper right
<img src="chrome/step_4.png">

#### 5. Click **"Load Unpacked"** on the upper left
<img src="chrome/step_5.png">

#### Then select the **"web-extension"** file that you extracted previously

<img src="chrome/step_5.5.png">

<br> <br>

#### Taa Daa! You can now use the extension on your browser!
<img src="chrome/step_6.png">



## Firefox
> [!IMPORTANT]  
Due to [Mozilla's policy](https://extensionworkshop.com/documentation/publish/add-on-policies/), this extension cannot be published on the Mozilla Web Store (AMO). However, Firefox users can still use the extension by installing it as a **temporary add-on**.


#### 1. Click the "**"Releases"**" button on this repository and then download the file with "**.xpi**"

#### 2. Navigate in search bar and type "**about:config**"
<img src="./firefox/config.png">

#### 3.  Click **Accept the Risk and Continue** to proceed in config page
<img src="./firefox/acceptRisk.png" >

#### On search tab type `xpinstall.signatures.required` and toggle to `false`
<img src="./firefox/toggleXpi.png">

#### 4. Navigate again in search bar and type `about:debugging` 
<img src="./firefox/aboutDebugging.png">

#### 5. Click the "**This Firefox**"
<img src="./firefox/thisFirefox.png">

#### 6. Click the "**Load Temporary Add-on...**"
<img src="./firefox/loadAddon.png">

#### 5. Then select the **".xpi"** file you download earlier


#### 6. Click the **"Extension Icon"** to locate the extension.
<img src="./firefox/extensionIcon.png"> 

#### This should pop up when you click the **"PUPSIS Scheduler Exporter"** extension.
>[!NOTE]
If the extension was missing after closing or restarting the browser, navigate again to `about:debugging` > Load Temporary Add-on and select again the .xpi you download

<img src="./firefox/extension.png">


***
# Usage
#### Click the **"Extension Icon"** to locate the extension. 
<img src="chrome/usage1.png">

#### This should pop up when you click the **"PUPSIS Scheduler Exporter"** extension.
<img src="chrome/usage.png">

#### You can now go to https://sis2.pup.edu.ph/student/schedule. <br>Click the extension and the **"Convert to .ics"** button to download the ICalendar file (.ics)
