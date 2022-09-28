export function ToStringScaleFormat(value) {
    let num = 3 * Math.sign(value);
    return (Math.abs(value) > 3) ? `${10 ** num}e${roundTo(value - num, 3)} м` : `${roundTo(10 ** value, 3)} м`;
}

export function ToStringCountFormat(value) {
    return value;
}

export function ToStringFrequencyFormat(value) {
    return `${value}`;
}

function roundTo(value, count) {
    return Math.round(value * 10 ** count) / 10 ** count;
}