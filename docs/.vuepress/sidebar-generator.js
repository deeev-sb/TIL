const path = require('path');
const fs = require('fs');

const getSidebarGroup = (targetDir = "", title = '', isCollapsable = true) => {
    const workingDir = 'docs';
    const dirAllPath = path.join(workingDir, targetDir);
    const files = getFiles(dirAllPath); // 디렉토리 읽어옴

    return {
        title: title || targetDir,
        collapsable: isCollapsable,
        children: getFilePaths(files, targetDir)
    }
}
const getFiles = (dir) => {
    return fs.readdirSync(dir).filter(file => getFile(path.join(dir, file)));
}

const getFile = (dir) => {
    return fs.existsSync(dir) && fs.statSync(dir).isFile() && path.extname(dir) === '.md';
}

const getFilePaths = (files, dir) => {
    return files.map((file) => {

        if (file === 'README.md') {
            return path.join(dir);
        }
        return path.join(dir, file).split(path.sep).join('/');
    });
};

module.exports = {
    getSidebarGroup
}