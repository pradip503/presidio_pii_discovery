const axios = require('axios');
const {
    records
} = require('./sample-records');

const baseURL = 'http://34.192.49.109:8080/api/v1';

module.exports = {

    analyzeProcess: async function () {

        for (let i = 0; i < records.length; i++) {
            let findings = await analyzeAndMaskingProcess(records[i])
            return findings;
        }
    },
};


//method to analyze the text
async function analyzeTextAPI(rawText) {
    return await axios.post(baseURL + '/projects/presidio/analyze', {
        text: rawText,
        analyzeTemplate: {
            allFields: true
        }
    })
};


//gets each records and analyze and mask it using detected data types
async function analyzeAndMaskingProcess(eachRecord) {

    return new Promise(async (resolve, reject) => {

        let eachKeys = Object.keys(eachRecord);
        let finalizedArray = [];
        let finalizedResolvedArray = [];

        for (let i = 0; i < eachKeys.length; i++) {
            finalizedArray.push(analyzeTextAPI(eachRecord[eachKeys[i]])
                .then(async results => {
                    let analyzerFindings = results ? results.data : null;

                    if (analyzerFindings) {

                        let filteredFindings = analyzerFindings.filter(finding => finding.score >= 0.05);

                        filteredFindings.map(filteredRecord => {
                            let locatedString = eachRecord[eachKeys[i]].substring(filteredRecord.location.start, filteredRecord.location.end);
                            filteredRecord['originalText'] = locatedString;

                            //replace original text with detected data types(masking)
                            filteredRecord['maskingText'] = filteredRecord.field.name;

                        });

                        return (analyzerFindings);
                    }
                })
                .catch(error => {
                    console.log(error);
                    reject(0);
                }));
        }

        const resolvedFinalArray = await Promise.all(finalizedArray);
        resolvedFinalArray.forEach(finalArray => {
            if (finalArray) {
                finalizedResolvedArray.push(finalArray[0]);
            }
        });
        resolve(finalizedResolvedArray);
    });
}

//method to analyze and redact 
function maskText(analyzedRecord) {
    return axios.post(baseURL + '/projects/presidio/anonymize', {
        "text": analyzedRecord,
        "AnalyzeTemplateId": "all-fields-analyzer",
        "AnonymizeTemplateId": "custom-anonymizer"
    });
}