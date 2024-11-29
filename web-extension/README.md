## **Building the Extension**
This project includes a Python-based build system to compile and publish web extensions for various browsers, including Chromium-based browsers (Chrome, Edge) and Gecko-based browsers (Firefox).

---

### **Prerequisites**
- Python 3.x installed
- Optional: Linux/Unix environment or WSL for better compatibility
- `pip install` the required dependencies, if applicable

---

### Using build.py

The build script, `build.py`, allows you to build, test, and package the extension for different browsers. You can specify which browser/platform you are building for using command-line arguments.

#### **Building for Specific Browsers (zipped)**
To generate compressed packages for the browser platforms, such as .zip for Chrome-based browsers and .xpi for Firefox, use the following commands:

- **Chrome** (Chromium-based): 
```bash
python build.py -p chrome --publish
```
- **Microsoft Edge**
```bash
python build.py -p edge --publish
```
- **Firefox** (Manifest V2)
```bash
python build.py -p firefox-mv2 --publish
```
- **All platforms** (chrome, edge firefox)
```bash
python build.py --unpacked
```

#### **Building for Specific Browsers (unpacked)**

Unpacked builds are used for local testing and development. You can generate browser-specific extensions as follows:

- **Chrome** (Chromium-based): 
```bash
python build.py -p chrome --unpacked
```
- **Microsoft Edge**
```bash
python build.py -p edge --unpacked
```
- **Firefox** (Manifest V2)
```bash
python build.py -p firefox-mv2 --unpacked
```
- **All platforms** (chrome, edge firefox)
```bash
python build.py --unpacked 
```

#### Cleaning the directory (python)
```bash
python build.py --rm 
```

### Using makefile & build.sh
- Prerequisities : Must run in Linux / Unix derivative environment

#### Building for Specific Browsers (unpacked)
Unpacked builds are used for local testing and development. You can generate browser-specific extensions as follows:
Use the `make` command followed by the target browser:

- **Chrome** (Chromium-based): 
```bash
make chrome
```
- **Microsoft Edge version**
```bash
make edge
```
- **Firefox (Manifest V2)**
```bash
  make firefox
```
- **Creating all platforms Chrome and Firefox browsers**
```
make unpacked
```

#### Building for Specific Browsers (zipped)
To generate compressed packages for the browser platforms such as `.zip` for chrome-based and `.xpi` for firefox:

- **Chrome** (Chromium-based): 
```bash
make chrome-publish
```
- **Microsoft Edge version**
```bash
make edge-publish
```
- **Firefox (Manifest V2)**
```bash
make firefox-publish
```
- **Creating all platforms Chrome and Firefox browsers**
```
make publish
```
#### Cleaning the directory (makefile)
```
make clean
```

The output of the build will be placed in the `dist/build` directory.

### Testing the extension locally
To test the extension on offline mode / local copy follow these steps:

#### Platform Supported
Browser Name       | Platform      | Manifest Version  
--------------------|--------------|-------------------  
Chrome               | chrome        | MV3  
Microsoft Edge       | edge          | MV3  
Firefox              | firefox-mv2   | MV2  
Firefox (manifest v3)| firefox-mv3   | MV3  

#### Steps
1. **Get a Local Copy of the SIS Website**:
   - Clone or download the [test branch](https://github.com/KevsterAmp/PUPSIS-Schedule-Exporter/tree/test/html) of this repository.
   - Extract the files and serve them using VSCode's Live Server extension.

2. **Build the Extension for Local Testing**:
   - Add the `-t` flag when running `build.py` to enable the extension to work on the local version of `sis.pup.edu.ph`.
   - Example build.py commands:
     ```bash
     python build.py -p <platform> -u -t # unpacked mode
     # or
     python build.py -p <platform> -z -t # zipped mode
     ```
     Replace `<platform>` with the desired target (e.g., `chrome`, `firefox-mv2`).

Now, you can test the extension using the local copy of SIS, the output of the build will be placed in the `dist/build` directory.

***
## File Directories

The project is organized into the following directories and files to streamline the development, building, and publishing process:

- `src/`  
  This directory contains common assets used across all browser platforms, including:
  - **HTML**: Structure and layout for the extension's user interface.
  - **CSS**: Stylesheets for the extension's appearance.
  - **Frontend JS**: JavaScript files for handling client-side functionality.

- `platform/`  
  This folder holds browser-specific files that vary between platforms. These include:
  - **Main JS**: Platform-specific logic, such as fetching the schedule or interacting with browser APIs.
  - **manifest.json**: The manifest file tailored to the respective browser (Chrome, Edge, Firefox) and its required manifest version (V2 or V3).

- `dist/`  
  The directory where built extensions and other generated files are stored:
  - `dist/build/`: The main output folder for the extensions generated by the `Makefile`. Each build is placed here for easy access during development and publishing.
  - `version`: This file keeps track of the current version number of the extension.

- `tools/`  
  Backend scripts and utilities used by the `Makefile` to automate the building and packaging process. This includes platform-specific build scripts to compile the extension based on the target browser (e.g., Chrome, Firefox)

## License

This project is under the MIT License

