const cds = require('@sap/cds');
const { v4: uuidv4 } = require('uuid');

module.exports = cds.service.impl(async function() {
    const accountingapi = await cds.connect.to('API_OPLACCTGDOCITEMCUBE_SRV');

    async function fetchAndUpsertData() {
        const { accdoc, AccountingDocumentItems, accounting } = this.entities;

        // Fetch records from the remote source
        const qry = SELECT.from(accounting)
            .columns([
                'CompanyCode',
                'FiscalYear',
                'AccountingDocument',
                'AccountingDocumentItem',
                'AccountingDocumentType',
                'GLAccount',
                'TaxCode',
                'TransactionTypeDetermination',
                'AmountInTransactionCurrency'
            ])
            .where({ AccountingDocumentType: { in: ['RV', 'DR', 'DG', 'RE', 'KR', 'KG'] } });
        
        try {
            let sourceRecords = await accountingapi.run(qry);
            console.log('Fetched Data:', sourceRecords);

            // Group and process data for accdoc
            const groupMap = new Map();
            sourceRecords.forEach(item => {
                const groupKey = `${item.CompanyCode}-${item.FiscalYear}-${item.AccountingDocument}`;
                if (!groupMap.has(groupKey)) {
                    item.ID = uuidv4(); // Generate UUID for new records
                    groupMap.set(groupKey, item);  // Store only one record per group
                }
            });

            const groupedData = Array.from(groupMap.values());
            const existingLocalRecords = await cds.run(
                SELECT.from(accdoc)
                    .columns(['CompanyCode', 'FiscalYear', 'AccountingDocument'])
                    .where({
                        CompanyCode: { in: groupedData.map(r => r.CompanyCode) },
                        FiscalYear: { in: groupedData.map(r => r.FiscalYear) },
                        AccountingDocument: { in: groupedData.map(r => r.AccountingDocument) }
                    })
            );

            const newLocalRecords = groupedData.filter(groupedRecord => {
                return !existingLocalRecords.some(existingRecord =>
                    existingRecord.CompanyCode === groupedRecord.CompanyCode &&
                    existingRecord.FiscalYear === groupedRecord.FiscalYear &&
                    existingRecord.AccountingDocument === groupedRecord.AccountingDocument
                );
            });

            if (newLocalRecords.length > 0) {
                await cds.run(UPSERT.into(accdoc).entries(newLocalRecords));
                console.log('Data upserted into accdoc:', newLocalRecords);
            } else {
                console.log('No new data to upsert into accdoc.');
            }

            // Process and upsert data for AccountingDocumentItems
            const recordsWithUUID = sourceRecords.map(record => ({
                ...record,
                ID: uuidv4() // Generate UUID for each record
            }));

            const existingItemsRecords = await cds.run(
                SELECT.from(AccountingDocumentItems)
                    .columns(['AccountingDocumentItem', 'FiscalYear'])
                    .where({
                        AccountingDocumentItem: { in: recordsWithUUID.map(r => r.AccountingDocumentItem) },
                        FiscalYear: { in: recordsWithUUID.map(r => r.FiscalYear) }
                    })
            );

            const existingItemsMap = new Map();
            existingItemsRecords.forEach(record => {
                const key = `${record.AccountingDocumentItem}-${record.FiscalYear}`;
                existingItemsMap.set(key, record);
            });

            const newItemsRecords = recordsWithUUID.filter(record => {
                const key = `${record.AccountingDocumentItem}-${record.FiscalYear}`;
                return !existingItemsMap.has(key);
            });

            if (newItemsRecords.length > 0) {
                await cds.run(UPSERT.into(AccountingDocumentItems).entries(newItemsRecords));
                console.log('Upserted records with UUIDs into AccountingDocumentItems:', newItemsRecords);
            } else {
                console.log('No new records to upsert into AccountingDocumentItems.');
            }

        } catch (error) {
            console.error('Error while fetching and upserting data:', error);
            throw new Error('Data fetching or upserting failed');
        }
    }

    // Register the fetchAndUpsertData handler
    this.on('click', async (req) => {
        try {
            await fetchAndUpsertData.call(this);
            console.log('Data fetch and upsert completed successfully.');
            return { message: 'Data fetch and upsert completed successfully.' };
        } catch (error) {
            console.error('Error during data fetch and upsert operation:', error);
            req.error(500, 'Error during data fetch and upsert operation');
        }
    });
});
