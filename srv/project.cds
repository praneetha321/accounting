using { com.praneetha as db } from '../db/schema';
using { API_OPLACCTGDOCITEMCUBE_SRV as accountingapi } from './external/API_OPLACCTGDOCITEMCUBE_SRV';

service AccountingDocument {
    entity accdoc as projection on db.AccountingDocument;
    entity AccountingDocumentItems as projection on db.AccountingDocumentItems;   
    entity accounting as projection on accountingapi.A_OperationalAcctgDocItemCube{
        CompanyCode,
        FiscalYear,
        FiscalPeriod,
        AccountingDocument,
        AccountingDocumentItem,
        AccountingDocumentType,
        TaxCode,
        GLAccount,
        TransactionTypeDetermination,
        AmountInTransactionCurrency
    };
    action click() returns String;
}

annotate AccountingDocument.AccountingDocumentItems with @odata.draft.enabled ;

annotate AccountingDocument.accdoc with @(
    UI.LineItem: [
        {
            Label: 'Company Code',
            Value: CompanyCode
        },
        {
            Label: 'Fiscal Year',
            Value: FiscalYear
        },
        {
            Label: 'Fiscal Period',
            Value: FiscalPeriod
        },
        {
            Label: 'Accounting Document',
            Value: AccountingDocument
        },
        {
            Label: 'Document Type',
            Value: AccountingDocumentType
        }
    ],
    UI.FieldGroup #accountingdocument: {
        $Type: 'UI.FieldGroupType',
        Data: [
            {
                Label: 'Company Code',
                Value: CompanyCode
            },
            {
                Label: 'Fiscal Year',
                Value: FiscalYear
            },
            {
                Label: 'Fiscal Period',
                Value: FiscalPeriod
            },
            {
                Label: 'Accounting Document',
                Value: AccountingDocument
            },
            {
                Label: 'Document Type',
                Value: AccountingDocumentType
            }
        ]
    },
    UI.Facets: [
        {
            $Type: 'UI.ReferenceFacet',
            ID: 'doc_facet',
            Label: 'Document',
            Target: '@UI.FieldGroup#accountingdocument'
        },
        {
            $Type: 'UI.ReferenceFacet',
            ID: 'doc_items_facet',
            Label: 'Document Items',
            Target: 'AccountingDocumentItems/@UI.LineItem'
        }
    ]
);

annotate AccountingDocument.AccountingDocumentItems with @(
    UI.LineItem: [
        {
            Label: 'AccountingDocument',
            Value: AccountingDocument
        },
        {
            Label: 'AccountingDocumentItem',
            Value: AccountingDocumentItem
        },
        {
            Label: 'TaxCode',
            Value: TaxCode
        },
        {
            Label: 'GLAccount',
            Value: GLAccount
        },
        {
            Label: 'TransactionTypeDetermination',
            Value: TransactionTypeDetermination
        }
    ]
);

