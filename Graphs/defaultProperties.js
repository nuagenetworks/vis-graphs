import { theme } from "../theme"

export default {
    loadSpeed: 300,
    margin: { top: 10, bottom: 10, left: 10, right: 10 },
    padding: 0.1,
    yTickGrid: true,
    yTickFontSize: 12,
    yTickSizeInner: 6,
    yTickSizeOuter: 0,
    yLabel: false,
    xColumnLabelPosition: 17,
    yLabelSize: 14,
    xTickGrid: false,
    xTickFontSize: 12,
    xTickSizeInner: 6,
    xTickSizeOuter: 0,
    xLabel: false,
    yColumnLabelPosition: 5,
    yAxisPadding: 2,
    xLabelSize: 14,
    dateHistogram: false,
    interval: "30s",
    otherMinimumLimit: 10,
    colors: [theme.palette.blueColor],
    fontColor: theme.palette.blackColor,
    fontSize: "1em",
    stroke: {
        color: theme.palette.whiteColor,
        width: "1px"
    },
    chartWidthToPixel: 6,           // Default value to convert a character's width into pixel
    chartHeightToPixel: 14,         // Default value to convert a character's height into pixel
    circleToPixel: 3,               // Default value to convert the circle to pixel
    legend: {
        show: true,                 // Show or not the legend style
        orientation: 'vertical',    // Orientation between 'vertical' and 'horizontal'
        circleSize: 4,              // Size in pixel of the circle
        labelOffset: 2,             // Space in pixels between the circle and the label
        separate: 20,
    },
    labelFontSize: 10,
    labelLimit: 10,
    yLabelLimit: 20,
    xLabelLimit: 10,
    xLabelRotate: true,
    xLabelRotateHeight: 35,
    appendCharLength: 3,
    brushArea: 20, // // in percentage
    otherColors: [
        theme.palette.bluePaleColor,
        theme.palette.orangeLightColor,
        theme.palette.blueLightColor,
        theme.palette.pinkLightColor,
        theme.palette.orangeLighterColor,
        theme.palette.blackLightColor,
        theme.palette.greenLightColor,
        theme.palette.greyLightDarkColor,
        theme.palette.blueviolet,
        theme.palette.darkCyan,
        theme.palette.peach,
        theme.palette.aquaLightColor,
        theme.palette.windowBodyColor,
        theme.palette.orangeBlindColor,
        theme.palette.mauveColor,
    ],
    zeroStart: true,
    yRangePadding: true,
}
