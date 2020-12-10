export default ({ data, key, xColumn, yColumn, graph }) => {

    let linesColumn = key || [yColumn];
    let uniqueArrayKey, keyList;

    /* Check if MultiLineGraph props key contains array of multiLine fields or its label.
    key contians array value of type of line to be drawn
    eg: key = [ 'ovs-1', 'ovs-2' ]
    key contians name of label for dynamic value of type of line to be drawn
    eg: key = "GatewayNSG"
    */
    const dynamicMultiLine = graph === "MultiLineGraph" && !Array.isArray(key) ? true : false;

    // Calculate MultiLineGraph key value
    if (dynamicMultiLine) {
        const uniqueKeys = new Set();
        data.map((item) => {
            if (item[key] !== null && item[xColumn] !== null) {
                uniqueKeys.add(item[key]);
            }
        });

        uniqueArrayKey = Array.from(uniqueKeys);
        keyList = key;
        linesColumn = uniqueArrayKey;
    }
    
    const finalYColumn = typeof yColumn === 'object' ? yColumn : [yColumn];
    let updatedLinesLabel = [];

    const colorList = {};
    const getColorList = (linesColumn) => {
        const keyList = [];
        linesColumn.forEach(lineList => {
            if (typeof lineList === 'object') {
                colorList[lineList['key']] = lineList['color'];
                keyList.push(lineList['key']);
            }
        });

        if (keyList.length === 0) {
            return linesColumn;
        }
        return keyList;
    }

    if (linesColumn) {
        updatedLinesLabel = typeof linesColumn === 'object' ? getColorList(linesColumn) : [linesColumn];
    }

    const legendsData = updatedLinesLabel.map((d, i) => {
        return {
            'key': d,
            'value': finalYColumn[i] ? finalYColumn[i] : d
        }
    })

    const flatData = []
    data.forEach((d) => {
        if (d[xColumn] <= Date.now()) {
            const newData = d;
            legendsData.forEach((ld) => {

                const key = typeof linesColumn === 'object' ? ld['key'] : d[ld['key']]
                if (typeof key === "object" || key === "") {
                    return
                }

                newData[key] = d[ld['value']] || 0;
                
                // initalize MultiLineGraph data containing yColumn value as its keys.
                if (dynamicMultiLine) {
                    newData[d[keyList]] = d[finalYColumn];
                }
            });
            flatData.push(newData);
        }
    });

    return {
        'uniqueKeys': uniqueArrayKey || key,
        'parsedData': flatData,
    }
}
