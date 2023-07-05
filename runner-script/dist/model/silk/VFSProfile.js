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
import SourceControlProfile from './sourceControlProfile.js';
import path from 'node:path';
import fs from 'fs-extra';
import axios from "axios";
import AdmZip from "adm-zip";
export default class VFSProfile extends SourceControlProfile {
    constructor(name, type, rootNode, projectPath, url) {
        super(name, type, rootNode);
        this._projectPath = projectPath;
        this._url = url;
    }
    createClasspathFolder(rootWorkingFolder, credentials) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._url.startsWith('smb:')) {
                const url = this._url.split('smb:')[1];
                fs.copySync(`${url}`, `${rootWorkingFolder}`, { overwrite: true });
            }
            else {
                if (this._url.startsWith('zip:http')) {
                    let zipUrl = this._url.split('zip:')[1];
                    const zipName = zipUrl.substring(zipUrl.lastIndexOf('/') + 1);
                    fs.mkdirSync(rootWorkingFolder, { recursive: true });
                    const res = yield axios.get(zipUrl, { responseType: 'stream' });
                    const fileStream = fs.createWriteStream(`${rootWorkingFolder}/${zipName}`);
                    try {
                        yield new Promise((resolve, reject) => {
                            res.data.pipe(fileStream);
                            res.data.on("error", reject);
                            fileStream.on("finish", resolve);
                        });
                    }
                    catch (err) {
                        console.log(err);
                    }
                    const zip = new AdmZip(`./${rootWorkingFolder}/${zipName}`);
                    zip.extractAllTo(rootWorkingFolder, true);
                }
            }
        });
    }
    getAbsoluteWorkingFolderPath(rootWorkingFolder) {
        return path.resolve(`${rootWorkingFolder}/${this._projectPath}/${this._rootNode}`);
    }
}
