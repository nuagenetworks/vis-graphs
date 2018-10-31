import React from 'react';
import { mount } from 'enzyme';
import ReactDOM from 'react-dom';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import { getDataAndConfig, getHtml, totalRows, checkRowData, totalColumn } from '../testHelper';
import Table from '.';

const cheerio = require('cheerio');

describe("Table", () => {
    let config;
    beforeAll(async () => {
        config = await getDataAndConfig('Table');
        global.document.body.createTextRange = () => {
            return {
                setEnd: () => { },
                setStart: () => { },
                getBoundingClientRect: () => { },
                getClientRects: () => []
            }
        }
    });

    describe("hidePagination", () => {
        let hidePagination, $, page;
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
            page = cheerio.load(hidePagination.html());
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
            expect(noOfRows).toBe(100);
        });

        it("Pagination Text", () => {
            const text = page('table').parent().parent().next().find('div').first().text();
            expect(text).toEqual("");
        });

        it("Pagination Previous", () => {
            const prev = page('table').parent().parent().next().find('button').attr('disabled');
            expect(prev).toEqual(undefined);
        })

        it("Pagination Next", () => {
            const next = page('table').parent().parent().next().find('button').next().attr('disabled');
            expect(next).toEqual(undefined);
        })
    });

    describe("Hide SearchBar", () => {
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
            expect(noOfRows).toBe(100);
        });

        it("SearchBar Text", () => {
            const search = $('.search-label').text();
            expect(search).toEqual('');
        });

        it("SearchBar", () => {
            const searchBarAndButton = $('.filter').children().length;
            expect(searchBarAndButton).toEqual(0);
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
            expect(noOfRows).toBe(100);
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
            expect(noOfRows).toBe(100);
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
            setTimeout(() => {
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
            expect(noOfRows).toBe(12);
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
            setTimeout(() => {
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
            expect(noOfRows).toBe(12);
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
            setTimeout(() => {
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
            expect(noOfRows).toBe(24);
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
            setTimeout(() => {
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
            expect(noOfRows).toBe(100);
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
            expect(noOfRows).toBe(100);
        });

        it("Select Column DropDown", () => {
            const cheerioNew = cheerio.load(selectColumn.find('.select-column').html());
            const dropDownText = cheerioNew('.select-column').text();
            expect(dropDownText).toEqual("Select Columns");
        });
    });

    describe("toolTip", () => {
        let toolTip, $;
        beforeAll(async () => {
            toolTip = mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.toolTip}
                    data={config.data}>
                </Table>
            );
            $ = getHtml(toolTip, 'table');
        });

        it("Total Column", () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(4);
        });

        it("Column Names", () => {
            var columnList = toolTip.root.props().configuration.data.columns;
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
                "Testin...",
                "200.54545454545456",
                "2422791762"
            ];
            expect(value).toEqual(firstRow);
        });

        it("Second Row Data", () => {
            const value = checkRowData($, "second");
            const secondRow = [
                "Oct 17, 70 4:24:23 PM",
                "Develo...",
                "300.54545454545456",
                "2422791762"
            ];
            expect(value).toEqual(secondRow);
        });

        it("Total Rows", () => {
            const noOfRows = totalRows($);
            expect(noOfRows).toBe(100);
        });
    });

    describe("pagination", () => {
        let pagination, $, page;
        beforeAll(async () => {
            pagination = mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.pagination}
                    data={config.data}>
                </Table>
            );
            $ = getHtml(pagination, 'table');
            page = cheerio.load(pagination.html());
        });

        it("Total Column", () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(4);
        });

        it("Column Names", () => {
            var columnList = config.pagination.data.columns
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
            expect(noOfRows).toBe(100);
        });

        it("Pagination Text", () => {
            const text = page('table').parent().parent().next().find('div').first().text();
            expect(text).toEqual("1 - 100 of 144");
        });

        it("Pagination Previous", () => {
            const prev = page('table').parent().parent().next().find('button').attr('disabled');
            expect(prev).toEqual("disabled");
        })

        it("Pagination Next", () => {
            const next = page('table').parent().parent().next().find('button').next().attr('disabled');
            expect(next).toEqual(undefined);
        })
    });

    describe("Click Event", () => {
        let table;
        const mockCallBack = jest.fn();
        const handleRowSelection = jest.fn();
        const element = document.createElement("div");
        beforeAll((done) => {
            document.body.appendChild(element);
            table = ReactDOM.render(
                <Table
                    width={500}
                    height={500}
                    configuration={config.pagination}
                    data={config.data}
                    onRowSelection={handleRowSelection}
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

        it("Click On Table", (done) => {
            element.querySelector('td').click();
            setTimeout(() => {
                done();
                expect(handleRowSelection).toHaveBeenCalled();
                expect(mockCallBack).toHaveBeenCalled();
            }, 1000);
        });
    });
});
