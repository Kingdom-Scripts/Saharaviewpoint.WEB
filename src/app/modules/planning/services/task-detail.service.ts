import { inject, Injectable } from '@angular/core';
import { TaskService } from '@svp-api-services';
import { Result, DocumentModel } from '@svp-models';
import { NotificationService } from '@svp-services';

export interface FileToUploadModel extends File {
  localUid?: string;
}

@Injectable({ providedIn: 'root' })
export class TaskDetailService {
  taskService = inject(TaskService);
  notify = inject(NotificationService);

  attachments!: FileToUploadModel[] | DocumentModel[];
  taskId!: number;

  /**
   * The function `loadAttachments` assigns a unique localUid to each attachment retrieved for a given
   * taskId.
   * @param {number} taskId - The `taskId` parameter is a number that represents the unique identifier
   * of a task for which attachments need to be loaded.
   */
  loadAttachments(taskId: number): void {
    this.taskId = taskId;
    this.taskService.listAttachments(taskId).subscribe((res: Result<DocumentModel[]>) => {
      if (res.success) {
        // generate a unique localUid for each attachment
        this.attachments = res.content!.map((a: DocumentModel) => {
          a.localUid = Math.random().toString(36).substring(2);
          return a;
        });
      } else {
        this.notify.timedErrorMessage(res.title, res.message);
      }
    });
  }

  /**
   * The function `uploadAttachments` takes an event triggered by file upload, extracts the files,
   * assigns a unique identifier to each file, and adds them to an array of attachments.
   * @param {Event} e - The parameter `e` in the `uploadAttachments` function represents an event
   * object. In this case, it is of type `Event`, which is a standard DOM event object that is
   * typically passed to event handlers in JavaScript. The event object contains information about the
   * event that occurred, such as the target
   * @returns The function `uploadAttachments` returns `void`, which means it does not return any
   * value.
   */
  uploadAttachments(e: Event): void {
    const target = e.target as HTMLInputElement;
    const files = target.files as File[] | null;

    if (files == null) {
      return;
    }

    // loop through the files
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileToUpload: FileToUploadModel = file;
      fileToUpload.localUid = Math.random().toString(36).substring(2);

      this.attachments.push(fileToUpload);
    }

    // Reset the file input value to allow re-selection of the same file
    target.value = '';
  }

  /**
   * The function `updateAttachmentReference` updates an attachment reference in an array based on a
   * matching localUid.
   * @param {DocumentModel} attachment - DocumentModel
   * @returns If the index of the attachment with the matching localUid is not found in the attachments
   * array, the function will return early without making any changes.
   */
  updateAttachmentReference(attachment: DocumentModel): void {
    const index = this.attachments.findIndex(a => a.localUid === attachment.localUid);
    if (index === -1) {
      return;
    }

    this.attachments[index] = attachment;
  }

  async deleteAttachment(file: FileToUploadModel | DocumentModel, skipConfirm = false): Promise<void> {
    // confirm action
    if (!skipConfirm) {
      const confirmed = await this.notify.confirmDelete();
      if (!confirmed) return;
    }

    // get the attachment localUid
    const attachment = this.attachments.find(a => a.localUid === file.localUid);

    if (!attachment) {
      return;
    }

    // Delete the attachment if it is uploaded already
    if ('id' in attachment! && attachment.id && attachment.id !== 0) {
      this.notify.showLoader();
      this.taskService.deleteAttachment(this.taskId, attachment.id as number).subscribe((res: Result<string>) => {
        this.notify.hideLoader();
        if (res.success) {
          this.notify.timedSuccessMessage('Attachment Deleted', `${attachment.name} has been deleted successfully`);

          this.attachments = this.attachments.filter(a => a.localUid !== attachment.localUid);
        } else {
          this.notify.errorMessage(`Unable to delete ${attachment.name}`, res.message);
        }
      });
    }

    // Remove the attachment from the list if it is not uploaded yet
    else {
      this.attachments = this.attachments.filter(a => a.localUid !== attachment.localUid);
    }
  }
}
