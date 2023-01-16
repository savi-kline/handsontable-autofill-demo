import {
  Component, OnInit
} from '@angular/core';
import { HotTableRegisterer } from '@handsontable/angular';
import { HyperFormula } from 'hyperformula';
import * as lodash from 'lodash';
import jsonData from 'src/db/data.json';
import { Common } from 'src/extensions/common.extension';
import { DataGridConfiguration } from 'src/model/dataGridConfiguration.model';
import { CommonService } from 'src/services/common.service';

@Component({
  selector: 'app-handson-table',
  templateUrl: './handson-table.component.html',
  styleUrls: ['./handson-table.component.css'],
})
export class HandsonTableComponent implements OnInit {
  handsontableLicenseKey = 'non-commercial-and-evaluation';
  hyperformulaInstance = HyperFormula.buildEmpty({
    // to use an external HyperFormula instance,
    // initialize it with the `'internal-use-in-handsontable'` license key
    licenseKey: 'internal-use-in-handsontable',
  });

  pendingChange: boolean = false;
  marketYearCategoryId: number = 0;
  studyProjectMarketYearId: number = 0;
  studyAreaId: number = 0;
  dataSetId: number = 0;
  yearsList: any[];
  columnsList: any[];
  isLockedStudy: boolean = false;
  isVolumeYear: boolean = false;
  dataSource: any = jsonData;
  currencyDropdown: any[] = [];
  unitsDropdown: any[] = [];
  isResetDataRequired: boolean = false;
  calculatedField: string = 'Value';
  dataRelations: any[] = [];
  clipboardCache: any = '';
  dataSourceData: any[] = [];
  dataSourceDataNoFormulas: any[] = [];
  hiddenColumns: any = {
    columns: [],
    indicators: false,
    copyPasteEnabled: false,
  };
  filterableColumns: any = [];
  dataSettings: DataGridConfiguration = new DataGridConfiguration();
  isManager: boolean = false;
  userDetail: any;
  disabledSignOffButton: boolean = false;
  isStudyEditable: boolean = false;
  studyTitle: string = '';
  isAddNewRowVisible: boolean = true;
  unitOfValues: any[] = [];
  currentCurrency: any;
  colHeaders: any[] = [];
  columns: any;
  data: any;
  cell: any;
  nestedHeaders: any;
  fixedRowsTop: number = 0;
  fixedColumnsLeft: number = 0;
  formulas: any;
  private hotRegisterer = new HotTableRegisterer();
  id = 'hotInstance';
  hotSettings: any = {};
  viewNotePopup: boolean = false;
  viewStudyComments: boolean = false;
  showHelpText: boolean = false;
  selectedCommentCellData: any = {};
  selectedRowNotes: any;
  noteSubmit = false;
  isAddNewRowPopup = false;
  newRowFormObj: any[] = [];
  visibleGridColumns: any[] = [];
  calculatorContextMenuItems: any[] = [];
  resetMenuItems: any[] = [];
  viewMenuItems: any[] = [];
  selectedView: any;
  showFormula: boolean = false;
  valueColsIndexes: any[] = [];
  isDefaultStateMode: boolean = false;
  dataGridState: any = [];
  countOfFormulasInDatagrid: number = 0;
  renderingFinishedTimeout: NodeJS.Timeout = setTimeout(() => {}, 0);
  isRenderingFinished: boolean = false;
  isRenderAllRows: boolean = true;
  tableHeight: string = this.isRenderAllRows ? 'auto' : '600';
  columnReferences: string[] = [];
  deletedRows: any[] = [];
  newRowNumberBoxFormat: string = '';
  staticColumns: any[] = [];
  isFormulaAllowed: boolean = true;
  selectedCellValue: any;
  selectedCell: any = { row: 0, col: 0 };
  disableFormulaBar: boolean = true;
  selectedCellsData: any [] = [];
  constructor(private commonService: CommonService) {
    this.marketYearCategoryId = 135;
    this.studyProjectMarketYearId = 58;
    this.studyAreaId = 25;
    this.dataSetId = 3;

    this.isManager = true;

    this.calculatorContextMenuItems = this.commonService.getCalculatorFields();
    this.resetMenuItems = this.commonService.getResetToDefaultOptions();
    this.columnReferences = this.commonService.getColumnReferences();
    this.viewMenuItems = this.commonService.getDataViewOptions();
    this.selectedView = this.viewMenuItems[0];
    this.formulas = {
      engine: HyperFormula,
    };
  }

