'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

// {
//     position: '',
//     enabled: false,
//     title: '',
//     name: '',
//     description: '',
//     price: '',
//     promo: null,
//     sku: '',
//     fields: fields.OUTSET_MVR,
//     skus: [''],
//     logo: './modules/bgchecks/img/everifile_logo.png'
// },

var reportPackages = [
  {
    position: 'left',
    enabled: true,
    title: 'Motor Vehicle Report',
    name: 'Motor Vehicle Report',
    features: [
      { title: 'Motor Vehicle Report', value: true, classes: 'text-success', icon: 'fa-check' },
      { title: 'National Database Criminal', value: true, classes: 'text-muted', icon: 'fa-close' },
      { title: 'Employment Verification', value: true, classes: 'text-muted', icon: 'fa-close' },
      { title: 'Single County Criminal', value: true, classes: 'text-muted', icon: 'fa-close' }
    ],
    price: '5.00',
    promo: null,
    sku: 'OUTSET_MVR',
    fields: [],
    skus: ['MVRDOM'],
    logo: './modules/bgchecks/img/everifile_logo.png'
  },
  {
    position: 'center',
    enabled: true,
    title: 'Basic',
    name: '',
    features: [
      { title: 'Motor Vehicle Report', value: true, classes: 'text-success', icon: 'fa-check' },
      { title: 'National Database Criminal', value: true, classes: 'text-success', icon: 'fa-check' },
      { title: 'Employment Verification', value: true, classes: 'text-muted', icon: 'fa-close' },
      { title: 'Single County Criminal', value: true, classes: 'text-muted', icon: 'fa-close' }
    ],
    price: '14.50',
    promo: null,
    sku: 'OUTSET_BASIC',
    fields: [],
    skus: ['MVRDOM', 'NBDS'],
    logo: './modules/bgchecks/img/everifile_logo.png'
  },
  {
    position: 'right',
    enabled: true,
    title: 'Premium',
    name: '',
    features: [
      { title: 'Motor Vehicle Report', value: true, classes: 'text-success', icon: 'fa-check' },
      { title: 'National Database Criminal', value: true, classes: 'text-success', icon: 'fa-check' },
      { title: 'Employment Verification', value: true, classes: 'text-success ', icon: 'fa-check' },
      { title: 'Single County Criminal', value: true, classes: 'text-success ', icon: 'fa-check' }
    ],
    price: '29.95',
    promo: null,
    sku: 'OUTSET_PREMIUM',
    fields: [],
    skus: ['MVRDOM', 'DBDS', 'CRIMESC', 'FORM_EVER'],
    logo: './modules/bgchecks/img/everifile_logo.png'
  },
  {
    position: 'title',
    text: {
      lead: 'Order Reports to Include in your Lockbox',
      sub: 'Always put your best foot forward with Employers & Shippers!'
    }
  }
];

function init() {
  _.each(reportPackages, function (rptPackage) {
    console.log('[%s] Merging all component skus `%s`', rptPackage.sku, rptPackage.skus);

    if (!!rptPackage.skus) {

      _.each(rptPackage.skus, function (sku) {
        console.log('Looking up fileds for sku `%s`', sku);
        var fields = reportDefinitions[sku];

        if (_.isEmpty(fields)) {
          return;
        }

        var fields = fields.fields || fields;

        console.log('Merging each field from the following fields: %j', fields);
        _.each(fields, function (f) {
          var existing = _.find(rptPackage.fields, { name: f.name });

          if (existing) {
            console.log('[%s] already contains %s field def for `%s`', rptPackage.sku, sku, f.name);
          } else {
            console.log('[%s] adding %s field def: `%s`', rptPackage.sku, sku, f.name);
            rptPackage.fields.push(f);
          }
        })     

        // rptPackage.fields = _.merge(rptPackage.fields, fields.fields);
        console.log('Set [%s] fields to `%j`', rptPackage.sku, rptPackage.fields);
      });
      
      
    }
  });
}
  
// _.each(reportPackages, function (reportPackage) {
//   _.chain(_.keys(fields))
//     .filter(function (key) {
//       return _.contains(reportPackage.skus, key);
//     })
//     .map(function (key) {
//       // Return array of fields corresponding to key
//       return fields[key];
//     })
//     .reduce(function (prev, current, index) {
//       prev = prev || [];

//       _.each(current, function (field) {
//         var existing = _.find(prev, field.description);

