import PropTypes from 'prop-types';
import React from 'react'
import WithConfigHOC from '../../HOC/WithConfigHOC';
import { properties } from "./default.config";
import { Column, Table, InfiniteLoader, AutoSizer } from 'react-virtualized';
import 'react-virtualized/styles.css';
import get from 'lodash/get';
import { events } from '../../utils/types';

const TableGraph = (props) => {
    const {
        width,
        height,
        properties,
        data,
    } = props;

    const getColumns = () => (properties.columns || []);

    const getHeaderData = () => {
        const { ESColumns } = props;
        let columnKeys = new Map();
        if (ESColumns) {
            ESColumns.forEach(item => {
                columnKeys.set(item.key, true);
            });
        }
        const columns = getColumns()
        const headerData = [];
        for (let index in columns) {
            if (columns.hasOwnProperty(index)) {
                const columnRow = columns[index];
                const headerColumn = {
                    name: index,
                    label: columnRow.label || columnRow.column,
                    columnField: columnRow.column,
                    columnText: columnRow.selection ? "" : (columnRow.label || columnRow.column),
                    filter: columnRow.filter !== false,
                    type: columnRow.selection ? "selection" : "text",
                    style: {
                        textIndent: '2px'
                    }
                };
                headerData.push(headerColumn);
            }
        }
        return headerData
    }

    const columnsDetail = () => {
        const columns = getHeaderData();
        return columns.map(column => <Column label={column.label} dataKey={(column.columnField)} cellDataGetter={({ dataKey, rowData }) => get(rowData, dataKey)} width={200} />);
    }

    const onScroll = () => {
        props.updateScroll({ currentPage: 10, event: events.PAGING })
    }

    return (
        <InfiniteLoader
            isRowLoaded={({ index }) => !!data[index]}
            loadMoreRows={onScroll}
            rowCount={10000000}
        >
            {({ onRowsRendered, registerChild }) => (
                <AutoSizer>
                    {({ width }) => (
                        <Table
                            ref={registerChild}
                            onRowsRendered={onRowsRendered}
                            width={width + 3500}
                            height={height}
                            headerHeight={20}
                            rowHeight={20}
                            rowCount={data.length}
                            rowGetter={({ index }) => data[index]}
                            isRowLoaded={({ index }) => data[index]}
                        >
                            {columnsDetail()}
                        </Table>
                    )}
                </AutoSizer>
            )}
        </InfiniteLoader>
    );
}

TableGraph.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
};

export default WithConfigHOC(properties)(TableGraph);