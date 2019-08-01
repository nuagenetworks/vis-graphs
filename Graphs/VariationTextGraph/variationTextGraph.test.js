import React from 'react';
import { mount, configure } from 'enzyme';

import { getDataAndConfig } from '../testHelper';
import VariationTextGraph from '.';
import ReactDOM from 'react-dom';
import Adapter from 'enzyme-adapter-react-16';

const cheerio = require('cheerio')

configure({ adapter: new Adapter() });

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

        it("Total boxs", () => {
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

    describe("Click Event", () => {
        let variationText;
        const mockCallBack = jest.fn();
        const element = document.createElement("div");
        beforeAll((done) => {
            document.body.appendChild(element);
            variationText = ReactDOM.render(
                <VariationTextGraph
                    width={500}
                    height={500}
                    configuration={config.configuration}
                    data={config.data}
                    onMarkClick={mockCallBack}
                />,
                element
            )
            setTimeout(() => {
                done();
            }, 1000);
        });

        afterAll(() => {
            document.body.removeChild(element);
        });

        it("Click On Bar", () => {
            element.querySelector('div').click();
            expect(mockCallBack).toHaveBeenCalled();
        });
    });
});
