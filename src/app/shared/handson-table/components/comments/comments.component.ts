import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from '@full-fledged/alerts';
import { IsLoadingService } from '@service-work/is-loading';
import { ApiResponse } from 'src/model/apiResponse.model';
import { PendingChangesService } from 'src/services/pending-changes.service';
import { StudyService } from 'src/services/study.service';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css'],
})
export class CommentsComponent implements OnInit {
  marketYearCategoryId: number = 0;
  studyProjectMarketYearId: number = 0;
  studyAreaId: number = 0;
  dataSetId: number = 0;

  viewNotePopup: boolean = false;
  selectedCommentCellData: any = {};
  selectedRowNotes: any;
  newNoteForm: FormGroup;
  noteSubmit = false;

  @Input() set viewCommentPopup(data: boolean) {
    this.viewNotePopup = data;
  }

  @Input() set setCommentCellData(data: any) {
    console.log(data);
    this.selectedCommentCellData = data;
  }

  @Output() onCommentBoxHidden = new EventEmitter<string>();
  @Output() onCommentAdded = new EventEmitter<any>();
  @Output() onCommentEmpty = new EventEmitter<any>();

  deleteCommentConfirmPopup: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private studyService: StudyService,
    private isLoadingService: IsLoadingService,
    private alertService: AlertService,
    private pendingChangeService: PendingChangesService
  ) {
    const params = this.route.snapshot.params;

    this.marketYearCategoryId = params['mycId'];
    this.studyProjectMarketYearId = params['spmId'];
    this.studyAreaId = params['studyArea'];
    this.dataSetId = params['dataSetId'];

    this.newNoteForm = this.formBuilder.group({
      note: [null, Validators.required],
      rowData: [null],
    });
  }

  ngOnInit(): void {}

  get n() {
    return this.newNoteForm.controls;
  }

  onNotePopupHide() {
    this.noteSubmit = false;
    this.newNoteForm.reset();
    this.selectedRowNotes = [];
    this.viewNotePopup = false;
    this.selectedCommentCellData = {};
    this.onCommentBoxHidden.emit();
  }

  onCommentBoxShowing() {
    this.getCellLevelComments();
  }

  getCellLevelComments() {
    const dataRowId = this.selectedCommentCellData.dataRowId;
    const cellColYear = this.selectedCommentCellData.colCaption;
    const attrType = this.selectedCommentCellData.attrType;

    this.isLoadingService.add();
    this.studyService
      .getCellCommentsForStudy(
        this.studyAreaId,
        this.marketYearCategoryId,
        dataRowId,
        cellColYear,
        attrType
      )
      .subscribe((data: ApiResponse) => {
        if (data.HttpStatusCode === 200) {
          this.selectedRowNotes = data.Data;
          this.viewNotePopup = true;

          if (
            this.selectedRowNotes.length === 0 &&
            this.selectedCommentCellData
          ) {
            if (
              this.selectedCommentCellData &&
              typeof this.selectedCommentCellData.currentRowData['allComments'][
                this.selectedCommentCellData.colValue
              ] !== 'undefined'
            ) {
              this.selectedCommentCellData.currentRowData['allComments'][
                this.selectedCommentCellData.colValue
              ][this.selectedCommentCellData.attrType] = false;
            }

            this.onCommentEmpty.emit(this.selectedCommentCellData);
          }

          this.isLoadingService.remove();
        }
      });
  }

  onSaveNote() {
    this.noteSubmit = true;
    if (this.newNoteForm.invalid) {
      return;
    }

    if (!this.selectedCommentCellData) {
      return;
    }

    const newNote = this.newNoteForm.value.note;

    const formData = {
      dataItemCategoryId: this.studyAreaId,
      marketYearCategoryDataId: this.marketYearCategoryId,
      draftDataRowId: this.selectedCommentCellData.dataRowId,
      columnName: this.selectedCommentCellData.colValue,
      attributeType: this.selectedCommentCellData.attrType,
      comment: newNote,
    };
    this.isLoadingService.add();
    this.studyService.addCommentForCell(formData).subscribe(
      (res: ApiResponse) => {
        if (res.HttpStatusCode === 200) {
          this.alertService.success(res.Data);
          this.isLoadingService.remove();
          this.pendingChangeService.setPendingChanges(true);
          if (
            this.selectedCommentCellData.currentRowData &&
            typeof this.selectedCommentCellData.currentRowData[
              'allComments'
            ] !== 'undefined'
          ) {
            if (
              typeof this.selectedCommentCellData.currentRowData['allComments'][
                this.selectedCommentCellData.colValue
              ] === 'undefined'
            ) {
              this.selectedCommentCellData.currentRowData['allComments'][
                this.selectedCommentCellData.colValue
              ] = [];
            }

            if (
              typeof this.selectedCommentCellData.currentRowData['allComments'][
                this.selectedCommentCellData.colValue
              ][this.selectedCommentCellData.attrType] === 'undefined'
            ) {
              this.selectedCommentCellData.currentRowData['allComments'][
                this.selectedCommentCellData.colValue
              ][this.selectedCommentCellData.attrType] = true;
            }
          }

          this.onCommentAdded.emit(this.selectedCommentCellData);

          this.noteSubmit = false;
          this.newNoteForm.reset();

          this.getCellLevelComments();
        } else {
          this.alertService.danger(res.Data);
          this.isLoadingService.remove();
        }
      },
      (err) => {
        // console.log(err);
        this.alertService.danger(
          'Something went wrong. Please try after sometime.'
        );
        this.isLoadingService.remove();
      }
    );
  }

  deleteCommentData: any = {};
  deleteComment(data: any) {
    this.deleteCommentData = data;
    this.deleteCommentConfirmPopup = true;
    // this.viewNotePopup = false;
  }

  onDeleteCommentConfirmPopupHide() {
    this.deleteCommentData = {};
    this.deleteCommentConfirmPopup = false;
  }

  confirmDeleteComment() {
    this.isLoadingService.add();
    const colValue = this.deleteCommentData.ColumnName;
    const dataRowId = this.deleteCommentData.DraftDataRowId;
    this.studyService
      .deleteCellComment(
        this.deleteCommentData.MarketYearCategoryDataId,
        dataRowId,
        colValue,
        this.deleteCommentData.Id
      )
      .subscribe(
        (res: ApiResponse) => {
          if (res.Data) {
            this.alertService.success(
              'Cell level comment removed successfully.'
            );
            this.deleteCommentConfirmPopup = false;
            this.getCellLevelComments();
            this.pendingChangeService.setPendingChanges(true);
          } else {
            this.alertService.danger(
              'Error: Something went wrong. Data row can not removed.'
            );
          }
          this.isLoadingService.remove();
        },
        (err) => {
          const msg =
            typeof err.error !== 'undefined' && err.error !== ''
              ? err.error
              : 'Error: Something went wrong.';

          this.onDeleteCommentConfirmPopupHide();
          this.alertService.danger(msg);
          this.isLoadingService.remove();
        }
      );
  }
}
