/**
 * @noflow
 */

const fs = require("fs");
const path = require("path");
const blacklist = require("react-native/node_modules/metro-bundler/src/blacklist");
const babelRegisterOnly = require("react-native/node_modules/metro-bundler/src/babelRegisterOnly");

const registeredTransformModulePaths = new Set();

module.exports = {
  getBlacklistRE() {
    return blacklist([/__internal__\/(.*)/]);
  },
  getProvidesModuleNodeModules() {
    return [];
  },
  getTransformModulePath() {
    const modulePath = path.join(__dirname, "transformer.js");
    if (!registeredTransformModulePaths.has(modulePath)) {
      babelRegisterOnly([modulePath]);
      registeredTransformModulePaths.add(modulePath);
    }
    return modulePath;
  },
  extraNodeModules: getNodeModulesForDirectory(path.resolve(".")),
};

function getNodeModulesForDirectory(rootPath) {
  const nodeModulePath = path.join(rootPath, "node_modules");
  const folders = fs.readdirSync(nodeModulePath);
  return folders.reduce((modules, folderName) => {
    const folderPath = path.join(nodeModulePath, folderName);
    if (folderName.startsWith("@")) {
      const scopedModuleFolders = fs.readdirSync(folderPath);
      const scopedModules = scopedModuleFolders.reduce((scopedModules, scopedFolderName) => {
        scopedModules[`${folderName}/${scopedFolderName}`] = maybeResolveSymlink(
          path.join(folderPath, scopedFolderName),
        );
        return scopedModules;
      }, {});
      return Object.assign({}, modules, scopedModules);
    }
    modules[folderName] = maybeResolveSymlink(folderPath);
    return modules;
  }, {});
}

function maybeResolveSymlink(maybeSymlinkPath) {
  if (fs.lstatSync(maybeSymlinkPath).isSymbolicLink()) {
    const resolved = path.resolve(path.dirname(maybeSymlinkPath), fs.readlinkSync(maybeSymlinkPath));
    return resolved;
  }
  return maybeSymlinkPath;
}
