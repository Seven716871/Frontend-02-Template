
const EOF = Symbol('EOF')

let currentToke = null
let currentAttribute = null
let stack = [{type: "document", children: []}]
function emit(token) {
    console.log(token)
    if (token.type === 'text') {
        return
    }

    let top = stack[stack.length - 1]
    if (token.type === 'startTag') {
        let element = {
            type: token.type,
            children: [],
            attributes: []
        }

        element.tagName = token.tagName
        for (const key in token) {
            if (key !== 'type' && key !== 'tagName') {
                element.attributes.push({
                    name: key,
                    value: token[key]
                })
            }
        }
        top.children.push(element)
        element.parent = top
        if (!token.isSelfClosing) {
            stack.push(element)
        }
    } else if (token.type === 'endTag') {
        if (top.tagName !== token.tagName) {
            throw new Error('error')
        } else {
            stack.pop()
        }
    }

}

function data(c) {
    if (c === '<') {
        return tagOpen
    } else if (c === EOF) {
        emit({
            type: "EOF"
        })
        return 
    } else {
        emit({
            type: "TEXT",
            content: c
        })
        return data
    }
}

function tagOpen(c) {
    if (c === '/') {
        return endTagOpen
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToke = {
            type: 'startTag',
            tagName: ''
        }
        return tagName(c)
    } else {
        return;
    }
}

function tagName(c) {
    if (c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName;
    } else if (c === '/') {
        return selfClosingStartTag;
    } else if (c.match(/^[a-zA-Z]$/)) {
        currentToke.tagName += c
        return tagName
    } else if (c === '>') {
        emit(currentToke)
        return data
    } else {
        return tagName
    }
}

function beforeAttributeName(c) {
    if (c.match(/^[\t/n/f ]$/)) {
        return beforeAttributeName
    } else if (c === '>' || c === '/' || c === EOF) {
        return afterAttributeValue(c)
    } else if ( c === '=') {

    } else {
        currentAttribute = {
            name: '',
            value: ''
        }
        return attributeName(c)
    }
}

function afterAttributeValue(c) {
    if ( c.match(/^[\t/n/f ]$/) || c === '>' || c === '/' || c === EOF) {
        return 
    } 
}

function attributeName(c) {
    if (c.match(/^[\t/n/f ]$/) || c === '>' || c === '/' || c === EOF) {
        return afterAttributeValue(c)
    } else if (c === '=') {
        return beforeAttributeValue
    } else if (c === '\u0000') {

    } else if (c === '\"' || c === "'" || c === "<") {

    } else {
        currentAttribute.name += c
        return attributeName
    }
}

function beforeAttributeValue(c) {
    if (c.match(/^[\t/n/f ]$/) || c === '>' || c === '/' || c === EOF) {
        return beforeAttributeValue
    } else if (c === "\"") {
        return doubleQuoteAttributeValue
    } if (c === "\'") {
        return singleQuoteAttributeValue
    } else if (c === '>') {

    }  else {
        return unQuoteAttributeValue
    }
}

function doubleQuoteAttributeValue(c) {
    if (c === "\"") {
        currentToke[currentAttribute.name] = currentAttribute.value
        return afterQuoteAttributeValue
    } else if (c === "\u0000") {

    } else if (c === EOF) {

    } else {
        currentAttribute.value += c
        return doubleQuoteAttributeValue
    }
}

function singleQuoteAttributeValue(c) {
    if (c === "\'") {
        currentToke[currentAttribute.name] = currentAttribute.value
        return afterQuoteAttributeValue
    } else if (c === "\u0000") {

    } else if (c === EOF) {

    } else {
        currentAttribute.value += c
        return singleQuoteAttributeValue
    }
}

function afterQuoteAttributeValue() {
    if (c.match(/^[\t/n/f ]$/)) {
        return beforeAttributeValue
    } else if (c === '/') {
        return selfClosingStartTag
    } else if (c  === ">") {
        currentToke[currentAttribute.name] = currentAttribute.value
        emit(currentToke)
        return data
    }  else if (c === EOF) {

    }  else {
        currentAttribute.value += c
        return doubleQuoteAttributeValue
    }
}

function unQuoteAttributeValue(c) {
    if (c.match(/^[\t/n/f ]$/)) {
        currentToke[currentAttribute.name] = currentAttribute.value
        return beforeAttributeValue
    } else if (c === '/') {
        currentToke[currentAttribute.name] = currentAttribute.value
        return selfClosingStartTag
    } else if (c  === ">") {
        currentToke[currentAttribute.name] = currentAttribute.value
        emit(currentToke)
        return data
    } else if (c === "\u0000") {

    } else if (c === EOF) {

    } else if (c === '\"' || c === "'" || c === "<" || c === '=' || c === "`") {

    } else {
        currentAttribute.value += c
        return unQuoteAttributeValue
    }
}

function selfClosingStartTag(c) {
    if (c === '>') {
        currentToke.isSelfClosing = true
        emit(currentToke)
        return data
    } else if (c === EOF) {

    } else {

    }
}

function endTagOpen(c) {
    if (c.match(/^[a-zA-Z]$/)) {
        currentToke = {
            type: "endTag",
            tagName: ""
        }
        return tagName(c)
    } else if (c === '>') {

    } else if (c === EOF) {

    }
}

module.exports.parseHTML = function (html) {
    let state = data
    for (const c of html) {
        state = state(c)
    }

    state = state(EOF)

}