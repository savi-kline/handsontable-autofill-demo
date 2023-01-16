import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CalculatedFieldType } from 'src/model/enums/calculatedFieldType.enum';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  getCalculatorFields() {
    return [
      {
        name: CalculatedFieldType.percentOfTotal,
        value: 'percentOfTotal',
        isCheck: false,
        icon: '',
        formula:
          '=CONCATENATE(IF(SUM(colStaticColName1: colStaticColNameTOTAL_ROWS), ROUND((colStaticColNameROW_NO / SUM(colStaticColName1: colStaticColNameTOTAL_ROWS)) * 100, 1), 0))',
      },
      {
        name: CalculatedFieldType.changePercent,
        value: 'changePercent',
        isCheck: false,
        icon: '',
        formula:
          '=CONCATENATE(IF(AND(colStaticColNameROW_NO > 0, COL_PREVIOUS_VALUEROW_NO > 0), ROUND(((colStaticColNameROW_NO - COL_PREVIOUS_VALUEROW_NO) / COL_PREVIOUS_VALUEROW_NO) * 100, 1), 0))',
      },
      {
        name: CalculatedFieldType.cagr,
        value: 'cagr',
        isCheck: false,
        icon: '',
        formula:
          '=CONCATENATE(IF(AND(colStaticColNameROW_NO > 0, COL_PREVIOUS_VALUEROW_NO > 0), ROUND((POWER(colStaticColNameROW_NO / COL_PREVIOUS_VALUEROW_NO, 1 / NO_YEAR) - 1) * 100, 1), 0))',
      },
    ];
  }

  getResetToDefaultOptions() {
    return [
      {
        name: 'Reset All',
        value: 'ResetAll',
      },
      {
        name: 'Reset Data',
        value: 'ResetData',
      },
      {
        name: 'Reset State',
        value: 'ResetState',
      },
      {
        name: 'Reset Calculated Fields',
        value: 'ResetCalculatedFields',
      },
    ];
  }

  getColumnReferences() {
    return [
      'A',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
      'M',
      'N',
      'O',
      'P',
      'Q',
      'R',
      'S',
      'T',
      'U',
      'V',
      'W',
      'X',
      'Y',
      'Z',
      'AA',
      'AB',
      'AC',
      'AD',
      'AE',
      'AF',
      'AG',
      'AH',
      'AI',
      'AJ',
      'AK',
      'AL',
      'AM',
      'AN',
      'AO',
      'AP',
      'AQ',
      'AR',
      'AS',
      'AT',
      'AU',
      'AV',
      'AW',
      'AX',
      'AY',
      'AZ',
      'BA',
      'BB',
      'BC',
      'BD',
      'BE',
      'BF',
      'BG',
      'BH',
      'BI',
      'BJ',
      'BK',
      'BL',
      'BM',
      'BN',
      'BO',
      'BP',
      'BQ',
      'BR',
      'BS',
      'BT',
      'BU',
      'BV',
      'BW',
      'BX',
      'BY',
      'BZ',
    ];
  }

  calculateCAGRPercentage(startValue: number, endValue: number, year: number) {
    let cargPer = '';
    if (startValue && endValue && year) {
      const cagr = Math.pow(endValue / startValue, 1 / year) - 1;
      cargPer = (cagr * 100).toFixed(1);
    }
    return +cargPer;
  }

  calculateTotalPercentage(total: number, value: number) {
    return value > 0 && total > 0 ? +((value / total) * 100).toFixed(1) : 0;
  }

  calculatePercentageChange(startValue: number, endValue: number) {
    let perChange = 0;
    if (startValue && endValue) {
      perChange = +(((endValue - startValue) / startValue) * 100).toFixed(1);
    }
    return +perChange;
  }
  checkDuplicateRow(list: any, columns: any, newRow: any) {
    let duplicateCount: number = 0;
    let duplicateRow: boolean = false;
    list.forEach((node: any) => {
      duplicateCount = 0;
      let columnData = node['ColumnsData'];
      let newRowColumnData = newRow['ColumnsData'];
      columns.forEach((item: any) => {
        if (columnData[item] === newRowColumnData[item]) {
          duplicateCount++;
        }
      });
      if (duplicateCount == columns.length) {
        duplicateRow = true;
        return;
      }
    });
    if (duplicateRow) {
      return columns;
    } else {
      return;
    }
  }
  getDataViewOptions() {
    return [
      {
        name: 'Display Values',
        value: 'DisplayValues',
      },
      {
        name: 'Display Formula',
        value: 'DisplayFormula',
      },
    ];
  }
}
