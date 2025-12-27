import { loadJson, saveJson } from './io.js';

// import countData from "./CSV/count.json" assert { type: "json" };

const pathLog = './CSV/log.txt';
const pathCount = './CSV/count.json';
const pathTest = './CSV/test.txt';

export async function log(obj, debug = false) {

    try {
        console.log("Trying to save the data!"); 
        const currentDate = new Date();
        
        const data = {
            date: `${currentDate.toLocaleString("en-US")}`,
            url: `${obj.url || 'Data Invalid!'}`,
            file: `${obj.file || 'Data Invalid!'}`,
            result: `${obj.result || 'Data Invalid!'}`,
        }

        // Adjust the count in the json file
        let { success: nbSuccess, failed: nbFailed } = await loadJson(pathCount);
        obj.result == "Success" ? nbSuccess++ : nbFailed++;
        const updateJson = { success: nbSuccess, failed: nbFailed };
        
        // Adjust the log file
        const jsonString = "\n" + JSON.stringify(data, null, 2);

        if (debug) {
            console.log("\n" + JSON.stringify(data, null, 2));
            console.log("\n" + JSON.stringify(updateJson, null, 2) + "\n");
        }
        else {
            await saveJson(pathCount, updateJson);
            await fs.appendFile(pathLog, jsonString);
        }

        console.log("Success!");
    }
    catch (err) {
        console.log(`Failed.. ${err}`);
    } 

}

async function adjustCount(nbSuccess, nbFailed) {
    saveJson(pathCount, { success: nbSuccess, failed: nbFailed });
}

const obj = {
    url: "url",
    file: "none",
    result: "Success"
}

adjustCount(10,4);
// log(obj, true);

// -----
// name api 
// s: 
// f: 
// -----