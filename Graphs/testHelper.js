import fsmo from 'fs';
const cheerio = require('cheerio');


export const readJSON = (JSONFile) => {
    try {
        return JSON.parse(fsmo.readFileSync(JSONFile, 'utf8'));
    } catch (e) {
        console.log(e);
    }
}

export const checkTicks = (component, parentClass, childClass, selector) => {
    const $ = cheerio.load(component.find(parentClass).find(childClass).html());
    const xAxisTicks = $(childClass).find(selector).length;
    return xAxisTicks;
}

const readdirAsync = (path) => {
    return new Promise(function (resolve, reject) {
        fsmo.readdir(path, function (error, result) {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

export const getDataAndConfig = (graphName) => {
    return new Promise(async function (resolve, reject) {
        const dataFolder = __dirname + '/' + graphName + '/mock/data';
        const configFolder = __dirname + '/' + graphName + '/mock/configurations';
        let allFiles = await readdirAsync(configFolder);
        let config = [];
        allFiles.forEach(file => {
            config[file.split(".")[0]] = readJSON(configFolder + '/' + file);
        });
        config['data'] = readJSON(dataFolder + '/data.json');
        resolve(config);
    });
}

export const getHtml = (component, tag) => {
    const cheerioData = cheerio.load(component.find(tag).html());
    return cheerioData;
}

export const checkSvg = (component) => {
    const $ = getHtml(component, 'svg');
    const svgHeight = $('svg').attr('height');
    const svgWidth = $('svg').attr('width');
    return svgHeight == "500" && svgWidth == "500";
}

export const totalRows = ($) => {
    const noOfRows = $('table tbody tr').length;
    return noOfRows;
}

export const totalColumn = ($) => {
    const noOfColumns = $('table').find('thead').find('tr').children().length;
    return noOfColumns;
}

export const checkRowData = ($, rowNo) => {
    let table, value;
    table = $('table tbody tr').first();
    if (rowNo == "second")
        table = table.next();
    value = table.find('td').map(
        function (i) {
            return $(this).text();
        }
    ).get();
    return value;
}

export const checkBar = ($, length) => {
    let barData = new Object(), bar;
    bar = $('.graph-bars').children().first().next().find('rect');
    if (length == "second")
        bar = $('.graph-bars').children().first().next().next().find('rect');
    barData.height = parseFloat(bar.attr('height'));
    barData.width = parseFloat(bar.attr('width'));
    barData.x = parseFloat(bar.attr('x'));
    barData.y = parseFloat(bar.attr('y'));
    return barData;
} 
