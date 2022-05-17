import { theme } from "../../theme"

export const properties = {
    stroke: {
        color: "grey",
        width: "0.5px"
    },
    legend: {
        show: false
    },
    emptyBoxColor: theme.palette.greyLightColor,
    brushArea: 5,
    brushColor: theme.palette.yellowLightColor,
    margin: { top: 5, bottom: 5, left: 10, right: 10 },
    yLabelLimit: 12,
}
