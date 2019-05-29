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
        theme.palette.redLightColor,
        theme.palette.greenLightColor,
        theme.palette.greyLightDarkColor,
        theme.palette.peach,
        theme.palette.aquaLightColor,
        theme.palette.windowBodyColor,
        theme.palette.orangeBlindColor,
        theme.palette.greenBlindColor,
    ],
    colors: [
        theme.palette.blueColor,
        theme.palette.pinkColor,
        theme.palette.orangeColor,
        theme.palette.greenColor,
        theme.palette.mauveColor,
        theme.palette.redColor,
        theme.palette.yellowColor,
        theme.palette.limePieColor,
        theme.palette.sweetPinkColor,
        theme.palette.yellowDarkColor,
        theme.palette.greyColor,
        theme.palette.paarlColor,
        theme.palette.darkCyan,
        theme.palette.greenDarkColor,
        theme.palette.flushOrangeColor,
        theme.palette.javaColor,
        theme.palette.lavenderGrayColor,
        theme.palette.wisteriaVioletColor,
        theme.palette.regentBlueColor,
        theme.palette.greyDarkColor,
        theme.palette.matisseColor,
        theme.palette.sweetPinkColor,
        theme.palette.redBlindColor,
        theme.palette.spicyMixColor,


    ],
    zeroStart: true,
    yRangePadding: true,
    legendArea: 0.20,
}
