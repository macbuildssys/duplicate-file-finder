class DuplicateScannerApp {
  constructor() {
    this.duplicates = [];
    this.init();
  }

  init() {
    this.bindUIActions();
  }

  bindUIActions() {
    document.getElementById("browseBtn").addEventListener("click", () => this.browseDirectory());
    document.getElementById("scanBtn").addEventListener("click", () => this.startScan());
    document.getElementById("exportTextBtn").addEventListener("click", () => this.exportAsText());
    document.getElementById("exportPdfBtn").addEventListener("click", () => this.exportAsPDF());
  }

  async browseDirectory() {
    const directory = await window.electronAPI.selectDirectory();
    if (directory) {
      document.getElementById("searchPath").value = directory;
    }
  }

  async startScan() {
    const directory = document.getElementById("searchPath").value.trim();
    if (!directory) {
      this.showNotification('Please select a directory to scan', 'error');
      return;
    }

    document.getElementById("progressContainer").classList.add("active");
    document.getElementById("progressText").textContent = "Reading directory...";

    const minSize = parseInt(document.getElementById('minSize').value);
    const fileTypes = this.getSelectedFileTypes();

    document.getElementById("progressText").textContent = "Filtering files...";
    const files = await window.electronAPI.readDirectory(directory);
    const filteredFiles = files.filter(file =>
      !file.isDirectory &&
      file.size >= minSize &&
      this.isAllowedFileType(file.name, fileTypes)
    );

    if (filteredFiles.length === 0) {
      this.showNoDuplicatesMessage();
      document.getElementById("progressContainer").classList.remove("active");
      return;
    }

    document.getElementById("progressText").textContent = "Calculating hashes...";

    const fileHashes = new Map();
    const totalFiles = filteredFiles.length;
    let processedFiles = 0;

    for (const file of filteredFiles) {
      processedFiles++;
      const progressPercentage = Math.round((processedFiles / totalFiles) * 100);
      document.getElementById("progressFill").style.width = `${progressPercentage}%`;
      document.getElementById("progressText").textContent = `Processing file ${processedFiles} of ${totalFiles}...`;

      const hash = await window.electronAPI.calculateHash(file.path);
      if (fileHashes.has(hash)) {
        fileHashes.get(hash).push(file);
      } else {
        fileHashes.set(hash, [file]);
      }
    }

    const duplicates = [];
    for (const [hash, group] of fileHashes) {
      if (group.length > 1) {
        duplicates.push(group);
      }
    }

    this.duplicates = duplicates;
    this.displayResults();
    document.getElementById("progressContainer").classList.remove("active");
    this.showNotification(`Scan completed. Found ${duplicates.length} duplicate groups.`, "success");
  }

  showNoDuplicatesMessage() {
    const container = document.getElementById("duplicateGroupsContainer");
    container.innerHTML = '';

    const noDuplicatesDiv = document.createElement("div");
    noDuplicatesDiv.className = "duplicate-group";

    const messageDiv = document.createElement("div");
    messageDiv.className = "no-duplicates-message";
    messageDiv.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div class="empty-icon">✨</div>
        <h3>No duplicates found!</h3>
        <p>Your system is clean and organized.</p>
      </div>
    `;

    noDuplicatesDiv.appendChild(messageDiv);
    container.appendChild(noDuplicatesDiv);

    document.getElementById('statsGrid').classList.remove('active');
    document.getElementById('results').classList.add('active');
  }

  getSelectedFileTypes() {
    const types = [];
    if (document.getElementById('typeImages').checked) types.push('images');
    if (document.getElementById('typeVideos').checked) types.push('videos');
    if (document.getElementById('typeAudio').checked) types.push('audio');
    if (document.getElementById('typeDocuments').checked) types.push('documents');
    if (document.getElementById('typeAll').checked) return ['all'];
    return types;
  }

  isAllowedFileType(filename, fileTypes) {
    if (fileTypes.includes('all')) return true;
    const ext = filename.split('.').pop().toLowerCase();
    const typeMap = {
      images: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff', 'ico'],
      videos: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'mpg', 'mpeg', '3gp'],
      audio: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a', 'opus'],
      documents: ['pdf', 'doc', 'docx', 'txt', 'xlsx', 'xls', 'ppt', 'pptx', 'rtf', 'odt']
    };
    return fileTypes.some(type => typeMap[type] && typeMap[type].includes(ext));
  }

  displayResults() {
    const container = document.getElementById("duplicateGroupsContainer");
    container.innerHTML = '';
    if (this.duplicates.length === 0) {
      return;
    }
    this.duplicates.forEach((group, index) => {
      const groupDiv = document.createElement("div");
      groupDiv.className = "duplicate-group";
      const title = document.createElement("h3");
      title.textContent = `Group ${index + 1} (${group.length} files, ${this.formatFileSize(group[0].size)} each)`;
      groupDiv.appendChild(title);
      group.forEach((file) => {
        const fileDiv = document.createElement("div");
        fileDiv.className = "file-item";
        const info = document.createElement("div");
        info.className = "file-info";
        info.innerHTML = `
          <div class="file-name">${file.name}</div>
          <div class="file-meta">
            Path: ${file.path}<br>
            Size: ${this.formatFileSize(file.size)}<br>
            Modified: ${new Date(file.mtime).toLocaleDateString()}
          </div>
        `;
        fileDiv.appendChild(info);
        groupDiv.appendChild(fileDiv);
      });
      container.appendChild(groupDiv);
    });
    this.updateStats();
    document.getElementById('statsGrid').classList.add('active');
    document.getElementById('results').classList.add('active');
  }

  updateStats() {
    const totalFiles = this.duplicates.reduce((sum, group) => sum + group.length, 0);
    const duplicateGroups = this.duplicates.length;
    const duplicateFiles = totalFiles - duplicateGroups;
    const wastedSpace = this.duplicates.reduce((sum, group) => sum + (group.length - 1) * group[0].size, 0);

    document.getElementById('totalFiles').textContent = totalFiles;
    document.getElementById('duplicateGroupsCount').textContent = duplicateGroups;
    document.getElementById('duplicateFiles').textContent = duplicateFiles;
    document.getElementById('wastedSpace').textContent = this.formatFileSize(wastedSpace);
    document.getElementById('resultsStats').textContent = `${duplicateGroups} groups, ${duplicateFiles} duplicates`;
  }

  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  }

  async exportAsText() {
    const filePath = await window.electronAPI.showSaveDialog({
      title: "Save Duplicate Files List as Text",
      defaultPath: "duplicates.txt",
      filters: [{ name: "Text Files", extensions: ["txt"] }]
    });

    if (!filePath) return;

    let content = 'Duplicate Files Report\n\n';
    content += `Generated: ${new Date().toLocaleString()}\n\n`;
    content += `Total Groups: ${this.duplicates.length}\n`;
    content += `Total Files: ${this.duplicates.reduce((sum, g) => sum + g.length, 0)}\n\n`;

    this.duplicates.forEach((group, i) => {
      content += `Group ${i + 1} (${group.length} files, ${this.formatFileSize(group[0].size)} each):\n`;
      group.forEach(file => {
        content += `  - ${file.path}\n`;
      });
      content += "\n";
    });

    const success = await window.electronAPI.writeFile(filePath, content);
    this.showNotification(success ? `Exported duplicates list to ${filePath}` : "Failed to export text", success ? "success" : "error");
  }

  async exportAsPDF() {
    const { PDFDocument, rgb } = require('pdf-lib');
    const filePath = await window.electronAPI.showSaveDialog({
      title: "Save Duplicate Files List as PDF",
      defaultPath: "duplicates.pdf",
      filters: [{ name: "PDF Files", extensions: ["pdf"] }]
    });

    if (!filePath) return;

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([600, 800]);
    const { height } = page.getSize();
    let y = height - 50;

    page.drawText('Duplicate Files Report', { x: 50, y, size: 20, color: rgb(0, 0, 0) });
    y -= 30;
    page.drawText(`Generated: ${new Date().toLocaleString()}`, { x: 50, y, size: 12, color: rgb(0.5, 0.5, 0.5) });
    y -= 20;
    page.drawText(`Total Groups: ${this.duplicates.length}`, { x: 50, y, size: 12, color: rgb(0, 0, 0) });
    y -= 20;
    page.drawText(`Total Files: ${this.duplicates.reduce((sum, group) => sum + group.length, 0)}`, { x: 50, y, size: 12, color: rgb(0, 0, 0) });
    y -= 30;

    this.duplicates.forEach((group, i) => {
      page.drawText(`Group ${i + 1} (${group.length} files, ${this.formatFileSize(group[0].size)} each):`, { x: 50, y, size: 14, color: rgb(0, 0, 0) });
      y -= 20;
      group.forEach(file => {
        if (y < 50) {
          page = pdfDoc.addPage([600, 800]);
          y = height - 50;
        }
        page.drawText(`  - ${file.path}`, { x: 50, y, size: 10, color: rgb(0, 0, 0) });
        y -= 15;
      });
      y -= 10;
    });

    const pdfBytes = await pdfDoc.save();
    const success = await window.electronAPI.writeFile(filePath, Buffer.from(await pdfBytes.arrayBuffer()));
    this.showNotification(success ? `Exported duplicates list to ${filePath}` : "Failed to export PDF", success ? "success" : "error");
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 4000);
  }
}

new DuplicateScannerApp();