  ngOnInit(): void {
    //this.cellRendererData = this.cellRendererData.bind(this);

    this.hotSettings = {
      afterChange: (changes: [any, any, any, any][]) => {
        if(changes){
          changes?.forEach(([row, prop, oldValue, newValue]) => {
            const col = this.hotRegisterer.getInstance(this.id).propToCol(prop);
            this.pendingChange = true;
            // check if user has added formula to the datagrid
            if (this.isFormulaAllowed === true) {
              if (
                isNaN(Number(oldValue)) === false &&
                newValue !== null &&
                newValue.toString().startsWith('=', 0)
              ) {
                this.countOfFormulasInDatagrid++;
              } else if (
                oldValue.toString().startsWith('=', 0) &&
                isNaN(Number(newValue)) === false
              ) {
                this.countOfFormulasInDatagrid--;
              }
            } else if (
              isNaN(Number(oldValue)) === false &&
              newValue !== null &&
              newValue.toString().startsWith('=', 0)
            ) {
              this.hotRegisterer
                .getInstance(this.id)
                .setDataAtRowProp(row, prop, oldValue);
            }
  
            // in case new value is number, apply validation
            if (isNaN(Number(newValue)) === false) {
              // apply rounding when user want to insert more decimal places te allowed
              const decimalPlaces =
                this.dataSource.Data.Settings.handontableSettings
                  ?.decimalPlaces || 2;
              const expressionOneDecimal = /^(\d{1,50}|\d{0,50}\.\d{1})$/;
              const expressionTwoDecimals = /^(\d{1,50}|\d{0,50}\.\d{1,2})$/;
              const reg =
                decimalPlaces === 1
                  ? expressionOneDecimal
                  : expressionTwoDecimals;
              if (!reg.test(newValue)) {
                const newValueRounded = lodash
                  .round(newValue, decimalPlaces)
                  .toFixed(decimalPlaces);
                this.hotRegisterer
                  .getInstance(this.id)
                  .setDataAtRowProp(row, prop, newValueRounded);
              }
  
              // change color of the cell if user change value
              //if (newValue !== oldValue) {
              //  this.hotRegisterer.getInstance(this.id).setCellMeta(row, col, 'className', 'lightgreen-bg');
              //}
            }
            // in case new value is not number and is not formula, change cell value to 0
            else if (newValue.toString().startsWith('=', 0) === false) {
              this.hotRegisterer
                .getInstance(this.id)
                .setDataAtRowProp(row, prop, oldValue);
            }
  
            // finally render all changes
            
          });
          this.hotRegisterer.getInstance(this.id).loadData(this.dataSourceData);
          this.applyStateFilters();
        }
       
      },
      // render 20 columns outside of the grid's viewport, this will fix stange horizontal scrolling behavior
      viewportColumnRenderingOffset: 20,
      afterViewRender: () => {
        clearTimeout(this.renderingFinishedTimeout);
        this.renderingFinishedTimeout = setTimeout(() => {
          this.isRenderingFinished = true;
        }, 1000);
      },
      afterScrollVertically: () => {
        if (
          this.isRenderAllRows === false &&
          this.calculatorContextMenuItems.find((f) => f.isCheck === true)
        ) {
          clearTimeout(this.renderingFinishedTimeout);
          this.renderingFinishedTimeout = setTimeout(() => {
            // this.hotRegisterer
            //   .getInstance(this.id)
            //   .loadData(this.dataSourceData);
            this.hotRegisterer
              .getInstance(this.id)
              .loadData(
                this.hotRegisterer.getInstance(this.id).getSourceData()
              );
            this.hotRegisterer.getInstance(this.id).render();
          }, 500);
        }
      },
    };

    setTimeout(() => {
      this.processDataSource();
    }, 1000);
  }

  getValueByYearsDataPosition(
    rowIndex: number,
    yearsDataIndex: number,
    countOfColumnsData: number
  ) {
    const realData = this.hotRegisterer.getInstance(this.id).getData();
    const requestedRowData = realData[rowIndex];
    return requestedRowData[countOfColumnsData + yearsDataIndex];
  }

