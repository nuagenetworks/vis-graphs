export default ({ data, key, xColumn, yColumn }) => {
    const uniqueXkeys = new Set();
    data.map((item) => {
        uniqueXkeys.add(item[xColumn]);
    });

    const uniqueArrayX = Array.from(uniqueXkeys);

    const finalData = [];
    uniqueArrayX.map((item) => {
        const rowData = {};
        data.map((d) => {
            if (d[xColumn] == item) {
                key.forEach((eachkey) => {
                    rowData[eachkey] = d[eachkey] || 0;
                });
                rowData[xColumn] = d[xColumn];
            }
        });
        finalData.push(rowData);
    });

    return {
        'uniqueKeys': key,
        'parsedData': finalData,
    }
}