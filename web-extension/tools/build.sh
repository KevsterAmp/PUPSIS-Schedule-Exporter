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

# copy_platform_files(platform)
copy_platform_files() {
    local platform=$1
    local destination=$2
    local version_file="dist/version"
    local manifest="$destination/manifest.json"

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

##### publishing mode #####
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
        ZIP_NAME="PUPSIS-Schedule-Exporter-$platform-$version.zip"
        
    elif [[ "$platform" =~ "firefox" ]]; then
        ZIP_NAME="PUPSIS-Schedule-Exporter-$platform-$version.xpi"
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

##### Main #####
# Set the build directory
echo "*** Building PUPSIS-Schedule Exporter MV3 ***"
PLATFORM=""

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
        *)
            echo "[!] Invalid argument: $i"
            exit 1
        ;;
    esac
done

####### Building zipped extension #######

echo "*** Building mode: Building the extension ***"
if [ "$PLATFORM" = "" ]; then
      platforms=("chrome" "edge" "firefox-mv2" "firefox-mv3")
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
        exit 0
    else
        for platform in "${platforms[@]}"; do
            DEST="dist/build/PUPSIS-Schedule-Exporter.$platform"
            building_platform "$platform" "$DEST"
            copy_common_files "$DEST"
            copy_platform_files "$platform" "$DEST"
        done
        echo "*** Finished building all extensions ***"
        exit 0
    fi
else
    mkdir -p dist/build
    if [ "$PUBLISH" = true ]; then
        echo "*** Publishing mode: Packaging the $PLATFORM extension ***"
        mkdir -p dist/build
        DEST=$(mktemp -d)
    else
        echo "*** Unpacked mode: Building the $PLATFORM extension ***"
        DEST="dist/build/PUPSIS-Schedule-Exporter.$PLATFORM"
    fi
    building_platform "$PLATFORM" "$DEST"
    copy_common_files "$DEST"
    copy_platform_files "$PLATFORM" "$DEST"
    
    # If the publish flag is set, zip the extension else not
    if [ "$PUBLISH" = true ]; then
        zip_files "$PLATFORM" "$DEST" "$(pwd)"
        rm -rf "$DEST"
        echo "*** Finished creating $PLATFORM zip file ***"
        exit 0
    fi
    echo *** Finished building $PLATFORM extension ***
fi