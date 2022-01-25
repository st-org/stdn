import * as ston from 'ston/dist/parse-with-index';
function objectToUnitWithIndexValue(object, index) {
    let tag = 'div';
    const children = {
        value: [],
        index,
        comment: ''
    };
    const options = {
        value: {},
        index,
        comment: ''
    };
    for (const key in object) {
        let valueWithIndex = object[key];
        if (valueWithIndex === undefined) {
            continue;
        }
        const { value, index, comment } = valueWithIndex;
        if (key === '__') {
            tag = 'katex';
            children.index = index;
            if (!Array.isArray(value)) {
                children.value = arrayToSTDNWithIndexValue([valueWithIndex], index);
                continue;
            }
            children.value = arrayToSTDNWithIndexValue(value, index);
            children.comment = comment;
            continue;
        }
        if (Array.isArray(value)) {
            tag = key;
            children.value = arrayToSTDNWithIndexValue(value, index);
            children.index = index;
            children.comment = comment;
            continue;
        }
        if (typeof value === 'object') {
            const { __ } = value;
            if (__ === undefined) {
                continue;
            }
            if (typeof __.value === 'string') {
                options.value[key] = {
                    value: arrayToSTDNWithIndexValue([{
                            value: {
                                __
                            },
                            index,
                            comment: ''
                        }], index),
                    index,
                    comment
                };
                continue;
            }
            if (!Array.isArray(__.value)) {
                options.value[key] = {
                    value: arrayToSTDNWithIndexValue([__], index),
                    index,
                    comment
                };
                continue;
            }
            options.value[key] = {
                value: arrayToSTDNWithIndexValue(__.value, index),
                index,
                comment
            };
            continue;
        }
        options.value[key] = {
            value,
            index,
            comment
        };
    }
    return {
        tag: {
            value: tag,
            index,
            comment: ''
        },
        options,
        children
    };
}
function arrayToLineWithIndexValue(array) {
    const out = [];
    for (const { value, index, comment } of array) {
        if (typeof value === 'string') {
            for (const char of value) {
                if (char >= ' ') {
                    out.push({
                        value: char,
                        index,
                        comment: ''
                    });
                }
            }
            continue;
        }
        if (typeof value === 'object' && !Array.isArray(value)) {
            out.push({
                value: objectToUnitWithIndexValue(value, index),
                index,
                comment
            });
        }
    }
    return out;
}
function arrayToSTDNWithIndexValue(array, index) {
    const out = [];
    for (const item of array) {
        if (!Array.isArray(item.value)) {
            out.push({
                value: arrayToLineWithIndexValue([item]),
                index: Math.max(index, 0),
                comment: ''
            });
            continue;
        }
        out.push({
            value: arrayToLineWithIndexValue(item.value),
            index: item.index,
            comment: item.comment
        });
    }
    return out;
}
export function parseWithIndex(string) {
    const result = ston.parseWithIndex(`[${string}]`, -1);
    if (result === undefined || !Array.isArray(result.value)) {
        return undefined;
    }
    return {
        value: arrayToSTDNWithIndexValue(result.value, result.index),
        index: 0,
        comment: result.comment
    };
}