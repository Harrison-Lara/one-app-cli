const prompts = require('prompts');
const log = require('./utils/log');
const installTemplate = require('./utils/install-template');
const installModule = require('./utils/install-module');
const getBaseOptions = require('./utils/get-base-options');
const walkTemplate = require('./utils/walk-template');

const generateFromTemplate = async ({ templateName }) => {
  log.generatorBanner();

  // Load the template
  log.stepBanner(1);
  await installTemplate(templateName);

  // we will need to resolve the correct name to import from from given template package
  // eslint-disable-next-line import/no-extraneous-dependencies,global-require
  const templatePackage = require('@americanexpress/holocron-module-template');

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
  console.log('not implemented');
};

module.exports = generateFromTemplate;
