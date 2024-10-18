"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const fs = require("fs");
const path = require("path");
const listFiles = async ({ path: path$1 }) => {
  let allFiles = [];
  try {
    const files = await fs.promises.readdir(path$1);
    for (const file of files) {
      const filePath = path.join(path$1, file);
      const fileStats = await fs.promises.stat(filePath);
      if (fileStats.isDirectory()) {
        const subDirFiles = await listFiles({ path: filePath });
        allFiles = allFiles.concat(subDirFiles);
      } else {
        allFiles.push(filePath);
      }
    }
  } catch (err) {
    console.error("Error reading directory:", err);
  }
  return allFiles;
};
const writeFile = async ({ code, filePath }) => {
  try {
    await fs.promises.writeFile(filePath, code);
    console.info(`File '${filePath}' has been created`);
  } catch (err) {
    console.error("Error writing file:", err);
  }
};
const getComponentFilePaths = ({ source }) => listFiles({ path: `src/${source}/` });
const getImportCode = async ({ sources }) => {
  var _a;
  let acumIndex = 0;
  return Promise.all(
    (_a = sources ?? []) == null ? void 0 : _a.map(async (source, sourceIndex) => {
      var _a2;
      const filePaths = await getComponentFilePaths({ source });
      const code = (_a2 = filePaths == null ? void 0 : filePaths.map((path2, index) => {
        var _a3;
        if (!(path2 == null ? void 0 : path2.includes("/actions/"))) return "";
        if (!(path2 == null ? void 0 : path2.endsWith(".js"))) return "";
        acumIndex++;
        const importPath = (_a3 = path2 == null ? void 0 : path2.replace(`src/${source}`, `@/${source}`)) == null ? void 0 : _a3.replace(".js", "");
        return `import * as A${acumIndex} from '${importPath}'
console.log(A${acumIndex})
`;
      })) == null ? void 0 : _a2.join("");
      return { filePaths, code };
    })
  );
};
const getURLPath = ({ path: path2, metaUrl }) => new URL(`${path2}`, metaUrl).pathname;
const getInputPaths = async ({ sources, metaUrl }) => {
  var _a;
  try {
    const componentsInfos = await getImportCode({ sources });
    const actionImportCode = `${(_a = componentsInfos == null ? void 0 : componentsInfos.map((componentsInfo) => componentsInfo == null ? void 0 : componentsInfo.code)) == null ? void 0 : _a.join("\n")}`;
    const actionsFilePath = "src/_actions_autogenerated.js";
    await writeFile({ code: actionImportCode, filePath: actionsFilePath });
    const paths = {
      ...componentsInfos == null ? void 0 : componentsInfos.reduce((acc1, componentsInfo) => {
        var _a2;
        acc1 = {
          ...acc1,
          ...(_a2 = componentsInfo == null ? void 0 : componentsInfo.filePaths) == null ? void 0 : _a2.reduce((acc, componentFilePath) => {
            var _a3;
            if ((componentFilePath == null ? void 0 : componentFilePath.endsWith(".js")) && !(componentFilePath == null ? void 0 : componentFilePath.includes("/actions/"))) return acc;
            const fileName = (_a3 = componentFilePath == null ? void 0 : componentFilePath.split("/")) == null ? void 0 : _a3.pop();
            const componentName = fileName == null ? void 0 : fileName.replace(/\.[^.]+$/, "");
            acc[componentName] = getURLPath({ path: componentFilePath, metaUrl });
            return acc;
          }, {})
        };
        return acc1;
      }, {}),
      actionsFilePath: getURLPath({ path: actionsFilePath, metaUrl })
      // 'sw.worker': getURLPath({ path: '/src/sw.worker.js', metaUrl }),
    };
    return paths;
  } catch (err) {
    console.error(err);
    return {};
  }
};
const closeBundle = async () => {
  const distFilePaths = await listFiles({ path: "dist/" });
  const cleanedDistFilePaths = distFilePaths == null ? void 0 : distFilePaths.filter((path2) => !(path2 == null ? void 0 : path2.endsWith(".DS_Store")));
  await writeFile({ code: JSON.stringify(cleanedDistFilePaths), filePath: "dist/dist.json" });
};
const getPlugin = () => {
  return [
    {
      name: "postbuild-command",
      closeBundle
    }
  ];
};
exports.getInputPaths = getInputPaths;
exports.getPlugin = getPlugin;
exports.getURLPath = getURLPath;
