import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from '@full-fledged/alerts';
import { IsLoadingService } from '@service-work/is-loading';
import { ApiResponse } from 'src/model/apiResponse.model';
import { PendingChangesService } from 'src/services/pending-changes.service';
import { StudyService } from 'src/services/study.service';


@Component({
  selector: 'app-study-comments',
  templateUrl: './study-comments.component.html',
  styleUrls: ['./study-comments.component.css']
})
export class StudyCommentsComponent implements OnInit {
  viewNotePopup: boolean = false;
  @Input() set viewCommentPopup(data: boolean) {
    this.viewNotePopup = data;
  }
  dataItemCategoryId: number;
  marketYearCategoryId: number;
  @Input() set studyData(data: any) {
    this.dataItemCategoryId = data.dataItemCategoryId;
    this.marketYearCategoryId = data.marketYearCategoryId;
  }
  @Output() closeCommentPopup: EventEmitter<any> = new EventEmitter<any>();
  noteSubmit = false;
  newNoteForm: FormGroup;
  deleteCommentConfirmPopup: boolean = false;
  selectedRowNotes: any[] = [];
  deleteCommentData: any = {};

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
    this.dataItemCategoryId = params['studyArea'];
    this.newNoteForm = this.formBuilder.group({
      note: [null, Validators.required],
      rowData: [null],
    });

  }

  ngOnInit(): void {
  }

  onCommentBoxShowing() {
    this.getAllStudyComments();
  }

  onNotePopupHide() {
    this.noteSubmit = false;
    this.newNoteForm.reset();
    this.selectedRowNotes = [];
    this.viewNotePopup = false;
    this.closeCommentPopup.emit();
  }

  get n() {
    return this.newNoteForm.controls;
  }

  getAllStudyComments() {
    this.isLoadingService.add();
    this.studyService.getAllStudyNotes(
      this.dataItemCategoryId, this.marketYearCategoryId
    ).subscribe((data: ApiResponse) => {
      if (data.HttpStatusCode === 200) {
        this.selectedRowNotes = data.Data;
        this.viewNotePopup = true;
        this.isLoadingService.remove();
      }
    });
  }
  
  deleteComment(data: any) {
    this.deleteCommentData = data;
    this.deleteCommentConfirmPopup = true;
  }

  onDeleteCommentConfirmPopupHide() {
    this.deleteCommentData = {};
    this.deleteCommentConfirmPopup = false;
  }

  confirmDeleteComment() {
    this.isLoadingService.add();
    this.studyService
      .deleteStudyNotes(
        this.deleteCommentData.StudyNoteLogId,
        this.deleteCommentData.MarketYearCategoryDataId,
      )
      .subscribe(
        (res: ApiResponse) => {
          if (res.Data) {
            this.alertService.success(
              'Your data row has been removed successfully.'
            );
            this.deleteCommentConfirmPopup = false;
            this.pendingChangeService.setPendingChanges(true);
            this.getAllStudyComments();
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

  onSaveNote() {
    this.noteSubmit = true;
    if (this.newNoteForm.invalid) {
      return;
    }
    
    const newNote = this.newNoteForm.value.note;
    const formData = {
      dataItemCategoryId: this.dataItemCategoryId,
      marketYearCategoryDataId: this.marketYearCategoryId,
      note: newNote,
    };
    this.isLoadingService.add();
    this.studyService.saveStudyNote(formData)
    .subscribe(
      (res: ApiResponse) => {
        if (res.HttpStatusCode === 200) {
          this.alertService.success(res.Data);
          this.isLoadingService.remove();
          this.noteSubmit = false;
          this.newNoteForm.reset();
          this.getAllStudyComments();
          this.pendingChangeService.setPendingChanges(true);
        } else {
          this.alertService.danger(res.Data);
          this.isLoadingService.remove();
        }
      },
      (err) => {
        this.alertService.danger(
          'Something went wrong. Please try after sometime.'
        );
        this.isLoadingService.remove();
      }
    );
  }

}
