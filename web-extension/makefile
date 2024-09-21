
.PHONY: chrome firefox publish clean

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

# build script for gecko based browser (firefox derivatives)
firefox:
	if [ "$(OS)" = "Linux" ]; then \
		echo "Detected OS: Linux"; \
		bash tools/build.sh firefox; \
	else \
		echo "This build process is only supported on Linux."; \
	fi

# build script for all browsers (zipped)
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