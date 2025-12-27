import jsdom from "jsdom";
const { JSDOM } = jsdom;

import * as io from "./io.js";
import path from 'path';
import * as pprint from './src/pprint.js';
import * as v from './validation.js';

// ----------------------------------------------
//      Update the raw version of BusStation
// ----------------------------------------------

// === The Raw Path === 
// ./BusRoutes 
//      /<Name>
//      .zip
//      [extract zip]
// config.json

// [To Do]
// > Add a flag with each files of the .zip
// > Could not parse Css stylessheet 

const pathRaw = './DataRaw/BusRoutes/';
const pathRawConfig = `${pathRaw}config.json`;
const pathTest = "";

// Fetch all the config file for the bus station
export async function fetchConfig() {

    fetch('https://exo.quebec/en/about/open-data')
        .then(response => response.text())  // get the raw HTML as text
        // .then(html => console.log(html))
        .then(html => {
            const dom = new JSDOM(html);
            const document = dom.window.document;

            // Extract data
            const results = [];
            const listItems = document.querySelectorAll('li');

            listItems.forEach(li => {
                const spans = li.querySelectorAll('span');
                const link = li.querySelector('a');
                
                // Skip the header row (has div instead of proper structure)
                if (spans.length === 2 && link) {
                    // looks if the first word is autobus inside of the spans[0]
                    if (!/autobus/.test(spans[0].textContent.trim().toLocaleLowerCase())) {
                        return;
                    }

                    results.push({
                        organization: spans[0].textContent.trim(),
                        lastUpdated: spans[1].textContent.trim(),
                        downloadUrl: link.getAttribute('href'),
                        downloaded: false,
                        extracted: false,
                        defaultPath: "",
                        names: [],
                    });
                }
            });

            // pprint.json(results);

            // Update the config.json
            UpdateAllConfigFile(results);

        })
        .catch(err => console.error(err));
}

// Update or Create new Folder
export async function UpdateAllConfigFile(newConfig) {
    
    // << WEAK need to revisit the struct

    // load the previous Config
    const updatedConfig = []; 
    let oldConfig;
    try {

        oldConfig = await io.loadJson(pathRawConfig);

    } catch(err) {
        console.log('[Config] Data not found!');
        // Retreive the other data with the given one 
        for (let i = 0; i < newConfig.length; i++) {
            updatedConfig.push(await RetrieveData(newConfig[i]));
        }

        await io.saveJson(pathRawConfig, updatedConfig);
        return;
    }

    // update config with any new files
    for (let i = 0; i < oldConfig.length; i++) {
        // Get all the last updated flag
        const lastUpdated = new Date(oldConfig[i].lastUpdated);
        const newUpdated = new Date(newConfig[i].lastUpdated);
            
        // If the item needs a new config
        if (lastUpdated < newUpdated) {
            oldConfig[i] = newConfig[i];
            updatedConfig.push(await RetrieveData(newConfig[i])); 
        } 
        else if (v.objHasDataMissing(oldConfig[i])) { // if the object is missing a field
            console.log('The module is missing a field'); // [could] put the missing data for the folder
            updatedConfig.push(await RetrieveData(oldConfig[i])); 
        }
        else {
            updatedConfig.push(oldConfig[i]);
        }
    }

    await io.saveJson(pathRawConfig, updatedConfig);
}

// Retrieve the data of the object : Make sure data is Downloaded and Extracted
export async function RetrieveData(data) {
    
    // Something to find a specific data
    const org = data.organization;
    const url = data.downloadUrl;
    console.log(`${org}`);


    // Create the folder and the file name for the 'sector'
    const folderName = org.replace(/\s/g, ''); // => without whitespace 
    const pathRawFolder = path.join(pathRaw, folderName);
    await io.ensureDirectoryExists(pathRawFolder); 
    
    const fileName = `${folderName}.zip`;
    const pathZip = path.join(pathRawFolder, fileName);

    if (await io.ensureFileExist(pathZip)) { 
        data.downloaded = true;
    }
    else {
        console.log(' > Need to retreive the file!');
        data.downloaded = await DownloadZip(url, pathRawFolder, fileName);
    }

    if (!await io.ensureFilesExists(data.names)) { 
        console.log(' > Extracting the files');
        data.extracted = await ExtractZip(pathZip, pathRawFolder);
    }

    if (!v.hasValues(data.defaultPath) || !v.arrHasData(data.names)) {
        console.log(' > Retrieving the names');
        const fileNames = await RetrieveNameFile(pathRawFolder);
        Object.assign(data, fileNames);
    }
    
    // pprint.json(data, '[CMD] New Data!'); // for now 
    return data;
}

export async function DownloadZip(url, pathRawFolder, fileName) {
    try {
        await io.deleteAllFilesInDirectory(pathRawFolder);
        await io.downloadZip(url, pathRawFolder, fileName);

        return true;
    }
    catch(err) {
        console.error(`Unable to download the zip file`);
        return false;
    }
}

export async function ExtractZip(pathZip, pathRawFolder) {
    try {
        // delete all the previous file instead of the zipfile
        await io.deleteAllFilesInDirectoryExcept(pathRawFolder, pathZip);
        await io.extractZip(pathZip, pathRawFolder);
        
        return true;
    }   
    catch(err) {
        console.error(`Unable to extract the zip file`);
        return false;
    }
}

export async function RetrieveNameFile(pathRawFolder) {
    // Looks for every files that isn't .zip

    const fileNames = await io.getAllFilesInDirectoryExcept(pathRawFolder, 'zip');
    const objFolder = {
        "defaultPath": pathRawFolder,
        "names": fileNames,
    }
    
    return objFolder;
}