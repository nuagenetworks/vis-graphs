import React from 'react'

const ParseData = ({ data, key, xColumn, yColumn }) => {
    let uniqueKeys = new Set();
    let map = [];
    let xData, yData;
    data.map((item, index) => {
        uniqueKeys.add(item[key]);
        xData = item[xColumn];
        yData = item[yColumn];
        map.push({ ...item, [`${item[key]}X`]: xData, [`${item[key]}Y`]: yData });
    });
    return {
        'uniqueKeys' :  Array.from(uniqueKeys),
        'parsedData' : map,
    }
}
export default ParseData