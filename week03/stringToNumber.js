
/**
 * 辅助方法 10进制字符串转number
 * @param {10进制字符串} str 
 */
const str10ToNum = (str) => {
    let number = 0
    let j = 1
    for(let i=str.length-1; i>=0; i--) {
        const c = str[i]
        number += c * j
        j = j * 10
    }
    return number
}

/**
 * 辅助方法
 * @param {待转换的值} s 
 * @param {待转换的进制} type 
 */
var toDecimal = (s, type) => {
    var res = 0;  
    var arr = s.split('');
    var len = arr.length;
    for(var i = 0;i<len;i++) {
        let item = arr[i]
        if(isNaN(item)) {
            item = map[item]
        }
      res += +item * Math.pow(type, len-1-i)    
    }
    return res;  
  }

  /**
   * 16进制映射
   */
  const map = {
      a: 11,
      b: 12,
      c: 13,
      d: 14,
      f: 15
  }

  /**
   * 转换函数
   * @param {待转换的值} string 
   * @param {进制} type 
   */
const stringToNumber = (string, type) => {
    if (Number.isNaN(string)) {
        return 'NaN'
    } else {
        if (type === 2) { //按照二级制转换
            let bin = toDecimal(string, 2)
            return bin
        } else if (type === undefined || type === 10) { //按十进制转换
            return str10ToNum(string)
        } else if (type === 8) {
            return toDecimal(string, 8) //按8进制转换
        } else if (type === 16) {
            return toDecimal(string, 16)  //按16进制转换
        }
    }
}

const res = stringToNumber('101010', 10)
console.log(res)