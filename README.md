# How to use graphs
The use of the graphs module is to provide a module to quickly shows your data into graphs.

## Table of Contents
- [Requirement](#requirement)
- [Usage examples](#usage-example)
- [Configuration](#configuration)
  - [Common configuration](#common-configuration)
    - [Tooltips](#tooltips)
    - [Listeners](#listeners)
  - [Graph specific configuration](#graph-specific-configuration)
    - [Supported Graphs](#supported-graphs)
      - [BarGraph](#bargraph)
      - [LineGraph](#linegraph)
      - [PieGraph](#[piegraph)
      - [Table](#tablegraph)
      - [ChordGraph](#chordgraph)
      - [SimpleTextGraph](#simpletextgraph)
      - [VariationTextGraph](#variationtextgraph)
      - [HeatmpaGraph](#heatmapgraph)
      - [AreaGraph](#areagraph)
      - [GuageGraph](#guagegraph)
      - [Geomap] (#geomap)


## Requirement-
  - We must need the following libraries which are using in different graphs -
  ```javascript
    "react": "15.6.0",
    "react-dom": "15.6.0",
    "d3": "4.10.0",
    "eval-expression": "^1.0.0",
    "lodash": "^4.17.4",
    "material-ui": "^0.16.7",
    "material-ui-datatables": "0.18.2",
    "material-ui-superselectfield": "^1.9.8",
    "react-copy-to-clipboard": "^4.3.1",
    "react-filter-box": "^2.0.0",
    "react-fontawesome": "1.3.1",
    "react-icons": "^2.2.7",
    "react-lightweight-tooltip": "0.0.4",
    "react-tap-event-plugin": "2.0.1",
    "react-tooltip": "^3.2.1",
    "object-path": "^0.11.4",
    "react-google-maps": "^9.4.5",
    "prop-types": "^15.6.2",
    "react-csv": "1.0.8",
    "react-copy-to-clipboard": "^4.3.1",
    "react-modal": "^3.5.1",
```
## Usage examples
  - Make sure your current project must be a valid git project, if not then run the below command
`git init`
  - Now run the following command to download graph module into your specified path
```javascript
  git submodule add https://github.com/nuagenetworks/vis-graphs.git your-path
```

Here is an example how to use bar graph into your component -
```jsx
import React, {Component} from 'react';
import { GraphManager } from "path-to-your-graph-component/vis-graphs/Graphs/index";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import { theme } from "path-to-your-graph-component/vis-graphs/theme"
import injectTapEventPlugin from "react-tap-event-plugin";

injectTapEventPlugin();

const TABLE_DATA =  [
    {
        "L7Classification": "Proin",
        "Sum of MB": 10000
    },
    {
        "L7Classification": "Justo",
        "Sum of MB": 25000
    },
    ...
];

class Graph extends Component {

  handleClickEvent(datum) {
    //..handle click event
  }
  render() {
    // pass a graph name to getGraphComponent as a param to use that graph
    const GraphComponent = GraphManager.getGraphComponent('BarGraph')
    return (
        <MuiThemeProvider muiTheme={theme}>
            <GraphComponent
              data={data}
              data1={data1} // you may pass data from multiple source as well
              configuration={configuration} // configuration object
              width={width} // graph width (numeric)
              height={height} // graph height (numeric)
              onMarkClick={ this.handleClickEvent } // event listener
            />
        </MuiThemeProvider>
    );
  }
}
```

__Note:__
- Make sure you have to wrap graph component with `MuiThemeProvider` and pass graph's  `theme` to  `MuiThemeProvider` as a props
- Register `injectTapEventPlugin()` method before calling graph component to enable touch tap event on graphs

# Common configuration
Configuration is a little more complex as it has more options. But it is working the same way, so don't worry :)

Here is the list of common options:

__Tolltip__ - If you want to add tooltips on an existing configuration ? Update its configuration:
  - **column*** - attribute name to use to display the value
  - **label** - tooltip label. If not specified, column will be used.
  - **format** - [d3 format](https://github.com/d3/d3-format) style to display the column value

```javascript
{
    // ...
    "data": {
        // ...
        "tooltip": [
            { "column": "L7Classification", "label": "L7 Signature" },
            { "column": "Sum of MB", "format": ",.2s"}
        ]
    }
    // ...
}
```

![tooltip](https://cloud.githubusercontent.com/assets/1447243/21205464/492fbc8c-c211-11e6-94f4-e22e96299fcf.png)


> The example above will display will display a tooltip with 2 lines (See picture below)


__onMarkClick__ - Method used to handle click event

__brush__ - (Number) to enble brushing with pre selected bars.Currently support in bar graph and heatmap graph. E.g -
```javascript
"brush": 3,
"brushArea": 20
```
 - **brushArea** (Number) space in visualization where brush slider display (in percentage). Default is 20.
> You may see example in Heatmap and Bargraph section

__padding__

- **top** set top padding in pixels
- **bottom** set bottom padding in pixels
- **right** set right padding in pixels
- **left** set left padding in pixels


![textgraph 1](https://user-images.githubusercontent.com/26645756/38319372-44c0eb02-384f-11e8-8bdb-a524b9ecdd19.png)

> padding currently supported only for text graph

__margin*__
- **top** set top margin in pixels
- **bottom** set bottom margin in pixels
- **right** set right margin in pixels
- **left** set left margin in pixels

![margin-example](https://user-images.githubusercontent.com/26645756/38317307-63aaaa26-384a-11e8-8dc3-6d0fc9862961.png)

__colors__ - (array) List of colors to use to render the graph.

__yLabelLimit__ - (numeric) Limit the character of y-axis label. Above the defined limit, the substring of the label will be display followed by the "..." and full label will be show on mouseover. 

__appendCharLength__ - (numeric) The length of the appended dots after the label if yLabelLimit defined

 __stroke__
- **width** define stroke width
- **color** define stroke color

__legend__
- **show** `true` to display legend. `false` otherwise. Default is `false`
- **orientation** `vertical` or `horizontal` legend. Default is `vertical`
- **circleSize** size of a legend circle. Default is `4` pixels
- **labelOffset** space in pixel between the legend circle and its label. Default is `2`.

__filterOptions__ - Allows to set filters on the visualization. See dashboard configuration for more information as it is working the same way!

__dateHistogram__ - To enable date formatted scaling if any of x-axis or y-axis data contain date. Default is `false`

__x-axis__ __and__ __y-axis__ - (Supported Graphs - BarGraph, PieGraph, AreaGraph, HeatmapGraph, LineGraph)

- **xColumn** attribute name in your results to use for x-axis
- **xLabel** x-axis title
- **xTicks** number of ticks to use for x-axis
- **xTickFormat** [d3 format](https://github.com/d3/d3-format) style to display x-axis labels
- **xTickGrid** (boolean) If set to `true` then the complete grid will be drawn
- **xTickSizeInner** - If size is specified, sets the inner tick size to the specified value and returns the axis.
- **xTickSizeOuter** If size is specified, sets the outer tick size to the specified value and returns the axis.

- **yColumn*** attribute name in your results to use for y-axis
- **yLabel** y-axis title
- **yTicks** number of ticks to use on y-axis
- **yTickFormat** [d3 format](https://github.com/d3/d3-format) style to display y-axis labels
- **yTickGrid** (boolean) If set to `true` then the complete grid will be drawn
- **yTickSizeInner** If size is specified, sets the inner tick size to the specified value and returns the axis.
- **yTickSizeOuter** If size is specified, sets the outer tick size to the specified value and returns the axis.
# Graph specific configuration

## *BarGraph*
Display vertical or horizontal bar charts

>[See sample configuration and data file](https://github.com/nuagenetworks/vis-graphs/tree/master/sample/barGraph)

![horizontal-bar](https://cloud.githubusercontent.com/assets/1447243/21204889/568e166a-c20e-11e6-8c8e-5da32f5d9966.png)


__orientation__ -  Orientation of the graph. Default is `vertical`. Set to `horizontal` to have an horizontal bar chart.

__otherOptions__ - (object) For grouping a data in order to show in single bar after defined limit of bars. Grouping can either be define in percentage or number. Default is percentage. E.g - 
```javascript
  "otherOptions": {
        "label": "Others", //used to display name of bar
        "limit": 5, // afer a given limit grouping is enable
        "type": "number" // it can be percentage as well
    }
```
__stackColumn__ - Used to show stacked data in bars. E.g-
```javascript
  "stackColumn": "social"
```
![stacked](https://user-images.githubusercontent.com/26645756/36251630-d603b8a0-1267-11e8-8efe-502c1046c7a8.png)

__stackColumn__ (optional) To show stacked Bar Charts

__brush__ (number) To enble brushing with pre selected bars.Currently support in bar graph and heatmap graph. E.g -
```javascript
"brush": 3,
"brushArea": 20
```

![dynamicbargraph](https://user-images.githubusercontent.com/26645756/36250751-b6872a64-1264-11e8-961c-1cb895518fc0.png)

## *LineGraph*
Display one or multiple lines
>[See sample configuration and data file](https://github.com/nuagenetworks/vis-graphs/tree/master/sample/lineGraph)

![multiline-chart](https://cloud.githubusercontent.com/assets/1447243/21205460/4672e4a6-c211-11e6-88a5-269bc32d2140.png)

__linesColumn__ - attribute name in your results to display line value

__showNull__ - (Boolean) If false, Show truncated line if yValue is null . Default is true

__defaultY__ - (string | object) default yAxis value used to draw straight horizontal line to show cut off value. It can be object which define data `source` and `column` to get data from another query and you may define separate `tooltip` for this staright line from data `source`. Example -

```javascript
 {
     `"defaultY": {
         "source": "data2",
         "column": "memory",
         "tooltip": [
             { "column": "memory", "label": "memory"},
             { "column": "cpu", "label": "cpu"}
         ]
     }
 }
 ```

>See x-axis and y-axis sections in BarGraph for more information

## *PieGraph*
Display nice Pie or Donut graphs

>[See sample configuration and data file](https://github.com/nuagenetworks/vis-graphs/tree/master/sample/pieGraph)

![donut](https://cloud.githubusercontent.com/assets/1447243/21204886/5327c232-c20e-11e6-95ca-cdab285c749e.png)

__pieInnerRadius__ - Inner radius of the slices. Make this non-zero for a Donut Chart

__pieOuterRadius__ - Outer radius of the slices

__pieLabelRadius__ - Radius for positioning labels

__otherOptions__ - optional object
- **type** Value must be percentage or number, and default is percentage
- **limit** As per the type we can define the limit in percentage or slices respectively.
- **minimum** In case of percentage, if we want to override the mimium slices of 10.

## *Table*
This is used to show data in tabular form

>[See sample configuration and data file](https://github.com/nuagenetworks/vis-graphs/tree/master/sample/table)

![table](https://user-images.githubusercontent.com/26645756/36247796-5c2f9d8e-125b-11e8-9a52-3b3c35087159.png)

__selectable__ - To enable/disable selectable feature - Default is `true`

__multiSelectable__ - To enable/disable multi select feature - default is `false`

__showCheckboxes__ - To show checkboxes to select rows - default is `false`

__enableSelectAll__ - To enable/disable select all feature - Default is `true`

__matchingRowColumn__ - (string) Compare `matchingRowColumn` value with all available datas and if equal to selected row, then save all matched records in store under "matchedRows"

__selectColumnOption__ - (Boolean) To show columns selection dropdown set this value to `true` (default is `false`).
In Columns array set `display: false` to hide any column (default is true, i.e. column will display inside the table if `display` is missing or set to `true`).

__selectedColumns__ - (Array) Containing the list of labels for the columns to be displayed, if empty or not present then will be used the `display` key of the columns records. Must be applicable if `selectColumnOption` is set to `true` 

__onColumnSelection__ - (handler) Event to capture the list of selected columns and must be passed as props.

__highlight__ - (Array of columns) Highlighted the rows if value of columns is not null

__hidePagination__ - Hide paging and search bar if data size is less than pagination limit - Default is `true`

__border__
- **top** set top border. Default is `solid 1px #ccc`
- **bottom** set bottom border. Default is `0`
- **right** set right border. Default is `0`
- **left** set left border. Default is `0`

__header__ - header specific parameters includes

__fontColor__ - Color of the header text

__columns__ - (Array) Array of columns display in the table. Example -

  ```javascript
  "columns":
    [
        { "column": "type", "label": " ", "colors" : {
            "OTHER": "green",
            "DENY": "red"
            },
            "sort": false, // to disable sorting on column
            "filter": false // hide column from search bar to filter data
        },
        { "column": "protocol", "label": "Proto", "selection": true  } // set `selection: true` to enable autocompleter for values of `protocol` column in search bar and must be string only.
        { "column": "sourceip", "label": "SIP" },
        { "column": "subnetName", "label": "Subnet", "totalCharacters":    16, "tooltip" : {"column": "nuage_metadata.subnetName"} }
    ]
```
__tabifyOptions__ - Converting the provided array indexes to comma separated values, instead of generating the multiple rows (avoiding possible duplicates). E.g -

```javascript
"tabifyOptions": {
    "concatenationFields": [
        {
            "path": "nuage_metadata.src-pgmem-info",
            "field": "name",
            "method": "(obj) => `${obj.name} (${obj.category})`"
        },
        {
            "path": "nuage_metadata.dst-pgmem-info",
            "field": "category"
        }
    ]
}
```

In above example, if a value of the column show via colors then add colors property in object and mentioned all values as a key and color as a value in order to replace color from value. Note: Add label property with space to declare empty column in the table. E.g -

![table-status-with-color](https://user-images.githubusercontent.com/26645756/37336742-4d9023fc-26d8-11e8-80c9-1c14100bf85b.png)


## *ChordGraph*

This graph visualises the inter-relationships between entities and compare similarities between them

>[See sample configuration and data file](https://github.com/nuagenetworks/vis-graphs/tree/master/sample/chordGraph)

![chordgraph](https://user-images.githubusercontent.com/26645756/36247609-a16c30de-125a-11e8-972a-56ebe41b4ca0.png)

__outerPadding__ -  Padding from container. Default is `30`

__arcThickness__ - Outer arc thickness. Default is `20`

__padAngle__ - Padding between arcs. Default is `0.07`

__labelPadding__ - Padding of the labels from arcs. Default is `10`

__transitionDuration__ - Duration of animation. Default is `500`

__defaultOpacity__ -  Default opacity. Default is `0.6`

__fadedOpacity__ - Hovered opacity. Default is `0.1`

## *SimpleTextGraph*
This graph allows you to display a simple text information.

>[See sample configuration and data file](https://github.com/nuagenetworks/vis-graphs/tree/master/sample/simpleTextGraph)

![textgraph](https://user-images.githubusercontent.com/26645756/36247536-666ad710-125a-11e8-937b-f110f812b5a0.png)

__targetedColumn__ - Name of the attribute to use to display the value. If not specified, this graph will display the length of the result

__titlePosition__ - Position title on `top` or at the `bottom` of the graph

__textAlign__ - Align text on `left`, `center` or `right`. Default is `center`

__fontSize__ - Font size

__fontColor__ - Font color

__borderRadius__ - Set a radius if you want to display your text in a square or rounded area. Default is `50%`

__innerWidth__ - Define the percentage of the width for the area. `1` means 100% of the width. Default is `0.3`

__innerHeight__ - Define the percentage of the height for the area. `1` means 100% of the width. Default is `0.4`

## *VariationTextGraph*
This graph shows a value and its variation from the previous one.

>[See sample configuration and data file](https://github.com/nuagenetworks/vis-graphs/tree/master/sample/variationTextGraph)

![variationtextgraph](https://user-images.githubusercontent.com/26645756/36247500-454d43c4-125a-11e8-81f9-26f5edb42271.png)

__drawColor__ - Color in case there is no variation

__negativeColor__ - Color in case the variation is lower than 0

__positiveColor__ - Color in case the variation is geater than 0

__textAlign__ - Align text on `left`, `center` or `right`. Default is `center`

__fontSize__ - Font size

__fontColor__ - Font color

## *HeatmapGraph*
This graph shows a value of a column at given timestamp.
It is a graphical representation of data where the individual values contained in a matrix are represented as colors

>[See sample configuration and data file](https://github.com/nuagenetworks/vis-graphs/tree/master/sample/heatmapGraph)

![heatmap](https://user-images.githubusercontent.com/14901092/36245661-200c8ae6-1252-11e8-8d5c-5cdf63cad97e.png)

__selectedData__: Selected data, normally returned by onMarkClick event after clicking on the cell, and will be used to highlight the cell for selected data.

__legendColumn__ - Used to display matrix

__xAlign__ - (boolean) If true then align x-axis label to the left position , default align is middle

__heatmapColor__ - (object) Used to define the color of the matrix of given `legendColumn` value. E.g -
```javascript
`"heatmapColor": {
    "InSla": "#b3d645"
}`
```

## *AreaGraph*
This graph displays graphically quantitative data. The area between axis and line are commonly emphasized with colors, textures and hatchings. Commonly one compares with an area chart two or more quantities.

>[See sample configuration and data file](https://github.com/nuagenetworks/vis-graphs/tree/master/sample/areaGraph)

![AreaGraph](https://user-images.githubusercontent.com/26645756/36246339-536c5404-1255-11e8-9776-e4314a9fb07e.png)

__linesColumn__ (Object) Its value is used to display area in graph
```javascript
"linesColumn": [
    {
        "key": "CPU"
    },
    {
        "key": "MEMORY"
    },
    {
        "key": "DISK",
        "value": "DISK"
    }
]
```
__stacked__ - (boolean) Whether area shown as stacked or not. Default is false.

## *GuageGraph*
Display a needle or dial to indicate where your data point(s) falls over a particular range

>[See sample configuration and data file](https://github.com/nuagenetworks/vis-graphs/tree/master/sample/guageGraph)

![guagegraph](https://user-images.githubusercontent.com/26645756/36246894-d348b9ae-1257-11e8-94b1-44016460da17.png)

__maxValue__ - Maximum value to draw speddometer

__currentColumn__ - Column used to show needle value

__gauzeTicks__ - Number of ticks on speedometer

## *Geomap*
Display a cluster markers on map to show data

>[See sample configuration and data file](https://github.com/nuagenetworks/vis-graphs/tree/master/sample/guageGraph)

![geomap](https://user-images.githubusercontent.com/26645756/42522636-3da71248-8489-11e8-9987-dfb640f0f085.png)

__latitudeColumn__ - Latitude of the marker

__longitudeColumn__ - Longitude of the marker

__nameColumn__ - name displayed on marker infowindow

__localityColumn__ - Locality displayed on marker infowindow

__idColumn__ - id to uniquely identified each marker

__links__ - (Object) to show connected lines beetween markers. For e.g.

```javascript

"links": {
    "source": "data1", // data source
    "sourceColumn": "source", // source column id(equivalent to idColumn)
    "destinationColumn": "destination" // destination column id(equivalent to idColumn)
}

```
__filters__ - List down columns in search bar

```javascript

"filters": [
            {
                "columnText": "name",
                "columField": "nsgatewayName",
                "type": "text"
            },
            {
                "columField": "status",
                "type": "selection" // for `selection`, value of status field should be string
            }

        ]

```

__markerIcon__ - (Object || string) to show markers icon. List of all the icons are defined in the Icon Helper files. Please add the icon over there before using the "key" over here like: nsGateway, icon1, icon2 and so on
. For e.g.

```javascript

"markerIcon": "nsgGateway"

or

"markerIcon": {
    "default": "default-icon", // optional
    "defaultUrgency": "GREEN", // optional
    "criteria": [
        {
            "icon": "icon1",
            "fields": {
                "nsg.status": "deactivated"
            },
            "urgency": "GRAY" // Either of "GREY", "RED", "YELLOW", "BLUE", as per criticaliy.
        },
        {
            "icon": "icon2",
            "fields": {
                "nsg.status": "activated",
                "nsg.signal": "yellow"
            }
        }
    ]
}

```


## *TreeGraph*
This graph displays nested hierarchical data. It is used to show the relation between parent node and child nodes using a horizonal tree based layout.

>[See sample data file](https://github.com/nuagenetworks/vis-graphs/tree/master/sample/treeGraph)

![TreeGraph](https://user-images.githubusercontent.com/31058528/47505647-26a26c80-d88c-11e8-8306-1529702b0633.png)

__data__ (Array of object) Nested hierarchical data passed into map to show tree view.

__onClickChild__ (Function) Function that is called when any node is clicked. It is called with one argument, the node which was clicked. Typically it is used to fetch data from server and update the children of the node in tree data.

```javascript
const clickChild = (child) => {
  const { name, children } = child;
  // do something
}
```

```html
<TreeGraph onClickChild={clickChild} />
```

__width__ (Integer) Width of treemap area.

__height__ (Integer) Height of treemap area.