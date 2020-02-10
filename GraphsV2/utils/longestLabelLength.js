export default (data, label, formatter) => {

    // Basic function if none provided
    if (!label)
        label = (d) => d;

    let format = (d) => d;

    if (formatter)
        format = format(formatter);

    // Extract the longest legend according to the label function
    const lab = label(data.reduce((a, b) => {
        let labelA = label(a);
        let labelB = label(b);

        if (!labelA)
            return b;

        if (!labelB)
            return a;

        return format(labelA.toString()).length > format(labelB.toString()).length ? a : b;
    }));

    const longestLabel = lab ? lab.toString() : '';
    let labelSize = format(longestLabel).length

    // and return its length + 2 to ensure we have enough space
    return labelSize > 8 ? labelSize : labelSize + 2
}
