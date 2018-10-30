import React from 'react';
import { mount } from 'enzyme';

import { getHtml, getDataAndConfig, checkSvg } from '../testHelper';
import ChordGraph from '.';

describe("ChordGraph", () => {
    let config;
    beforeAll(async () => {
        config = await getDataAndConfig('ChordGraph');
    });

    describe("IntialConfiguration", () => {
        let chordGraph, $;
        beforeAll(async () => {
            chordGraph = mount(
                <ChordGraph
                    width={500}
                    height={500}
                    configuration={config.configuration}
                    data={config.data}>
                </ChordGraph>
            );
            $ = getHtml(chordGraph, 'svg');
        });

        it("SVG Dimensions", () => {
            const result = checkSvg(chordGraph);
            expect(result).toBeTruthy();
        });

        it("Total ChordGraph", () => {
            const noOGraphs = $('svg').find('g').length;
            expect(noOGraphs).toBe(12)
        });

        it("ChordGraph Path Definition", () => {
            const chordGraphDefinition = $('svg').find('g').find('g').find('path').attr("d");
            expect(chordGraphDefinition).toEqual("M1.2246467991473532e-14,-200A200,200,0,0,1,107.13696325155514,-168.88360223904192Q0,0,118.68678486490563,-160.97654207502288A200,200,0,0,1,186.45394819404802,-72.35278296548967Q0,0,1.2246467991473532e-14,-200Z");
        });

        it("ChordGraph Transform", () => {
            const chordGraphTransform = $('svg').find('g').find('g').find('text').attr("transform");
            expect(chordGraphTransform).toEqual("rotate(-73.8048170546621)translate(230)");
        });
    });
});
