Duplicate File Finder
A fast, cross-platform desktop application for finding and managing duplicate files on your system. Built with Electron  for a modern, intuitive user experience.

✨ Features

Content-based Detection: Finds duplicates by comparing file contents, not just names
Cross-platform: Works seamlessly on Windows, macOS, and Linux
Intuitive GUI: Clean, modern interface built with Electron
Fast Scanning: Optimized algorithms for quick duplicate detection
Batch Operations: Select and manage multiple duplicates at once

🚀 Quick Start
Prerequisites

npm or yarn package manager

# Installation

# Clone the repository

git clone https://github.com/macbuildssys/duplicate-file-finder.git

cd duplicate-file-finder

Install dependencies

npm install

Start the application

npm start


# 📦 Downloads
Pre-built Releases

Download the latest release for your platform from the Releases page.

Linux: Duplicate\ File\ Finder-1.0.0.AppImage

Running the AppImage (Linux)

Download the AppImage file

Make it executable:

chmod +x Duplicate\ File\ Finder-1.0.0.AppImage 

Run the application:

./Duplicate\ File\ Finder-1.0.0.AppImage


# 🛠️ Development

npm start - Start the application in development mode

npm run build - Build the application for production

npm run dist - Create distributable packages for all platforms

npm run dist:linux - Build Linux AppImage

npm run dist:win - Build Windows installer

npm run dist:mac - Build macOS DMG

Building from Source

To create distributable packages:

# Build for current platform
npm run dist

# Build for specific platforms

npm run dist:linux    # Creates AppImage

npm run dist:win      # Creates .exe installer

npm run dist:mac      # Creates .dmg file

Built packages will be available in the dist/ directory.

# 🐧 Linux-Specific Setup

Common Issues and Solutions
_ _ _ _ _ _ _ _ _ _ _ _ _ _ _

Missing FUSE Library

If you see this error:
dlopen(): error loading libfuse.so.2

Solution: Install FUSE library

# Ubuntu/Debian
sudo apt install libfuse2

# Fedora/CentOS/RHEL
sudo dnf install fuse-libs

# Arch Linux
sudo pacman -S fuse2

# SUID Sandbox Issues

If you encounter sandbox errors:

FATAL:setuid_sandbox_host.cc: The SUID sandbox helper binary was found, but is not configured correctly.

Quick workaround (less secure):

./Duplicate-File-Finder-1.0.0.AppImage --no-sandbox

Proper solution (recommended):

# Extract AppImage temporarily

./Duplicate-File-Finder-1.0.0.AppImage --appimage-extract

# Fix permissions

sudo chown root:root squashfs-root/chrome-sandbox

sudo chmod 4755 squashfs-root/chrome-sandbox

# Run from extracted location

./squashfs-root/AppRun

🤝 Contributing

Contributions are welcome! Please feel free to make a Pull Request. For major changes, go for it!


📋 Roadmap

- A much improved version built in a memory-safe language (Rust).
-  Add file preview functionality.


📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments

Built with Electron.

Packaged with electron-builder.

📞 Support


🐛 Issues: GitHub Issues

💬 Discussions: GitHub Discussions
