const fs = require('fs');
const translateJson = require('./translate');
const PATH = "./messages.en.target.xlf";
const OPEN_SOURCE_TAG = "<source>";
const CLOSE_SOURCE_TAG = "</source>";
const OPEN_TARGET_TAG = "<target>";
const CLOSE_TARGET_TAG = "</target>";

const readFileLines = (dir) => {
    const file = fs.readFileSync(dir, 'utf-8');
    return file.split(/\r?\n/);
}

const judgeSourceTag = (line) => {
    return line.trim().startsWith(OPEN_SOURCE_TAG) && line.endsWith(CLOSE_SOURCE_TAG);
}

const  judgeXTag = (line) => {
    const reg = /<x[\s\S]*?\/>/mg;
    const matchXTags = line.match(reg);
    if (matchXTags != null) {
        return true;
    }
}

const judgeXTagLessThanOne = (line) => {
    if (judgeXTag(line)) {
        const reg = /<x[\s\S]*?\/>/mg;
        const matchXTags = line.match(reg);
        return matchXTags.length <= 1;
    }
    return true;
}

const readXTag = (line) => {
    const reg = /<x[\s\S]*?\/>/mg;
    const matchXTags = line.match(reg);
    return matchXTags[0];
}

const removeSourceTag = (line) => {
    const start = line.indexOf(OPEN_SOURCE_TAG);
    const end = line.indexOf(CLOSE_SOURCE_TAG);
    return line.substring(start + OPEN_SOURCE_TAG.length, end)
}

const readSourceTagValue = (line, xTag) => {
    const lineWithoutSourceTag = removeSourceTag(line);
    let strings = lineWithoutSourceTag;
    if (judgeXTag(lineWithoutSourceTag)) {
        strings = lineWithoutSourceTag.split(xTag);
        if (strings[0] === '') {
            strings[0] = xTag;
        } else {
            strings[1] = xTag;
        }
    }
    return strings;
}

const readSpaceLength = (line) => {
    return line.indexOf(OPEN_SOURCE_TAG);
}

const generateSpaceStr = (len) => {
    let str = "";
    while (len) {
        str += " ";
        len--;
    }
    return str;
}

const translateChinese = (value) => {
    return translateJson[value] || "";
}

const generateTargetTag = (space, value) => {
    return `${space}<target>${value}</target>`
}

const judgeTargetTag = (line) => {
    return line.trim().startsWith(OPEN_TARGET_TAG) && line.endsWith(CLOSE_TARGET_TAG);
}

const targetFileLines = [];
const fileLines = readFileLines(PATH);
for (let i = 0; i < fileLines.length; i++) {
    let currentLine = fileLines[i];
    let nextLine = fileLines[i+1];
    targetFileLines.push(currentLine);
    if (judgeSourceTag(currentLine) && !judgeTargetTag(nextLine) && judgeXTagLessThanOne(currentLine)) {
        let xTagValue = '';
        let value;
        const space = generateSpaceStr(readSpaceLength(currentLine));
        if (judgeXTag(currentLine)) {
            xTagValue = readXTag(currentLine);
            value = readSourceTagValue(currentLine, xTagValue);
            if (value[0] === xTagValue) {
                const translateValue = translateChinese(value[1]);
                translateValue ? targetFileLines.push(generateTargetTag(space, xTagValue + translateValue)) : null;
            } else {
                const translateValue = translateChinese(value[0]);
                translateValue ? targetFileLines.push(generateTargetTag(space, translateValue + xTagValue)) : null;
            }
        } else {
            value = readSourceTagValue(currentLine, xTagValue);
            const translateValue = translateChinese(value);
            translateValue ? targetFileLines.push(generateTargetTag(space, translateValue)) : null;
        }
    }
}

targetFileLines.forEach(line => {
    console.log(line);
})


