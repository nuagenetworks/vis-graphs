export default ({ data, xColumn, yColumn, groupedKeys }) => {

    const finalData = [];
    data.map((item) => {
        const rowData = {};
        rowData[xColumn] = item[xColumn];
        groupedKeys.map((d) => {
            rowData[d] = item[d][yColumn];
        });
        finalData.push(rowData);
    });

    return {
        'uniqueKeys': groupedKeys,
        'parsedData': finalData,
    }
}
