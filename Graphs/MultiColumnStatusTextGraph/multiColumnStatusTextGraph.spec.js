import React, { Children } from 'react';
import { mount, configure } from 'enzyme';
import ReactDOM from 'react-dom';

import { getDataAndConfig, columnStatusTextGraphData, getColor, rgbToHex } from '../testHelper';
import MultiColumnStatusTextGraph from ".";
import Adapter from 'enzyme-adapter-react-16';

const cheerio = require('cheerio');

configure({ adapter: new Adapter() });

describe('MultiColumnStatusText Graph', () => {
    let $, config;
    beforeAll(async (done) => {
        const element = document.createElement('div');
        config = await getDataAndConfig('MultiColumnStatusTextGraph');
        ReactDOM.render(
            <MultiColumnStatusTextGraph
                width={500}
                height={500}
                configuration={config.visualization}
                data={config.data}>
            </MultiColumnStatusTextGraph>,
            element
        );
        setTimeout(() => {
            done();
            $ = cheerio.load(element.innerHTML);
        }, 350);
    });

    it("columnStatusTextGraph Count", () => {
        const columnStatusTextCount = $('.inline-alarms').children().length;
        expect(columnStatusTextCount).toEqual(3);
    });

    it("First Data", () => {
        const value = columnStatusTextGraphData($);
        const firstColumnStatusText = [
            'Critical Alarms',
            '2'
        ];
        expect(firstColumnStatusText).toEqual(value);
    });

    it("Second Data", () => {
        const value = columnStatusTextGraphData($, 'second');
        const firstColumnStatusText = [
            'Major Alarms',
            '1'
        ];
        expect(firstColumnStatusText).toEqual(value);
    });

    it("Third Data", () => {
        const value = columnStatusTextGraphData($, 'third');
        const firstColumnStatusText = [
            'Minor Alarms',
            '3'
        ];
        expect(firstColumnStatusText).toEqual(value);
    });

    it("First Data Color", () => {
        const style = $('#color-0').attr('style');
        const rbgColor = getColor(style);
        const hexColor = rgbToHex(rbgColor);
        const color = config.visualization.data.colors[0];
        expect(hexColor).toEqual(color);
    });

    it("Second Data Color", () => {
        const style = $('#color-1').attr('style');
        const rbgColor = getColor(style);
        const hexColor = rgbToHex(rbgColor);
        const color = config.visualization.data.colors[1];
        expect(hexColor).toEqual(color);
    });

    it("Third Data Color", () => {
        const style = $('#color-2').attr('style');
        const rbgColor = getColor(style);
        const hexColor = rgbToHex(rbgColor);
        const color = config.visualization.data.colors[2];
        expect(hexColor).toEqual(color);
    });

});
