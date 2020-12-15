export default ({ data, key, xColumn, yColumn }) => {
    const uniqueKeys = new Set();
    const uniqueXkeys = new Set();
    data.map((item) => {
        if (item[key] !== null && item[xColumn] !== null) {
            uniqueKeys.add(item[key]);
            uniqueXkeys.add(item[xColumn]);
        }
    });

    const uniqueArrayKey = Array.from(uniqueKeys);
    const uniqueArrayX = Array.from(uniqueXkeys);

    const finalData = [];
    uniqueArrayX.map((item) => {
        const rowData = {};
        data.map((d) => {
            if(d[xColumn] == item) {
                rowData[d[key]] = d[yColumn];
                rowData[xColumn] = d[xColumn];
                rowData[yColumn] = d[yColumn];
            }
        }); 
        delete rowData[yColumn];
        finalData.push(rowData);
    });

    return {
        'uniqueKeys': uniqueArrayKey,
        'parsedData': finalData,
    }
}
