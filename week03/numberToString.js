var toConvert = (n, type = 10) => {
    if (n == 0) return '0';
    var res = '';
    while (n != 0) {
        let y = n % type
        if (y > 10) {
            y = map[y]
        }
        res = y + res
        n = parseInt(n / type)
    }
    return res;
}

/**
* 16进制映射
*/
const map = {
    [11]: 'a',
    [12]: 'b',
    [13]: 'c',
    [14]: 'd',
    [15]: 'f'
}

const numberToString = (num, type) => {
    if (Number.isNaN(num)) {
        return 'NaN'
    } else {
        if (type === 2) { //按照二级制转换
            let bin = toConvert(num, 2)
            return bin
        } else if (type === undefined || type === 10) { //按十进制转换
            return toConvert(num, 10)
        } else if (type === 8) {
            return toConvert(num, 8) //按8进制转换
        } else if (type === 16) {
            return toConvert(num, 16)  //按16进制转换
        }
    }
}

const res = numberToString(10, 8)
console.log(res, 123)