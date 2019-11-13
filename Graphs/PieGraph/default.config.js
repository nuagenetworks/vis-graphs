import { theme } from "../../theme";

export const properties = {
    pieInnerRadius: 0,      // The inner radius of the slices. Make this non-zero for a Donut Chart.
    pieOuterRadius: 0.8,    // The outer radius of the slices.
    pieLabelRadius: 0.85,   // The radius for positioning labels.
    stroke: {
        color: theme.palette.whiteColor,
        width: "3px"
    },
    labelCount: 5
}