  allColsComments: any[] = [];
  getAllColumnsComments() {
    this.processDataSource();
  }
  applyStateFilters() {
    if (this.dataGridState.filters) {
      const filterPlugins = this.hotRegisterer
        .getInstance(this.id)
        .getPlugin('filters');

      let isFilterApplied: boolean = false;
      this.dataGridState.filters.map((filterItem:any) => {
        if (filterItem.conditions) {
          filterItem.conditions.map((condition: any) => {
            filterPlugins.addCondition(
              filterItem.column,
              condition.name,
              condition.args,
              filterItem.operation
            );
          });
          isFilterApplied = true;
        }
      });
      if (isFilterApplied) {
        filterPlugins.filter();
        this.recalculateColumns();
      }
    }
  }
  processDataSource() {
    if (this.isResetDataRequired) {
      this.dataSourceData = [];
    }
    const data = this.dataSource.Data;
    if (typeof data === 'undefined') {
      return;
    }

    if (data.DataList === null) {
      return;
    }
    this.dataSettings = Common.realMerge(
      new DataGridConfiguration(),
      data.Settings || {}
    );
    console.log(data);
    const studySummary = data.StudySetup;

    this.isManager = true;

    this.studyTitle = `${studySummary.StudyDataSetName}-${studySummary.StudyYear}-${studySummary.MarketName}`;

    this.isStudyEditable = false;

    this.isLockedStudy = false;

    this.unitOfValues = data.UnitOfValues || [];

    const currency = this.unitOfValues.find(
      (item) => item.Title === 'Currency'
    );
    this.currentCurrency = this.currencyDropdown.find(
      (f) => f?.Id === currency?.Id
    );

    const columnLists: any[] = [];
    const nestedColumnList: any = [];
    let columnBinding: any[] = [];
    this.staticColumns = [];
    data.ColumnList.map((list: any) => {
      const colSetting = this.dataSettings.fields.find(
        (item) => item.dataField === list.Title
      );
      columnLists.push(colSetting?.caption || list.Title);
      this.staticColumns.push(colSetting?.caption || list.Title);
      nestedColumnList.push(null);
      columnBinding.push({
        data: `ColumnsData.${list.Title}`,
        readOnly: !this.isStudyEditable ? colSetting?.readOnly : true,
        type: colSetting?.dataType,
        width: colSetting?.width,
        isVisible: list.IsVisible,
        isColumnData: true,
      });
      list.IsVisible =
        typeof colSetting?.isVisible === 'boolean'
          ? colSetting.isVisible
          : list.IsVisible;
      this.filterableColumns.push(list.Index);
      if (!list.IsVisible) {
        this.hiddenColumns.columns.push(list.Index);
      }
    });

    //this.fixedColumnsLeft =
    //  columnBinding.filter((f) => !(f.isVisible && f.isColumnData)).length + 1;

    this.fixedColumnsLeft = columnBinding.filter((f) => f.isColumnData).length;

    data.YearsList.sort((a: any, b: any) => a.Index - b.Index);
    let nestedcColSetting: any;
    let yearWiseFieldList: any[] = [];
    let forecastFieldList: any[] = [];
    data.YearsList.map((year: any) => {
      if (year.AttributeList) {
        year.AttributeList.map((attr: any) => {
          this.calculatedField =
            attr.Title === 'Unit'
              ? 'Unit'
              : attr.Title === 'Volume'
              ? 'Volume'
              : 'Value';
          const colSetting = this.dataSettings.fields.find(
            (item) =>
              item.dataField === attr.Title &&
              item.isYearValue &&
              item.yearType.indexOf(year.Type) !== -1
          );

          if (colSetting) {
            nestedColumnList.push(colSetting?.caption || attr.Title);
            columnBinding.push({
              data: `YearsData.${year.Year}.${attr.Title}`,
              readOnly: !this.isStudyEditable ? colSetting?.readOnly : true,
              type: colSetting?.dataType,
              width: colSetting?.width,
              isVisible: true,
              allowEmpty: false,
            });
          }
        });
      }
      //if (!this.isVolumeYear) {
      columnLists.push({
        label: year.Year,
        colspan: year.AttributeList.length,
      });
      // }
    });

    // if (!this.isStudyEditable) {
    //   columnLists.push('');
    //   columnBinding.push({
    //     readOnly: true,
    //     filters: false,
    //     isVisible: true,
    //     isDeleteRowCell: true,
    //   });
    // }

    this.colHeaders.push(columnLists);
    let colHeaders = [];
    colHeaders.push(columnLists);
    if (data.HasAttribute) {
      colHeaders.push(nestedColumnList);
    }
    // if (this.isVolumeYear) {
    //   colHeaders.push(nestedColumnList);
    // }
    this.valueColsIndexes = [];
    for (let h = 0; h <= nestedColumnList.length; h++) {
      if (
        typeof nestedColumnList[h] !== 'undefined' &&
        nestedColumnList[h] === this.calculatedField
      ) {
        this.valueColsIndexes.push(h + 1);
      }
    }

    this.nestedHeaders = colHeaders;
    this.colHeaders = colHeaders;
    this.columns = columnBinding;

    data.DataList.map((item: any, i: number) => {
      if (!this.dataSourceData[i]) {
        if (item.ChangeLog !== null) {
          const changeLogObj = item.ChangeLog.split('|||');
          if (changeLogObj) {
            item['ChangeLogObj'] = [];
            changeLogObj.map((change: any) => {
              const changeObj = change.split('###');
              if (changeObj) {
                if (typeof item.ChangeLogObj[changeObj[3]] === 'undefined') {
                  item.ChangeLogObj[changeObj[3]] = {};
                }

                if (
                  typeof item.ChangeLogObj[changeObj[3]][changeObj[4]] ===
                  'undefined'
                ) {
                  item.ChangeLogObj[changeObj[3]][changeObj[4]] = {};
                }

                item.ChangeLogObj[changeObj[3]][changeObj[4]] = {
                  name: changeObj[0],
                  date: changeObj[1],
                  oldValue: changeObj[2],
                  year: changeObj[3],
                  attrType: changeObj[4],
                  dataRowId: changeObj[5],
                };
              }
            });
          }
        }

        let rowComments: any[] = [];
        if (this.allColsComments) {
          rowComments = this.allColsComments.filter(
            (single: any) => single.DraftDataRowId == item.DataRowId
          );

          item['allComments'] = [];
          rowComments.map(({ ColumnName, AttributeType }) => {
            if (typeof item['allComments'][ColumnName] === 'undefined') {
              item['allComments'][ColumnName] = [];
            }

            if (
              typeof item['allComments'][ColumnName][AttributeType] ===
              'undefined'
            ) {
              item['allComments'][ColumnName][AttributeType] = true;
            }
          });
        }

        item['IsDeleted'] = false;

        this.dataSourceData[i] = {
          ...item,
          ColumnsData: {},
          YearsData: {},
        };
      }
      data.ColumnList.forEach((col: any) => {
        // if (col.IsVisible) {
        Object.assign(this.dataSourceData[i]['ColumnsData'], {
          [col.Title]:
            item.ColumnsData[col.Index] !== null
              ? item.ColumnsData[col.Index].toString()
              : '',
        });
        // }
      });

      data.YearsList.forEach((year: any, j: number) => {
        if (!this.dataSourceData[i]['YearsData'][year.Year]) {
          this.dataSourceData[i]['YearsData'][year.Year] = {};
        }

        year.AttributeList.map((attribute: any) => {
          Object.assign(this.dataSourceData[i]['YearsData'][year.Year], {
            [attribute.Title]:
              typeof item.YearsData[year.Year] !== 'undefined'
                ? item.YearsData[year.Year][attribute.Index]
                : 0,
          });
        });
      });
    });

    const isDataRowNull = this.dataSourceData.find(
      (data) => data.DataRowId !== null
    );

    if (!isDataRowNull) {
      this.disabledSignOffButton = true;
    }

    this.dataSourceData = this.dataSourceData.filter(
      (item) => item.IsDeleted !== true
    );

    // show column reference
    this.showCellReferences();

    const that = this;
    this.hotRegisterer.getInstance(this.id).updateSettings({
      columnSorting: {
        sortEmptyCells: true,
      },
      cells(row: any, column: any, prop: { toString: () => string }) {
        const cellProperties: any = {};

        const cellProps = prop.toString().split('.');
        const data = this.instance.getSourceDataAtRow(row) as any;

        cellProperties.isStudyEditable = that.isStudyEditable;
        cellProperties.calculatedField = that.calculatedField;
        cellProperties.dataSetId = that.dataSetId;
        cellProperties.showFormula = that.showFormula;
        cellProperties.renderer = that.cellRendererData.bind(this);

        return cellProperties;
      },
      afterFilter(conditionsStack: any[]) {
        that.dataGridState.filters = conditionsStack;
      },
      afterSelection: (
        row:any,
        column:any,
        row2:any,
        column2:any,
        preventScrolling:any,
        selectionLayerLevel:any
      ) => {
        const logicalRow = that.hotRegisterer
          .getInstance(that.id)
          .toPhysicalRow(row);
        const col = that.hotRegisterer.getInstance(that.id).getSourceDataAtCell(logicalRow, column);
        const meta = that.hotRegisterer.getInstance(that.id).getCellMeta(logicalRow, column);
        const currentColumn = that.columns.find((item: any) => item.data == meta.prop);
        if (currentColumn && currentColumn.type == 'numeric') {
          that.selectedCell.row = row;
          that.selectedCell.col = column;
          that.selectedCellValue = col;
          that.disableFormulaBar = currentColumn.readOnly;
        }
        else {
          that.selectedCellValue = '';
        }
      },
      beforeAutofill(selectionData:any, sourceRange:any, targetRange:any, direction:any){
        const startRange = sourceRange.from;
        const endRange = sourceRange.to;
        var index = 0;
       
        let data = [];
        for (var i = startRange.row; i <= endRange.row; i++) {
          for (var j = startRange.col; j <= endRange.col; j++) {
            const logicalrow = that.hotRegisterer
            .getInstance(that.id)
            .toPhysicalRow(i);
            const dataAtRow = that.hotRegisterer
            .getInstance(that.id)
            .getSourceDataAtCell(logicalrow, j);
            data.push(dataAtRow);
          }
        }
        for(var i: any = 0;i<selectionData.length; i++){
          selectionData[i] = [data[index]];
          index ++;
          if(index == data.length){
            index = 0;
          }
        }
        console.log('Data Source Data',data);
        console.log('Selection Data',selectionData);

      },
      beforeCopy: function (data:any, coords:any) {
        var coord = coords[0];
        var row = 0;
        var col = 0;
        for (var i = coord.startRow; i <= coord.endRow; i++) {
          for (var j = coord.startCol; j <= coord.endCol; j++) {
            const logicalrow = that.hotRegisterer
              .getInstance(that.id)
              .toPhysicalRow(i);
            data[row][col] = that.hotRegisterer
              .getInstance(that.id)
              .getSourceDataAtCell(logicalrow, j);
            col++;
          }
          col = 0;
          row++;
        }
      },
    });
  }
  textBoxValueChanged(event: any) {
    if (event.event) {
      this.hotRegisterer
        .getInstance(this.id)
        .setDataAtCell(
          this.selectedCell.row,
          this.selectedCell.col,
          event.value
        );
    }
  }

