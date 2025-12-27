// -------------------------------------------- 
//                  Api in uses
//
//  - Places API (?/1000) 
//  - Road API   (?/1000)
// -------------------------------------------- 

import dotenv from "dotenv";
dotenv.config();

import * as io from "./io.js";
import * as pprint from './pprint.js';
import * as raw from "./upRawBusRoutes.js";
import * as ref from "./upRefBusRoutes.js";

// const API_KEY = process.env.GOOGLE_API_KEY;

const pathData = './CSV/data.json';
const pathNewFile = './CSV/SE/busRouteSE.json';
const pathConfig = './DataRaw/BusRoutes/config.json';

const pathTest = "./DataRaw/BusRoutes/Autobus-SecteurChambly-Richelieu-Carignan/";
const pathTest2 = 'DataRaw\\BusRoutes\\Autobus-SecteurLeRichelainetRoussillon';

// console.log('Fetching new data!');
// raw.fetchConfig();

ref.fetchConfig();


