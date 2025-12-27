export function selectedProperties(source, keysToCopy) {
    return Object.fromEntries(
        Object.entries(source).filter(([key, val]) => keysToCopy.includes(key))
    );
}

