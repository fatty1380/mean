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

module.exports.faqs = [
    {
        category: 'driver',
        question: 'How do I sign up as a Driver looking for work?',
        answer: 'Signing up is easy.  Go to www.joinoutset.com and Click the <b>Sign Up</b> button.  When prompted, let us know that you\'re a Driver.  After that, we\'ll ask you a few more simple questions to help create your account.  Once your account is created, you can begin to build your profile.',
        keywords: ['separate', 'any', 'keywords', 'terms', 'here']
    },
    {
        category: 'driver',
        question: 'How do I get Employers interested in me?',
        answer: 'Building a strong profile is the best way to get noticed and contacted by employers.  Every job posted on Outset receives multiple applications; those with the strongest profiles stand out from the crowd and motivate the employer to make contact. To build a strong profile, make sure to include reports such as a Background Check and Motor Vehicle Record, as well as your past employment history and a clear picture of yourself.',
        keywords: ['term', 'term']
    },
    {
        category: 'bgreport',
        question: 'Why should I order a Background Check, Motor Vehicle Report and/or Drug Test?',
        answer: 'Getting these reports dramatically increases your chances of being hired. These reports help you stand out from the crowd.  Employers will see that you have these reports, which will save them time and speed up the hiring process.',
        keywords: ['separate', 'any', 'keywords', 'terms', 'here']
    },
    {
        category: 'driver',
        question: 'Who will see my profile information?',
        answer: 'The only people that will see your profile will be the hiring managers for the jobs that you apply for. Once you apply, they will see your basic profile.  If they decide to connect with you, they\'ll see a more detailed version of your profile which will include any Reports you have hosted in your profile.',
        keywords: ['term', 'term']
    },
    {
        category: 'bgreport',
        question: 'How am I charged for my Reports?',
        answer: 'Background Checks, Motor Vehicle Reports & Drug Tests are billed as a one-time payment.  Payment can be made with Visa, MasterCard and American Express.',
        keywords: ['term', 'term']
    },
    {
        category: 'driver',
        question: 'How do I communicate with the Employer?',
        answer: 'After you have submitted your job application the Employer will review your basic profile information and decide whether they would like to \"Connect\" with you. Once this connection is made, you will be able to freely communicate with the employer via Outset\'s messaging capability.',
        keywords: ['term', 'term']
    },
    {
        category: 'bgreport',
        question: 'What do the Background Checks cover?',
        answer: '<li>item 1</li>Social Security Number verification – Verifies your identity and shows your work elegibilty. <li>item 2</li> County Courthouse Records Report- A search of the records on file in each county where the user is known to have lived in the past 7 years. This type of search can find criminal records in jurisdictions that do not provide information to the national criminal records database. <li>item 3</li> National Criminal Records Search- A National Criminal Database search draws from over 505 million records from thousands of jurisdictions, including databases with terrorist and sex offender information. ',
        keywords: ['term', 'term']
    },
    {
        category: 'bgreport',
        question: 'What does a Motor Vehicle Report cover?',
        answer: 'This is a motor vehicle search of public driving records. Please note that the motor vehicle check is solely for the current state of residence or the state where the driver\'s license is held.',
        keywords: ['term', 'term']
    },
    {
        category: 'bgreport',
        question: 'What does the Drug Test Cover?',
        answer: 'This is an inperson screening that will check for the following illegal or controlled substances in your system: Amphetamines, Barbituates, Benzodiazepines, Cocaine, Opiates, Marijuana, Methadone, Methanphetamines, PCP.',
        keywords: ['term', 'term']
    },
    {
        category: 'bgreport',
        question: 'Who can see my Background Check , Motor Vehicle Report and Drug Test?',
        answer: 'Your Reports  are only visible to people that you specifically grant access to. When you apply to a job, you may give permission to that employer by checking a box on your application. This allows the job poster to access 	your Reportst. ',
        keywords: ['term', 'term']
    },
    {
        category: 'bgreport',
        question: 'How do I remove access to my Reports?',
        answer: 'You can remove particular employer\'s access to your reports by canceling the \"connection\" you have with the Employer. If you have granted access to your reports, the employer can only actuallys see them once they have \"Connected\" with you as an applicant, so you will only need to cancel their access to your reports if a connection has been established',
        keywords: ['term', 'term']
    },
    {
        category: 'bgreport',
        question: 'How long does a Background Check take to run?',
        answer: 'The background check usually takes 4-7 days to complete.',
        keywords: ['term', 'term']
    },
    {
        category: 'bgreport',
        question: 'How long does a Motor Vehicle Report take to run?',
        answer: 'Depending on the state, the Motor Vehicle Report takes between 1-10 days to complete.',
        keywords: ['term', 'term']
    },
    {
        category: 'bgreport',
        question: 'What personal information is displayed on my background check?',
        answer: 'The only information that is visible to prospective employers is your full legal name, your city and state, the fact that your SSN was verified, and the results of your criminal history report.',
        keywords: ['term', 'term']
    },
    {
        category: 'employer',
        question: 'How do I sign up to post jobs and driving opportunities?',
        answer: 'Signing up is easy.  Go to www.joinoutset.com and Click the [Sign Up] button.  When prompted, let us know that you are an Employer.  After that, we\'ll ask you a few more simple questions to help create your account.  Once your account is created, you can subscribe and post your first job!',
        keywords: ['term', 'term']
    },
    {
        category: 'employer',
        question: 'Why should I use Outset to find my drivers?',
        answer: 'Outset is a place designed for drivers to manage their careers, and make themselves more marketable in the job market. As a result, we porvide great tools for drivers to "pre-qualify" themselves for your jobs by providing Background Checks, Motor Vehicle Reports & Drug Tests upfront. Which means you get more qualified applicants, and easy place to manage the process, so you spend less time on hiring',
        keywords: ['term', 'term']
    },
    {
        category: 'employer',
        question: 'What do I need to build a strong profile?',
        answer: 'Building a strong profile is the best way to get noticed and contacted by potential employess.  Every job posted on Outset receives multiple applications; those with the strongest profiles stand out from the crowd and motivate the employee to apply to make contact. To build a strong profile, make sure to include your Logo or a clear picture, 1-2 paragraphs about your company & any awards or iteams that help you stand out.',
        keywords: ['term', 'term']
    },
    {
        category: 'employer',
        question: 'How do I post a job?',
        answer: 'You can create a new job from any page by clicking the Create New Job Posting] button.  This will take you to a page where you can create your own posting.',
        keywords: ['term', 'term']
    },
    {
        category: 'employer',
        question: 'How many job postings can I create?',
        answer: 'You can create and save as many postings as you would like.  However, you can only have as many ACTIVE postings per month as your subscription allows.  You can activate or de-activate existing postings as often as needed, but at any time you can only have as many active postings as your subscription allows.',
        keywords: ['term', 'term']
    },
    {
        category: 'employer',
        question: 'Why was my job posting not approved?',
        answer: 'Every job posting is reviewed by the Outset team prior to going active.  Postings must include at least two relevant, detailed sentences in your short description. You may also not include telephone numbers, external links or web addresses in your job posting.',
        keywords: ['term', 'term']
    },
    {
        category: 'employer',
        question: 'How do I Close/De-Activate my job posting?',
        answer: 'You can manage any job posting from the [Job Postings] section.  Find the posting you would like to de-activate and click the [De-Activate Posting] button.',
        keywords: ['term', 'term']
    },
    {
        category: 'employer',
        question: 'How do I view and/or re-activate my inactive job postings?',
        answer: 'You can manage any job posting from the [Job Postings] section.  Click the [Show Inactive Postings] link on the left side of the page. Find the posting you would like to re-activate and click the [Activate Posting] button.',
        keywords: ['term', 'term']
    },
    {
        category: 'managing applicants',
        question: 'When will I start getting applicants?',
        answer: 'Once your job posting is approved and activated, it will be immediately available to applicants.  ',
        keywords: ['term', 'term']
    },
    {
        category: 'managing applicants',
        question: 'Where can I view the applicants for my job postings?',
        answer: 'Applicants will show up in the [Job Postings] section underneath each specific job posting.  Click on any job posting to see a list of the applicants for that job.',
        keywords: ['term', 'term']
    },
    {
        category: 'managing applicants',
        question: 'How do I contact applicants?',
        answer: 'In order to contact an applicant, you must \'connect\' with them first. To connect, click the [Full Profile and Connect] button on their application and you will be shown the applicant\'s full profile. If you decide to connect, click the [Connect] button. Once you have connected with an applicant, click the [Messaging] link under their picture. You\'ll be able to send and receive messages from them.  At this point you can set up time to talk in person or over the phone.',
        keywords: ['term', 'term']
    },
    {
        category: 'managing applicants',
        question: 'How do I view an applicant\'s Background Check or Motor Vehicle Report?',
        answer: 'Once you have "Connected" with an applicant you will have full access to their reports if available.',
        keywords: ['term', 'term']
    },
    {
        category: 'managing applicants',
        question: 'What should I do with applicants I\'ve decided not to work with?',
        answer: 'If you do not want to work with and applicant, click the [Decline] button on their application.  The applicant will then be informed that they were declined for this job posting.',
        keywords: ['term', 'term']
    },
    {
        category: 'subsciptions and billing',
        question: 'How is my subscription billed?',
        answer: 'Your subscription period is 30 days long.  You will be billed on the 1st day for the next subscription period.  Billing starts on the day that you purchase your subscription.',
        keywords: ['term', 'term']
    },
    {
        category: 'subsciptions and billing',
        question: 'How do I change my subscription plan?',
        answer: 'You can change your plan by clicking the [Change] link next to your current plan in your [Profile] Section.  Your bill will be pro-rated to reflect the change in your subscription plan.',
        keywords: ['term', 'term']
    },
    {
        category: 'subsciptions and billing',
        question: 'How do I change my credit card on file?',
        answer: 'To change your billing information, click the Settings Icon (shaped like a gear) in the upper right hand corner of the screen of every page.  You can also click the [Edit Account Settings] button near your name on your profile page.',
        keywords: ['term', 'term']
    }];