  cellRendererData(
    instance: any,
    td: any,
    row: number,
    col: number,
    prop: string,
    value: any,
    cellProperties: any
  ) {
    // Handsontable.renderers.NumericRenderer.apply(this, arguments as any);
    td.innerHTML = value;
    const visiblerows = instance.rowIndexMapper.getNotTrimmedIndexes();
    const logicalRowNum = cellProperties.row;
    const cellProps = prop.toString().split('.');
    const data = instance.getSourceDataAtRow(logicalRowNum) as any;
    const rowData = instance.getDataAtRow(row);
    const visibleIndex = visiblerows.find((x: any) => x == logicalRowNum);
    if (data && data.IsNewRow) {
      if (typeof cellProps[0] !== 'undefined' && cellProps[0] === 'YearsData') {
        td.classList.add('htNumeric');
      }
      td.classList.add('highlighter-tr');
    }

    if (typeof cellProps[0] !== 'undefined' && cellProps[0] === 'YearsData') {
      td.classList.add('htRight');
      const cellValue = instance.getSourceDataAtCell(
        logicalRowNum,
        cellProperties.col
      );
      if (cellValue.toString().startsWith('=', 0)) {
        // td.classList.add('has-formula');
        if (cellProperties.showFormula) {
          td.innerHTML = cellValue;
        }
      }
      if (
        data &&
        typeof data['ChangeLog'] !== 'undefined' &&
        data['ChangeLog'] !== null
      ) {
        const rowChangeLogData = data['ChangeLogObj'];
        if (typeof rowChangeLogData[cellProps[1]] !== 'undefined') {
          const yearChangeLogData = rowChangeLogData[cellProps[1]];
          if (typeof yearChangeLogData[cellProps[2]] !== 'undefined') {
            let commentHtml = '';
            if (
              data['ChangeLogObj'] &&
              typeof data['ChangeLogObj'][cellProps[1]] !== 'undefined'
            ) {
              const commentData =
                data['ChangeLogObj'][cellProps[1]][cellProps[2]];

              const oldValue = !isNaN(commentData.oldValue)
                ? +commentData.oldValue
                : 0;

              commentHtml = `<div class='row text-left'>
                            <div class='col-3'>Name:</div>
                            <div class='col'>${commentData.name}</div>
                        </div>
                        <div class='row text-left'>
                            <div class='col-3'>Old Value:</div>
                            <div class='col'>${oldValue.toFixed(1)}</div>
                        </div>
                        <div class='row text-left'>
                            <div class='col-3'>Date:</div>
                            <div class='col'>${commentData.date}</div>
                        </div>`;
            }
            // Handsontable.renderers.TextRenderer.apply(this, arguments);
            // td.className = 'htRight htNumeric highlighter-td cellWithComment';
            td.classList.add('htRight');
            td.classList.add('htNumeric');
            td.classList.add('highlighter-td');
            td.classList.add('cellWithComment');

            // const myDiv = `<div popup-tooltip='${commentHtml}'></div>`;

            const div = document.createElement('div');
            div.innerHTML = commentHtml;
            div.className = 'cellComment';
            // div.parentElement?.parentElement?.parentElement?.classList.add('');
            // td.setAttribute(
            //   'popup-tooltip',
            //   'This is test tooltip without HTML'
            // );
            td.appendChild(div);
          }
        }
      }

      if (
        data &&
        typeof data['allComments'] !== 'undefined' &&
        data['allComments'] !== null
      ) {
        if (typeof data['allComments'][cellProps[1]] !== 'undefined') {
          if (
            typeof data['allComments'][cellProps[1]][cellProps[2]] !==
              'undefined' &&
            data['allComments'][cellProps[1]][cellProps[2]]
          ) {
            // cellProperties.className = 'has-comment';
            td.classList.add('has-comment');
          }
        }
      }
    }

    const colCount = instance.countCols();
    //const hiddenColumnsCount = this.hiddenColumns?.columns?.length || 0;
    //if (
    //  !cellProperties.isStudyEditable &&
    //  col === colCount - hiddenColumnsCount - 1
    //) {

    if (typeof cellProps[0] !== 'undefined' && cellProps[0] === 'YearsData') {
      if (cellProps[2] !== cellProperties.calculatedField) {
        const calculatedFiled = cellProperties.calculatorContextMenuItems?.find(
          (single: any) => single.name === cellProps[2] && single.isCheck
        );

        if (calculatedFiled) {
          const valueProp = `${cellProps[0]}.${cellProps[1]}.${cellProperties.calculatedField}`;
          const currentValue = cellProperties.valueColsIndexes.find(
            (valueColsIndex: any) => valueColsIndex.prop === valueProp
          );
          const currentValueIndex = cellProperties.valueColsIndexes.findIndex(
            (valueColsIndex: any) => valueColsIndex.prop === valueProp
          );

          if (currentValue) {
            const colStaticColName = Common.getAlphabetFromNo(
              currentValue.index + 1
            );

            const previousValueIndex =
              currentValueIndex > 0 ? currentValueIndex - 1 : 0;

            const previousValue =
              cellProperties.valueColsIndexes[previousValueIndex];

            let colStaticColPreviousValue = '';
            if (previousValue) {
              colStaticColPreviousValue = Common.getAlphabetFromNo(
                previousValue.index + 1
              );
            }
            // console.log(instance.countRows());
            let replaceValue = {
              colStaticColName: colStaticColName,
              COL_PREVIOUS_VALUE: colStaticColPreviousValue,
              TOTAL_ROWS: instance.countRows(),
              ROW_NO: row + 1,
              NO_YEAR: 1,
            };

            let colFormula =
              typeof calculatedFiled.formula !== 'undefined'
                ? calculatedFiled.formula
                : '';

            colFormula = Common.replaceAll(colFormula, replaceValue);
            // console.log(colFormula);
            data['YearsData'][cellProps[1]][cellProps[2]] = colFormula;
            cellProperties.numericFormat = {
              pattern: '0,0.0',
            };
            // Handsontable.renderers.NumericRenderer.apply(
            //   this,
            //   arguments as any
            // );
            // add % symbol to calculated fields, numeric sorting is allowed
            td.innerHTML = `${value}%`;
          }
        }
      }
      // cellProperties.type= 'numeric',
      //Handsontable.renderers.NumericRenderer.apply(this, arguments as any);
      cellProperties.numericFormat = {
        pattern:
          cellProperties.calculatedField == 'Unit'
            ? '0,0'
            : cellProperties.dataSetId == 4
            ? '0,0.0'
            : '0,0.00',
      };
    }

    return td;
  }

