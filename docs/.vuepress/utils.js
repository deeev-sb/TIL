const fs = require('fs');
const path = require('path');

class SidebarUtils {

    toTitle(title, targetPath) {
        if (title === '') {
            return targetPath.replace('/', '');
        }
        return title;
    };

    getFilePaths(files, targetDir) {
        return files.map((file) => {

            if (file === 'README.md') {
                return path.join(targetDir);
            }
            return path.join(targetDir, file);
        });
    };

    getFiles (workingDir, targetPath) {
        return fs.readdirSync(path.join(workingDir, targetPath)).filter((file) => {
            return this.isFile(path.join(workingDir, targetPath, file));
        });
    };

    getFileItems(workingDir, targetDir) {
        return fs.readdirSync(path.join(workingDir, targetDir)).map((file) => {
            if (file === 'README.md') {
                return path.join(targetDir);
            }
            return path.join(targetDir, file);
        })
    };

    getDirectories (workingDir) {
        return fs.readdirSync(workingDir).filter((childDir) => {
            if (childDir === '.vuepress') {
                return false;
            }
            return this.isDirectory(path.join(workingDir, childDir));
        });
    };

    getRootFileItems (workingDir) {
        return fs.readdirSync(workingDir).filter((file) => {
            if (file === 'README.md') {
                return false;
            }
            return this.isFile(path.join(workingDir, file));
        });
    };

    isFile(targetPath) {
        return fs.existsSync(targetPath) && fs.statSync(targetPath).isFile() && path.extname(targetPath) === '.md';
    };

    isDirectory(targetPath) {
        return fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory();
    };
}
module.exports = new SidebarUtils();