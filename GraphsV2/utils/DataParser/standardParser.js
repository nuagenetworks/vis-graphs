
export default ({ data, key, xColumn, yColumn, isVertical }) => {
    const map = [];
    data.map((item) => {
        map.push({
            ...item,
            'xVal': item[xColumn],
            'yVal': item[yColumn]
        });
    });
    return {
        'uniqueKeys': isVertical ? ['yVal'] : ['xVal'],
        'parsedData': map,
    }
}
