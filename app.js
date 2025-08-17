class DuplicateFinder {
    constructor() {
        this.isScanning = false;
        this.duplicates = [];
        this.currentPath = '/';
        this.selectedPath = '/';
        this.fileSystem = this.generateMockFileSystem();
        this.currentFileDetails = null;
        this.initializeEventListeners();
        this.setDefaultPath();
    }

    setDefaultPath() {
        // Set appropriate default paths for different OS
        const userAgent = navigator.userAgent.toLowerCase();
        let defaultPath;
        
        if (userAgent.includes('win')) {
            defaultPath = 'C:\\Users\\User\\Documents';
        } else if (userAgent.includes('mac')) {
            defaultPath = '/Users/user/Documents';
        } else {
            defaultPath = '/home/user/Documents';
        }
        
        document.getElementById('searchPath').value = defaultPath;
    }

    initializeEventListeners() {
        // Main buttons
        document.getElementById('scanBtn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.startScan();
        });
        
        document.getElementById('clearBtn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.clearResults();
        });
        
        // Browse button
        document.getElementById('browseBtn').addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.browseDirectory();
        });
        
        // File type checkboxes
        document.getElementById('typeAll').addEventListener('change', (e) => {
            this.handleAllTypesChange(e);
        });
        
        // Directory input
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleDirectorySelect(e);
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.startScan();
            }
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
        
        // File Browser Modal event listeners
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeFileBrowser();
        });
        
        document.getElementById('cancelSelect').addEventListener('click', () => {
            this.closeFileBrowser();
        });
        
        document.getElementById('confirmSelect').addEventListener('click', () => {
            this.confirmFolderSelection();
        });
        
        // File Details Modal event listeners
        document.getElementById('closeFileDetails').addEventListener('click', () => {
            this.closeFileDetails();
        });
        
        document.getElementById('closeFileDetailsBtn').addEventListener('click', () => {
            this.closeFileDetails();
        });
        
        document.getElementById('openFileLocation').addEventListener('click', () => {
            this.openFileLocation();
        });
        
        document.getElementById('openFileDirectly').addEventListener('click', () => {
            this.openFileDirectly();
        });
        
        // Close modal when clicking outside
        document.getElementById('fileBrowserModal').addEventListener('click', (e) => {
            if (e.target.id === 'fileBrowserModal') {
                this.closeFileBrowser();
            }
        });
        
        document.getElementById('fileDetailsModal').addEventListener('click', (e) => {
            if (e.target.id === 'fileDetailsModal') {
                this.closeFileDetails();
            }
        });
        
        // Auto-focus search path
        document.getElementById('searchPath').focus();
    }

    closeAllModals() {
        this.closeFileBrowser();
        this.closeFileDetails();
    }

    generateMockFileSystem() {
        return {
            '/': {
                type: 'directory',
                children: {
                    'home': {
                        type: 'directory', 
                        children: {
                            'user': { 
                                type: 'directory', 
                                children: {
                                    'Documents': { 
                                        type: 'directory', 
                                        children: {
                                            'Work': { type: 'directory', children: {} },
                                            'Personal': { type: 'directory', children: {} },
                                            'Projects': { type: 'directory', children: {} },
                                            'Archive': { type: 'directory', children: {} }
                                        }
                                    },
                                    'Downloads': { 
                                        type: 'directory', 
                                        children: {
                                            'Software': { type: 'directory', children: {} },
                                            'Media': { type: 'directory', children: {} },
                                            'Documents': { type: 'directory', children: {} }
                                        }
                                    },
                                    'Pictures': { 
                                        type: 'directory', 
                                        children: {
                                            'Vacation 2023': { type: 'directory', children: {} },
                                            'Family': { type: 'directory', children: {} },
                                            'Screenshots': { type: 'directory', children: {} },
                                            'Camera Roll': { type: 'directory', children: {} }
                                        }
                                    },
                                    'Music': { 
                                        type: 'directory', 
                                        children: {
                                            'Rock': { type: 'directory', children: {} },
                                            'Jazz': { type: 'directory', children: {} },
                                            'Classical': { type: 'directory', children: {} },
                                            'Playlists': { type: 'directory', children: {} }
                                        }
                                    },
                                    'Videos': { 
                                        type: 'directory', 
                                        children: {
                                            'Movies': { type: 'directory', children: {} },
                                            'TV Shows': { type: 'directory', children: {} },
                                            'Personal': { type: 'directory', children: {} }
                                        }
                                    },
                                    'Desktop': { type: 'directory', children: {} },
                                    'Templates': { type: 'directory', children: {} },
                                    'Public': { type: 'directory', children: {} }
                                }
                            }
                        }
                    },
                    'var': { 
                        type: 'directory', 
                        children: {
                            'www': { type: 'directory', children: {} },
                            'log': { type: 'directory', children: {} },
                            'cache': { type: 'directory', children: {} }
                        }
                    },
                    'opt': { 
                        type: 'directory', 
                        children: {
                            'applications': { type: 'directory', children: {} },
                            'bin': { type: 'directory', children: {} }
                        }
                    },
                    'tmp': { type: 'directory', children: {} },
                    'usr': { 
                        type: 'directory', 
                        children: {
                            'local': { type: 'directory', children: {} },
                            'share': { type: 'directory', children: {} }
                        }
                    }
                }
            }
        };
    }

    browseDirectory() {
        this.openFileBrowser();
    }

    openFileBrowser() {
        this.currentPath = '/';
        this.selectedPath = '/';
        document.getElementById('fileBrowserModal').classList.add('show');
        this.loadDirectory('/');
    }

    async loadDirectory(path) {
        const loading = document.getElementById('browserLoading');
        const list = document.getElementById('fileBrowserList');
        
        loading.style.display = 'flex';
        list.style.display = 'none';
        
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const directories = this.getDirectoriesInPath(path);
        this.renderDirectoryList(directories, path);
        this.updateBreadcrumb(path);
        
        loading.style.display = 'none';
        list.style.display = 'block';
    }

    getDirectoriesInPath(path) {
        const parts = path.split('/').filter(p => p);
        let current = this.fileSystem['/'];
        
        for (const part of parts) {
            if (current.children && current.children[part]) {
                current = current.children[part];
            } else {
                return [];
            }
        }
        
        const directories = [];
        if (current.children) {
            for (const [name, info] of Object.entries(current.children)) {
                if (info.type === 'directory') {
                    directories.push({
                        name,
                        path: path === '/' ? `/${name}` : `${path}/${name}`,
                        size: Math.floor(Math.random() * 50) + ' items',
                        modified: this.getRandomDate()
                    });
                }
            }
        }
        
        return directories.sort((a, b) => a.name.localeCompare(b.name));
    }

    renderDirectoryList(directories, currentPath) {
        const list = document.getElementById('fileBrowserList');
        list.innerHTML = '';
        
        // Add parent directory option if not at root
        if (currentPath !== '/') {
            const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
            const parentItem = document.createElement('li');
            parentItem.className = 'file-browser-item';
            parentItem.innerHTML = `
                <div class="file-icon">📁</div>
                <div class="file-details">
                    <div class="file-name">..</div>
                    <div class="file-meta">Parent directory</div>
                </div>
            `;
            parentItem.addEventListener('click', () => {
                this.currentPath = parentPath;
                this.loadDirectory(parentPath);
            });
            list.appendChild(parentItem);
        }
        
        directories.forEach(dir => {
            const item = document.createElement('li');
            item.className = 'file-browser-item';
            item.dataset.path = dir.path;
            
            item.innerHTML = `
                <div class="file-icon">📁</div>
                <div class="file-details">
                    <div class="file-name">${dir.name}</div>
                    <div class="file-meta">${dir.size} • Modified ${dir.modified}</div>
                </div>
            `;
            
            item.addEventListener('click', () => {
                // Remove selection from other items
                document.querySelectorAll('.file-browser-item').forEach(el => {
                    el.classList.remove('selected');
                });
                
                // Select this item
                item.classList.add('selected');
                this.selectedPath = dir.path;
                document.getElementById('selectedPath').textContent = dir.path;
            });
            
            item.addEventListener('dblclick', () => {
                this.currentPath = dir.path;
                this.loadDirectory(dir.path);
            });
            
            list.appendChild(item);
        });
        
        // Update selected path display
        document.getElementById('selectedPath').textContent = currentPath;
        this.selectedPath = currentPath;
    }

    updateBreadcrumb(path) {
        const breadcrumb = document.getElementById('breadcrumb');
        const parts = path.split('/').filter(p => p);
        
        let html = '<span class="breadcrumb-item" data-path="/">🏠 Home</span>';
        let currentPath = '';
        
        parts.forEach((part, index) => {
            currentPath += '/' + part;
            html += '<span class="breadcrumb-separator">/</span>';
            html += `<span class="breadcrumb-item" data-path="${currentPath}">${part}</span>`;
        });
        
        breadcrumb.innerHTML = html;
        
        // Add click handlers to breadcrumb items
        breadcrumb.querySelectorAll('.breadcrumb-item').forEach(item => {
            item.addEventListener('click', () => {
                const targetPath = item.dataset.path;
                this.currentPath = targetPath;
                this.loadDirectory(targetPath);
            });
        });
    }

    closeFileBrowser() {
        document.getElementById('fileBrowserModal').classList.remove('show');
    }

    confirmFolderSelection() {
        document.getElementById('searchPath').value = this.selectedPath;
        this.closeFileBrowser();
        this.showNotification(`Selected folder: ${this.selectedPath}`, 'success');
    }

    handleDirectorySelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            const firstFile = files[0];
            const path = firstFile.webkitRelativePath.split('/')[0];
            document.getElementById('searchPath').value = path;
            this.showNotification('Directory selected: ' + path, 'success');
        }
    }

    handleAllTypesChange(e) {
        const checkboxes = ['typeImages', 'typeVideos', 'typeAudio', 'typeDocuments'];
        checkboxes.forEach(id => {
            const checkbox = document.getElementById(id);
            checkbox.checked = !e.target.checked;
            checkbox.disabled = e.target.checked;
        });
    }

    async startScan() {
        if (this.isScanning) return;

        const searchPath = document.getElementById('searchPath').value.trim();
        if (!searchPath) {
            this.showNotification('Please select a directory to scan', 'error');
            return;
        }

        this.isScanning = true;
        this.updateScanButton(true);
        this.showProgress();
        this.clearResults();

        try {
            await this.simulateScan();
            this.generateMockResults();
            this.displayResults();
            this.showNotification('Scan completed successfully!', 'success');
        } catch (error) {
            console.error('Scan error:', error);
            this.showNotification('Scan failed: ' + error.message, 'error');
        } finally {
            this.isScanning = false;
            this.updateScanButton(false);
            this.hideProgress();
        }
    }

    updateScanButton(scanning) {
        const btn = document.getElementById('scanBtn');
        const icon = document.getElementById('scanIcon');
        const text = document.getElementById('scanText');

        btn.disabled = scanning;
        
        if (scanning) {
            icon.innerHTML = '<div class="loading"></div>';
            text.textContent = 'Scanning...';
        } else {
            icon.textContent = '🔍';
            text.textContent = 'Start Scan';
        }
    }

    showProgress() {
        document.getElementById('progressContainer').classList.add('active');
        document.getElementById('progressFill').style.width = '0%';
    }

    hideProgress() {
        document.getElementById('progressContainer').classList.remove('active');
    }

    async simulateScan() {
        const steps = [
            'Scanning directory structure...',
            'Reading file metadata...',
            'Calculating file hashes...',
            'Comparing file signatures...',
            'Identifying duplicate groups...',
            'Finalizing results...'
        ];

        for (let i = 0; i < steps.length; i++) {
            document.getElementById('progressText').textContent = steps[i];
            const progress = ((i + 1) / steps.length) * 100;
            document.getElementById('progressFill').style.width = `${progress}%`;
            await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 600));
        }
    }

    generateMockResults() {
        const searchPath = document.getElementById('searchPath').value || '/home/user/Documents';
        const basePath = searchPath.replace(/\/$/, ''); // Remove trailing slash

        // Generate more realistic duplicate scenarios
        this.duplicates = [
            {
                size: 2457600,
                hash: 'abc123def456',
                files: [
                    `${basePath}/Photos/vacation_2023.jpg`,
                    `${basePath}/Backup/vacation_2023_copy.jpg`,
                    `${basePath}/Desktop/vacation_backup.jpg`
                ]
            },
            {
                size: 1048576,
                hash: 'def789ghi012',
                files: [
                    `${basePath}/Work/presentation.pdf`,
                    `${basePath}/Downloads/presentation_final.pdf`
                ]
            },
            {
                size: 3932160,
                hash: 'ghi345jkl678',
                files: [
                    `${basePath}/Music/favorite_song.mp3`,
                    `${basePath}/Downloads/favorite_song.mp3`,
                    `${basePath}/Backup/Music/favorite_song_backup.mp3`
                ]
            },
            {
                size: 512000,
                hash: 'jkl901mno234',
                files: [
                    `${basePath}/Documents/report_2023.docx`,
                    `${basePath}/Backup/report_2023_v2.docx`
                ]
            },
            {
                size: 204800,
                hash: 'mno567pqr890',
                files: [
                    `${basePath}/Data/export.csv`,
                    `${basePath}/Downloads/data_export.csv`,
                    `${basePath}/Backup/export_backup.csv`,
                    `${basePath}/Archive/old_export.csv`
                ]
            }
        ];
    }

    displayResults() {
        this.updateStats();
        this.renderDuplicateGroups();
        document.getElementById('results').classList.add('active');
        document.getElementById('statsGrid').classList.add('active');
    }

    updateStats() {
        const totalDuplicates = this.duplicates.reduce((sum, group) => sum + group.files.length, 0);
        const wastedSpace = this.duplicates.reduce((sum, group) => sum + (group.size * (group.files.length - 1)), 0);

        document.getElementById('totalFiles').textContent = this.formatNumber(1247 + Math.floor(Math.random() * 500));
        document.getElementById('duplicateGroups').textContent = this.duplicates.length.toString();
        document.getElementById('duplicateFiles').textContent = totalDuplicates.toString();
        document.getElementById('wastedSpace').textContent = this.formatFileSize(wastedSpace);

        document.getElementById('resultsStats').textContent = 
            `${this.duplicates.length} groups, ${totalDuplicates} duplicates`;
    }

    renderDuplicateGroups() {
        const container = document.getElementById('duplicateGroups');
        container.innerHTML = '';

        if (this.duplicates.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">✨</div>
                    <h3>No duplicates found!</h3>
                    <p>Your system is clean and organized.</p>
                </div>
            `;
            return;
        }

        this.duplicates.forEach((group, groupIndex) => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'duplicate-group';
            
            groupDiv.innerHTML = `
                <div class="group-header">
                    <div class="group-info">
                        Duplicate Group ${groupIndex + 1} • ${group.files.length} files
                    </div>
                    <div class="group-size">${this.formatFileSize(group.size)} each</div>
                </div>
                <div class="file-list">
                    ${group.files.map((file, fileIndex) => `
                        <div class="file-item" data-group="${groupIndex}" data-file="${fileIndex}">
                            <div class="file-info">
                                <div class="file-path" title="${file}">${this.getFileName(file)}</div>
                                <div class="file-meta">
                                    Path: ${this.getDirectoryPath(file)} •
                                    Modified: ${this.getRandomDate()} • 
                                    ${this.formatFileSize(group.size)} •
                                    Hash: ${group.hash.substring(0, 8)}...
                                </div>
                            </div>
                            <div class="file-actions">
                                <button class="btn btn-secondary btn-small" onclick="duplicateFinder.showFileDetails('${file}', ${group.size}, '${group.hash}')">
                                    📄 Details
                                </button>
                                <button class="btn btn-danger btn-small" onclick="duplicateFinder.deleteFile(${groupIndex}, ${fileIndex})">
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            container.appendChild(groupDiv);
        });
    }

    getFileName(filePath) {
        return filePath.split('/').pop() || filePath.split('\\').pop();
    }

    getDirectoryPath(filePath) {
        const parts = filePath.split('/');
        if (parts.length > 1) {
            return parts.slice(0, -1).join('/');
        }
        const winParts = filePath.split('\\');
        if (winParts.length > 1) {
            return winParts.slice(0, -1).join('\\');
        }
        return filePath;
    }

    showFileDetails(filePath, size, hash) {
        this.currentFileDetails = {
            path: filePath,
            size: size,
            hash: hash,
            name: this.getFileName(filePath),
            directory: this.getDirectoryPath(filePath),
            extension: filePath.split('.').pop() || 'No extension',
            modified: this.getRandomDate(),
            created: this.getRandomDate()
        };

        this.renderFileDetails();
        document.getElementById('fileDetailsModal').classList.add('show');
    }

    renderFileDetails() {
        const content = document.getElementById('fileDetailsContent');
        const file = this.currentFileDetails;
        
        content.innerHTML = `
            <div class="file-detail-row">
                <span class="file-detail-label">File Name:</span>
                <span class="file-detail-value">${file.name}</span>
            </div>
            <div class="file-detail-row">
                <span class="file-detail-label">Full Path:</span>
                <span class="file-detail-value">${file.path}</span>
            </div>
            <div class="file-detail-row">
                <span class="file-detail-label">Directory:</span>
                <span class="file-detail-value">${file.directory}</span>
            </div>
            <div class="file-detail-row">
                <span class="file-detail-label">File Size:</span>
                <span class="file-detail-value">${this.formatFileSize(file.size)}</span>
            </div>
            <div class="file-detail-row">
                <span class="file-detail-label">File Type:</span>
                <span class="file-detail-value">.${file.extension}</span>
            </div>
            <div class="file-detail-row">
                <span class="file-detail-label">Hash (MD5):</span>
                <span class="file-detail-value">${file.hash}</span>
            </div>
            <div class="file-detail-row">
                <span class="file-detail-label">Modified:</span>
                <span class="file-detail-value">${file.modified}</span>
            </div>
            <div class="file-detail-row">
                <span class="file-detail-label">Created:</span>
                <span class="file-detail-value">${file.created}</span>
            </div>
        `;

        document.getElementById('fileDetailsTitle').textContent = `📄 ${file.name}`;
    }

    openFileLocation() {
        if (!this.currentFileDetails) return;
        
        const directory = this.currentFileDetails.directory;
        this.showNotification(`Opening location: ${directory}`, 'success');
        
        // Simulate opening file manager to the directory
        console.log('Opening file manager to:', directory);
        
        // In a real Electron app, you would use:
        // shell.showItemInFolder(this.currentFileDetails.path);
    }

    openFileDirectly() {
        if (!this.currentFileDetails) return;
        
        const filePath = this.currentFileDetails.path;
        this.showNotification(`Opening file: ${this.currentFileDetails.name}`, 'success');
        
        // Simulate opening the file
        console.log('Opening file:', filePath);
        
        // In a real Electron app, you would use:
        // shell.openPath(filePath);
    }

    closeFileDetails() {
        document.getElementById('fileDetailsModal').classList.remove('show');
        this.currentFileDetails = null;
    }

    async deleteFile(groupIndex, fileIndex) {
        const file = this.duplicates[groupIndex].files[fileIndex];
        
        // Simulate deletion confirmation
        if (confirm(`Are you sure you want to delete:\n${this.getFileName(file)}?`)) {
            this.duplicates[groupIndex].files.splice(fileIndex, 1);
            
            // Remove group if only one file remains
            if (this.duplicates[groupIndex].files.length <= 1) {
                this.duplicates.splice(groupIndex, 1);
            }
            
            this.displayResults();
            this.showNotification(`File deleted: ${this.getFileName(file)}`, 'success');
        }
    }

    clearResults() {
        document.getElementById('results').classList.remove('active');
        document.getElementById('statsGrid').classList.remove('active');
        this.duplicates = [];
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    formatNumber(num) {
        return num.toLocaleString();
    }

    getRandomDate() {
        const now = new Date();
        const pastDate = new Date(now.getTime() - Math.random() * 365 * 24 * 60 * 60 * 1000);
        return pastDate.toLocaleDateString();
    }

    showNotification(message, type = 'success') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        // Create new notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px;">
                ${type === 'success' ? '✅' : '❌'} ${type === 'success' ? 'Success' : 'Error'}
            </div>
            <div>${message}</div>
        `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
let duplicateFinder;

document.addEventListener('DOMContentLoaded', () => {
    duplicateFinder = new DuplicateFinder();
    
    // Make it globally accessible for onclick handlers
    window.duplicateFinder = duplicateFinder;
    
    console.log('Duplicate File Finder initialized successfully');
});

// Prevent form submission on Enter key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'BUTTON') {
        e.preventDefault();
    }
});