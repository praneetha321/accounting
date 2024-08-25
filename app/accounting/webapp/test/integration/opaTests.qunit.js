sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'accounting/test/integration/FirstJourney',
		'accounting/test/integration/pages/accdocList',
		'accounting/test/integration/pages/accdocObjectPage'
    ],
    function(JourneyRunner, opaJourney, accdocList, accdocObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('accounting') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheaccdocList: accdocList,
					onTheaccdocObjectPage: accdocObjectPage
                }
            },
            opaJourney.run
        );
    }
);