export default ({ data, key, xColumn, yColumn }) => {
    const uniqueKeys = new Set();
    const map = [];
    data.map((item) => {
        uniqueKeys.add(item[key]);
        map.push({
            ...item,
            [`${item[key]}X`]: item[xColumn],
            [`${item[key]}Y`]: item[yColumn]
        });
    });
    return {
        'uniqueKeys': Array.from(uniqueKeys),
        'parsedData': map,
    }
}
