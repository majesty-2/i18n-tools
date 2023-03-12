const fs = require('fs');
const CH_PATH = "./messages.xlf";
const EN_PATH = "./messages.en.xlf";

const readFileTransUnitTags = (dir) => {
    const file = fs.readFileSync(dir, 'utf-8');
    const reg = /[\s]*<trans-unit[\s\S]*?>[\s\S]*?(<\/trans-unit>)/mg;
    return file.match(reg);
}

const generateTransUnitTagInfo = (transUnitTags) => {
    const transUnitTagInfo = {
        transUnitTagObj: {},
        transUnitTagList: [],
    }
    transUnitTags.forEach(item => {
        const id = generateTransUnitTagIds(item);
        transUnitTagInfo.transUnitTagList.push(id);
        transUnitTagInfo.transUnitTagObj[id] = item;
    })
    return transUnitTagInfo;
}

const generateTransUnitTagIds = (transUnitTag) => {
    const start = transUnitTag.indexOf('id="') + 4;
    const end = transUnitTag.indexOf('"', start);
    return transUnitTag.substring(start, end);
}

const compareTwoFiles = (CH_PATH, EN_PATH) => {
    const chFileTransUnitTags = readFileTransUnitTags(CH_PATH);
    const enFileTransUnitTags = readFileTransUnitTags(EN_PATH);
    const chFileTransUnitTagInfo = generateTransUnitTagInfo(chFileTransUnitTags);
    const enFileTransUnitTagInfo = generateTransUnitTagInfo(enFileTransUnitTags);
    const resultFile = [];
    chFileTransUnitTagInfo.transUnitTagList.forEach(id => {
        if (enFileTransUnitTagInfo.transUnitTagList.includes(id)) {
            resultFile.push(enFileTransUnitTagInfo.transUnitTagObj[id]);
        } else {
            resultFile.push(chFileTransUnitTagInfo.transUnitTagObj[id]);
        }
    })
    return resultFile.join("");
}

const generateResultFile = (CH_PATH, EN_PATH) => {
    const start = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="1.2" xmlns="urn:oasis:names:tc:xliff:document:1.2">
    <file source-language="zh-CN" datatype="plaintext" original="ng2.template">
        <body>`;
    const end = `
        </body>
    </file>
</xliff>`;
    return `${start}${compareTwoFiles(CH_PATH, EN_PATH)}${end}`;

}

const targetFile = generateResultFile(CH_PATH, EN_PATH);
console.log(targetFile);