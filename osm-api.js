import fetch from "node-fetch";
import { verifyResponse } from './verify-request.js';
import { saveJson } from "./io.js";

// const pathData = './CSV/data.json';
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export async function fetchOsm(path, query) {

    let json;
    try {
        const response = await fetch(OVERPASS_URL, {
            method: "POST",
            body: new URLSearchParams({ data: query }),
        });
    
        if (verifyResponse(response)) {
            json = await response.json();
            saveJson(path, json);
        }
    }
    catch(err) {
        console.error(`Error: ${err}`);
    }

    return json;
}

// const query = 
// `[out:json][timeout:60];
// area["name"="Montreal"]->.searchArea;
// way["highway"~"primary|secondary|tertiary|unclassified|residential"](area.searchArea);
// out geom;`;

// fetchOsm(query);