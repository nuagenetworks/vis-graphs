import React from 'react';
const cheerio = require('cheerio');
import ReactDom from 'react-dom';

import { getDataAndConfig } from '../testHelper';
import AreaGraph from '.';

describe("AreaGraph", () => {
  let config;
  let useEffect;

  const mockUseEffect = () => {
    useEffect.mockImplementationOnce(f => f());
  };

  beforeAll(async () => {
    config = await getDataAndConfig('AreaGraph');
  });

  describe("Simple", () => {
    let simple, $;
    const element = document.createElement("div");

    beforeAll((done) => {
      useEffect = jest.spyOn(React, "useEffect");

      mockUseEffect();
      document.body.appendChild(element);

      simple = ReactDom.render(
        <AreaGraph
          width={500}
          height={500}
          configuration={config.simple}
          data={config.data}>
        </AreaGraph>,
        element
      );
      mockUseEffect();
      setTimeout(() => {
        done();
        $ = cheerio.load(element.innerHTML);
      }, 3000);
    });

    it("SVG Dimensions", () => {
      const height = $('svg').attr('height');
      const width = $('svg').attr('width');
      expect(height).toEqual("500");
      expect(width).toEqual("500");
    });

    it("Total AreaGraph", () => {
      const noOfAreaBlock = $('.area-fill').find('.recharts-area-area').length;
      const noOfLineBlock = $('.area-fill').find('.recharts-area-curve').length;
      expect(noOfAreaBlock).toBe(1);
      expect(noOfLineBlock).toBe(1)
    });

    it("AreaGraph Dimensions", () => {
      const areaGraph = $('.area-fill').find('.recharts-area-area').attr("d");
      expect(areaGraph).toEqual("M90,51.060389999999984C108.09523809523809,51.06009749999998,126.19047619047619,51.05980499999998,144.28571428571428,51.05951249999998C162.38095238095238,51.05921999999998,180.47619047619045,51.058927499999974,198.57142857142856,51.05863499999998C216.66666666666666,51.05834249999999,234.76190476190476,51.05805000000003,252.85714285714286,51.05775750000004C270.95238095238096,51.05746500000004,289.04761904761904,51.05717250000004,307.1428571428571,51.056880000000035C325.23809523809524,51.05658750000003,343.3333333333333,51.056294999999984,361.42857142857144,51.05600249999998C379.5238095238095,51.05570999999997,397.61904761904765,51.055417499999976,415.7142857142857,51.055124999999975C433.8095238095238,51.054832499999975,451.9047619047619,51.054539999999974,470,51.054247499999974L470,420C451.9047619047619,420,433.8095238095238,420,415.7142857142857,420C397.61904761904765,420,379.5238095238095,420,361.42857142857144,420C343.3333333333333,420,325.23809523809524,420,307.1428571428571,420C289.04761904761904,420,270.95238095238096,420,252.85714285714286,420C234.76190476190476,420,216.66666666666666,420,198.57142857142856,420C180.47619047619045,420,162.38095238095238,420,144.28571428571428,420C126.19047619047619,420,108.09523809523809,420,90,420Z");
    });

    it("AreaGraph Legends", () => {
      const noOfLegends = $('.recharts-legend-wrapper').find('div').find('div').length;
      expect(noOfLegends).toBe(1);
    });

    it("xAxis Ticks Length", () => {
      const xAxisTicks = $('.recharts-xAxis').find('.graph-axis').length;
      expect(xAxisTicks).toBe(8);
    });

    it("yAxis Ticks Length", () => {
      const yAxisTicks = $('.recharts-yAxis').find('.graph-axis').length;
      expect(yAxisTicks).toBe(5);
    });
  });

  describe("Stacked", () => {
    let stacked, $;
    const element = document.createElement("div");

    beforeAll((done) => {
      useEffect = jest.spyOn(React, "useEffect");

      mockUseEffect();
      document.body.appendChild(element);

      stacked = ReactDom.render(
        <AreaGraph
          width={500}
          height={500}
          configuration={config.stacked}
          data={config.data}>
        </AreaGraph>,
        element
      );
      mockUseEffect();
      setTimeout(() => {
        done();
        $ = cheerio.load(element.innerHTML);
      }, 3000);
    });

    it("SVG Dimensions", () => {
      const height = $('svg').attr('height');
      const width = $('svg').attr('width');
      expect(height).toEqual("500");
      expect(width).toEqual("500");
    });

    it("Total AreaGraph", () => {
      const noOfAreaBlock = $('.area-fill').find('.recharts-area-area').length;
      const noOfLineBlock = $('.area-fill').find('.recharts-area-curve').length;
      expect(noOfAreaBlock).toBe(1);
      expect(noOfLineBlock).toBe(1)
    });

    it("AreaGraph Dimensions", () => {
      const areaGraph = $('.area-fill').find('.recharts-area-area').attr("d");
      expect(areaGraph).toEqual("M90,51.060389999999984C108.09523809523809,51.06009749999998,126.19047619047619,51.05980499999998,144.28571428571428,51.05951249999998C162.38095238095238,51.05921999999998,180.47619047619045,51.058927499999974,198.57142857142856,51.05863499999998C216.66666666666666,51.05834249999999,234.76190476190476,51.05805000000003,252.85714285714286,51.05775750000004C270.95238095238096,51.05746500000004,289.04761904761904,51.05717250000004,307.1428571428571,51.056880000000035C325.23809523809524,51.05658750000003,343.3333333333333,51.056294999999984,361.42857142857144,51.05600249999998C379.5238095238095,51.05570999999997,397.61904761904765,51.055417499999976,415.7142857142857,51.055124999999975C433.8095238095238,51.054832499999975,451.9047619047619,51.054539999999974,470,51.054247499999974L470,420C451.9047619047619,420,433.8095238095238,420,415.7142857142857,420C397.61904761904765,420,379.5238095238095,420,361.42857142857144,420C343.3333333333333,420,325.23809523809524,420,307.1428571428571,420C289.04761904761904,420,270.95238095238096,420,252.85714285714286,420C234.76190476190476,420,216.66666666666666,420,198.57142857142856,420C180.47619047619045,420,162.38095238095238,420,144.28571428571428,420C126.19047619047619,420,108.09523809523809,420,90,420Z");
    });

    it("AreaGraph Legends", () => {
      const noOfLegends = $('.recharts-legend-wrapper').find('div').find('div').length;
      expect(noOfLegends).toBe(1);
    });

    it("xAxis Ticks Length", () => {
      const xAxisTicks = $('.recharts-xAxis').find('.graph-axis').length;
      expect(xAxisTicks).toBe(8);
    });

    it("yAxis Ticks Length", () => {
      const yAxisTicks = $('.recharts-yAxis').find('.graph-axis').length;
      expect(yAxisTicks).toBe(5);
    });
  });

  describe("Null Data", () => {
    let stacked, $;
    const element = document.createElement("div");

    beforeAll((done) => {
      useEffect = jest.spyOn(React, "useEffect");

      mockUseEffect();
      document.body.appendChild(element);

      stacked = ReactDom.render(
        <AreaGraph
          width={500}
          height={500}
          configuration={config.stacked}
          data={config.nullData}>
        </AreaGraph>,
        element
      );
      mockUseEffect();
      setTimeout(() => {
        done();
        $ = cheerio.load(element.innerHTML);
      }, 3000);
    });

    it("SVG Dimensions", () => {
      const height = $('svg').attr('height');
      const width = $('svg').attr('width');
      expect(height).toEqual("500");
      expect(width).toEqual("500");
    });

    it("Total AreaGraph", () => {
      const noOfAreaBlock = $('.area-fill').find('.recharts-area-area').length;
      const noOfLineBlock = $('.area-fill').find('.recharts-area-curve').length;
      expect(noOfAreaBlock).toBe(1);
      expect(noOfLineBlock).toBe(1)
    });

    it("AreaGraph Dimensions", () => {
      const areaGraph = $('.area-fill').find('.recharts-area-area').attr("d");
      expect(areaGraph).toEqual("M90,51.060389999999984C108.09523809523809,51.06009749999998,126.19047619047619,51.05980499999998,144.28571428571428,51.05951249999998C162.38095238095238,51.05921999999998,180.47619047619045,51.058927499999974,198.57142857142856,51.05863499999998C216.66666666666666,51.05834249999999,234.76190476190476,51.05805000000003,252.85714285714286,51.05775750000004C270.95238095238096,51.05746500000004,289.04761904761904,51.05717250000004,307.1428571428571,51.056880000000035C325.23809523809524,51.05658750000003,343.3333333333333,51.056294999999984,361.42857142857144,51.05600249999998C379.5238095238095,51.05570999999997,397.61904761904765,51.055417499999976,415.7142857142857,51.055124999999975C433.8095238095238,51.054832499999975,451.9047619047619,51.054539999999974,470,51.054247499999974L470,420C451.9047619047619,420,433.8095238095238,420,415.7142857142857,420C397.61904761904765,420,379.5238095238095,420,361.42857142857144,420C343.3333333333333,420,325.23809523809524,420,307.1428571428571,420C289.04761904761904,420,270.95238095238096,420,252.85714285714286,420C234.76190476190476,420,216.66666666666666,420,198.57142857142856,420C180.47619047619045,420,162.38095238095238,420,144.28571428571428,420C126.19047619047619,420,108.09523809523809,420,90,420Z");
    });

    it("AreaGraph Legends", () => {
      const noOfLegends = $('.recharts-legend-wrapper').find('div').find('div').length;
      expect(noOfLegends).toBe(1);
    });

    it("xAxis Ticks Length", () => {
      const xAxisTicks = $('.recharts-xAxis').find('.graph-axis').length;
      expect(xAxisTicks).toBe(8);
    });

    it("yAxis Ticks Length", () => {
      const yAxisTicks = $('.recharts-yAxis').find('.graph-axis').length;
      expect(yAxisTicks).toBe(5);
    });
  });
});
