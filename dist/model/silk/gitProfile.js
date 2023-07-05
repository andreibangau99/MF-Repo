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
import SourceControlProfile from './sourceControlProfile.js';
import path from 'path';
import fs from 'fs';
import { gitCheckout, gitClone, gitDefaultBranchName } from '../../utils/shellUtils/git.js';
import { cd } from '../../utils/shellUtils/fileSystem.js';
export default class GitProfile extends SourceControlProfile {
    constructor(name, type, rootNode, projectPath, branch, url) {
        super(name, type, rootNode);
        this._projectPath = projectPath;
        this.branch = branch;
        this._url = url;
    }
    get url() {
        return this._url.replace(/\\/g, '/');
    }
    createClasspathFolder(rootWorkingFolder, credentials) {
        if (!fs.existsSync(rootWorkingFolder)) {
            gitClone(this._url, rootWorkingFolder, credentials);
        }
        cd(rootWorkingFolder);
        const branchName = this.branch;
        if (branchName) {
            gitCheckout(branchName);
            console.log('Successfully checked out to remote branch ' +
                'origin/' +
                branchName);
        }
        else {
            const defaultBranch = gitDefaultBranchName();
            gitCheckout(defaultBranch);
            console.log('Successfully checked out to remote branch ' +
                'origin/' +
                defaultBranch);
        }
        cd('../..');
    }
    getAbsoluteWorkingFolderPath(rootWorkingFolder) {
        return path.resolve(`${rootWorkingFolder}/${this._projectPath}/${this._rootNode}`);
    }
}
