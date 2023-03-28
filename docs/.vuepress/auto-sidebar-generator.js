const path = require('path');
const utils = require('./utils');

class SidebarGen {
    constructor () {

    };

    getSidebarItem (targetDir) {
        let workingDir = './docs';
        let files = utils.getFiles(workingDir, targetDir);

        return utils.getFilePaths(files, targetDir).map((path) => {
            return "[" + path + " ]";
        }).join();
    };

    getSidebarGroup (targetDir = '/', title = '', isCollapsable = true) {
        let workingDir = './docs';
        let files = utils.getFiles(workingDir, targetDir);
        let groupTitle = utils.toTitle(title, targetDir);

        let directoryGroup =  {
            title: groupTitle,
            collapsable: isCollapsable,
            children: utils.getFilePaths(files, targetDir)
        };
        return directoryGroup;
    };

    getSidebarList (isCollapsable = true) {
        let root = ['']
        let workingDir = './docs';
        let rootFiles = utils.getRootFileItems(workingDir);
        let rootItems = rootFiles.map((file) => {
            return path.join(file);
        });
        let directories = utils.getDirectories(workingDir);
        let directoryGroups = directories.map((directory) => {
            return {
                title: directory,
                collapsable: isCollapsable,
                children: utils.getFileItems(workingDir, directory)
            };
        });
        let sidebarList = root.concat(rootItems, directoryGroups);

        return sidebarList;
    };
}
module.exports = new SidebarGen();