import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common'

import { JobTrainingProvider } from '../Providers/Service';
import { TraineeFormsService } from '../Views/TraineeForms/trainee-forms.service';
import * as JobTrainingModel from '../Providers/Model';
import * as JT_FormsModel from '../Providers/Forms.Model';
import * as JT_ReportsModel from '../Providers/Reports.Model';

import { isNullOrUndefined } from 'is-what';
import * as pdfmake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';


@Injectable()
export class PDFExportService {

    /*
     * This service uses the PDFMAKE library to create PDF files for exporting forms.
     * @see https://pdfmake.github.io/docs/
     */

    constructor(
        private datePipe: DatePipe,
        private jobTrainingService: JobTrainingProvider,
        private traineeFormsService: TraineeFormsService
    ) { }

    /**
     * Structures the forms as desired and passes them to pdfmake for PDF creation
     * @param forms
     * @param taskList (optional)
     */
    public exportFormsToPDF(forms: JT_FormsModel.FullFormInfo[], taskList: JobTrainingModel.FullTraineeTaskListInfo = undefined): void {
        // Font setup
        pdfmake.vfs = pdfFonts.pdfMake.vfs;

        // Cache for all content in the document
        const content: any[] = [];

        // If more than one form was passed in, create a Table of Contents
        if (forms.length > 1) {
            content.push(this._makePDFTableOfContents());
        }

        // If given a task list, create summary information
        if (taskList !== undefined) {
            content.push(this._makePDFTaskList(taskList));
        }

        var nForms = forms.length;
        // Make the header and body for each form page
        forms.forEach((form, index) => {
            content.push(this._makeFormPDFHeaderContent(form, index + 1));
            content.push(this._makeFormPDFBodyContent(form));
            /**
             * Empty node with a page break after it to ensure forms start on new pages.
             * We only add this if it's NOT the last page.
             * We skip the last page because this code would make an additional blank page on the end.
             * This logic also works if there is only 1 form given in the [forms] array.
             */
            var isLastForm = ((index + 1) == nForms);
            if (!isLastForm) {
                content.push({ text: '', pageBreak: 'after' });
            }
        });

        // Main document definition for pdfmake API
        const docDefinition = {
            content: content,
            styles: {
                /* PDF - form header styles */
                header_left: {
                    bold: true,
                    fontSize: 16
                },
                header_right: {
                    bold: true,
                    fontSize: 16,
                    alignment: 'right'
                },
                sub_header_left: {
                    fontSize: 14,
                    decoration: 'underline',
                    margin: [0, 0, 0, 8],
                    alignment: 'left' // not really necessary
                },
                sub_header_right: {
                    fontSize: 14,
                    alignment: 'right'
                },
                /* PDF - form instructions styles */
                form_instructions_header: {
                    fontSize: 14,
                    decoration: 'underline',
                    margin: [0, 0, 0, 8]
                },
                form_instructions: {
                    margin: [0, 0, 0, 8]
                },
                form_instructions_likert_row: {
                    margin: [0, 0, 0, 8],
                    alignment: 'center'
                },
                /* PDF - form category & field styles */
                form_category: {
                    fontSize: 14,
                    decoration: 'underline',
                    margin: [0, 0, 0, 8]
                },
                form_field: {
                    fontSize: 12,
                    margin: [0, 0, 0, 8]
                },
                form_field_value: {
                    fontSize: 12,
                    margin: [8, 0, 0, 8]
                },
                form_field_value_empty: {
                    margin: [0, 0, 0, 24],
                },
                /* PDF - form field signature styles */
                form_signature_value: {
                    margin: [8, 0, 0, 8]
                },
                /* PDF - form field feedback styles */
                form_feedback_value: {
                    margin: [8, 0, 0, 8]
                },
                form_feedback_links_header: {
                    decoration: 'underline',
                    margin: [8, 0, 0, 8]
                },
                form_feedback_links_row: {
                    margin: [8, 0, 0, 8]
                },
            },
            pageSize: 'A4',
            pageOrientation: 'portrait'
        };

        // Make the PDF and open in a new tab/window
        pdfmake.createPdf(docDefinition).open();
    }

