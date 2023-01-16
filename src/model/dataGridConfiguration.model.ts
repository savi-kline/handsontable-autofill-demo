export class DataGridConfiguration {
  basicSettings: BasicSettings = new BasicSettings();
  handontableSettings: HandsOnTableSettings = new HandsOnTableSettings();
  fields: Field[] = [new Field()];
}

export class BasicSettings {
  title: string = '';
}

export class HandsOnTableSettings {
  dropdownMenu: boolean = false;
  filters: boolean = false;
  columnSorting: boolean = false;
  copyPaste: boolean = false;
  decimalPlaces: number = 2;
}

export class Field {
  isVisible: boolean = true;
  isYearValue: boolean = false;
  caption: string = '';
  dataField: string = '';
  width: number = 150;
  formula: string = '';
  isValue: boolean = false;
  dataType: string = '';
  fieldType: string = '';
  readOnly: boolean = false;
  yearType: string[] = [];
  isVisibleToAddRow: boolean = true;
  isVolumeYear: boolean = false;
  isYearWiseVolume: boolean = false;
  isForecastVolume: boolean = false;
  isEditable: boolean = true;
}