module.exports.fields = {
    'OUTSET_MVR': [
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
        {
            'dataFields': [
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
            'description': 'Current Address',
            'name': 'currentAddress',
            'type': 'object',
            'required': false
        },
        {
            'dataFields': [
                {
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
                    ],
                    'description': 'Alias',
                    'name': 'alias',
                    'type': 'object',
                    'required': false
                }
            ],
            'description': 'Aliases',
            'name': 'aliases',
            'length': 3,
            'type': 'array',
            'required': false
        },
        {
            'description': 'Driver License #',
            'name': 'driversLicense',
            'length': 15,
            'type': 'string',
            'required': true
        },
        {
            'description': 'Driver License State',
            'name': 'driversLicenseState',
            'type': 'state',
            'required': true
        }
    ],
    'OUTSET_BASE': [
        {
            'description': 'First Name',
            'name': 'firstName',
            'length': 50,
            'type': 'string',
            'required': true
        }, {
            'description': 'Middle Name',
            'name': 'middleName',
            'length': 50,
            'type': 'string',
            'required': false
        }, {
            'description': 'Last Name',
            'name': 'lastName',
            'length': 50,
            'type': 'string',
            'required': true
        }, {
            'description': 'Suffix',
            'name': 'nameSuffix',
            'length': 50,
            'type': 'string',
            'required': false
        }, {
            'description': 'Birth Date',
            'name': 'birthDate',
            'type': 'datelong',
            'required': true
        }, {
            'description': 'SSN',
            'name': 'governmentId',
            'length': 9,
            'type': 'string',
            'required': true
        }, {
            'description': 'Gender',
            'name': 'gender',
            'pickList': [{
                'description': '',
                'value': ''
            }, {
                'description': 'Male',
                'value': 'male'
            }, {
                'description': 'Female',
                'value': 'female'
            }],
            'type': 'string',
            'required': false
        }, {
            'dataFields': [{
                'description': 'Street Address',
                'name': 'street1',
                'length': 100,
                'type': 'string',
                'required': true
            }, {
                'description': 'Apt. #',
                'name': 'street2',
                'length': 50,
                'type': 'string',
                'required': false
            }, {
                'description': 'City',
                'name': 'city',
                'length': 50,
                'type': 'string',
                'required': true
            }, {
                'description': 'State',
                'name': 'state',
                'type': 'state',
                'required': true
            }, {
                'description': 'Zip/Postal Code',
                'name': 'postalCode',
                'length': 10,
                'type': 'string',
                'required': true
            }, {
                'description': 'Country',
                'name': 'country',
                'length': 25,
                'type': 'country',
                'required': true
            }, {
                'description': 'Occupy Date',
                'name': 'occupyDate',
                'type': 'datelong',
                'required': false
            }],
            'description': 'Current Address',
            'name': 'currentAddress',
            'type': 'object',
            'required': true
        }, {
            'dataFields': [{
                'dataFields': [{
                    'description': 'First Name',
                    'name': 'firstName',
                    'length': 50,
                    'type': 'string',
                    'required': true
                }, {
                    'description': 'Middle Name',
                    'name': 'middleName',
                    'length': 50,
                    'type': 'string',
                    'required': false
                }, {
                    'description': 'Last Name',
                    'name': 'lastName',
                    'length': 50,
                    'type': 'string',
                    'required': true
                }],
                'description': 'Alias',
                'name': 'alias',
                'type': 'object',
                'required': false
            }],
            'description': 'Aliases',
            'name': 'aliases',
            'length': 3,
            'type': 'array',
            'required': false
        }],
    'OUTSET_PREMIUM': [
        {
            "description": "First Name",
            "name": "firstName",
            "length": 50,
            "type": "string",
            "required": true
        },
        {
            "description": "Middle Name",
            "name": "middleName",
            "length": 50,
            "type": "string",
            "required": false
        },
        {
            "description": "Last Name",
            "name": "lastName",
            "length": 50,
            "type": "string",
            "required": true
        },
        {
            "description": "Suffix",
            "name": "nameSuffix",
            "length": 50,
            "type": "string",
            "required": false
        },
        {
            "description": "Birth Date",
            "name": "birthDate",
            "length": 11,
            "type": "datelong",
            "required": false
        },
        {
            "description": "SSN",
            "name": "governmentId",
            "type": "string",
            "required": true,
            "length": 9
        },
        {
            "description": "Gender",
            "name": "gender",
            "length": 6,
            "type": "string",
            "required": false,
            "pickList": [
                {
                    "description": "",
                    "value": ""
                },
                {
                    "description": "Male",
                    "value": "male"
                },
                {
                    "description": "Female",
                    "value": "female"
                }
            ]
        },
        {
            "description": "Current Address",
            "name": "currentAddress",
            "dataFields": [
                {
                    "description": "Street Address",
                    "name": "street1",
                    "length": 30,
                    "type": "string",
                    "required": false
                },
                {
                    "description": "Apt. #",
                    "name": "street2",
                    "length": 30,
                    "type": "string",
                    "required": false
                },
                {
                    "description": "City",
                    "name": "city",
                    "length": 50,
                    "type": "string",
                    "required": false
                },
                {
                    "description": "State",
                    "name": "state",
                    "length": 50,
                    "type": "state",
                    "required": false
                },
                {
                    "description": "Zip/Postal Code",
                    "name": "postalCode",
                    "length": 10,
                    "type": "string",
                    "required": false
                },
                {
                    "description": "Country",
                    "name": "country",
                    "length": 25,
                    "type": "country",
                    "required": true
                },
                {
                    "description": "Occupy Date",
                    "name": "occupyDate",
                    "type": "datelong",
                    "required": false
                }
            ],
            "type": "object",
            "required": true
        },
        {
            'dataFields': [
                {
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
                            'dataFields': [
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
                            'description': 'Address',
                            'name': 'address',
                            'type': 'object',
                            'required': false
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
                    ],
                    'description': 'employmentDetail',
                    'name': 'employmentDetail',
                    'type': 'object',
                    'required': false
                }
            ],
            'description': 'employmentHistory',
            'name': 'employmentHistory',
            'type': 'array',
            'required': true
        },
        {
            "dataFields": [
                {
                    "dataFields": [
                        {
                            "description": "First Name",
                            "name": "firstName",
                            "length": 50,
                            "type": "string",
                            "required": true
                        },
                        {
                            "description": "Middle Name",
                            "name": "middleName",
                            "length": 50,
                            "type": "string",
                            "required": false
                        },
                        {
                            "description": "Last Name",
                            "name": "lastName",
                            "length": 50,
                            "type": "string",
                            "required": true
                        }
                    ],
                    "description": "Alias",
                    "name": "alias",
                    "type": "object",
                    "required": false
                }
            ],
            "description": "Aliases",
            "name": "aliases",
            "length": 3,
            "type": "array",
            "required": false
        },
        {
            'description': 'Driver License #',
            'name': 'driversLicense',
            'length': 15,
            'type': 'string',
            'required': true
        },
        {
            'description': 'Driver License State',
            'name': 'driversLicenseState',
            'type': 'state',
            'required': true
        }
    ],
    'OUTSET_ENTERPRISE': [
        {
            "description": "First Name",
            "name": "firstName",
            "length": 50,
            "type": "string",
            "required": true
        },
        {
            "description": "Middle Name",
            "name": "middleName",
            "length": 50,
            "type": "string",
            "required": false
        },
        {
            "description": "Last Name",
            "name": "lastName",
            "length": 50,
            "type": "string",
            "required": true
        },
        {
            "description": "Suffix",
            "name": "nameSuffix",
            "length": 50,
            "type": "string",
            "required": false
        },
        {
            "description": "Birth Date",
            "name": "birthDate",
            "length": 11,
            "type": "datelong",
            "required": false
        },
        {
            "description": "SSN",
            "name": "governmentId",
            "type": "string",
            "required": true,
            "length": 9
        },
        {
            "description": "Gender",
            "name": "gender",
            "length": 6,
            "type": "string",
            "required": false,
            "pickList": [
                {
                    "description": "",
                    "value": ""
                },
                {
                    "description": "Male",
                    "value": "male"
                },
                {
                    "description": "Female",
                    "value": "female"
                }
            ]
        },
        {
            "description": "Current Address",
            "name": "currentAddress",
            "dataFields": [
                {
                    "description": "Street Address",
                    "name": "street1",
                    "length": 30,
                    "type": "string",
                    "required": false
                },
                {
                    "description": "Apt. #",
                    "name": "street2",
                    "length": 30,
                    "type": "string",
                    "required": false
                },
                {
                    "description": "City",
                    "name": "city",
                    "length": 50,
                    "type": "string",
                    "required": false
                },
                {
                    "description": "State",
                    "name": "state",
                    "length": 50,
                    "type": "state",
                    "required": false
                },
                {
                    "description": "Zip/Postal Code",
                    "name": "postalCode",
                    "length": 10,
                    "type": "string",
                    "required": false
                },
                {
                    "description": "Country",
                    "name": "country",
                    "length": 25,
                    "type": "country",
                    "required": true
                },
                {
                    "description": "Occupy Date",
                    "name": "occupyDate",
                    "type": "datelong",
                    "required": false
                }
            ],
            "type": "object",
            "required": true
        },
        {
            'dataFields': [
                {
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
                            'dataFields': [
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
                            'description': 'Address',
                            'name': 'address',
                            'type': 'object',
                            'required': false
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
                    ],
                    'description': 'employmentDetail',
                    'name': 'employmentDetail',
                    'type': 'object',
                    'required': false
                }
            ],
            'description': 'employmentHistory',
            'name': 'employmentHistory',
            'type': 'array',
            'required': true
        },
        {
            "dataFields": [
                {
                    "dataFields": [
                        {
                            "description": "First Name",
                            "name": "firstName",
                            "length": 50,
                            "type": "string",
                            "required": true
                        },
                        {
                            "description": "Middle Name",
                            "name": "middleName",
                            "length": 50,
                            "type": "string",
                            "required": false
                        },
                        {
                            "description": "Last Name",
                            "name": "lastName",
                            "length": 50,
                            "type": "string",
                            "required": true
                        }
                    ],
                    "description": "Alias",
                    "name": "alias",
                    "type": "object",
                    "required": false
                }
            ],
            "description": "Aliases",
            "name": "aliases",
            "length": 3,
            "type": "array",
            "required": false
        },
        {
            'description': 'Driver Licence ID',
            'name': 'driversLicense',
            'length': 15,
            'type': 'string',
            'required': true
        },
        {
            'description': 'Driver License State',
            'name': 'driversLicenseState',
            'type': 'state',
            'required': true
        }
    ],
    'OUTSET_DRUGS': [
        {
            'description': 'First Name',
            'name': 'firstName',
            'length': 50,
            'type': 'string',
            'required': true
        },
        {
            'description': 'Last Name',
            'name': 'lastName',
            'length': 50,
            'type': 'string',
            'required': true
        },
        {
            'description': 'Birth Date',
            'name': 'birthDate',
            'type': 'datelong',
            'required': false
        },
        {
            'description': 'SSN',
            'name': 'governmentId',
            'length': 9,
            'type': 'string',
            'required': false
        },
        {
            'description': 'Email',
            'name': 'email',
            'type': 'string',
            'required': false
        },
        {
            'dataFields': [
                {
                    'description': 'Street Address',
                    'name': 'street1',
                    'length': 100,
                    'type': 'string',
                    'required': false
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
                    'required': false
                },
                {
                    'description': 'State',
                    'name': 'state',
                    'type': 'state',
                    'required': false
                },
                {
                    'description': 'Zip/Postal Code',
                    'name': 'postalCode',
                    'length': 10,
                    'type': 'string',
                    'required': false
                }
            ],
            'description': 'Current Address',
            'name': 'currentAddress',
            'type': 'object',
            'required': false
        }
    ]
}