    /**
     * Creates a Table of Contents using the pdfmake API and our list of forms
     * @param forms
     */
    private _makePDFTableOfContents(): object[] {
        // Cache for header nodes
        const headerColumns = [];

        // First header column is trainee name.
        headerColumns.push({
            text: this._formatTraineeDisplayName(this.traineeFormsService.traineeUserInfo),
            style: 'header_left'
        });
        //headerColumns.push({ text: this.jobTrainingService.selectedProgram.Name, style: 'header_left' });

        // Second header column is:
        // - Program Name
        // - Trainee Summary Data
        // - Plaintext "Table of Contents"        
        const rightsideHeaderColumn = [];

        rightsideHeaderColumn.push({
            text: this.jobTrainingService.selectedProgram.Name,
            style: 'header_right'
        });
        this.traineeFormsService.traineeUserInfo.Summary.FormattedData.forEach(data => {
            rightsideHeaderColumn.push({
                text: data.DataName + ': ' + data.DataValue,
                style: 'sub_header_right'
            });
        });
        rightsideHeaderColumn.push({
            text: 'Table of Contents',
            style: 'sub_header_right'
        });
        headerColumns.push(rightsideHeaderColumn);

        // Register a built-in Table of Contents
        const tableOfContents = {
            toc: {
                title: { text: '' }
            }
        };

        return [
            { columns: headerColumns }, // Top of the document, header columns left-to-right
            { text: ' ' }, // Blank node to force 1 line of space between the header content and start of ToC
            tableOfContents, // Generated Table of Contents
            { text: '', pageBreak: 'after' } // Empty node with [pageBreak] to ensure forms start on a new page
        ];
    }

    /**
     * Structures task list readable left-to-right on a new page
     * @param taskList 
     */
    private _makePDFTaskList(taskList: JobTrainingModel.FullTraineeTaskListInfo): object[] {
        // Cache for header nodes
        const headerColumns = [];

        // First header column is program name
        headerColumns.push({ text: this.jobTrainingService.selectedProgram.Name, style: 'header_left' });

        // Second header column is:
        // - "Task List"
        // - Trainee Name
        const infoColumn = [];
        infoColumn.push({ text: 'Task List', style: 'header_right', tocItem: true });
        infoColumn.push({
            text: this._formatTraineeDisplayName(this.traineeFormsService.traineeUserInfo),
            style: 'sub_header_right'
        });
        headerColumns.push(infoColumn);

        // Construct actual TaskList data
        /* JDB 8/7/2020 
         * This particular block has gone through tens of iterations. The original idea was
         * to keep this data formatted in the same column-like format as the page displays it.
         * That method proved unreliable here as there was no way to guarantee summary items would
         * line up horizontally with their corresponding task/category items.
         * 
         * We're now just putting the data in a linear format for readability.
         */
        const taskListNodes = [];
        taskList.Categories.forEach(category => {
            taskListNodes.push({ text: category.Name, style: { bold: true } });
            category.Tasks.forEach(task => {
                taskListNodes.push({ text: task.Name });
                task.Summary.FormattedData.forEach(data => {
                    taskListNodes.push({ text: '-- ' + data.DataName + ': ' + data.DataValue });
                });
            });
            taskListNodes.push({ text: ' ' }); // Blank node to ensure categories are separated by 1 line
        });

        return [
            { columns: headerColumns }, // Top of the document, header columns left-to-right
            { text: ' ' }, // Blank node to force 1 line of space between the header content and start of Summary
            taskListNodes, // Formatted TaskList data
            { text: '', pageBreak: 'after' } // Empty node with [pageBreak] to ensure forms start on a new page
        ];
    }

    /**
     * Creates header nodes for a given form
     * @param form 
     * @param index - Included to help number the ToC items
     */
    private _makeFormPDFHeaderContent(form: JT_FormsModel.FullFormInfo, index: number): object {
        // Cache for header nodes
        const headerColumns = [];

        // First header column is program name
        headerColumns.push(
            { text: this.jobTrainingService.selectedProgram.Name, style: 'header_left' }
        );

        // Second header column is:
        // - Invisible/fake anchor for the Table of Contents
        // - Form name
        // - Trainee Name
        // - Entry date, if relevant
        const formInfoColumn = [];
        formInfoColumn.push(
            // The idea here is to fake an anchor with the desired text (index. FormName - EntryDate) for the ToC, then put the actual item beneath it.
            {
                text: index + '. ' + form.Name + ' - ' + this.datePipe.transform(form.TraineeFormRecordInfo.Date, 'MM/dd/yyyy'),
                style: {
                    fontSize: '0'
                },
                tocItem: true
            },
            // This is the actual item shown on the page.
            { text: form.Name, style: 'header_right' }
        );
        formInfoColumn.push(
            {
                text: this._formatTraineeDisplayName(this.traineeFormsService.traineeUserInfo),
                style: 'sub_header_right'
            }
        );
        if (form.IncludeDateField) {
            formInfoColumn.push(
                {
                    // Get date formatted.
                    text: this.datePipe.transform(form.TraineeFormRecordInfo.Date, 'MM/dd/yyyy'),
                    style: 'sub_header_right'
                }
            );
        }
        headerColumns.push(formInfoColumn);

        return {
            columns: headerColumns // Top of the document, header columns left-to-right
        };
    }

