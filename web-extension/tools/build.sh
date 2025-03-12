#!/usr/bin/env bash
#
# This script assumes a linux environment

set -e
shopt -s extglob

###### Functions ######
# rebuilding the dist folder
building_platform(){
    local platform=$1
    local destination=$2
    
    echo "*** Building $platform dist files ***"
    rm -rf $destination
    mkdir -p $destination
}

copy_common_files(){
    echo "*** Copying common files (/css, /js, /web-icons) ***"
    local destination=$1
    
    cp -r src/css $destination
    cp -r src/utils $destination
    cp -r src/web-icons $destination
    cp src/popup.html $destination
    cp src/edit.html $destination
    cp src/editSched.js $destination
}

# copy_platform_files(platform)
copy_platform_files() {
    local platform=$1
    local destination=$2
    local version_file="dist/version"
    local manifest="$destination/manifest.json"
    local popup="$destination/popup.js"
    
    echo "*** Copying $platform-specific files ***"
    
    # Copy the platform-specific files
    cp platform/$platform/manifest.json $destination
    cp platform/$platform/contentScript.js $destination
    cp platform/$platform/popup.js $destination
    
    # Check if the version file exists
    if [ -f "$version_file" ]; then
        # Get the version from the version file
        local version=$(cat "$version_file")
        echo "*** Modifying manifest.json with version $version ***"
        # Use sed to modify the "version" field in manifest.json
        sed -i "s/\"version\": \".*\"/\"version\": \"$version\"/" "$manifest"
    else
        echo "[!] Version file not found: $version_file"
    fi
    
    # if case for testing
    if [ "$TEST" ]; then
        echo "*** DEBUG MODE : Modifying manifest.json & popup.js for testing/debugging ***"
        
        # Modify manifest.json to replace matches array with <all_urls>
        sed -i '/"matches": \[/,/\],/c\      "matches": [\n        "<all_urls>"\n      ],' "$manifest"
        echo "Modified manifest.json to use <all_urls>."
        
        # Modify popup.js to set OVERRIDE_DEV = true and add a newline with the comment
        sed -i 's/^const OVERRIDE_DEV = .*$/const OVERRIDE_DEV = true; \/\/ MODIFIED by the build.sh, SET TO false when publishing/' "$popup"
        echo "Modified popup.js to set OVERRIDE_DEV = true."
    fi
}

