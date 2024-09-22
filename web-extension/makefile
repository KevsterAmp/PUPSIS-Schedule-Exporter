# Description: Makefile for building the web extension for different browsers.
# this script assumes Linux as the build environment

.PHONY: chrome edge firefox firefox-mv3 chrome-publish edge-publish firefox-publish firefox-mv3-publish publish clean

# check the os if linux or windows
OS := $(shell uname)

# build script for chromium (i.e chrome, edge)
chrome:
	if [ "$(OS)" = "Linux" ]; then \
		echo "Detected OS: Linux"; \
		bash tools/build.sh chromium; \
	else \
		echo "This build process is only supported on Linux."; \
	fi

# build script for edge (chromium-based)
edge:
	if [ "$(OS)" = "Linux" ]; then \
		echo "Detected OS: Linux"; \
		bash tools/build.sh edge; \
	else \
		echo "This build process is only supported on Linux."; \
	fi

# build script for gecko-based browser (firefox derivatives, manifest v2)
firefox:
	if [ "$(OS)" = "Linux" ]; then \
		echo "Detected OS: Linux"; \
		bash tools/build.sh firefox-mv2; \
	else \
		echo "This build process is only supported on Linux."; \
	fi

# build script for gecko-based browser (firefox derivatives, manifest v3)
firefox-mv3:
	if [ "$(OS)" = "Linux" ]; then \
		echo "Detected OS: Linux"; \
		bash tools/build.sh firefox-mv3; \
	else \
		echo "This build process is only supported on Linux."; \
	fi

# build script for all browsers
unpacked:
	if [ "$(OS)" = "Linux" ]; then \
		echo "Detected OS: Linux"; \
		bash tools/build.sh unpacked; \
	else \
		echo "This build process is only supported on Linux."; \
	fi

########### publish scripts ###########
# publish script for chrome (chromium-based)
chrome-publish:
	if [ "$(OS)" = "Linux" ]; then \
		echo "Detected OS: Linux"; \
		bash tools/build.sh chrome publish; \
	else \
		echo "This build process is only supported on Linux."; \
	fi

# publish script for chrome (chromium-based)
edge-publish:
	if [ "$(OS)" = "Linux" ]; then \
		echo "Detected OS: Linux"; \
		bash tools/build.sh edge publish; \
	else \
		echo "This build process is only supported on Linux."; \
	fi

# publish script for firefox (gecko-based) mv2
firefox-publish:
	if [ "$(OS)" = "Linux" ]; then \
		echo "Detected OS: Linux"; \
		bash tools/build.sh firefox-mv2 publish; \
	else \
		echo "This build process is only supported on Linux."; \
	fi

# publish script for firefox (gecko-based) mv3
firefox-mv3-publish:
	if [ "$(OS)" = "Linux" ]; then \
		echo "Detected OS: Linux"; \
		bash tools/build.sh firefox-mv3 publish; \
	else \
		echo "This build process is only supported on Linux."; \
	fi

# publish script for all browsers (zipped)
publish:
	if [ "$(OS)" = "Linux" ]; then \
		echo "Detected OS: Linux"; \
		bash tools/build.sh publish; \
	else \
		echo "This build process is only supported on Linux."; \
	fi

# clean the build directory
clean:
	rm -rf dist/build
