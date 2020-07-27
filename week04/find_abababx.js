
var match = (string) => {
    let state = start
    for (const c of string) {
        state = state(c)
    }

    return state ===  end
}


var start = (c) => {
    if (c === 'a') {
        return foundA
    }
     
    return start
}

var foundA = (c) => {
    if (c === 'b') {
        return foundB
    }

    return start(c)
}

var foundA2 = (c) => {
    if (c === 'b') {
        return foundB2
    }

    return start(c)
}

var foundA3 = (c) => {
    if (c === 'b') {
        return foundB3
    }

    return start(c)
}

var foundB = (c) => {
    if (c === 'a') {
        return foundA2
    }

    return start(c)
}

var foundB2 = (c) => {
    if (c === 'a') {
        return foundA3
    }
}

var foundB3 = (c) => {
    if (c === 'x') {
        return end
    }

    return foundB2(c)
}

var end = () => {
    return end
}

var res = match('ababababx')
console.log(res)