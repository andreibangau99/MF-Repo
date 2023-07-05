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
import { svnCheckout } from '../../utils/shellUtils/subversion.js';
export default class SubversionProfile extends SourceControlProfile {
    constructor(name, type, rootNode, projectPath, url) {
        super(name, type, rootNode);
        this._projectPath = projectPath;
        this._url = url;
    }
    get url() {
        return this._url.replace(/\\/g, '/');
    }
    createClasspathFolder(rootWorkingFolder, credentials) {
        svnCheckout(this._url, rootWorkingFolder, credentials);
    }
    getAbsoluteWorkingFolderPath(rootWorkingFolder) {
        return path.resolve(`${rootWorkingFolder}/${this._projectPath}/${this._rootNode}`);
    }
}
