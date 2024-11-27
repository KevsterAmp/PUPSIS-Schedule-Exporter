#!/usr/bin/env python3
import os
import shutil
import zipfile
import argparse
import tempfile
import json


def purge_build_directory():
    """Remove all files in the 'dist/build' directory."""
    build_dir = os.path.join(os.getcwd(), 'dist', 'build')
    if os.path.exists(build_dir):
        print("*** Purging build directory ***")
        shutil.rmtree(build_dir)
        print("*** Build directory purged ***")
    else:
        print("*** Build directory does not exist; nothing to purge ***")

def building_platform(platform, destination):
    print(f"*** Building {platform} dist files ***")
    if os.path.exists(destination):
        shutil.rmtree(destination)
    os.makedirs(destination, exist_ok=True)


def copy_common_files(destination):
    print("*** Copying common files (/css, /js, /web-icons) ***")
    shutil.copytree('src/css', os.path.join(destination, 'css'))
    shutil.copytree('src/utils', os.path.join(destination, 'utils'))
    shutil.copytree('src/web-icons', os.path.join(destination, 'web-icons'))
    shutil.copy('src/popup.html', destination)
    shutil.copy('src/edit.html', destination)
    shutil.copy('src/editSched.js', destination)


def copy_platform_files(platform, destination, test_mode=False):
    print(f"*** Copying {platform}-specific files ***")
    version_file = "dist/version"
    manifest_path = os.path.join(destination, 'manifest.json')
    popup_path = os.path.join(destination, 'popup.js')

    platform_manifest = f'platform/{platform}/manifest.json'
    platform_content_script = f'platform/{platform}/contentScript.js'
    platform_popup = f'platform/{platform}/popup.js'

    # Check if the platform-specific files exist before copying
    if not os.path.exists(platform_manifest):
        print(f"[!] Warning: Missing platform manifest file for {platform}. Skipping...")
        return

    if not os.path.exists(platform_content_script):
        print(f"[!] Warning: Missing contentScript.js for {platform}. Skipping...")
        return

    if not os.path.exists(platform_popup):
        print(f"[!] Warning: Missing popup.js for {platform}. Skipping...")
        return

    # Copy platform-specific files
    shutil.copy(platform_manifest, destination)
    shutil.copy(platform_content_script, destination)
    shutil.copy(platform_popup, destination)

    # Modify version in manifest.json
    if os.path.exists(version_file):
        version = open(version_file).read().strip()
        print(f"*** Modifying manifest.json with version {version} ***")
        with open(manifest_path, 'r+') as manifest_file:
            manifest = json.load(manifest_file)
            manifest['version'] = version
            manifest_file.seek(0)
            manifest_file.write(json.dumps(manifest, indent=4))
            manifest_file.truncate()

    # Debug/Test mode modifications
    if test_mode:
        print("*** DEBUG MODE: Modifying manifest.json & popup.js ***")
        # Replace matches array with <all_urls>
        with open(manifest_path, 'r+') as manifest_file:
            manifest = json.load(manifest_file)
            for key in manifest.get('content_scripts', []):
                key['matches'] = ["<all_urls>"]
            manifest_file.seek(0)
            manifest_file.write(json.dumps(manifest, indent=4))
            manifest_file.truncate()

        # Set OVERRIDE_DEV = true in popup.js
        with open(popup_path, 'r+') as popup_file:
            content = popup_file.read()
            content = content.replace("const OVERRIDE_DEV = false", "const OVERRIDE_DEV = true  // MODIFIED by build.py")
            popup_file.seek(0)
            popup_file.write(content)
            popup_file.truncate()



def zip_files(platform, destination, dist_dir):
    print(f"*** Creating .zip for {platform} web browser ***")
    version_file = "dist/version"
    version = open(version_file).read().strip() if os.path.exists(version_file) else "unknown"

    # Set the zip name based on the platform
    if platform in ['chrome', 'edge']:
        zip_name = f"PUPSIS-Schedule-Exporter-{version}-{platform}.zip"
    elif 'firefox' in platform:
        zip_name = f"PUPSIS-Schedule-Exporter-{version}-{platform}.xpi"
    else:
        print("[!] Invalid platform")
        return

    # Ensure the 'dist/build' directory exists
    build_dir = os.path.join(dist_dir, 'dist', 'build')  # Updated this line to reflect the correct directory
    os.makedirs(build_dir, exist_ok=True)

    # Create the zip file in the updated directory
    with zipfile.ZipFile(os.path.join(build_dir, zip_name), 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(destination):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, destination)
                zipf.write(file_path, arcname)

    print(f"*** Finished Creating {zip_name} ***")



def print_config(platform, publish, test_mode):
    print("---- Building configuration: ----")
    print(f"  Platform: {platform or 'All'}")
    print(f"  Publish Mode (Zip): {publish}")
    print(f"  Debug Mode: {test_mode}")
    print("---------------------------------")


def main():
    parser = argparse.ArgumentParser(description="Build script for PUPSIS-Schedule Exporter")
    parser.add_argument('-p', '--platform', choices=['chrome', 'firefox-mv2', 'firefox-mv3', 'edge'], help="Target platform")
    parser.add_argument('-z', '--publish', action='store_true', help="Package as .zip or .xpi")
    parser.add_argument('-u', '--unpacked', action='store_true', help="Build unpacked version")
    parser.add_argument('-t', '--test', action='store_true', help="Enable debug mode (OVERRIDE_DEV=true)")
    parser.add_argument('-rm', '--remove', action='store_true', help="Purge all files in the build directory")

    args = parser.parse_args()

    if args.remove:
        purge_build_directory()
        return

    # Platforms to build if none is specified
    platforms = [args.platform] if args.platform else ['chrome', 'edge', 'firefox-mv2', 'firefox-mv3']

    
    publish = args.publish
    test_mode = args.test
    dist_dir = os.getcwd()

    print("*** Building PUPSIS-Schedule Exporter ***")
    if platforms:
        print_config("".join(list('all' if len(platforms)==4  else platforms)), publish, test_mode)

    if not args.unpacked and publish:
        # Build and publish for each platform
        for platform in platforms:
            dest = tempfile.mkdtemp()   
            building_platform(platform, dest)
            copy_common_files(dest)
            copy_platform_files(platform, dest, test_mode)
            zip_files(platform, dest, dist_dir)
            shutil.rmtree(dest)
    else:
        # Build unpacked version for each platform
        for platform in platforms:
            dest = os.path.join(dist_dir, f"dist/build/{platform}")
            building_platform(platform, dest)
            copy_common_files(dest)
            copy_platform_files(platform, dest, test_mode)
            print(f"*** Finished building unpacked version for {platform} ***")


if __name__ == "__main__":
    main()
