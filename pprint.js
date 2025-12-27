

export function json(data, title = "") {
    console.log(`\n${title}\n`);
    console.log(JSON.stringify(data, null, 2));
    console.log('\n');
}