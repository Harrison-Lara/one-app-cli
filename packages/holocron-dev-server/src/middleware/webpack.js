/*
 * Copyright 2021 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations
 * under the License.
 */

import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import createHotHolocronCompiler from '../webpack/createHotHolocronCompiler';
import { vfs } from '../utils/virtual-file-system';
import { setPublisher } from '../utils/publish';

export default async function loadWebpackMiddleware({
  modules = [],
  environmentVariables = {},
  webpackConfigPath = null,
} = {}) {
  const compiler = createHotHolocronCompiler({
    modules,
    environmentVariables,
    webpackConfigPath,
  });
  const devMiddleware = webpackDevMiddleware(compiler, {
    // TODO: removing all logs - still writes to stderr
    // https://webpack.js.org/configuration/other-options/#infrastructurelogging
    stats: false,
    index: false,
    writeToDisk: true,
    outputFileSystem: vfs,
  });
  const hotMiddleware = webpackHotMiddleware(compiler, {
    log: false,
    dynamicPublicPath: false,
  });

  setPublisher((...args) => hotMiddleware.publish(...args));

  return new Promise((resolve) => {
    // resolves when the first bundle is built
    devMiddleware.waitUntilValid(() => {
      resolve([devMiddleware, hotMiddleware]);
    });
  });
}
