import * as pprint from './pprint.js';
// import as v.

export function objHasData(obj) {
    // First, ensure it's an object and not null, to prevent errors
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    // Then, check the number of own, enumerable properties.
    return Object.keys(obj).length > 0;
}

export function arrHasData(arr) {

    if (!Array.isArray(arr)) {
        return false;
    }
    // console.log('arr length' + arr.length);
    return arr.length > 0;
}
export function objHasDataMissing(obj) {
    // console.log('validation...');
    // pprint.json(obj);
    if (!objHasData(obj)) {
        return true; // No data = data is missing
    }
    
    const val = Object.values(obj);
    // Check if ANY value is missing (returns true if data is missing)
    return !val.every(element => {
        const isNull = hasValues(element);
    });
}

export function hasValues(data) {
    
    if (Array.isArray(data))
        return data.length > 0;
    return data !== null && data !== undefined && data !== '';
}