    private _formatTraineeDisplayName(traineeUserInfo: JobTrainingModel.TraineeUserInfo) {
        var formattedDisplayName = traineeUserInfo.DisplayName;
        if (!isNullOrUndefined(traineeUserInfo.AcadisID) && (traineeUserInfo.AcadisID !== '')) {
            formattedDisplayName += ' (' + traineeUserInfo.AcadisID + ')';
        }
        return formattedDisplayName;
    }

    /**
     * Creates body content nodes for a given form
     * @param form 
     */
    private _makeFormPDFBodyContent(form: JT_FormsModel.FullFormInfo): object[] {
        // Cache for body nodes
        const bodyContent = [];

        if (form.HasInstructions) {
            // Get instructions + (conditionally)likert inserted.
            bodyContent.push(
                { text: 'Instructions', style: 'form_instructions_header' }
            );

            // Create a tempDiv element to let us extract the plaintext instructions for use in the PDF.
            const instructionsHTML = form.Instructions;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = instructionsHTML;
            const instructionsPlainText = tempDiv.innerText;
            bodyContent.push(
                { text: instructionsPlainText, style: 'form_instructions' }
            );

            // Check for likert existance, then check if it should be shown with the form instructions.
            if (form.HasLikert && form.Likert.IncludeLikertBelowFormInstructions) {
                const pdfContent_likertTableHeader = {
                    columns: [], style: 'form_instructions_likert_row'
                };
                const pdfContent_likertTableBody = {
                    columns: [], style: 'form_instructions_likert_row'
                };
                form.Likert.Ratings.forEach(loopedRating => {
                    if (loopedRating.ShowInTable) {
                        if (loopedRating.Description !== '') {
                            pdfContent_likertTableHeader.columns.push(
                                // *-width should get the equal space divided by the number of all starsized columns
                                { text: loopedRating.Description, width: '*' }
                            );
                        }
                        pdfContent_likertTableBody.columns.push(
                            { text: (loopedRating.Text) }
                        )
                    }
                });
                bodyContent.push(pdfContent_likertTableHeader);
                bodyContent.push(pdfContent_likertTableBody);

                const pdfContent_likertExtraOptions = {
                    columns: [], style: 'form_instructions_likert_row'
                }
                form.Likert.Ratings.forEach(loopedRating => {
                    if (!loopedRating.ShowInTable) {
                        pdfContent_likertExtraOptions.columns.push(
                            { text: (loopedRating.Description) }
                        );
                    }
                });
                bodyContent.push(pdfContent_likertExtraOptions);
            }
        }
        // End of instructions & likert header.
        if (form.Categories) {
            form.Categories.forEach(loopedCategory => {
                bodyContent.push(
                    { text: loopedCategory.Name, style: 'form_category' }
                    /**
                     * TODO - Consider showing summarized likert scores, IF all fields are filled.
                     * We wouldn't want to prematurely show a summarized score because the user
                     * may intend to fill those fields out by hand and we can't sync the data
                     * once it's printed or whatever lol.
                     */
                );

                if (loopedCategory.HasTable) {
                    // TODO - Implement PDF export for "table-type forms.
                }
                else {
                    loopedCategory.Fields.forEach((loopedField, fieldIndex) => {
                        const pdfContent_field = this._makePDFBodyContent_Field(form, loopedField, fieldIndex);

                        bodyContent.push(pdfContent_field);
                    });
                }
            });
        }
        return bodyContent;
    }