  getvisibleRows() {
    let visibleRows: any[] = [];
    const filterRows = this.hotRegisterer
      .getInstance(this.id)
      .rowIndexMapper.getNotTrimmedIndexes();
    if (filterRows) {
      filterRows.map((filterRow) => {
        const row = this.hotRegisterer
          .getInstance(this.id)
          .getSourceDataAtRow(filterRow) as any;
        visibleRows.push(row);
      });
    }
    // this.hotRegisterer.getInstance(this.id).loadData(visibleRows);
    return visibleRows;
  }
  recalculateColumns() {
    const filterRows = this.hotRegisterer
      .getInstance(this.id)
      .rowIndexMapper.getNotTrimmedIndexes();
  }

  afterFormulasValuesUpdate = (changes: any) => {};

  onCalculatedItemClick(e: any) {
    this.isRenderingFinished = false;

    setTimeout(() => {
      this.addCalculatedItem(e);
    }, 100);
  }

  addCalculatedItem(e: any) {
    if (typeof e.itemData !== 'undefined' || typeof e !== 'undefined') {
      const calculatedFiled = e?.itemData || e;
      calculatedFiled.isCheck = !calculatedFiled.isCheck;
      calculatedFiled.icon = calculatedFiled.isCheck ? 'check' : '';

      const myCols: any = [];

      let dataSourceData = this.hotRegisterer
        .getInstance(this.id)
        .getSourceData();

      dataSourceData.map((item: any, i) => {
        const yearData = item.YearsData;
        let colStaticColNo = Object.keys(item.ColumnsData).length;

        if (yearData) {
          let valueColIndex = 0;
          let isFirstCol = false;
          Object.keys(yearData).map((year: any) => {
            colStaticColNo++;
            if (calculatedFiled.isCheck) {
              if (
                typeof item.YearsData[year][calculatedFiled.name] ===
                'undefined'
              ) {
                item.YearsData[year][calculatedFiled.name] = '';
              }
            } else {
              delete item.YearsData[year][calculatedFiled.name];
            }

            if (!myCols.includes(...Object.keys(item.YearsData[year]))) {
              myCols.push(...Object.keys(item.YearsData[year]));
            }
          });
        }
      });

      let nestedHeader: any = [];
      this.colHeaders[0].map((colItem: any) => {
        if (typeof colItem.label !== 'undefined') {
          //if (!this.isVolumeYear) {
          colItem.colspan = myCols.length;
          myCols.map((nestedCol: any) => {
            nestedHeader.push(nestedCol);
          });
          // } else {
          //   nestedHeader = this.colHeaders[1];
          // }
        } else {
          nestedHeader.push(null);
        }
      });

      let columnLists: any = [];

      this.columns.map((cols: any, index: number) => {
        let colObj =
          typeof cols.data !== 'undefined' ? cols.data.split('.') : [];
        if (cols.data === `YearsData.${colObj[1]}.${this.calculatedField}`) {
          // let newCols: any = [];
          columnLists.push(cols);
          myCols.map((nestedCol: any) => {
            if (nestedCol !== this.calculatedField) {
              const newCols = {
                data: `YearsData.${colObj[1]}.${nestedCol}`,
                readOnly: true,
                width: 50,
                wordWrap: false,
                placeholder: '...',
                isCalculatedField: true,
              };
              columnLists.push(newCols);
            }
          });
          // columnLists.splice(index, 0, ...newCols);
        } else {
          columnLists.push(cols);
        }
      });

      if (typeof this.colHeaders[1] !== 'undefined') {
        this.colHeaders[1] = nestedHeader;
      } else {
        this.colHeaders.push(nestedHeader);
      }

      if (myCols.length <= 1) {
        this.colHeaders.pop();
      }
      // this.columns = this.colHeaders;

      this.valueColsIndexes = [];
      for (let h = 0; h <= nestedHeader.length; h++) {
        if (
          typeof nestedHeader[h] !== 'undefined' &&
          nestedHeader[h] === this.calculatedField
        ) {
          this.valueColsIndexes.push({
            prop: columnLists[h]?.data || '',
            index: h,
          });
          // this.valueColsIndexes.push(h + 1);
        }
      }

      const that = this;
      this.hotRegisterer.getInstance(this.id).updateSettings({
        columns: columnLists,
        colHeaders: this.colHeaders,
        nestedHeaders: this.nestedHeaders,

        cells(row, column, prop) {
          const cellProperties: any = {};
          cellProperties.calculatedField = that.calculatedField;
          cellProperties.dataSetId = that.dataSetId;
          cellProperties.valueColsIndexes = that.valueColsIndexes;
          cellProperties.calculatorContextMenuItems =
            that.calculatorContextMenuItems;
          cellProperties.showFormula = that.showFormula;
          cellProperties.renderer = that.cellRendererData.bind(this);

          return cellProperties;
        },
      });
      // console.log(nestedHeader);

      if (this.isFormulaAllowed) {
        dataSourceData = this.replaceCellReferences(dataSourceData);
      }

      this.showCellReferences();
      // setTimeout(() => {
      this.hotRegisterer.getInstance(this.id).loadData(dataSourceData);
      this.hotRegisterer.getInstance(this.id).render();
      // }, 100);
      this.applyStateFilters();
      // only for case itemData exists,only in this case is field added manually
      if (e.itemData) {
        if (e.itemData.value === 'percentOfTotal') {
          this.dataGridState.isPercentOfTotal = e.itemData.isCheck;
        }
        if (e.itemData.value === 'changePercent') {
          this.dataGridState.isChangePercent = e.itemData.isCheck;
        }
        if (e.itemData.value === 'cagr') {
          this.dataGridState.isCagr = e.itemData.isCheck;
        }
      }
    }
  }