//         if (!!existing) {
//           existing.requred = existing.required || field.required;

//           if (/object|array/i.test(field.type)) {
//             /// DO Recursive operation
//           }
//         }
//         else {
//           prev.push(current);
//         }
//       });

//       return prev;
//     });
// });

function setRequired(field, reqVal) {
  return _.extend(field, { required: reqVal });
}

var dataFields = {
  currentAddress: [
    {
      'description': 'Street Address',
      'name': 'street1',
      'length': 100,
      'type': 'string',
      'required': true
    },
    {
      'description': 'Apt. #',
      'name': 'street2',
      'length': 50,
      'type': 'string',
      'required': false
    },
    {
      'description': 'City',
      'name': 'city',
      'length': 50,
      'type': 'string',
      'required': true
    },
    {
      'description': 'State',
      'name': 'state',
      'type': 'state',
      'required': true
    },
    {
      'description': 'Zip/Postal Code',
      'name': 'postalCode',
      'length': 10,
      'type': 'string',
      'required': true
    },
    {
      'description': 'Country',
      'name': 'country',
      'length': 25,
      'type': 'country',
      'required': true
    },
    {
      'description': 'Occupy Date',
      'name': 'occupyDate',
      'type': 'datelong',
      'required': false
    }
  ],
  employmentAddress: [
    {
      'description': 'Street Address',
      'name': 'street1',
      'length': 20,
      'type': 'string',
      'required': false
    },
    {
      'description': 'Apt. #',
      'name': 'street2',
      'length': 20,
      'type': 'string',
      'required': false
    },
    {
      'description': 'City',
      'name': 'city',
      'length': 50,
      'type': 'string',
      'required': true
    },
    {
      'description': 'State',
      'name': 'state',
      'length': 30,
      'type': 'state',
      'required': true
    },
    {
      'description': 'Zip/Postal Code',
      'name': 'postalCode',
      'length': 10,
      'type': 'string',
      'required': false
    },
    {
      'description': 'Country',
      'name': 'country',
      'length': 50,
      'type': 'country',
      'required': true
    }
  ],
  alias: [
    {
      'description': 'Alias',
      'name': 'alias',
      'type': 'object',
      'required': false,
      'dataFields': [
        {
          'description': 'First Name',
          'name': 'firstName',
          'length': 50,
          'type': 'string',
          'required': true
        },
        {
          'description': 'Middle Name',
          'name': 'middleName',
          'length': 50,
          'type': 'string',
          'required': false
        },
        {
          'description': 'Last Name',
          'name': 'lastName',
          'length': 50,
          'type': 'string',
          'required': true
        }
      ]
    }
  ]
};

var fields = {
  firstName: {
    'description': 'First Name',
    'name': 'firstName',
    'length': 50,
    'type': 'string',
    'required': true
  },
  middleName: {
    'description': 'Middle Name',
    'name': 'middleName',
    'length': 50,
    'type': 'string',
    'required': false
  },
  lastName: {
    'description': 'Last Name',
    'name': 'lastName',
    'length': 50,
    'type': 'string',
    'required': true
  },
  nameSuffix: {
    'description': 'Suffix',
    'name': 'nameSuffix',
    'length': 50,
    'type': 'string',
    'required': false
  },
  birthDate: {
    'description': 'Birth Date',
    'name': 'birthDate',
    'type': 'datelong',
    'required': true
  },
  governmentId: {
    'description': 'SSN',
    'name': 'governmentId',
    'length': 9,
    'type': 'string',
    'required': true
  },
  gender: {
    'description': 'Gender',
    'name': 'gender',
    'pickList': [
      {
        'description': '',
        'value': ''
      },
      {
        'description': 'Male',
        'value': 'male'
      },
      {
        'description': 'Female',
        'value': 'female'
      }
    ],
    'type': 'string',
    'required': false
  },
  driversLicense: {
    'description': 'Driver License #',
    'name': 'driversLicense',
    'length': 15,
    'type': 'string',
    'required': true
  },
  driversLicenseState: {
    'description': 'Driver License State',
    'name': 'driversLicenseState',
    'type': 'state',
    'required': true
  },
  aliases: {
    'description': 'Aliases',
    'name': 'aliases',
    'length': 3,
    'type': 'array',
    'required': false,
    'dataFields': dataFields.alias
  },
  currentAddress: {
    'description': 'Current Address',
    'name': 'currentAddress',
    'type': 'object',
    'required': false,
    'dataFields': dataFields.currentAddress
  },
  employmentHistory: {
    'description': 'employmentHistory',
    'name': 'employmentHistory',
    'type': 'array',
    'required': true,
    'dataFields': [
      {
        'description': 'employmentDetail',
        'name': 'employmentDetail',
        'type': 'object',
        'required': false,
        'dataFields': [
          {
            'description': 'companyName',
            'name': 'companyName',
            'length': 50,
            'type': 'string',
            'required': true
          },
          {
            'description': 'companyPhone',
            'name': 'companyPhone',
            'length': 20,
            'type': 'string',
            'required': false
          },
          {
            'description': 'Address',
            'name': 'address',
            'type': 'object',
            'required': false,
            'dataFields': dataFields.employmentAddress
          },
          {
            'description': 'applicantBeginDate',
            'name': 'applicantBeginDate',
            'length': 15,
            'type': 'datelong',
            'required': true
          },
          {
            'description': 'applicantEndDate',
            'name': 'applicantEndDate',
            'length': 15,
            'type': 'datelong',
            'required': false
          },
          {
            'description': 'applicantJobPosition',
            'name': 'applicantJobPosition',
            'length': 50,
            'type': 'string',
            'required': true
          },
          {
            'description': 'applicantAnnualSalary',
            'name': 'applicantAnnualSalary',
            'length': 12,
            'type': 'string',
            'required': false
          }
        ]
      }
    ]
  }
};

