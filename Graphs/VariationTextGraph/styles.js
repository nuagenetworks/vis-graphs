const infoBoxTextNoVariation = {
    borderRadius: "2px 0 0 2px",
    display: "flex",
    height: "100%",
    fontWeight: "bold",
    fontSize: "1.2em",
    alignItems: "center",
    textAlign: "center"
}

const style = {
    infoBoxIcon: {
        float: "left",
        height: "100%",
        width: "40%",
        textAlign: "center",
        background: "rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        fontSize: "2em"
    },

    infoBoxTextNoVariation,

    infoBoxText: {
        ...infoBoxTextNoVariation,
        float: "right",
        width: "60%",
    },
    
    labelText: {
        textAlign: "center",
        fontWeight: "bold",
        marginTop: "2px",
        fontSize: "0.5em"
    },

    iconFont: {
        color: "#fff",
        margin : "auto"
    },

    fullScreenLargeFont: {
        fontSize: "4vw"
    },

    fullScreenLargerFont: {
        fontSize: "8vw"
    }
};

export default style;
