
#!/usr/bin/env bash
#
# This script assumes a linux environment

set -e
shopt -s extglob

echo "***  Building PUPSIS-Schedule Exporter MV3 ***"
PLATFORM="chromium"
DEST="dist/build/PUPSIS-Schedule-Exporter.$PLATFORM"
PUBLISH=false

# rebuilding the dist folder
building_platform(){
    local platform=$1
    local destination=$2
    
    echo "*** Building $platform ***"
    rm -rf $destination
    mkdir -p $destination
}

# copy_platform_files(platform)
copy_platform_files() {
    local platform=$1
    local destination=$2
    echo "*** Copying $platform-specific files ***"
    
    cp platform/$platform/manifest.json $destination
    cp platform/$platform/contentScript.js $destination
    cp platform/$platform/popup.js $destination
}

copy_common_files(){
    echo "*** Copying common files (/css, /js, /web-icons) ***"
    local destination=$1
    
    cp -r src/css $destination
    cp -r src/utils $destination
    cp -r src/web-icons $destination
    cp src/popup.html $destination
    cp src/edit.html $destination
    cp platform/editSched.js $destination
}

##### publishing mode #####
zip_files(){
    local platform=$1
    local destination=$2
    local dist_dir=$3

    echo "*** Creating .zip for $platform web browser***"
    

    # Set the zip name based on the platform
    if [ "$platform" = "chromium" ]; then
        ZIP_NAME="PUPSIS-Schedule-Exporter-$platform.zip"
    elif [ "$platform" = "firefox" ] || [ "$platform" = "firefox-mv2" ]; then
        ZIP_NAME="PUPSIS-Schedule-Exporter-$platform.xpi"
    else
        echo "[!] Invalid platform"
        return 1
    fi

    echo "$ZIP_NAME $destination"
    
    # Change into the destination directory and zip the contents
    (
        cd "$destination" || exit 1
        zip -r "../$ZIP_NAME" ./*
    )
    
    # Move the generated zip file to the build directory
    mv "$destination/../$ZIP_NAME" "$dist_dir/dist/build"
}

for i in "$@"; do
    case $i in
        chromium)
            PLATFORM="chromium"
            DEST="dist/build/PUPSIS-Schedule-Exporter.$PLATFORM"
        ;;
        firefox)
            PLATFORM="firefox"
            DEST="dist/build/PUPSIS-Schedule-Exporter.$PLATFORM"
        ;;
        publish)
            PUBLISH=true
            DEST=
        ;;
    esac
done

###### Packaging for publish ######
if [ "$PUBLISH" = true ]; then
    echo "*** Publishing mode: Packaging the extension ***"
    mkdir -p dist/build
    TEMP_DIR=$(mktemp -d)
    
    # chrome
    building_platform "chromium" "$TEMP_DIR"
    copy_common_files "$TEMP_DIR"
    copy_platform_files "chromium" "$TEMP_DIR"
    zip_files "chromium" "$TEMP_DIR" $(pwd)
    # firefox
    building_platform "firefox" "$TEMP_DIR"
    copy_common_files "$TEMP_DIR"
    copy_platform_files "firefox" "$TEMP_DIR"
    zip_files "firefox" "$TEMP_DIR" $(pwd)

    # firefox mv2
    building_platform "firefox-mv2" "$TEMP_DIR"
    copy_common_files "$TEMP_DIR"
    copy_platform_files "firefox-mv2" "$TEMP_DIR"
    zip_files "firefox-mv2" "$TEMP_DIR" $(pwd)
    
    # Clean up temporary directory
    rm -rf "$TEMP_DIR"
    
###### Unpacked mode ######
else
    echo "*** Unpacked mode: Extension ready in $DEST ***"
    ###### Building the extension ######
    building_platform $PLATFORM $DEST
    
    ###### Copying common files ######
    copy_common_files $DEST
    
    ###### Copying platform-specific files ######
    copy_platform_files $PLATFORM $DEST
fi


echo "*** Build process finished ***"
