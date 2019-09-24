 import { theme } from "../../theme";

const tableStyle = {
    defaultFontsize: 10,
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
    },
    muiStyling: {
        MUIDataTableHeadCell: {
            fixedHeader: {
                zIndex: '9999'
            }
        },
        MuiTableRow: {
            root: {
                '&$selected': {
                    backgroundColor: '#d9d9d9'
                }
            },
            footer: {
                height: "40px",
            }
        },
        MuiTableCell: {
            head: {
                fontSize: '11px',
            },
            body: {
                fontSize: '10px',
                fontWeight: '350',
            },
            root: {
                padding: '0px 40px 0px 15px',
            }
        },
        MuiPopover: {
            paper: {
                maxHeight: '300px'
            }
        },
        MuiIconButton: {
            root: {
                '&:hover': {
                    backgroundColor: 'rgb(255, 255, 255)'
                }
            }
        },
        MuiTableFooter: {
            root: {
                borderTop: "1px solid #e0e0e0",
            }
        },
        MuiTablePagination: {
            toolbar: {
                height: "40px",
                minHeight: "40px",
            }
        }
    }
  }
  
  export default tableStyle;