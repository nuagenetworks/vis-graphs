import React, { Children } from 'react';
import { configure } from 'enzyme';
import ReactDOM from 'react-dom';

import { getHtml, getDataAndConfig } from '../testHelper';
import Heatmap from '.';
import Adapter from 'enzyme-adapter-react-16';

const cheerio = require('cheerio');

configure({ adapter: new Adapter() });


describe('Heatmap', () => {
    let config;
    beforeAll(async () => {
        config = await getDataAndConfig('Heatmap');
        window.SVGElement.prototype.getBBox = () => ({
            x: 0,
            y: 0,
        });
    });

    describe('withoutBrush', () => {
        let $;
        const element = document.createElement('div');
        beforeAll((done) => {
            ReactDOM.render(
                <Heatmap
                    width={500}
                    height={500}
                    configuration={config.withoutBrush}
                    data={config.data}
                >
                </Heatmap>,
                element
            );

            setTimeout(() => {
                done();
                $ = cheerio.load(element.innerHTML);
            }, 1000);
        });

        afterAll(() => {
          document.removeChild(element);
        })

        it('SVG Dimensions', () => {
              const width = parseInt($('.graphContainer').find('svg').attr('width'));
              expect(width).toBe(500);
        });

        it("Total Heatmap Block", () => {
            const rect = $('.heatmap').find('g').length;
            console.log('rect length', rect)
            expect(rect).toBe(28)
        });

        it("Heatmap First Block Configuration", () => {
          const rect = $('.heatmap').children().first().has('rect');
          expect(rect).toBeTruthy();
        });

        it("Heatmap Null Block Color", () => {
            const rect = $('.heatmap').find('g rect').first();
            console.log('block color', rect.attr('style'))
            expect(rect.attr('style')).toEqual(
                "stroke: grey; stroke-width: 0.5px; fill: #f2f2f2; opacity: 1;"
            );
        });

        it("Heatmap Last Block Configuration", () => {
          const rect = $('.heatmap').children().last().has('rect');
          expect(rect).toBeTruthy();
        });

        it("Heatmap Colored Block Color", () => {
            const rect = $('.heatmap').find('g rect').last();
            console.log('color', rect.attr('style'))
            expect(rect.attr('style')).toEqual(
                "stroke: grey; stroke-width: 0.5px; fill: #f2f2f2; opacity: 1;"
            );
        });

        it("xAxis Ticks Length", () => {
            const xAxisTicks = $('.graph-container').find('.xAxis').find('g').length;
            console.log('xAxisTicks', xAxisTicks)
            expect(xAxisTicks).toBe(7);
        });

        it("yAxis Ticks Length", () => {
            const yAxisTicks = $('.graph-container').find('.yAxis').find('g').length;
            console.log('yAxisTicks', yAxisTicks)
            expect(yAxisTicks).toBe(4);
        });

        it("Legends", () => {
            const legend = $('.legend').children().length;
            expect(legend).toEqual(2);
        });
    });

    // describe('withBrush', () => {
    //   let $;
    //   const element = document.createElement('div');
    //   beforeAll( (done) => {
    //        ReactDOM.render(
    //           <Heatmap
    //               width={500}
    //               height={500}
    //               configuration={config.withBrush}
    //               data={config.data}
    //           >
    //           </Heatmap>,
    //           element
    //       );

    //       setTimeout(() => {
    //           done();
    //           $ = cheerio.load(element.innerHTML);
    //       }, 1000);
    //   });


    //   it('SVG Dimensions', () => {
    //       const width = parseInt($('.graphContainer').find('svg').attr('width'));
    //       expect(width).toBe(500);
    //   });

    //   it("Total Heatmap Block", () => {
    //       const rect = $('.heatmap').find('g').length;
    //       expect(rect).toBe(28)
    //   });

    //   it("Heatmap First Block Configuration", () => {
    //     const rect = $('.heatmap').children().first().has('rect');
    //     expect(rect).toBeTruthy();
    //   });

    //   it("Heatmap Null Block Color", () => {
    //       const rect = $('.heatmap').find('g rect').first();
    //       console.log('block color', rect.attr('style'))
    //       expect(rect.attr('style')).toEqual(
    //           "stroke: grey; stroke-width: 0.5px; fill: #f2f2f2; opacity: 1;"
    //       );
    //   });

    //   it("Heatmap Last Block Configuration", () => {
    //       const rect = $('.heatmap').children().last().has('rect');
    //       expect(rect).toBeTruthy();
    //   });

    //   it("Heatmap Colored Block Color", () => {
    //       const rect = $('.heatmap').find('g rect').last();
    //       expect(rect.attr('style')).toEqual(
    //           "stroke: grey; stroke-width: 0.5px; fill: #f2f2f2; opacity: 1;"
    //       );
    //   });

    //   it("xAxis Ticks Length", () => {
    //       const xAxisTicks = $('.graph-container').find('.xAxis').find('g').length;
    //       console.log('xAxisTicks', xAxisTicks)
    //       expect(xAxisTicks).toBe(7);
    //   });

    //   it("yAxis Ticks Length", () => {
    //       const yAxisTicks = $('.graph-container').find('.yAxis').find('g').length;
    //       expect(yAxisTicks).toBe(4);
    //   });

    //   it("Height and Width of Brush Selected Area", () => {
    //     const height = $('.brush').length;
    //     expect(height).toEqual(1);
    //   });

    //   it("Legends", () => {
    //       const legend = $('.legend').children().length;
    //       expect(legend).toEqual(2);
    //   });
    // });

});