zip_files(){
    local platform=$1
    local destination=$2
    local dist_dir=$3
    
    echo "*** Creating .zip for $platform web browser***"
    
    # getting the version from the version file
    if [ ! -f dist/version ]; then
        echo "[!] Version file not found"
        version=""
    else
        version=$(cat dist/version)
        echo "*** Found version :  $version ***"
    fi
    
    
    # Set the zip name based on the platform
    if [ "$platform" = "chrome" ] || [ "$platform" = "edge" ]; then
        ZIP_NAME="PUPSIS-Schedule-Exporter-$version-$platform.zip"
        
        elif [[ "$platform" =~ "firefox" ]]; then
        ZIP_NAME="PUPSIS-Schedule-Exporter-$version-$platform.xpi"
    else
        echo "[!] Invalid platform"
        return 1
    fi
    
    # Change into the destination directory and zip the contents
    (
        cd "$destination" || exit 1
        zip -qr "../$ZIP_NAME" ./*
    )
    
    # Move the generated zip file to the build directory
    mv "$destination/../$ZIP_NAME" "$dist_dir/dist/build"
    rm -rf "$destination"
    echo "*** Finished Creating $ZIP_NAME ***"
}

print_config(){
    echo "---- Building configuration: ----"
    # if all platforms are being built then print all platforms
    if [ "$PLATFORM" = "" ]; then
        echo "  Platform: All"
    else
        echo "  Platform: $PLATFORM"
    fi
    
    # if zipped then print the publish mode as zip else print the unpacked mode
    echo "  Publish Mode (Zip): $PUBLISH"
    
    # if zipped then print the destination as /dist/build else print the destination
    if [ "$PUBLISH" = true ] || [ "$PLATORM" = "" ]; then
        echo "  Destination: /dist/build"
    else
        echo "  Destination: $DEST"
    fi

    # version
    if [ -f dist/version ]; then
        echo "  Version: $(cat dist/version)"
    else
        echo "  Version: N/A"
    fi
    
    # if test mode is set then print the test mode
    if [ "$TEST" ]; then
        echo "  Debug Mode: $TEST"
        echo "  ! Note: The extension is set to run on all URLs."
        echo "  ! OVERRIDE_DEV=true in popup.js."
    fi
    echo "---------------------------------"
}
##### Main #####
# Set the build directory
echo "*** Building PUPSIS-Schedule Exporter MV3 ***"
PLATFORM=""
PUBLISH=false

# Check if there are no arguments
if [ $# -eq 0 ]; then
    echo "[!] Error: No arguments provided. Please specify a platform (e.g., chrome, firefox-mv3, etc.)."
    exit 1
fi

# Create the build directory
for i in "$@"; do
    case $i in
        chrome)
            PLATFORM="chrome"
        ;;
        firefox-mv2)
            PLATFORM="firefox-mv2"
        ;;
        firefox-mv3)
            PLATFORM="firefox-mv3"
        ;;
        edge)
            PLATFORM="edge"
        ;;
        publish)
            PUBLISH=true
        ;;
        unpacked)
            PUBLISH=false
        ;;
        debug)
            TEST=true
        ;;
        *)
            echo "[!] Invalid argument: $i"
            exit 1
        ;;
    esac
done

####### Building extension #######

echo "*** Building mode: Building the extension ***"
##### Building ALL platforms the extension #####
if [ "$PLATFORM" = "" ]; then
    platforms=("chrome" "edge" "firefox-mv2" "firefox-mv3")
    ##### zipped version of ALL platform extension #####
    if [ "$PUBLISH" = true ]; then
        echo "*** Publishing mode: Packaging the extension ***"
        mkdir -p dist/build
        TEMP_DIR=$(mktemp -d)
        # Iterate through the platforms array
        for platform in "${platforms[@]}"; do
            building_platform "$platform" "$TEMP_DIR"
            copy_common_files "$TEMP_DIR"
            copy_platform_files "$platform" "$TEMP_DIR"
            zip_files "$platform" "$TEMP_DIR" "$(pwd)"
        done
        
        # Clean up temporary directory
        rm -rf "$TEMP_DIR"
        echo "*** Finished creating all zip files ***"
        print_config
        exit 0
        ##### unpacked version of ALL platform extension #####
    else
        for platform in "${platforms[@]}"; do
            DEST="dist/build/PUPSIS-Schedule-Exporter.$platform"
            if [ "$TEST" ]; then
                DEST="dist/build/TEST_PUPSIS-Schedule-Exporter.$platform"
            fi
            building_platform "$platform" "$DEST"
            copy_common_files "$DEST"
            copy_platform_files "$platform" "$DEST"
        done
        echo "*** Finished building all extensions ***"
        print_config
        exit 0
    fi
    ##### Building a single specified platform extension #####
else
    mkdir -p dist/build
    if [ "$PUBLISH" = true ]; then
        echo "*** Publishing mode: Packaging the $PLATFORM extension ***"
        mkdir -p dist/build
        DEST=$(mktemp -d)
    else
        echo "*** Unpacked mode: Building the $PLATFORM extension ***"
        DEST="dist/build/PUPSIS-Schedule-Exporter.$PLATFORM"
        if [ "$TEST" ]; then
            DEST="dist/build/TEST_PUPSIS-Schedule-Exporter.$PLATFORM"
        fi
    fi
    building_platform "$PLATFORM" "$DEST"
    copy_common_files "$DEST"
    copy_platform_files "$PLATFORM" "$DEST"
    
    # If the publish flag is set, zip the extension else not
    if [ "$PUBLISH" = true ]; then
        zip_files "$PLATFORM" "$DEST" "$(pwd)"
        rm -rf "$DEST"
        echo "*** Finished creating $PLATFORM zip file ***"
        print_config
        exit 0
    fi
    echo "*** Finished building $PLATFORM extension ***"
    print_config
fi