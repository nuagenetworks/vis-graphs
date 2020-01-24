export default ({ data, key, xColumn, yColumn }) => {
    const map = [];
    data.map((item) => {
        map.push({
            ...item,
            'xVal': [0,item[xColumn]],
            'yVal': item[yColumn]
        });
    });
    return {
        'uniqueKeys': ['yVal'],
        'parsedData': map,
    }
}
