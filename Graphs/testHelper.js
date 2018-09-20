import fsmo from 'fs';
const cheerio = require('cheerio');


export const readJSON = (JSONFile) => {
    try {
        return JSON.parse(fsmo.readFileSync(JSONFile, 'utf8'));
    } catch (e) {
        console.log(e);
    }
}

export const CheckTicks = (component, parentClass, childClass, selector) => {
    const middleHtml = component.find(parentClass).find(childClass).html();
    const $ = cheerio.load(middleHtml);
    const axisTicks = $(childClass).find(selector).length;
    return axisTicks;
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

export const getInnerHtml = (component,tag) => {
    const middleHtml = component.find(tag).html();
    const cheerioData = cheerio.load(middleHtml);
    return cheerioData;
}
