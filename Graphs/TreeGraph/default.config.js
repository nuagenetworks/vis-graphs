import {
    theme
} from "../../theme"

export const properties = {
    linksSettings: {
        stroke: {
            "defaultColor": "lightsteelblue",
            "selectedColor": "#0e15ec",
            "width": "1px"
        }
    },
    colors: [
        theme.palette.greenColor,
        theme.palette.mauveColor,
        theme.palette.yellowDarkColor,
        theme.palette.blueLightColor,
        theme.palette.pinkLightColor,
        theme.palette.redBlindColor,
        theme.palette.peach,
        theme.palette.darkCyan,
        theme.palette.lightBrown,
        theme.palette.orangeLighterColor,
        theme.palette.blueviolet,
        theme.palette.aquaLightColor,
        theme.palette.yellowLightColor,
        theme.palette.greenDarkerColor,
        theme.palette.redLightColor,
        theme.palette.orangeLightColor,
    ],
    "transition": {
        "duration": 750
    },
    rectNode: {
        selectedBackground: "#58A2FF",
        defaultBackground: "#D9D9D9",
        selectedTextColor: "#F9F8FF",
        defaultTextColor: "#020202",
        stroke: {
            selectedColor: "#666",
            defaultColor: "rgba(60, 57, 57, 0.37)",
            width: "1px"
        },
        width: 120,
        height: 45,
        textMargin: 5,
        attributesToShow: {
            enterprises: {
                'name': true,
                'description': true
            },
            domain: {
                'name': true,
                'description': true
            },
            l2domain: {
                'name': true,
                'description': true
            },
            zone: {
                'name': true,
                'description': true
            },
            subnet: {
                'name': true,
                'description': false,
                'address': true
            },
            vport: {
                'name': true,
                'description': true
            },
            vminterface: {
                'name': true,
                'description': true
            },
            default: {
                'name': true,
                'description': true
            }
        }
    },
    margin: {
        top: -80,
        right: 90,
        bottom: 30,
        left: 90
    },
    transformAttr: {
        translate: [30, -80],
        scale: []
    },
    pagination: {
        "paginationIconColor": "#58A2FF",
        "max": 3
    },
    "maximumNodesToShowOnPage": 15,
    "selectedNodesInfo": {
        "fontColor" :"black",
        "stroke": "#0e15ec",
        "width": "1px"
    }
}