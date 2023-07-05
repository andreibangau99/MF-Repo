var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { getTestSuiteById } from '../utils/octaneClient.js';
import { getOctaneListNodesAsString } from '../utils/files.js';
const getExecutionKeywords = (testSuiteId) => __awaiter(void 0, void 0, void 0, function* () {
    let testSuite = yield getTestSuiteById(testSuiteId);
    let kwds = '';
    if (testSuite.sc_exec_keywords_udf !== undefined) {
        kwds = yield getOctaneListNodesAsString(testSuite.sc_exec_keywords_udf);
    }
    return kwds.replace(/,/g, "&&");
    // validateOctaneTest(test, testName);
});
const testSuiteId = process.argv[2];
getExecutionKeywords(testSuiteId)
    .then((kwds) => process.stdout.write(kwds))
    .catch(err => console.error(err.message, err));