module.exports.reportPackages = {
    base: {
        title: 'Motor Vehicle Report',
        name: 'Motor Vehicle Report',
        description: 'Motor Vehicle Report',
        price: '5',
        promo: '1',
        sku: 'OUTSET_MVR',
        fields: module.exports.fields.OUTSET_MVR,
        skus: ['MVRDOM'],
        enabled: true
    },
    good: {
        title: 'Good',
        name: 'National Background Report and Motor Vehicle Report',
        description: 'National Background Report and Motor Vehicle Report',
        price: '14.50',
        sku: 'OUTSET_BASE',
        fields: module.exports.fields.OUTSET_BASE,
        skus: ['NBDS', 'MVRDOM'],
        enabled: true
    },
    better: {
        title: 'Premium',
        name: 'Premium Background Report and Motor Vehicle Report',
        description: 'Premium Background Report and Motor Vehicle Report',
        price: '44.95',
        sku: 'OUTSET_PREMIUM',
        fields: module.exports.fields.OUTSET_PREMIUM,
        skus: ['PKG_PREMIMUM', 'MVRDOM'],
        enabled: true
    },
    best: {
        title: 'Enterprise',
        name: 'Enterprise Background Report, Motor Vehicle Report and Drug Test',
        description: 'Enterprise Background Report, Motor Vehicle Report and Drug Test',
        price: '84.95',
        sku: 'OUTSET_ENTERPRISE',
        fields: module.exports.fields.OUTSET_ENTERPRISE,
        skus: ['PKG_PREMIMUM', 'MVRDOM', 'ES_ECUPIT'],
        enabled: true
    },
    drugs: {
        title: 'Drug Test',
        name: 'Drug Test',
        description: '',
        price: '40',
        sku: 'OUTSET_DRUGS',
        fields: module.exports.fields.OUTSET_DRUGS,
        skus: ['ES_ECUPIT'],
        enabled: false
    },
    fieldSkus: ['MVRDOM', 'NBDS', 'SSNVAL', 'CRIMESC', 'FORM_EVER', 'ES_ECUPIT']
};