  replaceCellReferences(dataSourceData: any) {
    // clone data and update and return only copy
    let dataSourceDataCopy = lodash.cloneDeep(dataSourceData);

    // check all cells for referencing
    dataSourceData.forEach((datasourceRow: any, datasourceRowIndex: any) => {
      //console.log(dataSourceData);
      const yearsData = datasourceRow.YearsData;
      let yearsDataIndex = 0;
      for (let yearData in yearsData) {
        // count with value if any formula exists
        if (yearsData[yearData].Value?.toString().startsWith('=', 0)) {
          console.log(yearsData[yearData].Value);
          // check if formula matching reference from reference list
          this.columnReferences.forEach(
            (reference: any, index: any, columnReferences: any) => {
              // regular expression for reference in formula
              const regFullReference = new RegExp(
                `\\\$?${reference}\\\$?[1-9][0-9]?[0-9]?[0-9]?`,
                'g'
              );
              // regular expression for reference
              const regColumnReference = new RegExp(`${reference}`, 'g');

              // value with formula
              const str = yearsData[yearData].Value;

              // get all matches
              const matchArr = str.match(regFullReference);

              // if matches exists, replace reference by new reference
              if (matchArr?.length) {
                const columnsDataReferenceCount = Object.keys(
                  datasourceRow.ColumnsData
                ).length;
                const yearsDataReferenceCount = Object.keys(yearsData).length;
                const yearDataPropCount = Object.keys(
                  yearsData[yearData]
                ).length;
                const matchedReferenceIndex = index;
                // compute new reference
                const newReference = this.getNewReference(
                  matchedReferenceIndex,
                  columnReferences,
                  columnsDataReferenceCount,
                  yearsDataReferenceCount,
                  yearDataPropCount
                );
                for (let match of matchArr) {
                  const replacedMatch = match.replace(
                    regColumnReference,
                    newReference
                  );
                  dataSourceDataCopy[datasourceRowIndex].YearsData[
                    yearData
                  ].Value = dataSourceDataCopy[datasourceRowIndex].YearsData[
                    yearData
                  ].Value.replace(match, replacedMatch);
                }
              }
            }
          );
        }

        //!!!! function have to count also with volume or units, use some enum way instead this
        //count with volume
        //if (yearsData[yearData].Volume?.toString().startsWith('=', 0)) {

        //}

        // TODO use enum in condition for all future cases
        // unit
        //if (yearsData[yearData].Unit?.toString().startsWith('=', 0)) {

        //}
        yearsDataIndex++;
      }
    });

    return dataSourceDataCopy;
  }

