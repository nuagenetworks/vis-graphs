import React from 'react';
import { mount, shallow } from 'enzyme';

import { getDataAndConfig, getHtml, totalRows, checkRowData, totalColumn } from '../testHelper';
import Table from '.';

const cheerio = require('cheerio');

describe("Table", () => {
    let config;
    beforeAll(async () => {
        config = await getDataAndConfig('Table');
        global.document.body.createTextRange = () => {
            return { 
                setEnd: () => {},
                setStart: () => {},
                getBoundingClientRect: () => {},
                getClientRects: () => []
               }
           }
    });

    describe("hidePagination", () => {
        let hidePagination, $;
        beforeAll(async () => {
            hidePagination = mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.hidePagination}
                    data={config.data}>
                </Table>
            );
            $ = getHtml(hidePagination, 'table');
        });

        it("Total Column", () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(4);
        });

        it("Column Names", () => {
            var columnList = hidePagination.root.props().configuration.data.columns;
            var columns = Object.keys(columnList).map(function (key) {
                return columnList[key].column;
            });
            const tableColumns = $('table thead th').map(
                function (i) {
                    return $(this).text();
                }
            ).get();
            expect(tableColumns).toEqual(columns);
        });

        it("First Row Data", () => {
            const value = checkRowData($);
            const firstRow = [
                "Jun 23, 70 10:37:43 PM",
                "Testing", 
                "200.54545454545456", 
                "2422791762"
            ];
            expect(value).toEqual(firstRow);
        });

        it("Second Row Data", () => {
            const value = checkRowData($, "second");
            const secondRow = [
                "Oct 17, 70 4:24:23 PM", 
                "Developing", 
                "300.54545454545456", 
                "2422791762"
            ];
            expect(value).toEqual(secondRow);
        });

        it("Total Rows", () => {
            const noOfRows = totalRows($);
            expect(noOfRows).toBe(3);
        });
    });

    describe("hideSearchBar", () => {
        let hideSearchBar, $;
        beforeAll(async () => {
            hideSearchBar = mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.hideSearchBar}
                    data={config.data}>
                </Table>
            );
            $ = getHtml(hideSearchBar, 'table');
        });

        it("Total Column", () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(4);
        });

        it("Column Names", () => {
            var columnList = hideSearchBar.root.props().configuration.data.columns;
            var columns = Object.keys(columnList).map(function (key) {
                return columnList[key].column;
            });
            const tableColumns = $('table thead th').map(
                function (i) {
                    return $(this).text();
                }
            ).get();
            expect(tableColumns).toEqual(columns);
        });

        it("First Row Data", () => {
            const value = checkRowData($);
            const firstRow = [
                "Jun 23, 70 10:37:43 PM",
                "Testing", 
                "200.54545454545456", 
                "2422791762"
            ];
            expect(value).toEqual(firstRow);
        });

        it("Second Row Data", () => {
            const value = checkRowData($, "second");
            const secondRow = [
                "Oct 17, 70 4:24:23 PM", 
                "Developing", 
                "300.54545454545456", 
                "2422791762"
            ];
            expect(value).toEqual(secondRow);
        });

        it("Total Rows", () => {
            const noOfRows = totalRows($);
            expect(noOfRows).toBe(3);
        });
    });

    describe("selectAll", () => {
        let selectAll, $;
        beforeAll(async () => {
            selectAll = mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.selectAll}
                    data={config.data}>
                </Table>
            );
            $ = getHtml(selectAll, 'table');
        });

        it("Total Column", () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(5);
        });

        it("Column Names", () => {
            var columnList = selectAll.root.props().configuration.data.columns;
            var columns = Object.keys(columnList).map(function (key) {
                return columnList[key].column;
            });
            columns.unshift("");
            const tableColumns = $('table thead th').map(
                function (i) {
                    return $(this).text();
                }
            ).get();
            expect(tableColumns).toEqual(columns);
        });

        it("First Row Data", () => {
            const value = checkRowData($);
            const firstRow = [
                "",
                "Jun 23, 70 10:37:43 PM",
                "Testing", 
                "200.54545454545456", 
                "2422791762"
            ];
            expect(value).toEqual(firstRow);
        });

        it("Second Row Data", () => {
            const value = checkRowData($, "second");
            const secondRow = [
                "",
                "Oct 17, 70 4:24:23 PM", 
                "Developing", 
                "300.54545454545456", 
                "2422791762"
            ];
            expect(value).toEqual(secondRow);
        });

        it("Total Rows", () => {
            const noOfRows = totalRows($);
            expect(noOfRows).toBe(3);
        });
    });

    describe("highlightColumn", () => {
        let highlightColumn, $;
        beforeAll(async () => {
            highlightColumn = mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.highlightColumn}
                    data={config.data}>
                </Table>
            );
            $ = getHtml(highlightColumn, 'table');
        });

        it("Total Column", () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(4);
        });

        it("Column Names", () => {
            var columnList = highlightColumn.root.props().configuration.data.columns;
            var columns = Object.keys(columnList).map(function (key) {
                return columnList[key].column;
            });
            const tableColumns = $('table thead th').map(
                function (i) {
                    return $(this).text();
                }
            ).get();
            expect(tableColumns).toEqual(columns);
        });

        it("First Row Data", () => {
            const value = checkRowData($);
            const firstRow = [
                "Jun 23, 70 10:37:43 PM",
                "Testing", 
                "200.54545454545456", 
                "2422791762"
            ];
            expect(value).toEqual(firstRow);
        });

        it("Second Row Data", () => {
            const value = checkRowData($, "second");
            const secondRow = [
                "Oct 17, 70 4:24:23 PM", 
                "Developing", 
                "300.54545454545456", 
                "2422791762"
            ];
            expect(value).toEqual(secondRow);
        });

        it("Total Rows", () => {
            const noOfRows = totalRows($);
            expect(noOfRows).toBe(3);
        });
    });

    describe("search Single Value", () => {
        let search, $;
        beforeAll(async (done) => {
            search = await mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.search}
                    data={config.data}>
                </Table>
            );
            setTimeout( () => {
                 search.update();
                done();
            }, 2000);
            $ = cheerio.load(search.html());;
        });

        it("Total Column", () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(4);
        });

        it("Column Names", () => {
            var columnList = config.search.data.columns;
            var columns = Object.keys(columnList).map(function (key) {
                return columnList[key].column;
            });
            const tableColumns = $('table thead th').map(
                function (i) {
                    return $(this).text();
                }
            ).get();
            expect(tableColumns).toEqual(columns);
        });

        it("First Row Data", () => {
            const value = checkRowData($);
            const firstRow = [
                "Oct 17, 70 4:24:23 PM", 
                "Developing", 
                "300.54545454545456", 
                "2422791762"
            ];
            expect(value).toEqual(firstRow);
        });

        it("Second Row Data", () => {
            const value = checkRowData($, "second");
            const secondRow = [];
            expect(value).toEqual(secondRow);
        });

        it("Total Rows", () => {
            const noOfRows = totalRows($);
            expect(noOfRows).toBe(1);
        });

        it("SearchBar Text", () => {
            const search = $('.search-label').text();
            expect(search).toEqual('Search:  ');
        });

        it("SearchBar", () => {
            const searchBarAndButton = $('.filter').children().length;
            expect(searchBarAndButton).toEqual(2);
        });

    });

    describe("search With AND Operator", () => {
        let searchWithAndOperator, $;
        beforeAll(async (done) => {
            searchWithAndOperator = await mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.searchWithAndOperator}
                    data={config.data}>
                </Table>
            );
            setTimeout( () => {
                searchWithAndOperator.update();
                done();
            }, 2000);
            $ = cheerio.load(searchWithAndOperator.html());;
        });

        it("Total Column", () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(4);
        });

        it("Column Names", () => {
            var columnList = config.searchWithAndOperator.data.columns;
            var columns = Object.keys(columnList).map(function (key) {
                return columnList[key].column;
            });
            const tableColumns = $('table thead th').map(
                function (i) {
                    return $(this).text();
                }
            ).get();
            expect(tableColumns).toEqual(columns);
        });

        it("First Row Data", () => {
            const value = checkRowData($);
            const firstRow = [
                "Oct 17, 70 4:24:23 PM", 
                "Developing", 
                "300.54545454545456", 
                "2422791762"
            ];
            expect(value).toEqual(firstRow);
        });

        it("Second Row Data", () => {
            const value = checkRowData($, "second");
            const secondRow = [];
            expect(value).toEqual(secondRow);
        });

        it("Total Rows", () => {
            const noOfRows = totalRows($);
            expect(noOfRows).toBe(1);
        });

        it("SearchBar Text", () => {
            const search = $('.search-label').text();
            expect(search).toEqual('Search:  ');
        });

        it("SearchBar", () => {
            const searchBarAndButton = $('.filter').children().length;
            expect(searchBarAndButton).toEqual(2);
        });

    });

    describe("search With OR Operator", () => {
        let searchWithOrOperator, $;
        beforeAll(async (done) => {
            searchWithOrOperator = await mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.searchWithOrOperator}
                    data={config.data}>
                </Table>
            );
            setTimeout( () => {
                searchWithOrOperator.update();
                done();
            }, 2000);
            $ = cheerio.load(searchWithOrOperator.html());;
        });

        it("Total Column", () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(4);
        });

        it("Column Names", () => {
            var columnList = config.searchWithOrOperator.data.columns;
            var columns = Object.keys(columnList).map(function (key) {
                return columnList[key].column;
            });
            const tableColumns = $('table thead th').map(
                function (i) {
                    return $(this).text();
                }
            ).get();
            expect(tableColumns).toEqual(columns);
        });

        it("First Row Data", () => {
            const value = checkRowData($);
            const firstRow = [
                "Jun 23, 70 10:37:43 PM",
                "Testing", 
                "200.54545454545456", 
                "2422791762"
            ];
            expect(value).toEqual(firstRow);
        });

        it("Second Row Data", () => {
            const value = checkRowData($, "second");
            const secondRow = [
                "Oct 17, 70 4:24:23 PM", 
                "Developing", 
                "300.54545454545456", 
                "2422791762"
            ];
            expect(value).toEqual(secondRow);
        });

        it("Total Rows", () => {
            const noOfRows = totalRows($);
            expect(noOfRows).toBe(2);
        });

        it("SearchBar Text", () => {
            const search = $('.search-label').text();
            expect(search).toEqual('Search:  ');
        });

        it("SearchBar", () => {
            const searchBarAndButton = $('.filter').children().length;
            expect(searchBarAndButton).toEqual(2);
        });

    });

    describe("search With NOT Operator", () => {
        let searchWithNotOperator, $;
        beforeAll(async (done) => {
            searchWithNotOperator = await mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.searchWithNotOperator}
                    data={config.data}>
                </Table>
            );
            setTimeout( () => {
                searchWithNotOperator.update();
                done();
            }, 2000);
            $ = cheerio.load(searchWithNotOperator.html());;
        });

        it("Total Column", () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(4);
        });

        it("Column Names", () => {
            var columnList = config.searchWithNotOperator.data.columns;
            var columns = Object.keys(columnList).map(function (key) {
                return columnList[key].column;
            });
            const tableColumns = $('table thead th').map(
                function (i) {
                    return $(this).text();
                }
            ).get();
            expect(tableColumns).toEqual(columns);
        });

        it("First Row Data", () => {
            const value = checkRowData($);
            const firstRow = [
                "Jun 23, 70 10:37:43 PM",
                "Testing", 
                "200.54545454545456", 
                "2422791762"
            ];
            expect(value).toEqual(firstRow);
        });

        it("Second Row Data", () => {
            const value = checkRowData($, "second");
            const secondRow = [
                "Feb 10, 71 10:11:03 AM", 
                "Application",
                "300.54545454545456", 
                "2422791762"
            ];
            expect(value).toEqual(secondRow);
        });

        it("Total Rows", () => {
            const noOfRows = totalRows($);
            expect(noOfRows).toBe(2);
        });

        it("SearchBar Text", () => {
            const search = $('.search-label').text();
            expect(search).toEqual('Search:  ');
        });

        it("SearchBar", () => {
            const searchBarAndButton = $('.filter').children().length;
            expect(searchBarAndButton).toEqual(2);
        });

    });

    describe("selectColumn", () => {
        let selectColumn, $;
        beforeAll(async () => {
            selectColumn = mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.selectColumn}
                    data={config.data}>
                </Table>
            );
            $ = getHtml(selectColumn, 'table');
        });

        it("Total Column", () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(4);
        });

        it("Column Names", () => {
            var columnList = selectColumn.root.props().configuration.data.columns;
            var columns = Object.keys(columnList).map(function (key) {
                return columnList[key].column;
            });
            const tableColumns = $('table thead th').map(
                function (i) {
                    return $(this).text();
                }
            ).get();
            expect(tableColumns).toEqual(columns);
        });

        it("First Row Data", () => {
            const value = checkRowData($);
            const firstRow = [
                "Jun 23, 70 10:37:43 PM",
                "Testing", 
                "200.54545454545456", 
                "2422791762"
            ];
            expect(value).toEqual(firstRow);
        });

        it("Second Row Data", () => {
            const value = checkRowData($, "second");
            const secondRow = [
                "Oct 17, 70 4:24:23 PM", 
                "Developing", 
                "300.54545454545456", 
                "2422791762"
            ];
            expect(value).toEqual(secondRow);
        });

        it("Total Rows", () => {
            const noOfRows = totalRows($);
            expect(noOfRows).toBe(3);
        });

        it("Select Column DropDown", () => {
            const cheerioNew = cheerio.load(selectColumn.find('.select-column').html());
            const dropDownText = cheerioNew('.select-column').text();
            expect(dropDownText).toEqual("Select Columns");
        });
    });
});
