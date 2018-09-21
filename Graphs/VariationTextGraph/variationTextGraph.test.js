import React from 'react';
import { mount } from 'enzyme';

import { getDataAndConfig } from '../testHelper';
import VariationTextGraph from '.';

const cheerio = require('cheerio')

describe("VariationTextGraph", () => {
    let config
    beforeAll(async () => {
        config = await getDataAndConfig('VariationTextGraph');
    });

    describe("InitialConfiguration", () => {
        let variationText, graphData, $;
        beforeAll(async () => {
            variationText = mount(
                <VariationTextGraph
                    width={500}
                    height={500}
                    configuration={config.configuration}
                    data={config.data}>
                </VariationTextGraph>
            );
            graphData = variationText.html();
            $ = cheerio.load(graphData);
        });

        it("Number of box", () => {
            const noOfBox = $('div').find('div').length;
            expect(noOfBox).toBe(2);
        });

        it("First box Value", () => {
            const text = $('span').first().text();
            expect(text).toEqual('-31.58%');
        });

        it("Second box value", () => {
            const value = $('span').last().text();
            expect(value).toEqual('1,300');
        });

    });

});
