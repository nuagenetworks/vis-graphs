import { DEFAULT_BARGRAPH_ORIENTATION } from '../../../constants';

export default ({ data, key, xColumn, yColumn, orientation }) => {
    const map = [];
    data.map((item) => {
        map.push({
            ...item,
            'xVal': item[xColumn],
            'yVal': item[yColumn]
        });
    });
    return {
        'uniqueKeys': DEFAULT_BARGRAPH_ORIENTATION === orientation ? ['yVal'] : ['xVal'],
        'parsedData': map,
    }
}
