import fs, { mkdir } from 'node:fs';
import fsPromise from 'node:fs/promises';

import https from 'https';
import path from 'path';

import * as v from './validation.js' 

import yauzl from 'yauzl';

import csv from 'csv-parser';


export async function loadJson(path) {
    const file = await fsPromise.readFile(path, 'utf8');
    return JSON.parse(file);
}

export async function saveJson(path, content) {
    let value = content;
    if (typeof content !== "string")
        value = JSON.stringify(content, null, 2);
    await fsPromise.writeFile(path, value);
}

// better name ...
export async function saveNewJson(oldpath, newPath) {
    const content = await loadJson(oldpath);
    await saveJson(newPath, content);
}

export async function downloadZip(url, destinationFolder, fileName) {

    if (!fs.existsSync(destinationFolder))
        mkdir(destinationFolder);

    return new Promise((resolve, reject) => {
        const filePath = path.join(destinationFolder, fileName);
        const fileStream = fs.createWriteStream(filePath);

        https.get(url, (response) => {
            if (response.ok) {
                reject(new Error(`Failed to download: ${response.statusCode} ${response.statusMessage}`));
                return;
            }

            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve(filePath);
            });

            fileStream.on('error', (err) => {
                fsPromise.unlink(filePath, () => {}); // Delete the partial file on error
                reject(err);
            });
        })
        .on('error', (err) => {
            reject(err);
        });
    });
}

export async function extractZip(pathZip, pathDirectory) {

    return new Promise((resolve, reject) => {

        yauzl.open(pathZip, {lazyEntries: true}, function(err, zipfile) {
            if (err) throw err;
            zipfile.readEntry();
            zipfile.on("entry", function(entry) {
                if (/\/$/.test(entry.fileName)) {
                    // Directory file names end with '/'.
                    // Note that entries for directories themselves are optional.
                    // An entry's fileName implicitly requires its parent directories to exist.
                    zipfile.readEntry();
                } else {
                    // file entry
                    zipfile.openReadStream(entry, function(err, readStream) {
                        
                        if (err) {
                            console.log (`Error: ${err}`);
                            throw err;
                        }
                        
                        readStream.on("end", function() {
                            zipfile.readEntry();
                        });
                        
                        // <+> Save the data to the output file 
                        const name = path.join(pathDirectory, entry.fileName); // <
                        const writeStream = fs.createWriteStream(name);
                        readStream.pipe(writeStream);
                    });
                }
            });

            zipfile.on("end", () => { 
                resolve(true);
            });

            zipfile.on("error", reject);
        });
    });
}
    
export async function ensureDirectoryExists(dirPath) {
    try {
        await fsPromise.access(dirPath);
    } catch (err) {
        // recursive : create all the folder uninitiated
        await fsPromise.mkdir(dirPath, { recursive: true });  
        console.log(`Created directory: ${dirPath}`);
    }
}

export async function ensureFileExist(filePath) {
    try {
        await fsPromise.access(filePath);
        return true;
    } catch (err) { 
        console.error(`File do not exist : ${filePath}`);
        return false;
    }
}

export async function ensureFilesExists(filesPath) {
    
    if (!v.arrHasData(filesPath)) {
        return false;
    }

    try {
        console.log('ensure files exists');
        for await(const item of filesPath) {
            try {
                await fsPromise.access(item)
            } catch (err) {
                return false;
            }
        }
        return true;
        
    } catch (err) { 
        console.log(`File do not exist : ${filePath}`);
        return false;
    }
}

export async function deleteAllFilesInDirectory(directoryPath) {
    const files = await getAllFilesInDirectory(directoryPath);

    for (const file of files) {
        await deleteFile(file);
    }
}

export async function deleteAllFilesInDirectoryExcept(directoryPath, fileName) {
    const files = await getAllFilesInDirectory(directoryPath);

    for (const file of files) {
        if (file !== fileName) {
            await deleteFile(file);
        }
    }
}

export async function deleteFile(pathFile) {
    try {
        await fsPromise.unlink(pathFile);
    } catch(err) {
        console.log(`Error, unable to delete selected files: ${deleteFile}`);
    }
}

export async function getAllFilesInDirectory(directoryPath) {
    try {
        // Read the contents of the directory
        const filesAndFolders = await fsPromise.readdir(directoryPath, { withFileTypes: true });

        const fileNames = [];
        for (const item of filesAndFolders) {
            if (item.isFile()) {
                // If it's a file, add its full path to the list
                fileNames.push(path.join(directoryPath, item.name));
            }
        }
        return fileNames;
    } catch (error) {
        console.error('Error reading directory:', error);
        throw error; // Re-throw the error for further handling
    }
}

export async function getAllFilesInDirectoryExcept(directoryPath, extension) {
    try {
        // Read the contents of the directory
        const filesAndFolders = await fsPromise.readdir(directoryPath, { withFileTypes: true }); // if this is null 

        const fileNames = [];
        for (const item of filesAndFolders) {
            const pattern = `\.${extension}$`;
            const regex = new RegExp(pattern);
            if (item.isFile() && !regex.test(item.name)) {
                fileNames.push(item.name);
            }
        }

        return fileNames;
    } catch (error) {
        console.error('Error reading directory:', error);
        throw error; // Re-throw the error for further handling
    }
}
export async function MakeDir(path) {
    const regex = /(?<dir>.*\\)[^\.]*\./; 
    const match = path.match(regex);
    await fsPromise.mkdir(match.groups.dir, { recursive: true }); 
}

export async function CopyFile(pathRef, pathNew) {
    try {

        if (!(await ensureFileExist(pathRef))) { // change the !await for !(await) ? 
            console.log('The files doesnt exist ' + pathRef);
            return;
        }

        await fsPromise.copyFile(pathRef, pathNew);
            
    } catch(err) {
        console.error('Error copying file: ', err);
    }
}

export async function getAllValueColumnCSV(path, nameColumn) { 

    return new Promise((resolve, reject) =>  { fs.createReadStream(path)
        .pipe(csv())
        .on('data', (data) =>  {
            console.log(data);
            results.push(data);
        })
        .on('end', () => {
            console.log(results);
        });
    });
}

// ----------------------------------------------
// 
//              Non Async Function 
//
// ----------------------------------------------

// [To Do] Change the regex to support every type of pathFile : ./my/name/i.txt
export function ChangeExtention(pathFile, newExtension) {
    try {
        if (!v.hasValues(newExtension)) {
            console.log('new Exstension is invalid');    
        }
        
        // we capture everythink except of the extention
        const regex = /(?<name>[^\.]*)\./; 
        const match = pathFile.match(regex);
        
        return `${match.groups.name}.${newExtension}`;
        
    } catch (err) {
        console.error(`Unable to change the pathFile`);
    }
} 