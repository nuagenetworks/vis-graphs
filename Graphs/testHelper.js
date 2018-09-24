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
    const middleHtml = component.find(parentClass).find(childClass).html();
    const $ = cheerio.load(middleHtml);
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

export const getHtml = (component,tag) => {
    const graph = component.find(tag).html();
    const cheerioData = cheerio.load(graph);
    return cheerioData;
}

export const checkSvg = (component) => {
    const $ = getHtml(component, 'svg');
    const svgHeight = $('svg').attr('height');
    const svgWidth = $('svg').attr('width');
    if(svgHeight == "500" && svgWidth == "500"){
        return true;
    } else {
        return false;
    }
}

export const totalRows = ($) => {
    const noOfRows = $('table tbody tr').length;
    return noOfRows;
}

export const totalColumn = ($) => {
    const noOfColumns = $('table').find('thead').find('tr').children().length;
    return noOfColumns;
}

export const checkSingleRowData = ($) => {
    const value = $('table tbody tr').first().find('td').map(
        function (i) {
            return $(this).text();
        }
    ).get();
    return value;
}
