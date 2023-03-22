import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common'

import { isNullOrUndefined } from 'is-what';
import * as pdfmake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { MatTableDefinitionForExport } from './policies.model';
import { MatTableDataSource } from '@angular/material/table';
import { removeData } from 'jquery';


@Injectable()
export class PoliciesPDFExportService {

    /*
     * This service uses the PDFMAKE library to create PDF files for exporting forms.
     * @see https://pdfmake.github.io/docs/
     */

    constructor(

    ) { }

    /**
     * Structures the forms as desired and passes them to pdfmake for PDF creation
     * @param header - string value of the report header
     * @param tableColumns - list of DataTable column headers
     * @param tableData - the actual data of the DataTable
     */
    public exportMatTableToPDF(header: string, tableColumns: MatTableDefinitionForExport[], tableData: MatTableDataSource<any>): void {
        // Font setup
        pdfmake.vfs = pdfFonts.pdfMake.vfs;
        // Cache for all content in the document
        const content: any[] = [];

        // define and append header
        let currentDateTime = new Date();

        content.push({
            text: header,
            style: ['header_left']
        },
            {
                text: "Generated on: " + currentDateTime.toLocaleString(),
                style: 'sub_header_left'
            });

        // Cache for body nodes
        const bodyContent = [];

        // setup table body
        var pdfContent_Table = {
            style: 'tableExample',
            table: {
                headerRows: 1,
                widths: [],
                body: [],
            },
            layout: {
                fillColor: function (rowIndex, node, columnIndex) {
                    rowIndex--;
                    if (rowIndex >= 0 && rowIndex < tableData.data.length) {
                        return (tableData.data[rowIndex].IsDeleted) ? '#CCCCCC' : null;
                    } else {
                        return null;
                    }
                }
            }
        };

        // setup table headers
        let tableHeaders = [];
        let tableWidth = [];
        tableColumns.forEach(column => {
            // if the datatable class name reflects hide for print, do not render the column
            if (!column.HideForPrint) {

                let width = column?.Width ?? 'auto';
                tableWidth.push(width);
                tableHeaders.push({ text: column.FriendlyName, style: ['tblHeader'] })
            }

        });

        // push the headers to the table body
        pdfContent_Table.table.body.push(
            tableHeaders
        );

        pdfContent_Table.table.widths = tableWidth;

        // for each data row, pair the data reference with the table column
        tableData.data.forEach(row => {
            let columnValues = [];

            // for each table column, pair the data info to the column name
            tableColumns.forEach(column => {
                // if the datatable class name reflects hide for print, do not render the column
                if (!column.HideForPrint) {
                    // retrieve the data value of the record based on the column name
                    let columnValue = '';
                    // If the [TechnicalName] cpntains a . then it's referring to a sub property.
                    if (column.TechnicalName.indexOf('.') != -1) {
                        var splitProperties = column.TechnicalName.split('.');
                        columnValue = row[splitProperties[0]][splitProperties[1]];
                    } else {
                        columnValue = row[column.TechnicalName];
                    }

                    // [columnValue] might not be set, or might be malformed, depending on the [Datatype]
                    if (column.Datatype == 'date-string') {
                        columnValue = columnValue ? new Date(columnValue).toLocaleDateString() : '-';
                    }

                    columnValues.push({ text: columnValue ? columnValue : '', style: ['textWrap'] });
                }

            });

            // push the value to the table
            pdfContent_Table.table.body.push(
                columnValues
            );
        });

        // push the table content to the body
        bodyContent.push(pdfContent_Table);
        content.push(bodyContent);

        // Main document definition for pdfmake API
        const docDefinition = {
            content: content,
            styles: {
                /* PDF - form header styles */
                tblHeader: {
                    bold: true,
                },
                header_left: {
                    bold: true,
                    fontSize: 16,
                },
                header_right: {
                    bold: true,
                    fontSize: 16,
                    alignment: 'right'
                },
                sub_header_left: {
                    fontSize: 8,
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
                /* PDF - form field styles */
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
                textWrap: {
                    padding: '.25em .5em',
                    // background: '#eee',
                    // borderRadius: '3px',
                    display: 'inline-block',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                }
            },
            pageSize: 'A4',
            pageOrientation: 'portrait'
        };
        // Make the PDF and open in a new tab/window
        pdfmake.createPdf(docDefinition).open();
    }


    /**
     * Compiles a mat-table datasource into a CSV file and initiates download
     * @param fileName - the name of the downloaded file
     * @param tableColumns - the definition of all of the table's columns
     * @param tableData - the actual data of the DataTable
     */
    public exportMatTableToCSV(fileName: string, tableColumns: MatTableDefinitionForExport[], tableData: MatTableDataSource<any>): void {

        // init csv string
        let csv = "";

        // append csv headers
        tableColumns.forEach(column => {
            // if the datatable class name reflects hide for print, do not render the column
            if (!column.HideForPrint) {
                csv += '"' + column.FriendlyName + '",';
            }

        });

        // insert newline
        csv = csv.substring(0, csv.length - 1);
        csv += "\n";

        // for each data row, pair the data reference with the table column
        tableData.data.forEach(row => {

            // for each table column, pair the data info to the column name
            tableColumns.forEach(column => {
                // if the datatable class name reflects hide for print, do not render the column
                if (!column.HideForPrint) {
                    // retrieve the data value of the record based on the column name
                    let columnValue = '';
                    // If the [TechnicalName] contains a . then it's referring to a sub property.
                    if (column.TechnicalName.indexOf('.') != -1) {
                        var splitProperties = column.TechnicalName.split('.');
                        columnValue = row[splitProperties[0]][splitProperties[1]];
                    } else {
                        columnValue = row[column.TechnicalName];
                    }

                    // [columnValue] might not be set, or might be malformed, depending on the [Datatype]
                    if (column.Datatype == 'date-string') {
                        columnValue = columnValue ? new Date(columnValue).toLocaleDateString() : '-';
                    }

                    // if [columnValue] is expecting a boolean [Datatype], we should go ahead and alter the value to be more readable
                    if (column.Datatype == 'boolean') {
                        columnValue = columnValue ? 'Yes' : 'No';
                    }

                    // append column value
                    csv += '"' + columnValue + '",';
                }

            });

            // append newline
            csv = csv.substring(0, csv.length - 1);
            csv += "\n";



        });

        // generate file blob and initiate download
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

        if (navigator.msSaveBlob) { // In case of IE 10+
            navigator.msSaveBlob(blob, fileName + ".csv");
        } else {
            const link = document.createElement('a');
            if (link.download !== undefined) {
                // browsers that support HTML5 download attribute
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', fileName + ".csv");
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }


    }

}
