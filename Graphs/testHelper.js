import fsmo from 'fs';
import { format, timeFormat } from "d3";
import React from 'react';

const d3 = { format, timeFormat };
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
            config[file.split('.')[0]] = readJSON(configFolder + '/' + file);
        });
        config['data'] = readJSON(dataFolder + '/data.json');
        resolve(config);
    });
}

export const getHtml = (component, tag) => {
    if (tag === 'table') {
        return cheerio.load(component.first(tag).html());
    }
    const cheerioData = cheerio.load(component.find(tag).html());
    return cheerioData;
}

export const checkSvg = (component) => {
    const $ = getHtml(component, 'svg');
    const svgHeight = $('svg').attr('height');
    const svgWidth = $('svg').attr('width');
    return svgHeight == '500' && svgWidth == '500';
}

export const totalRows = ($) => {
    const noOfRows = $('.ReactVirtualized__Table').attr('aria-rowcount');
    return noOfRows;
}

export const totalColumn = ($) => {
    const noOfColumns = $('.ReactVirtualized__Table').attr('aria-colcount');
    return noOfColumns;
}

export const checkRowData = ($, rowNo) => {
    let table, value;
    table = $('.ReactVirtualized__Table__row').first();
    if (rowNo == 'second')
        table = table.next();
    value = table.children().map(
        function (i) {
            if ($(this).find('p')) {
                return $(this).find('p').text().trim();
            }
        }
    ).get();
    return value;
}

export const checkBar = ($, length, type) => {
    let barData = new Object(), bar;
    bar = $('.recharts-bar-rectangles .recharts-layer').children().first().find('path');
    if (length === 'second') {
        bar = $('.recharts-bar-rectangles .recharts-layer').children().first().next().find('path');
    }
    if (type === 'vertical') {
        barData.width = parseFloat(bar.attr('width'));
    } else {
        barData.height = parseFloat(bar.attr('height'));
        barData.y =  parseFloat(bar.attr('y'));
    }
    barData.x = parseFloat(bar.attr('x'));

    return barData;
}

export const checkLine = ($, length) => {
    let d, linePath, line;
    linePath = $('svg').find('g').get(1).firstChild.nextSibling.nextSibling.children;
    line = cheerio.load(linePath);
    d = line('path').attr('d');
    if (length == 'second')
        d = line('path').next().attr('d');
    return d;
}

export const checkTime = (date) => {
    const timeFormat = '%b %d, %y %X';
    const formatter = d3.timeFormat(timeFormat);
    return formatter(new Date(date))
}

export const mockUseEffect = () => jest.spyOn(React, "useEffect").mockImplementationOnce(f => f())

export const clearAllMocks = () => jest.clearAllMocks();

export const createElement = () => document.createElement('div');

export const appendChildToElement = (element) => document.body.appendChild(element);

export const removeElement = (element) => document.body.removeChild(element);
