import * as io from "./io.js";
import path from 'path';
import * as pprint from './pprint.js';
import * as v from './validation.js';
import * as utils from './utils.js';
import moment from "moment";

// ----------------------------------------------
//      Fetch the ref version of BusStation
// ----------------------------------------------

const pathRef = './DataRef/BusRoutes/';
const pathRawConfig = './DataRaw/BusRoutes/config.json';
const pathRefConfig = './DataRef/BusRoutes/config.json';

// Mutiples path

// "routes.txt", <1>
// "trips.txt" <2>
// "stop_times.txt", <3>
// "stops.txt", <4>
// "shapes.txt", <?>

const routes_name = "routes.txt";
const trips_name = "trips.txt";
const stop_times_name = "stop_times.txt";
const stops_name = "stops.txt";

const fileToRetreive = [
    routes_name,
    trips_name,
    stop_times_name,
    stops_name,
];

// fetch ref config file
export async function fetchConfig() {

    const rawConfig = await io.loadJson(pathRawConfig);
    const currentDate = moment();
    
    const refConfig = [];
    Sector: for (let i = 0; i < rawConfig.length; i++) {
        
        // [IF NEW]
        // Assing the value of 
        const sector = rawConfig[i];
        const newModule = utils.selectedProperties(sector, ['organization', 'lastUpdated']);
        newModule.lastFecth = currentDate.format('DD MMM YYYY HH:MM'); // Gold!
        newModule.fileFecth = fileToRetreive; // << ??
        
        // [IF NOT]
        const _dateLastUpdated = new Date(sector.lastUpdated);
        const _dateLastFetch = new Date(newModule.lastFecth);
        const files = new Map();

        // Look if we have the lasted version of 'data' csv
        if (_dateLastFetch < _dateLastUpdated) {
            console.log(`This folder needs to be updated : ${sector.names}`);
            // Files : all the file to download, tempsFile : the file we 'think' we need to download
            try {

                // Fetch all the 'usefull' files and changes their extension to 'csv'
                const tempFiles = new Map();
                for (let j = 0; j < fileToRetreive.length; j++) {
                    const file = fileToRetreive[j];

                    // If one the files isn't found we dont save any progress
                    if (!sector.names.includes(file)) {
                        console.log(`The file isn't found! ${file}`);
                        continue Sector;
                    }
                    
                    const oldPathFile = path.join(sector.defaultPath, file);

                    const folderName = sector.organization.replace(/\s/g, '');
                    const fileName = io.ChangeExtention(file, 'csv');
                    const newPathFile = path.join(pathRef, folderName, fileName);

                    tempFiles.set(oldPathFile, newPathFile); 
                }

                tempFiles.forEach((value, key) => files.set(key, value)); // [Question] why are the value are inverse??

            } catch(err) {
                console.error(err);
                continue Sector;
            }
        }

        // push all the changes to 
        refConfig.push(newModule);

        // Download all the new files
        for ( const [oldFile, newFile] of files) {
            // console.log(`${oldFile} ${newFile}`);

            // await io.MakeDir(newFile); 
            // await io.CopyFile(oldFile, newFile); // [To Do] Fix the logic, if they are new folder dont make new one 
        }
    }

    // pprint.json(refConfig);
    await io.saveJson(pathRefConfig, refConfig);
}

// Routes, stop_times, stops, trips

// Routes : route_id >> trips : trip_id >> stop_times : stop_id > stops : stop_name, stop_lat, stop_lon

// Sym  | In - Out
// >>   : 1 for x
// >    : 1 for 1

async function reorderData() {
    
    // 1) Read the Routes.csv
    // - Get all the route_id
    io.getAllValueColumnCSV(); // here <<

    // 2) For every route_id in trips.csv
    // - Get all the trip_id
    
    // 3) For every trip_id in stop_times.csv
    // - Get all the stop_id 



} 