## **Building the Extension**
This project includes a Python-based build system to compile and publish web extensions for various browsers, including Chromium-based browsers (Chrome, Edge) and Gecko-based browsers (Firefox).

---

### **Prerequisites**
- Python 3.x installed
- Optional: Linux/Unix environment or WSL for better compatibility
- `pip install` the required dependencies, if applicable

---

### **Using `build.py`**

The build script, `build.py`, allows you to build, test, and package the extension for different browsers. You can specify which browser/platform you are building for using command-line arguments.

---

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