    /**
     * Creates full field data nodes for a given form
     * @param form 
     * @param field 
     * @param fieldIndex 
     */
    private _makePDFBodyContent_Field(form: JT_FormsModel.FullFormInfo, field: JT_FormsModel.FormFieldInfo, fieldIndex: number): object[] {
        const _1basedFieldIndex = (fieldIndex + 1);
        const fieldText = _1basedFieldIndex + '. ' + field.Text;
        const pdfContent_fieldLabel = { text: fieldText, style: 'form_field' };

        let pdfContent_fieldValue = this._makePDFBodyContent_EmptyField();

        /**
         * Make a copy of [field.EntryInfo.Value] so we send it in to our [_makePDFBodyContent-...] style 
         * methods. The methods will ultimately manipulate the data, and we don't want to accidentally
         * overwrite the entry data as we export it.
         */
        const copiedEntryInfo: JT_FormsModel.TraineeFormEntryInfo = JSON.parse(JSON.stringify(field.EntryInfo));
        switch (field.FieldType.Type) {
            case 'Signature':
                pdfContent_fieldValue = this._makePDFBodyContent_SignatureField(copiedEntryInfo);
                break;
            case 'Number':
            case 'Textarea':
            case 'Textbox':
            case 'YesNo':
            case 'TaskName': // 'TaskName' is readonly but that should be okay for the TextField method.
                pdfContent_fieldValue = this._makePDFBodyContent_TextField(copiedEntryInfo);
                break;
            case 'DatePicker':
            case 'DateTimePicker':
                pdfContent_fieldValue = this._makePDFBodyContent_DateField(copiedEntryInfo);
                break;
            case 'Likert':
                pdfContent_fieldValue = this._makePDFBodyContent_LikertField(form, copiedEntryInfo);
                break;
            case 'RadioGroup':
                pdfContent_fieldValue = this._makePDFBodyContent_RadioGroupField(field, copiedEntryInfo);
                break;
            case 'DropDownList':
                pdfContent_fieldValue = this._makePDFBodyContent_DropDownListField(field, copiedEntryInfo);
                break;
            case 'ReportTable':
                pdfContent_fieldValue = this._makePDFBodyContent_ReportTable(copiedEntryInfo);
                break;
            case 'Instructions':
                // No need to provide a text or styling on the non-existant value of an instructions field.
                pdfContent_fieldValue = { text: '' };
                break;
            default:
                // We don't know the field type, fall back to an empty value.
                pdfContent_fieldValue = this._makePDFBodyContent_EmptyField();
                break;
        }

        /**
         *[pdfContent_signatureInfo] won't always get populated. It's based on the
         * field.[ShowSignatureInfo] property.
         */
        const pdfContent_signatureInfo = this._makePDFBodyContent_FieldSignatureInfo(field, copiedEntryInfo);

        // Consider field feedback & links.
        const pdfContent_feedback = this._makePDFBodyContent_FieldFeedback(copiedEntryInfo);

        return [
            pdfContent_fieldLabel,
            pdfContent_fieldValue,
            pdfContent_signatureInfo,
            pdfContent_feedback
        ];
    }

    /**
     * Creates text field nodes
     * @param entryInfo 
     */
    private _makePDFBodyContent_TextField(entryInfo: JT_FormsModel.TraineeFormEntryInfo): object {
        let pdfContent_fieldValue = {};
        if (entryInfo.HasValue) {
            pdfContent_fieldValue = { text: entryInfo.Value, style: 'form_field_value' };
        }
        else {
            pdfContent_fieldValue = this._makePDFBodyContent_EmptyField();
        }
        return pdfContent_fieldValue;
    }

    /**
     * Creates date field nodes
     * @param entryInfo 
     */
    private _makePDFBodyContent_DateField(entryInfo: JT_FormsModel.TraineeFormEntryInfo): object {
        let pdfContent_fieldValue = {};
        if (entryInfo.HasValue) {
            pdfContent_fieldValue = { text: entryInfo.Value, style: 'form_field_value' };
        }
        else {
            pdfContent_fieldValue = this._makePDFBodyContent_EmptyField();
        }
        return pdfContent_fieldValue;
    }

