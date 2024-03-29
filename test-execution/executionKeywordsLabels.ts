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
import { getTestSuiteById
} from './utils/octaneClient.js';
import { getOctaneListNodesAsString
} from './utils/files.js';
import OctaneTestSuite from "./model/octane/octaneTestSuite";


const getExecutionKeywords = async (
     testSuiteId: string): Promise<string>  => {

    let testSuite: OctaneTestSuite = await getTestSuiteById(testSuiteId);
    let kwds ='';
    if (testSuite.sc_exec_keywords_udf !== undefined) {
        kwds = await getOctaneListNodesAsString(testSuite.sc_exec_keywords_udf);
    }

    return kwds.replace(/,/g,"&&");
};

const testSuiteId = process.argv[2];

getExecutionKeywords(testSuiteId)
    .then((kwds) => fs.writeFileSync("execution_keywords.txt", kwds))
    .catch(err => console.error(err.message, err));
