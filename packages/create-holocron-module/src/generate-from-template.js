const prompts = require('prompts');
const log = require('./utils/log');
const installTemplate = require('./utils/install-template');
const installModule = require('./utils/install-module');
const getBaseOptions = require('./utils/get-base-options');
const walkTemplate = require('./utils/walk-template');
const initializeGitRepo = require('./utils/initialize-git-repo');

const generateFromTemplate = async ({ templateName }) => {
  log.generatorBanner();

  // Load the template
  log.stepBanner(1);
  await installTemplate(templateName);

  // remove the version, this does mean that you always need to specify the version
  // of the template package.
  let templatePackageName = templateName.split('@').slice(0, -1).join('@');
  if (process.env.DEV_TEMPLATE_NAME_OVERRIDE) {
    // when making changes to a local template, you will use npm pack, then pass the
    // entire file path to this command, in this case, you should also export
    // the below variable to the name of the package so it can be required.
    templatePackageName = process.env.DEV_TEMPLATE_NAME_OVERRIDE;
  }

  // eslint-disable-next-line max-len
  // eslint-disable-next-line import/no-extraneous-dependencies,global-require,import/no-dynamic-require
  const templatePackage = require(templatePackageName);

  // Gather parameters
  log.stepBanner(2);
  const baseData = await getBaseOptions();
  const {
    templateValues,
    dynamicFileNames = [],
    ignoredFileNames = [],
  } = await templatePackage.getTemplateOptions(baseData, prompts);
  const templateDirPaths = templatePackage.getTemplatePaths();

  // Generate Module
  log.stepBanner(3);

  templateDirPaths.forEach((templateRootPath) => walkTemplate(
    templateRootPath,
    `./${templateValues.moduleName}`,
    {
      ignoredFileNames,
      dynamicFileNames,
      templateValues,
    }
  ));

  // Install and build the module
  log.stepBanner(4);
  await installModule(`./${templateValues.moduleName}`);

  // Initialize git
  log.stepBanner(5);
  await initializeGitRepo(`./${templateValues.moduleName}`);
};

module.exports = generateFromTemplate;
