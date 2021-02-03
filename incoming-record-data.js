const axios = require('axios');
const {
    records
} = require('./sample-records');

const baseURL = 'http://34.192.49.109:8080/api/v1';

module.exports = {

    analyzeProcess: async function () {

        return new Promise(async (resolve, reject) => {
            let findingsArray = [];

            for (let i = 0; i < records.length; i++) {

                let recordString = JSON.stringify(records[i]);

                try {
                    let filteredRecord = await analyzeAndMaskingProcess(recordString);
                    findingsArray.push(...filteredRecord);

                    if ((i) === (records.length - 1)) {
                        resolve(findingsArray);
                    }
                } catch(error){
                    console.log(error);
                }

            }
        })
    },
};


//method to analyze the text
function analyzeTextAPI(rawText) {
    return axios.post(baseURL + '/projects/presidio/analyze', {
        text: rawText,
        analyzeTemplate: {
            allFields: true
        }
    })
};


//gets each records and analyze and mask it using detected data types
function analyzeAndMaskingProcess(recordString) {

    return new Promise((resolve, reject) => {

        let newRecordedString = recordString;
        analyzeTextAPI(recordString)
            .then(results => {
                let analyzerFindings = results ? results.data : null;

                if (analyzerFindings) {

                    let filteredFindings = analyzerFindings.filter(finding => finding.score >= 0.05);
                    filteredFindings.map(filteredRecord => {

                        let locatedString = recordString.substring(filteredRecord.location.start, filteredRecord.location.end);
                        filteredRecord['originalText'] = locatedString;

                        //replace original text with detected data types(masking)
                        filteredRecord['maskingText'] = filteredRecord.field.name;
                        newRecordedString = newRecordedString.replace(locatedString, filteredRecord.field.name);

                    });

                    console.log(newRecordedString);  //displays the masked string
                    resolve(filteredFindings);
                }
            })
            .catch(error => {
                console.log(error);
                reject(0);
            });

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