    /**
     * Creates signature field nodes
     * @param entryInfo 
     */
    private _makePDFBodyContent_SignatureField(entryInfo: JT_FormsModel.TraineeFormEntryInfo): object {
        let pdfContent_fieldValue = {};
        if (entryInfo.HasValue && (entryInfo.Value !== false) && (entryInfo.Value !== 'false')) {
            const contentText = 'Signed - '
                + entryInfo.CreatedByDisplayName
                // Format date time values
                + ' (' + this.datePipe.transform(entryInfo.CreatedOnDate, 'MM/dd/yyyy HH:mm') + ')';

            pdfContent_fieldValue = { text: contentText, style: 'form_field_value' };
        }
        else {
            pdfContent_fieldValue = this._makePDFBodyContent_EmptyField();
        }
        return pdfContent_fieldValue;
    }

    /**
     * Creates likert field nodes
     * @param form
     * @param entryInfo
     */
    private _makePDFBodyContent_LikertField(form: JT_FormsModel.FullFormInfo, entryInfo: JT_FormsModel.TraineeFormEntryInfo): object {
        let pdfContent_fieldValue: any;

        /**
         * Likert may be disabled (or not even set up yet), so we check [HasLikert] here
         * before trying to access & loop the likert & ratings.
         */
        if (form.HasLikert) {
            pdfContent_fieldValue = {
                columns: [],
                style: 'form_field_value'
            };


            form.Likert.Ratings.forEach((loopedRating) => {
                let ratingIsSelected = false;
                if (entryInfo.HasValue) {
                    if (loopedRating.RatingID.toString() === entryInfo.Value.toString()) {
                        ratingIsSelected = true;
                    }
                }

                if (ratingIsSelected) {
                    /**
                     * In pdfMake there doesn't appear to be a good way to draw a border around a single bit
                     * of text. But we can cheat and use a "table".
                     * 
                     * So for the selected likert option we will use a table.
                     */
                    pdfContent_fieldValue.columns.push(
                        {
                            table: {
                                body: [
                                    [{ text: loopedRating.Text }]
                                ]
                            }
                        }
                    )
                }
                else {
                    pdfContent_fieldValue.columns.push(
                        { text: loopedRating.Text }
                    )
                }

            });
        }
        else {
            // There was no likert yet, just return an empty field.
            pdfContent_fieldValue = this._makePDFBodyContent_EmptyField();
        }

        return pdfContent_fieldValue;
    }

    /**
     * Creates RadioGroup nodes
     * @param field 
     * @param entryInfo 
     */
    private _makePDFBodyContent_RadioGroupField(field: JT_FormsModel.FormFieldInfo, entryInfo: JT_FormsModel.TraineeFormEntryInfo): object {
        let pdfContent_fieldValue: any;

        if (entryInfo.HasValue) {
            pdfContent_fieldValue = {
                columns: [],
                style: 'form_field_value'
            };

            field.Options.forEach((loopedOption) => {
                let optionIsSelected = false;
                if (entryInfo.HasValue) {
                    if (loopedOption.OptionID.toString() === entryInfo.Value.toString()) {
                        optionIsSelected = true;
                    }
                }

                if (optionIsSelected) {
                    /**
                     * In pdfMake there doesn't appear to be a good way to draw a border around a single bit
                     * of text. But we can cheat and use a "table".
                     * 
                     * So for the selected likert option we will use a table.
                     */
                    pdfContent_fieldValue.columns.push(
                        {
                            table: {
                                body: [
                                    [{ text: loopedOption.Text }]
                                ]
                            }
                        }
                    )
                }
                else {
                    pdfContent_fieldValue.columns.push(
                        { text: loopedOption.Text }
                    )
                }
            });
        }
        else {
            /**
             * There was no option selected yet, just return an empty field.
             * If we try to loop & display options it shows something like...
             * "Nothing selected, yet." Which doesn't make sense on the piece of paper.
             */
            pdfContent_fieldValue = this._makePDFBodyContent_EmptyField();
        }

        return pdfContent_fieldValue;
    }


    /**
     * Creates dropdown list nodes
     * @param field 
     * @param entryInfo 
     */
    private _makePDFBodyContent_DropDownListField(field: JT_FormsModel.FormFieldInfo, entryInfo: JT_FormsModel.TraineeFormEntryInfo): object {
        let pdfContent_fieldValue = {};

        let hasMatchedOption = false;

        if (entryInfo.HasValue) {
            field.Options.forEach(loopedOption => {
                if (loopedOption.OptionID.toString() === entryInfo.Value.toString()) {
                    hasMatchedOption = true;
                    pdfContent_fieldValue = { text: loopedOption.Text, style: 'form_field_value' };
                }
            });
        }

        if (!hasMatchedOption) {
            /**
             * There was no selected value, or the matching option for the selected value wasn't found.
             * Fall back to an empty field.
             */
            pdfContent_fieldValue = this._makePDFBodyContent_EmptyField();
        }
        return pdfContent_fieldValue;
    }

