'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

var abbreviations;

module.exports.stateAbbreviations = function () {
    if (abbreviations !== undefined) {
        console.log('returning cached abbreviations');
        return abbreviations;
    }


    console.log('generating fresh abbreviations');

    abbreviations = [];

    for (var i = 0; i < module.exports.usStates.length; i++) {
        abbreviations.push(module.exports.usStates[i]['alpha-2']);
    }

    return abbreviations;
};

module.exports.baseSchedule = [{
    'description': 'Early Morning',
    'time': {
        'start': 3,
        'end': 9
    }
}, {
    'description': 'Morning',
    'time': {
        'start': 6,
        'end': 12
    }
}, {
    'description': 'Mid-day',
    'time': {
        'start': 10,
        'end': 3
    }
}, {
    'description': 'Afternoon',
    'time': {
        'start': 12,
        'end': 17
    }
}, {
    'description': 'Evening',
    'time': {
        'start': 16,
        'end': 20
    }
}, {
    'description': 'Night',
    'time': {
        'start': 18,
        'end': 2
    }
}, {
    'description': 'Overnight',
    'time': {
        'start': 20,
        'end': 4
    }
},];

module.exports.usStates = [{id: 'alabama', name: 'Alabama', 'alpha-2': 'AL'},
    {id: 'alaska', name: 'Alaska', 'alpha-2': 'AK'},
    {id: 'arizona', name: 'Arizona', 'alpha-2': 'AZ'},
    {id: 'arkansas', name: 'Arkansas', 'alpha-2': 'AR'},
    {id: 'california', name: 'California', 'alpha-2': 'CA'},
    {id: 'colorado', name: 'Colorado', 'alpha-2': 'CO'},
    {id: 'connecticut', name: 'Connecticut', 'alpha-2': 'CT'},
    {id: 'delaware', name: 'Delaware', 'alpha-2': 'DE'},
    {id: 'district_of_columbia', name: 'District of Columbia', 'alpha-2': 'DC'},
    {id: 'florida', name: 'Florida', 'alpha-2': 'FL'},
    {id: 'georgia', name: 'Georgia', 'alpha-2': 'GA'},
    {id: 'hawaii', name: 'Hawaii', 'alpha-2': 'HI'},
    {id: 'idaho', name: 'Idaho', 'alpha-2': 'ID'},
    {id: 'illinois', name: 'Illinois', 'alpha-2': 'IL'},
    {id: 'indiana', name: 'Indiana', 'alpha-2': 'IN'},
    {id: 'iowa', name: 'Iowa', 'alpha-2': 'IA'},
    {id: 'kansas', name: 'Kansas', 'alpha-2': 'KS'},
    {id: 'kentucky', name: 'Kentucky', 'alpha-2': 'KY'},
    {id: 'lousiana', name: 'Lousiana', 'alpha-2': 'LA'},
    {id: 'maine', name: 'Maine', 'alpha-2': 'ME'},
    {id: 'maryland', name: 'Maryland', 'alpha-2': 'MD'},
    {id: 'massachusetts', name: 'Massachusetts', 'alpha-2': 'MA'},
    {id: 'michigan', name: 'Michigan', 'alpha-2': 'MI'},
    {id: 'minnesota', name: 'Minnesota', 'alpha-2': 'MN'},
    {id: 'mississippi', name: 'Mississippi', 'alpha-2': 'MS'},
    {id: 'missouri', name: 'Missouri', 'alpha-2': 'MO'},
    {id: 'montana', name: 'Montana', 'alpha-2': 'MT'},
    {id: 'nebraska', name: 'Nebraska', 'alpha-2': 'NE'},
    {id: 'nevada', name: 'Nevada', 'alpha-2': 'NV'},
    {id: 'new_hampshire', name: 'New Hampshire', 'alpha-2': 'NH'},
    {id: 'new_jersey', name: 'New Jersey', 'alpha-2': 'NJ'},
    {id: 'new_mexico', name: 'New Mexico', 'alpha-2': 'NM'},
    {id: 'new_york', name: 'New York', 'alpha-2': 'NY'},
    {id: 'north_carolina', name: 'North Carolina', 'alpha-2': 'NC'},
    {id: 'north_dakota', name: 'North Dakota', 'alpha-2': 'ND'},
    {id: 'ohio', name: 'Ohio', 'alpha-2': 'OH'},
    {id: 'oklahoma', name: 'Oklahoma', 'alpha-2': 'OK'},
    {id: 'oregon', name: 'Oregon', 'alpha-2': 'OR'},
    {id: 'pennsylvania', name: 'Pennsylvania', 'alpha-2': 'PA'},
    {id: 'rhode_island', name: 'Rhode Island', 'alpha-2': 'RI'},
    {id: 'south_carolina', name: 'South Carolina', 'alpha-2': 'SC'},
    {id: 'south_dakota', name: 'South Dakota', 'alpha-2': 'SD'},
    {id: 'tennessee', name: 'Tennessee', 'alpha-2': 'TN'},
    {id: 'texas', name: 'Texas', 'alpha-2': 'TX'},
    {id: 'utah', name: 'Utah', 'alpha-2': 'UT'},
    {id: 'vermont', name: 'Vermont', 'alpha-2': 'VT'},
    {id: 'virginia', name: 'Virginia', 'alpha-2': 'VA'},
    {id: 'washington', name: 'Washington', 'alpha-2': 'WA'},
    {id: 'west_virginia', name: 'West Virginia', 'alpha-2': 'WV'},
    {id: 'wisconsin', name: 'Wisconsin', 'alpha-2': 'WI'},
    {id: 'wyoming', name: 'Wyoming', 'alpha-2': 'WY'}];
