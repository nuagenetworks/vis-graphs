 import { theme } from "../../theme";

const tableStyle = {
    defaultFontsize: 10,
    table: {
        width: "inherit",
        minWidth: "100%"
    },
    body: {
        overflowY: "auto",
        overflowX: "auto"
    },
    headerColumn: {
        fontSize: "12px", 
        padding: "0px",
        paddingLeft: "2px",
        height: "32px"
    },
    row: {
        height: "32px"
    },
    rowColumn: {
        fontSize: "12px",
        padding: "0px",
        padingLeft: "2px", 
        height: "32px"
    },
    footerToolbar: {
        height: "32px"
    },

    button: {
        design: {
            margin: '10px',
            float: 'right',
            height: '28px',
            minWidth: '60px',
            padding: '0',
            background: theme.palette.greyLightColor
        },
        background: theme.palette.greyLightColor,
        icon: {
            color: theme.palette.blackLightColor
        },
        labelStyle: {
            fontWeight: 700
        }
    }
  }
  
  export default tableStyle;