    /**
     * Creates report table nodes
     * @param entryInfo
     */
    private _makePDFBodyContent_ReportTable(entryInfo: JT_FormsModel.TraineeFormEntryInfo): object {
        let pdfContent_fieldValue = {
            table: {
                body: []
            },
            style: 'form_field_value'
        };

        let parsedReport = new JT_ReportsModel.FormattedReportInfo();
        if (typeof entryInfo.Value == 'string') {
            // JDB 7/29/2020 - Sometimes [entryInfo.Value] is still a string 
            // after being JSON-parsed by the caller of this function.
            parsedReport = JSON.parse(entryInfo.Value);
        }
        else {
            // The report was probably alreayd parsed. Let's try to use it!
            parsedReport = entryInfo.Value;
        }

        var formattedHeaderCells = this._makePDFBodyContent_ReportTableRow(parsedReport.HeaderRow);
        pdfContent_fieldValue.table.body.push(formattedHeaderCells);

        parsedReport.BodyRows.forEach(loopedBodyRow => {
            var formattedCells = this._makePDFBodyContent_ReportTableRow(loopedBodyRow);
            pdfContent_fieldValue.table.body.push(formattedCells);
        });

        // JDB 7/29/2020 - pdfmake expects at least 1 node in the body array
        if (!pdfContent_fieldValue.table.body.length) {
            pdfContent_fieldValue.table.body.push(this._makePDFBodyContent_EmptyField());
        }
        return pdfContent_fieldValue;
    }

    private _makePDFBodyContent_ReportTableRow(rowInfo: JT_ReportsModel.FormattedReportRowInfo): object[] {
        var formattedCells = [];
        rowInfo.Cells.forEach(loopedCell => {
            formattedCells.push({
                text: loopedCell.Text,
                colSpan: loopedCell._ColSpan
            });
        });
        return formattedCells;
    }

    /**
     * Creates an empty field node
     */
    private _makePDFBodyContent_EmptyField(): object {
        return { text: '', style: 'form_field_value_empty' };
    }


    private _makePDFBodyContent_FieldSignatureInfo(field: JT_FormsModel.FormFieldInfo, entryInfo: JT_FormsModel.TraineeFormEntryInfo) {
        const pdfContent_signatureInfo = [];
        if (field.ShowSignatureInfo && entryInfo.HasValue) {
            // [formattedSignatureText] - User who filled out the field signed & when.
            const formattedSignatureText = entryInfo.CreatedByDisplayName
                // Format date time values
                + ' (' + this.datePipe.transform(entryInfo.CreatedOnDate, 'MM/dd/yyyy HH:mm') + ')';

            pdfContent_signatureInfo.push(
                {
                    text: [
                        'Signed - ' + formattedSignatureText
                    ],
                    style: 'form_signature_value'
                }
            );
        }
        return pdfContent_signatureInfo;
    }

    /**
     * Creates feedback field nodes
     * @param entryInfo 
     */
    private _makePDFBodyContent_FieldFeedback(entryInfo: JT_FormsModel.TraineeFormEntryInfo): object {
        const pdfContent_feedback = [];

        const hasFeedback = !(isNullOrUndefined(entryInfo.Feedback) || (entryInfo.Feedback.length === 0));
        if (hasFeedback) {
            pdfContent_feedback.push(
                {
                    text: [
                        // Inline style of bold.
                        { text: 'Feedback: ', bold: true },
                        // Actual user entered feedback text.
                        entryInfo.Feedback
                    ],
                    style: 'form_feedback_value'
                }
            );
        }

        const hasLinks = !(isNullOrUndefined(entryInfo.FormEntryLinks) || (entryInfo.FormEntryLinks.length === 0));
        if (hasLinks) {
            pdfContent_feedback.push(
                { text: 'Links', style: 'form_feedback_links_header' }
            )
            entryInfo.FormEntryLinks.forEach(loopedLink => {
                pdfContent_feedback.push(
                    { text: loopedLink.URL, style: 'form_feedback_links_row' }
                );
            });
        }

        return pdfContent_feedback;
    }
}
