var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/*
 * (c) Copyright 2021-2022 Micro Focus or one of its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import fs from 'fs';
import { deserializeSourceControlDetails, getNunitOctaneTestByName, getAppModuleBySourceType, validateOctaneTest } from './utils/octaneClient.js';
import { getAbsoluteClasspath } from './utils/classpath.js';
import { cleanUpWorkingFiles, EXECUTABLE_FILE, getEnvironmentVariables, getTestParameters, getRootWorkingFolder, getTestNames, replaceParametersFromCSV, replaceParamsValuesInNunitTest, TEST_RESULT_FILE } from './utils/files.js';
const NUNIT3_CONSOLE = 'nunit3-console.exe';
const createCommand = (nunitDirectories, test, timestamp, testContainerAppModule, sourceControlProfile, credentials) => __awaiter(void 0, void 0, void 0, function* () {
    let dllPath;
    if (sourceControlProfile) {
        const rootWorkingFolder = getRootWorkingFolder(test);
        sourceControlProfile.createClasspathFolder(rootWorkingFolder, credentials);
        dllPath = getAbsoluteClasspath(sourceControlProfile.getAbsoluteWorkingFolderPath(rootWorkingFolder), test.sc_nunit_assembly_udf);
    }
    else {
        dllPath = getAbsoluteClasspath('', test.sc_nunit_assembly_udf);
    }
    let nunitDirectory = '';
    const octaneNunitDir = test.sc_nunit_directory_udf;
    if (octaneNunitDir) {
        if (octaneNunitDir.endsWith(NUNIT3_CONSOLE)) {
            if (nunitDirectories.nunit3) {
                nunitDirectory = nunitDirectories.nunit3;
            }
            else {
                throw new Error('Missing nunit3 directory');
            }
        }
        else {
            if (nunitDirectories.nunit2) {
                nunitDirectory = nunitDirectories.nunit2;
            }
            else {
                throw new Error('Missing nunit2 directory');
            }
        }
    }
    else {
        throw new Error(`Nunit Directory udf has empty value for the Octane automated test with with the name ${test.name}`);
    }
    console.log('nunit_exe: ' + nunitDirectory);
    const nunitOptions = test.sc_nunit_options_udf != null ? test.sc_nunit_options_udf : '';
    const outputFilePath = `./${TEST_RESULT_FILE}/${test.name}_${timestamp}_output_nunit.xml`;
    let command;
    //this should always be in one line
    command = `"${nunitDirectory}" ${nunitOptions} --result="${outputFilePath}";transform="./nunit3-junit.xslt" "${dllPath}"`;
    return command;
});
const getJavaCommand = (testMethod, runnerJarPath, timestamp) => {
    //this should always be in one line
    return `java -cp "${runnerJarPath}" com.microfocus.adm.almoctane.migration.plugin_silk_central.nunit.NUnitCmdLineWrapper ${testMethod} ${timestamp}`;
};
const getExecutableFile = (testsToRun, runnerJarPath, nunitDirectories, suiteId, suiteRunId, githubCredentials) => __awaiter(void 0, void 0, void 0, function* () {
    cleanUpWorkingFiles();
    if (fs.existsSync('./java_command_to_execute.bat')) {
        fs.unlinkSync('./java_command_to_execute.bat');
    }
    const testNames = getTestNames(testsToRun);
    for (const testName of testNames) {
        const test = yield getNunitOctaneTestByName(testName);
        validateOctaneTest(test, testName);
        const testContainerAppModule = yield getAppModuleBySourceType(test, 'test container');
        const sourceControlProfile = deserializeSourceControlDetails(testContainerAppModule.sc_source_control_udf);
        const environmentParams = getEnvironmentVariables();
        let iterations = yield getTestParameters(test, testContainerAppModule, suiteId, suiteRunId, sourceControlProfile);
        const iterationsParams = yield replaceParametersFromCSV(iterations, environmentParams);
        for (const iteration of iterationsParams) {
            const testWithParams = replaceParamsValuesInNunitTest(iteration, environmentParams, test);
            const timestamp = Date.now();
            const command = yield createCommand(nunitDirectories, testWithParams, timestamp, testContainerAppModule, sourceControlProfile, githubCredentials);
            fs.appendFileSync(EXECUTABLE_FILE, command + '\n');
            const javaCommand = getJavaCommand(testName, runnerJarPath, timestamp);
            fs.appendFileSync('./java_command_to_execute.bat', javaCommand + '\n');
        }
    }
});
let credentials = undefined;
let nunitDirectories = undefined;
const testsToRun = process.argv[2];
const jarPath = process.argv[3];
const suiteId = process.argv[4];
const suiteRunId = process.argv[5];
const nunit2 = process.argv[6];
const nunit3 = process.argv[7];
const username = process.argv[8];
const password = process.argv[9];
if (!testsToRun || !jarPath) {
    throw new Error('testsToRun and jarPath parameters are mandatory!');
}
if (username && password) {
    credentials = {
        username: username,
        pat: password
    };
}
nunitDirectories = {
    nunit2: nunit2,
    nunit3: nunit3
};
getExecutableFile(testsToRun, jarPath, nunitDirectories, suiteId, suiteRunId, credentials)
    .then(() => console.log('Executable file was successfully created.'))
    .catch(err => console.error(err.message, err));
