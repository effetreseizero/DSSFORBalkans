import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilitiesService {

  constructor() { }

  // Arithmetic mean
  getMean(data) {
    return data.reduce((a, b) => {
      return Number(a) + Number(b);
    }) / data.length;
  }

  getMedian(data) {
    // median of [3, 5, 4, 4, 1, 1, 2, 3] = 3
    let median = 0;
    let numsLen = data.length;
    data.sort();

    if (
      numsLen % 2 === 0 // is even
    ) {
      // average of two middle numbers
      median = (data[numsLen / 2 - 1] + data[numsLen / 2]) / 2;
    } else { // is odd
      // middle number only
      median = data[(numsLen - 1) / 2];
    }

    return median;
  }

  getMode(data) {
    // as result can be bimodal or multi-modal,
    // the returned result is provided as an array
    // mode of [3, 5, 4, 4, 1, 1, 2, 3] = [1, 3, 4]
    var modes = [], count = [], i, number, maxIndex = 0;

    for (i = 0; i < data.length; i += 1) {
      number = data[i];
      count[number] = (count[number] || 0) + 1;
      if (count[number] > maxIndex) {
        maxIndex = count[number];
      }
    }
    for (i in count)
      if (count.hasOwnProperty(i)) {
        if (count[i] === maxIndex) {
          modes.push(Number(i));
        }
      }
    
    return modes[0];
  }

  getSD(data) {
    let m = this.getMean(data);
    return Math.sqrt(data.reduce((sq, n) => {
      return sq + Math.pow(n - m, 2);
    }, 0) / (data.length - 1));
  }

  getDS(data, mean) {
    const m = mean;
    return Math.sqrt(data.reduce((sq, n) => {
      return sq + Math.pow(n - m, 2);
    }, 0) / (data.length - 1));
  }

  getSum(data) {

    return data.reduce((a, b) => {
      return a + b
    }, 0);

  }

  matrix(m, n) {
    var result = []
    for (var i = 0; i < n; i++) {
      result.push(new Array(m).fill(1))
    }
    return result
  }

  det(M) {
    if (M.length == 2) { return (M[0][0] * M[1][1]) - (M[0][1] * M[1][0]); }
    var answer = 0;
    for (var i = 0; i < M.length; i++) {
      answer += Math.pow(-1, i) * M[0][i] * this.det(this.deleteRowAndColumn(M, i));
    }
    return answer;
  }

  deleteRowAndColumn(M, index) {
    var temp = [];
    for (var i = 0; i < M.length; i++) { temp.push(M[i].slice(0)); }
    temp.splice(0, 1);
    for (var i = 0; i < temp.length; i++) { temp[i].splice(index, 1); }
    return temp;
  }

  isEmpty(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key))
        return false;
    }
    return true;
  }
  




}
