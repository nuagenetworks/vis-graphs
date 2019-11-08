import * as d3 from 'd3'
import timeAbbreviations from '../../helpers/constants';

export default ({
    interval,
    timeScale
  }) => {

    const step = +interval.substr(0, interval.length - 1);
    
      // TODO handle case of 'ms'
      const abbreviation = interval.substr(interval.length - 1);
      const d3Interval = timeAbbreviations[abbreviation];
    
      // TODO validation and error handling
      const start = new Date(2000, 0, 0, 0, 0);
      const end = d3[d3Interval].offset(start, step);
    
      return timeScale(end) - timeScale(start);

}
