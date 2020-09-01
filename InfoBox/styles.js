import { theme } from "../theme";

const style = {
    modal: {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            minWidth: "400px",
            minHeight: "50px",
            transform: 'translate(-50%, -50%)',
            border: '1px solid rgb(167, 162, 162)',
            boxShadow: '5px 5px 2px rgb(167, 162, 162, .7)'
        },
        overlay: {zIndex: 1000}
    },
    container: {
        padding: '25px',
        color: '#000',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        height: '40px',
        textAlign: 'center',
        width: '100%',
    },
    button: {
        background: theme.palette.greyDarkColor,
        label: theme.palette.greyLightColor
    }
}

export default style;
