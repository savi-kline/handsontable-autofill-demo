export class Common {
  // function returns index of objects array by atribute and value
  findWithAttr(array: any, attr: any, value: any): any {
    for (let i = 0; i < array.length; i++) {
      if (array[i][attr] === value) {
        return i;
      }
    }
    return -1;
  }

  // sort array of object by property
  // usage http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects
  // example number format this.dataSource.sort(this.common.sortByProp("MarketShare", false, parseFloat));
  // example string format this.dataSource.sort(this.common.sortByProp('area', false, function(a){return a.toUpperCase()}));
  sortByProp(field: string, reverse: boolean, primer: any): any {
    let key = function (x: any) {
      return primer ? primer(x[field]) : x[field];
    };

    return function (a: any, b: any) {
      let A = key(a),
        B = key(b);
      return (A < B ? -1 : A > B ? 1 : 0) * [-1, 1][+!!reverse];
    };
  }

  // put object on the end of list if property contain id
  moveOnTheEndByPropValue(arr: any, property: string, idNum: number): any {
    let rememberObj;
    for (let arrItem of arr) {
      if (arrItem[property] === idNum) {
        rememberObj = arrItem;
      }
    }
    if (rememberObj) {
      arr.push(arr.splice(arr.indexOf(rememberObj), 1)[0]);
    }
    return arr;
  }

  // get object from array by prop value
  searchByValue(propName: string, keyValue: any, arr: any): any {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i][propName] === keyValue) {
        return arr[i];
      }
    }
  }

  // get index of obj in array by prop value
  searchIndexByValue(propName: string, keyValue: any, arr: any): any {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i][propName] === keyValue) {
        return i;
      }
    }
  }

  // function returns number in string format 100,000,000.00
  largeNumberFormat(number: number): string {
    number = this.round(number, 2);
    if (this.isInt(number)) {
      return number.toLocaleString() + '.0';
    } else {
      return number.toLocaleString();
    }
  }

  round(value: number, precision: number) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  }

  isInt(value: any) {
    return (
      !isNaN(value) &&
      (function (x) {
        return (x | 0) === x;
      })(parseFloat(value))
    );
  }

  static getBrowser() {
    var ua = navigator.userAgent,
      tem,
      M =
        ua.match(
          /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
        ) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return 'IE ' + (tem[1] || '');
    }
    if (M[1] === 'Chrome') {
      tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
      if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return M.join(' ');
  }

  static objToString(obj: any): string {
    let str = '';
    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        str += p + '::' + obj[p] + '\n';
      }
    }
    return str;
  }

  // this function merge two objects
  static realMerge(to: any, from: any) {
    for (let n in from) {
      if (typeof to[n] != 'object') {
        to[n] = from[n];
      } else if (typeof from[n] == 'object') {
        to[n] = this.realMerge(to[n], from[n]);
      }
    }
    return to;
  }

  static removeAllSpaces(textWithSpaces: string) {
    let textWithOutSpaces = textWithSpaces.replace(' ', '');
    return textWithOutSpaces;
  }

  static getAlphabetFromNo(columnNumber: number) {
    // To store result (Excel column name)
    let columnName = [];

    while (columnNumber > 0) {
      // Find remainder
      let rem = columnNumber % 26;

      // If remainder is 0, then a
      // 'Z' must be there in output
      if (rem == 0) {
        columnName.push('Z');
        columnNumber = Math.floor(columnNumber / 26) - 1;
      } // If remainder is non-zero
      else {
        columnName.push(String.fromCharCode(rem - 1 + 'A'.charCodeAt(0)));
        columnNumber = Math.floor(columnNumber / 26);
      }
    }

    return columnName.reverse().join('');
  }

  static replaceAll(str: string, mapObj: any) {
    var re = new RegExp(Object.keys(mapObj).join('|'), 'gi');

    return str.replace(re, function (matched) {
      return mapObj[matched];
    });
  }
}
