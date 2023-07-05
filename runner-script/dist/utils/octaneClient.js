var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a, _b, _c, _d, _e;
import { Octane, Query } from '@microfocus/alm-octane-js-rest-sdk';
import PropertiesReader from 'properties-reader';
import GitProfile from '../model/silk/gitProfile.js';
import SubversionProfile from '../model/silk/subversionProfile.js';
import UNCProfile from '../model/silk/UNCProfile.js';
import VFSProfile from '../model/silk/VFSProfile.js';
const properties = PropertiesReader('./octane-details.properties');
const octane = new Octane({
    server: ((_a = properties.get('octane-url')) === null || _a === void 0 ? void 0 : _a.toString()) || '',
    sharedSpace: Number.parseInt(((_b = properties.get('sharedspace')) === null || _b === void 0 ? void 0 : _b.toString()) || ''),
    workspace: Number.parseInt(((_c = properties.get('workspace')) === null || _c === void 0 ? void 0 : _c.toString()) || ''),
    user: ((_d = properties.get('user')) === null || _d === void 0 ? void 0 : _d.toString()) || '',
    password: ((_e = properties.get('password')) === null || _e === void 0 ? void 0 : _e.toString()) || ''
});
const getJunitOctaneTestByName = (testName) => __awaiter(void 0, void 0, void 0, function* () {
    const query = Query.field('name')
        .equal(testName)
        .and(Query.field('class_name').equal(Query.NULL))
        .and(Query.field('package').equal(Query.NULL))
        .and(Query.field('component').equal(Query.NULL));
    const octaneResponse = yield octane
        .get(Octane.entityTypes.tests)
        .fields('name', 'external_test_id', 'sc_class_names_udf', 'sc_method_name_udf', 'sc_classpath_udf', 'application_modules', 'attachments', 'sc_enable_data_driven_udf')
        .query(query.build())
        .execute();
    if (octaneResponse.data[0] === undefined) {
        throw new Error(`Not found! Automated test with name ${testName} does not exist in Octane.`);
    }
    return Object.assign(Object.assign({}, octaneResponse.data[0]), { attachments: (octaneResponse.data[0].attachments.data), application_modules: (octaneResponse.data[0].application_modules.data) });
});
const getOctaneKDTByName = (testName) => __awaiter(void 0, void 0, void 0, function* () {
    const query = Query.field('name')
        .equal(testName)
        .and(Query.field('class_name').equal(Query.NULL))
        .and(Query.field('package').equal(Query.NULL))
        .and(Query.field('component').equal(Query.NULL));
    const octaneResponse = yield octane
        .get(Octane.entityTypes.tests)
        .fields('name', 'external_test_id', 'attachments', 'application_modules', 'sc_enable_data_driven_udf')
        .query(query.build())
        .execute();
    if (octaneResponse.data[0] === undefined) {
        throw new Error(`Not found! Automated test with name ${testName} does not exist in Octane.`);
    }
    return Object.assign(Object.assign({}, octaneResponse.data[0]), { attachments: (octaneResponse.data[0].attachments.data), application_modules: (octaneResponse.data[0].application_modules.data) });
});
const getAppModuleBySourceType = (test, sourceType) => __awaiter(void 0, void 0, void 0, function* () {
    if (!Array.isArray(test.application_modules) || !test.application_modules.length) {
        throw new Error(`Octane test with name ${test.name} does not have any application modules assigned`);
    }
    const assignedAppModuleIds = getApplicationModuleIds(test.application_modules);
    if (assignedAppModuleIds.length == 0) {
        throw new Error(`Octane test with name ${test.name} does not have any application modules assigned`);
    }
    const query = Query.field('id')
        .inComparison(assignedAppModuleIds)
        .and(Query.field('source_type_udf').equal(sourceType));
    const octaneResponse = yield octane
        .get(Octane.entityTypes.applicationModules)
        .fields('id', 'name', 'source_type_udf', 'sc_source_control_udf', 'sc_product_name_udf', 'attachments')
        .query(query.build())
        .execute();
    if (octaneResponse.data[0] === undefined) {
        throw new Error(`Entity of type "application_module" with source type_ "${sourceType}" having the id among ids list {${assignedAppModuleIds}} can not be found in Octane.`);
    }
    return Object.assign(Object.assign({}, octaneResponse.data[0]), { attachments: octaneResponse.data[0].attachments.data });
});
const getApplicationModuleIds = (assignedApplicationModules) => {
    const applicationModuleIds = [];
    assignedApplicationModules.forEach(appModule => {
        applicationModuleIds.push(appModule.id);
    });
    return applicationModuleIds;
};
const getAttachmentIds = (attachments) => {
    const testAttachmentIds = [];
    attachments.forEach(testAttachment => {
        testAttachmentIds.push(testAttachment.id);
    });
    return testAttachmentIds;
};
const getAttachmentContentByName = (entity, attachmentName) => __awaiter(void 0, void 0, void 0, function* () {
    if (!Array.isArray(entity.attachments) || !entity.attachments.length) {
        return undefined;
    }
    const attachmentIds = getAttachmentIds(entity.attachments);
    const query = Query.field('id')
        .inComparison(attachmentIds)
        .and(Query.field('name').equal(attachmentName));
    const octaneResponse = yield octane
        .get(Octane.entityTypes.attachments)
        .fields('id', 'name')
        .query(query.build())
        .execute();
    const attachment = octaneResponse.data[0];
    if (attachment === undefined) {
        return undefined;
    }
    return yield getAttachmentContentById(Number.parseInt(attachment.id));
});
const getAttachmentContentById = (attachmentId) => __awaiter(void 0, void 0, void 0, function* () {
    return Buffer.from(yield octane.getAttachmentContent().at(attachmentId).execute());
});
const deserializeSourceControlDetails = (name) => {
    const sourceControlProfile = JSON.parse(name);
    switch (sourceControlProfile.Type) {
        case 'Git':
            return new GitProfile(sourceControlProfile.ProfileName, sourceControlProfile.Type, sourceControlProfile.RootNode, sourceControlProfile.projectpath, sourceControlProfile.branch, sourceControlProfile.url);
        case 'Subversion':
            return new SubversionProfile(sourceControlProfile.ProfileName, sourceControlProfile.Type, sourceControlProfile.RootNode, sourceControlProfile.projectpath, sourceControlProfile.url);
        case 'UNC':
            return new UNCProfile(sourceControlProfile.ProfileName, sourceControlProfile.Type, sourceControlProfile.path, sourceControlProfile.RootNode);
        case 'VFS':
            return new VFSProfile(sourceControlProfile.ProfileName, sourceControlProfile.Type, sourceControlProfile.RootNode, sourceControlProfile.projectpath, sourceControlProfile.url);
        case 'VoidSCP':
            return undefined;
        default:
            throw new Error(`Unknown source control profile of type ` +
                sourceControlProfile.pluginClass);
    }
};
const getNunitOctaneTestByName = (testName) => __awaiter(void 0, void 0, void 0, function* () {
    let query;
    query = Query.field('name')
        .equal(testName)
        .and(Query.field('class_name').equal(Query.NULL))
        .and(Query.field('package').equal(Query.NULL))
        .and(Query.field('component').equal(Query.NULL));
    const octaneResponse = yield octane
        .get(Octane.entityTypes.tests)
        .fields('name', 'external_test_id', 'sc_nunit_assembly_udf', 'sc_nunit_directory_udf', 'sc_nunit_options_udf', 'application_modules', 'attachments', 'sc_enable_data_driven_udf')
        .query(query.build())
        .execute();
    if (octaneResponse.data[0] === undefined) {
        throw new Error(`Not found! Automated test with name ${testName} does not exist in Octane.`);
    }
    return Object.assign(Object.assign({}, octaneResponse.data[0]), { attachments: (octaneResponse.data[0].attachments.data), application_modules: (octaneResponse.data[0].application_modules.data) });
});
const getTestSuiteById = (suiteId) => __awaiter(void 0, void 0, void 0, function* () {
    let query;
    query = Query.field("id").equal(suiteId);
    const octaneResponse = yield octane
        .get(Octane.entityTypes.testSuites)
        .fields('name', 'source_id_udf', 'silk_release_build_udf', 'silk_release_version_udf', 'sc_exec_keywords_udf', 'attachments')
        .query(query.build())
        .execute();
    if (octaneResponse.data[0] === undefined) {
        throw new Error(`Not found! Test Suite with id ${suiteId} does not exist in Octane.`);
    }
    return Object.assign(Object.assign({}, octaneResponse.data[0]), { silk_release_build_udf: octaneResponse.data[0].silk_release_build_udf ? yield extractOctaneListNode((octaneResponse.data[0].silk_release_build_udf), suiteId) : undefined, silk_release_version_udf: octaneResponse.data[0].silk_release_version_udf ? yield extractOctaneListNode((octaneResponse.data[0].silk_release_version_udf), suiteId) : undefined, sc_exec_keywords_udf: octaneResponse.data[0].sc_exec_keywords_udf.data ? yield extractOctaneListNodes((octaneResponse.data[0].sc_exec_keywords_udf.data), suiteId) : [], attachments: (octaneResponse.data[0].attachments.data) });
});
const getOctaneListNodeIds = (octaneListNodes) => {
    const octaneListNodeIds = [];
    octaneListNodes.forEach(octaneListNode => {
        octaneListNodeIds.push(octaneListNode.id);
    });
    return octaneListNodeIds;
};
const getOctaneListNodesFromIds = (octaneListNodeIds, suiteId) => __awaiter(void 0, void 0, void 0, function* () {
    const query = Query.field('id').inComparison(octaneListNodeIds);
    const octaneResponse = yield octane
        .get(Octane.entityTypes.listNodes)
        .fields("id", "name")
        .query(query.build())
        .execute();
    if (octaneResponse.data === undefined) {
        throw new Error(`Not found! Could not get Execution Keywords of Test Suite with id ${suiteId} .`);
    }
    return (octaneResponse.data);
});
const getPEOctaneTestByName = (testName) => __awaiter(void 0, void 0, void 0, function* () {
    let query;
    query = Query.field('name')
        .equal(testName)
        .and(Query.field('class_name').equal(Query.NULL))
        .and(Query.field('package').equal(Query.NULL))
        .and(Query.field('component').equal(Query.NULL));
    const octaneResponse = yield octane
        .get(Octane.entityTypes.tests)
        .fields('name', 'sc_exec_keywords_udf', 'application_modules', 'attachments')
        .query(query.build())
        .execute();
    if (octaneResponse.data[0] === undefined) {
        throw new Error(`Not found! Automated test with name ${testName} does not exist in Octane.`);
    }
    return Object.assign(Object.assign({}, octaneResponse.data[0]), { attachments: (octaneResponse.data[0].attachments.data), application_modules: (octaneResponse.data[0].application_modules.data) });
});
const validateOctaneTest = (test, testName) => {
    if (!test) {
        throw new Error('Could not get Octane automated test with name ' + testName);
    }
};
const validateOctaneJUnitTest = (test, testName) => {
    validateOctaneTest(test, testName);
    if (!test.sc_classpath_udf || test.sc_classpath_udf.length === 0) {
        throw new Error('SC Classpath udf has empty value for Octane automated test of type JUnit with name' +
            testName);
    }
};
const extractOctaneListNodes = (octaneListNodes, suiteId) => __awaiter(void 0, void 0, void 0, function* () {
    return octaneListNodes.length === 0 ? [] : yield getOctaneListNodesFromIds(getOctaneListNodeIds(octaneListNodes), suiteId);
});
const extractOctaneListNode = (octaneListNode, suiteId) => __awaiter(void 0, void 0, void 0, function* () {
    let listNode = [];
    listNode.push(octaneListNode);
    let extractedListNode = yield extractOctaneListNodes(listNode, suiteId);
    return extractedListNode.pop();
});
export { getJunitOctaneTestByName, validateOctaneTest, validateOctaneJUnitTest, getNunitOctaneTestByName, deserializeSourceControlDetails, getApplicationModuleIds, getAppModuleBySourceType, getAttachmentIds, getAttachmentContentByName, getAttachmentContentById, getOctaneKDTByName, getTestSuiteById, getPEOctaneTestByName };
