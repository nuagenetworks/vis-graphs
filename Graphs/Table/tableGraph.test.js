import React from 'react';
import {mount} from 'enzyme';
import {CheckTicks,getDataAndConfig} from '../testHelper';
import Table from '.';
const cheerio = require('cheerio')

describe ("test Table", ()=>{
    beforeAll( async () => {
            global.config = await getDataAndConfig('Table');    
    });

    describe("hide-pagination", ()=>{
        beforeAll( async () => {
            global.componentHidePagination = mount(<Table width={500} height={500} configuration={config.hidePagination} data={config.data}> </Table>);
        });

        it("number of column Table is matched", ()=>{
            const middleHtml = componentHidePagination.find('table').html();
            const $ = cheerio.load(middleHtml);
            const noOfBars = $('table').find('thead').find('tr').children().length;
            const totalBar = componentHidePagination.root.props().configuration.data.columns.length;
            expect(noOfBars).toBe(totalBar)
        });

        it("check-column-names", ()=>{
            var obj = componentHidePagination.root.props().configuration.data.columns;
            var columns = Object.keys(obj).map(function(key) {
            return obj[key].column;
            });
            const middleHtml = componentHidePagination.find('table').html();
            const $ = cheerio.load(middleHtml);
            const tableColumns = $('table thead th').map(function(i) { return $(this).text(); }).get();
            expect(tableColumns).toEqual(columns);
        });
    
        it("check-row", ()=>{
            const middleHtml = componentHidePagination.find('table').html();
            const $ = cheerio.load(middleHtml);
            const value = $('table tbody tr').first().find('td').map(function(i) { return $(this).text(); }).get();
            expect(value).toBeDefined();
        });

        it("check-number-of-rows", ()=>{
            const middleHtml = componentHidePagination.find('table').html();
            const $ = cheerio.load(middleHtml);
            const noOfRows = $('table tbody tr').length;
            expect(noOfRows).toBeGreaterThan(0);
        })     
    });   

    describe("hide-search-bar", ()=>{
        beforeAll( async () => {
            global.componentHideSearch = mount(<Table width={500} height={500} configuration={config.hideSearchBar} data={config.data}> </Table>);
        });

        it("number of column Table is matched", ()=>{
            const middleHtml = componentHideSearch.find('table').html();
            const $ = cheerio.load(middleHtml);
            const noOfBars = $('table').find('thead').find('tr').children().length;
            const totalBar = componentHideSearch.root.props().configuration.data.columns.length;
            expect(noOfBars).toBe(totalBar)
        });

        it("check-column-names", ()=>{
            var obj = componentHideSearch.root.props().configuration.data.columns;
            var columns = Object.keys(obj).map(function(key) {
            return obj[key].column;
            });
            const middleHtml = componentHideSearch.find('table').html();
            const $ = cheerio.load(middleHtml);
            const tableColumns = $('table thead th').map(function(i) { return $(this).text(); }).get();
            expect(tableColumns).toEqual(columns);
        });
    
        it("check-row", ()=>{
            const middleHtml = componentHideSearch.find('table').html();
            const $ = cheerio.load(middleHtml);
            const value = $('table tbody tr').first().find('td').map(function(i) { return $(this).text(); }).get();
            expect(value).toBeDefined();
        });

        it("check-number-of-rows", ()=>{
            const middleHtml = componentHideSearch.find('table').html();
            const $ = cheerio.load(middleHtml);
            const noOfRows = $('table tbody tr').length;
            expect(noOfRows).toBeGreaterThan(0);
        })   
    });    

    let componentselectAll;
    describe("selectAll", ()=>{
        beforeAll( async () => {
           componentselectAll = mount(<Table width={500} height={500} configuration={config.selectAll} data={config.data}> </Table>);
        });

        it("number of column Table is matched", ()=>{
            const middleHtml = componentselectAll.find('table').html();
            const $ = cheerio.load(middleHtml);
            const noOfBars = $('table').find('thead').find('tr').children().length;
            const totalBar = componentselectAll.root.props().configuration.data.columns.length;
            expect(noOfBars).toBe(totalBar+1)
        });

        it("check-column-names", ()=>{
            var obj = componentselectAll.root.props().configuration.data.columns;
            var columns = Object.keys(obj).map(function(key) {
                return obj[key].column;
            });
            columns.unshift("");
            const middleHtml = componentselectAll.find('table').html();
            const $ = cheerio.load(middleHtml);
            const tableColumns = $('table thead th').map(function(i) { return $(this).text(); }).get();
            expect(tableColumns).toEqual(columns);
        });
    
        it("check-row", ()=>{
            const middleHtml = componentselectAll.find('table').html();
            const $ = cheerio.load(middleHtml);
            const value = $('table tbody tr').first().find('td').map(function(i) { return $(this).text(); }).get();
            expect(value).toBeDefined();
        });

        it("check-number-of-rows", ()=>{
            const middleHtml = componentselectAll.find('table').html();
            const $ = cheerio.load(middleHtml);
            const noOfRows = $('table tbody tr').length;
            expect(noOfRows).toBeGreaterThan(0);
        })   
    }); 

    let componentSimple;
    describe("highlight-column", ()=>{
        beforeAll( async () => {
            componentSimple = mount(<Table width={500} height={500} configuration={config.highlightColumn} data={config.data}> </Table>);
        });

        it("number of column Table is matched", ()=>{
            const middleHtml = componentSimple.find('table').html();
            const $ = cheerio.load(middleHtml);
            const noOfBars = $('table').find('thead').find('tr').children().length;
            const totalBar = componentSimple.root.props().configuration.data.columns.length;
            expect(noOfBars).toBe(totalBar)
        });

        it("check-column-names", ()=>{
            var obj = componentSimple.root.props().configuration.data.columns;
            var columns = Object.keys(obj).map(function(key) {
            return obj[key].column;
            });
            const middleHtml = componentSimple.find('table').html();
            const $ = cheerio.load(middleHtml);
            const tableColumns = $('table thead th').map(function(i) { return $(this).text(); }).get();
            expect(tableColumns).toEqual(columns);
        });
    
        it("check-row", ()=>{
            const middleHtml = componentSimple.find('table').html();
            const $ = cheerio.load(middleHtml);
            const value = $('table tbody tr').first().find('td').map(function(i) { return $(this).text(); }).get();
            expect(value).toBeDefined();
        });

        it("check-number-of-rows", ()=>{
            const middleHtml = componentSimple.find('table').html();
            const $ = cheerio.load(middleHtml);
            const noOfRows = $('table tbody tr').length;
            expect(noOfRows).toBeGreaterThan(0);
        })
    }); 
});