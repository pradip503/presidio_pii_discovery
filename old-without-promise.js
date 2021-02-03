const axios = require('axios');
const {
    records
} = require('./sample-records');

const baseURL = 'http://34.192.49.109:8080/api/v1';
module.exports = {

    filterProcess: async function() {

        let findingsArray = [];

        for (let index = 0; index < records.length; index++) {

            try {

                let results = await analyzeText(JSON.stringify(records[index]));
                let analyzerFindings = results ? results.data : null;

                if (analyzerFindings) {
                    let filteredFindings = analyzerFindings.filter(finding => finding.score >= 0.05);
                    filteredFindings.map(filteredRecord => {

                        let locatedString = JSON.stringify(records[index]).substring(filteredRecord.location.start, filteredRecord.location.end);
                        filteredRecord['text'] = locatedString;
                        delete filteredRecord['location'];

                        findingsArray.push(filteredRecord);

                    });
                }
            } catch (error) {
                console.log(error);
            }
        };
        return findingsArray;
    }
}


//method to analyze the text
function analyzeText(rawText) {
    return axios.post(baseURL + '/projects/presidio/analyze', {
        text: rawText,
        analyzeTemplate: {
            allFields: true
        }
    })
};