module.exports.individualFields = {
    MVRDOM: {
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
            {
                'dataFields': [
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
                'description': 'Current Address',
                'name': 'currentAddress',
                'type': 'object',
                'required': false
            },
            {
                'dataFields': [
                    {
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
                        ],
                        'description': 'Alias',
                        'name': 'alias',
                        'type': 'object',
                        'required': false
                    }
                ],
                'description': 'Aliases',
                'name': 'aliases',
                'length': 3,
                'type': 'array',
                'required': false
            },
            {
                'description': 'Driver License #',
                'name': 'driversLicense',
                'length': 15,
                'type': 'string',
                'required': true
            },
            {
                'description': 'Driver License State',
                'name': 'driversLicenseState',
                'type': 'state',
                'required': true
            }
        ]
    },
    'NBDS': {
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
            {
                'dataFields': [
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
                'description': 'Current Address',
                'name': 'currentAddress',
                'type': 'object',
                'required': true
            },
            {
                'dataFields': [
                    {
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
                        ],
                        'description': 'Alias',
                        'name': 'alias',
                        'type': 'object',
                        'required': false
                    }
                ],
                'description': 'Aliases',
                'name': 'aliases',
                'length': 3,
                'type': 'array',
                'required': false
            }
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
            {
                'dataFields': [
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
                'description': 'Current Address',
                'name': 'currentAddress',
                'type': 'object',
                'required': true
            },
            {
                'dataFields': [
                    {
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
                        ],
                        'description': 'Alias',
                        'name': 'alias',
                        'type': 'object',
                        'required': false
                    }
                ],
                'description': 'Aliases',
                'name': 'aliases',
                'length': 3,
                'type': 'array',
                'required': false
            }
        ]
    },
    CRIMESC: {
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
            {
                'dataFields': [
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
                'description': 'Current Address',
                'name': 'currentAddress',
                'type': 'object',
                'required': true
            },
            {
                'dataFields': [
                    {
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
                        ],
                        'description': 'Alias',
                        'name': 'alias',
                        'type': 'object',
                        'required': false
                    }
                ],
                'description': 'Aliases',
                'name': 'aliases',
                'length': 3,
                'type': 'array',
                'required': false
            }
        ]
    },
    'FORM_EVER': {
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
                'description': 'Birth Date',
                'name': 'birthDate',
                'length': 11,
                'type': 'datelong',
                'required': false
            },
            {
                'description': 'SSN',
                'name': 'governmentId',
                'length': 11,
                'type': 'string',
                'required': true
            },
            {
                'description': 'Gender',
                'name': 'gender',
                'length': 6,
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
            {
                'dataFields': [
                    {
                        'description': 'Street Address',
                        'name': 'street1',
                        'length': 30,
                        'type': 'string',
                        'required': false
                    },
                    {
                        'description': 'Apt. #',
                        'name': 'street2',
                        'length': 30,
                        'type': 'string',
                        'required': false
                    },
                    {
                        'description': 'City',
                        'name': 'city',
                        'length': 50,
                        'type': 'string',
                        'required': false
                    },
                    {
                        'description': 'State',
                        'name': 'state',
                        'length': 50,
                        'type': 'state',
                        'required': false
                    },
                    {
                        'description': 'Zip/Postal Code',
                        'name': 'postalCode',
                        'length': 10,
                        'type': 'string',
                        'required': false
                    }
                ],
                'description': 'Current Address',
                'name': 'currentAddress',
                'type': 'object',
                'required': false
            },
            {
                'dataFields': [
                    {
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
                                'dataFields': [
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
                                'description': 'Address',
                                'name': 'address',
                                'type': 'object',
                                'required': false
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
                        ],
                        'description': 'employmentDetail',
                        'name': 'employmentDetail',
                        'type': 'object',
                        'required': false
                    }
                ],
                'description': 'employmentHistory',
                'name': 'employmentHistory',
                'type': 'array',
                'required': true
            }
        ]
    },
    'ES_ECUPIT': {
        'fields': [
            {
                'description': 'First Name',
                'name': 'firstName',
                'length': 50,
                'type': 'string',
                'required': true
            },
            {
                'description': 'Last Name',
                'name': 'lastName',
                'length': 50,
                'type': 'string',
                'required': true
            },
            {
                'description': 'Birth Date',
                'name': 'birthDate',
                'type': 'datelong',
                'required': false
            },
            {
                'description': 'SSN',
                'name': 'governmentId',
                'length': 9,
                'type': 'string',
                'required': false
            },
            {
                'description': 'Email',
                'name': 'email',
                'type': 'string',
                'required': false
            },
            {
                'dataFields': [
                    {
                        'description': 'Street Address',
                        'name': 'street1',
                        'length': 100,
                        'type': 'string',
                        'required': false
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
                        'required': false
                    },
                    {
                        'description': 'State',
                        'name': 'state',
                        'type': 'state',
                        'required': false
                    },
                    {
                        'description': 'Zip/Postal Code',
                        'name': 'postalCode',
                        'length': 10,
                        'type': 'string',
                        'required': false
                    }
                ],
                'description': 'Current Address',
                'name': 'currentAddress',
                'type': 'object',
                'required': false
            }
        ]
    }
};
