/*
 * Copyright 2019 American Express Travel Related Services Company, Inc.
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

const chokidar = require('chokidar');
const index = require('..');
const compileModuleLocales = require('../src/compileModuleLocales');

jest.mock('chokidar', () => {
  const mockChokidar = {
    watch: jest.fn(() => mockChokidar),
    on: jest.fn(() => mockChokidar),
  };

  return mockChokidar;
});
jest.mock('../src/compileModuleLocales', () => jest.fn(() => Promise.resolve()));

const flushPromises = () => new Promise(setImmediate);

describe('index', () => {
  jest.spyOn(process, 'cwd').mockImplementation(() => 'module/path');

  beforeEach(() => jest.clearAllMocks());

  it('exports an function', () => {
    expect(typeof index).toEqual('function');
  });

  it('returns undefined', () => {
    expect(index()).toEqual(undefined);
  });

  it('compiles the module locales', () => {
    index();
    expect(compileModuleLocales).toHaveBeenCalledTimes(1);
    expect(chokidar.watch).not.toHaveBeenCalled();
    expect(chokidar.on).not.toHaveBeenCalled();
  });

  it('watches the locale directory for changes', () => {
    index(true);
    expect(compileModuleLocales).toHaveBeenCalledTimes(1);
    expect(chokidar.watch).toHaveBeenCalledTimes(1);
    expect(chokidar.watch.mock.calls).toMatchSnapshot();
    expect(chokidar.on).toHaveBeenCalledTimes(1);
    expect(chokidar.on.mock.calls[0][0]).toBe('all');
    chokidar.on.mock.calls[0][1]();
    expect(compileModuleLocales).toHaveBeenCalledTimes(2);
  });

  it('should throw an exception in a 0 length timeout if compileModuleLocales fails', async () => {
    compileModuleLocales.mockImplementation(() => Promise.reject(new Error('rejectionReasonMock')));

    jest.useFakeTimers();

    index();

    await flushPromises();

    expect(setTimeout).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenNthCalledWith(1, expect.any(Function));

    expect(() => jest.runAllTimers()).toThrow('rejectionReasonMock');

    jest.useRealTimers();
  });
});