var reportDefinitions = {
  MVRDOM: {
    'fields': [
      fields.firstName,
      fields.middleName,
      fields.lastName,
      fields.nameSuffix,
      fields.birthDate,
      fields.governmentId,
      fields.gender,
      setRequired(fields.currentAddress, false),
      fields.aliases,
      fields.driversLicense,
      fields.driversLicenseState
    ]
  },
  NBDS: {
    'fields': [
      fields.firstName,
      fields.middleName,
      fields.lastName,
      fields.nameSuffix,
      fields.birthDate,
      fields.governmentId,
      fields.gender,
      fields.currentAddress,
      fields.aliases
    ]
  },
  CRIMESC: {
    'fields': [
      fields.firstName,
      fields.middleName,
      fields.lastName,
      fields.nameSuffix,
      fields.birthDate,
      fields.governmentId,
      fields.gender,
      fields.currentAddress,
      fields.aliases
    ]
  },
  FORM_EVER: {
    'fields': [
      fields.firstName,
      fields.middleName,
      fields.lastName,
      setRequired(fields.birthDate, false),
      fields.governmentId,
      fields.gender,
      // TODO : Determine if valie
      fields.currentAddress,
      // _.map(fields.currentAddress, function (details) {
      //   var tmp = _.extend(details, { required: false });

      //   _(tmp.dataFields).map(function (field) {
      //     if (/country|occupyData/i.test(field.name)) { return };
      //     field.required = false;
      //     return field;
      //   }).omit(_.isEmpty);

      //   return details;
      // }),
      fields.employmentHistory
    ]
  },
  SSNVAL: {
    'fields': [
      {
        'description': 'First Name',
        'name': 'firstName',
        'length': 50,
        'type': 'string',
        'required': true
      },
      {
        'description': 'Middle Name',
        'name': 'middleName',
        'length': 50,
        'type': 'string',
        'required': false
      },
      {
        'description': 'Last Name',
        'name': 'lastName',
        'length': 50,
        'type': 'string',
        'required': true
      },
      {
        'description': 'Suffix',
        'name': 'nameSuffix',
        'length': 50,
        'type': 'string',
        'required': false
      },
      {
        'description': 'Birth Date',
        'name': 'birthDate',
        'type': 'datelong',
        'required': true
      },
      {
        'description': 'SSN',
        'name': 'governmentId',
        'length': 9,
        'type': 'string',
        'required': true
      },
      {
        'description': 'Gender',
        'name': 'gender',
        'type': 'string',
        'required': false,
        'pickList': [
          {
            'description': '',
            'value': ''
          },
          {
            'description': 'Male',
            'value': 'male'
          },
          {
            'description': 'Female',
            'value': 'female'
          }
        ]
      },
      fields.currentAddress,
      fields.aliases
    ]
  }
};

init();

module.exports = {
  fields: fields,
  reportPackages: reportPackages
};