  getNewReference(
    matchedReferenceIndex: any,
    columnReferences: any,
    columnsDataReferenceCount: any,
    yearsDataReferenceCount: any,
    yearDataPropCount: any
  ) {
    // check the column position of changed reference

    //TODO Use yearDataPropCount to recognize how many calculated fielad are applied
    //TODO Figure out if user removing calculated fields

    const indexPositionInYearsData =
      yearsDataReferenceCount -
      (columnsDataReferenceCount +
        yearsDataReferenceCount -
        matchedReferenceIndex);
    return columnReferences[
      columnsDataReferenceCount + indexPositionInYearsData * 2
    ];
  }

  showCellReferences() {
    if (this.colHeaders.length > 1) {
      let newHeaderRow = [];
      for (
        let i = 0;
        i < this.colHeaders[this.colHeaders.length - 1].length;
        i++
      ) {
        // if (i === 0) {
        //   console.log(this.staticColumns.length);
        //   newHeaderRow.push({
        //     label: null,
        //     colspan: this.staticColumns.length,
        //   });
        // } else {
        // if (
        //   this.colHeaders[0][i] &&
        //   typeof this.colHeaders[0][i] !== 'object'
        // ) {
        //   newHeaderRow.push(this.colHeaders[0][i]);
        // }
        // }
      }
      // console.log(newHeaderRow);
      // this.colHeaders[0] = newHeaderRow;
      // console.log(this.colHeaders[1]);
      let nestedHeaderRow = [];
      for (let s of this.staticColumns) {
        nestedHeaderRow.push(s);
      }
      for (let h in this.colHeaders[1]) {
        if (this.colHeaders[1][h]) {
          nestedHeaderRow.push(this.colHeaders[1][h]);
        }
      }

      this.colHeaders[1] = nestedHeaderRow;
    }

    const columnReferences = this.columnReferences;

    // remove all existing references
    for (let headersArray in this.colHeaders) {
      for (let header in this.colHeaders[headersArray]) {
        if (
          typeof this.colHeaders[headersArray][header] === 'object' &&
          this.colHeaders[headersArray][header] !== null
        ) {
          this.colHeaders[headersArray][header]['label'] = this.colHeaders[
            headersArray
          ][header]['label']?.replace(/ *\([^)]*\) */g, '');
        } else {
          this.colHeaders[headersArray][header] =
            this.colHeaders[headersArray][header]?.replace(
              / *\([^)]*\) */g,
              ''
            ) || '';
        }
      }
    }

    // add reference to last nested level
    let index = 0;
    for (let header in this.colHeaders[this.colHeaders.length - 1]) {
      if (
        typeof this.colHeaders[this.colHeaders.length - 1][header] ===
          'object' &&
        this.colHeaders[this.colHeaders.length - 1][header] !== null
      ) {
        this.colHeaders[this.colHeaders.length - 1][header]['label'] =
          '(' +
          columnReferences[index] +
          ') ' +
          this.colHeaders[this.colHeaders.length - 1][header]['label'];
      } else {
        if (
          this.colHeaders[this.colHeaders.length - 1][header] === 'Value' ||
          this.colHeaders[this.colHeaders.length - 1][header] === 'Volume' ||
          this.colHeaders[this.colHeaders.length - 1][header] === 'Unit' ||
          /^[0-9]{4}$/.test(this.colHeaders[this.colHeaders.length - 1][header])
        ) {
          this.colHeaders[this.colHeaders.length - 1][header] =
            '(' +
            columnReferences[index] +
            ') ' +
            this.colHeaders[this.colHeaders.length - 1][header];
        }
      }
      index++;
    }

    const that = this;
    this.hotRegisterer.getInstance(this.id).updateSettings({
      colHeaders: this.colHeaders,
      afterGetColHeader(column: any, TH: any, cp: any) {
        if (that.colHeaders.length > 1) {
          // TH.classList.add('new-header');
          // console.log(that.colHeaders);
          if (cp == 0) {
            for (let i = 0; i < that.staticColumns.length; i++) {
              if (column == i) TH.classList.add('new-header');
            }
          }
        }
      },
      afterGetColumnHeaderRenderers(renderers) {},
    });
  }
}
