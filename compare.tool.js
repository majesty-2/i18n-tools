const fs = require('fs');
const crypto = require('crypto');
const CH_PATH = "./projects/frame/locale/messages.xlf";
const EN_PATH = "./projects/frame/locale/messages.en.xlf";
const SECRET = 'd6F3Efeq';
const ALGORITHM = 'aes-256-ctr';
const encoding = 'hex';

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

const readContextGroupTags = (transUnit) => {
    const reg = /[\s]*<context-group[\s\S]*?>[\s\S]*?(<\/context-group>)/mg;
    return transUnit.match(reg);
}

// const cryptoContextGroup = (tag) => crypto.createHash('md5').update(tag).digest('hex');

const cryptoCreateCipher = (tag) => {
    const cipher = crypto.createCipher(ALGORITHM, SECRET)
    let crypted = cipher.update(tag,"utf8",encoding)
    crypted += cipher.final('hex');
    return crypted;
}

const cryptoCreateDecipher = (tag) => {
    const decipher = crypto.createDecipher(ALGORITHM, SECRET)
    let dec = decipher.update(tag, encoding, "utf8")
    dec += decipher.final('utf8');
    return dec;
}

const mergeContextGroups = (zhTransUnit, enTransUnit) => {
    let zhGroupTags = readContextGroupTags(zhTransUnit);
    let enGroupTags = readContextGroupTags(enTransUnit);
    zhGroupTags = zhGroupTags.map(tag => {
        return cryptoCreateCipher(tag);
    });
    enGroupTags = enGroupTags.map(tag => {
        return cryptoCreateCipher(tag);
    });
    let resultContextGroups = [...zhGroupTags];
    enGroupTags.forEach(code => zhGroupTags.includes(code) ? null : resultContextGroups.push(code));
    resultContextGroups = resultContextGroups.map(code => cryptoCreateDecipher(code));
    return resultContextGroups;
}

const generateTransUnitTagAfterMergeContextGroup = (transUnit, mergeContextGroup) => {
    const reg = /<context-group[\s\S]*>[\s\S]*<\/context-group.*>/mg;
    return transUnit.replace(transUnit.match(reg), mergeContextGroup.join('').replace(/^[\s\S]*/, ''));
}

const compareTwoFiles = (CH_PATH, EN_PATH) => {
    const chFileTransUnitTags = readFileTransUnitTags(CH_PATH);
    const enFileTransUnitTags = readFileTransUnitTags(EN_PATH);
    const chFileTransUnitTagInfo = generateTransUnitTagInfo(chFileTransUnitTags);
    const enFileTransUnitTagInfo = generateTransUnitTagInfo(enFileTransUnitTags);
    const resultFile = [];
    chFileTransUnitTagInfo.transUnitTagList.forEach(id => {
        if (enFileTransUnitTagInfo.transUnitTagList.includes(id)) {
            const enTransUnitTag = enFileTransUnitTagInfo.transUnitTagObj[id];
            const chTransUnitTag = chFileTransUnitTagInfo.transUnitTagObj[id];
            const transUnitTag = generateTransUnitTagAfterMergeContextGroup(enTransUnitTag, mergeContextGroups(chTransUnitTag, enTransUnitTag))
            resultFile.push(transUnitTag);
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
