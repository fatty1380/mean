(function () {
    'use strict';

    function HomeController($location, $timeout, $document, $log, Authentication, $state) {
        var vm = this;

        // This provides Authentication context.
        vm.authentication = Authentication;

        vm.signupType = $state.is('intro.driver') ? 'driver' : 'owner';

        vm.textBase = {
            driver: {
                header: {
                    lead: 'Control your career.<br>Get better transportation jobs.',
                    bullets: [
                        'Pre-qualify for Jobs.',
                        'Build your Online Driving Portfolio.',
                        'Digital Documents: MVR, Resume, Background, Insurance.'
                    ],
                    signup: 'Get Started'
                },
                subhero: {
                    videoURL: '//www.youtube.com/embed/aj4vz1jMSR8',
                    title: 'Why Outset?',
                    bullets: [
                        'Driver Focused.',
                        'Digital Reports are yours to keep.',
                        'Control who sees your information.'
                    ]
                },
                section1: {
                    header: 'Portfolio',
                    sub: 'Your digital business card.',
                    bullets: ['Easily share information with Employers.',
                        'Show you\'re on top of your Game.',
                        'Grow it with your career.'],
                    image: '/modules/core/img/intro/driver.png'
                },
                section2: {
                    header: 'Reports',
                    sub: 'Your Pre-qualification tool',
                    bullets: [
                        'Let Employers know you\'re ready to go tomorrow.',
                        'Stand out from other applicants.',
                        'Securely store and share:<ul><li>Motor Vehicle Reports</li><li>Background Checks</li><li>Drug Test Results</li><li>Proof of Insurance</li>'
                    ],
                    image: '/modules/core/img/intro/reports.png'
                },
                section3: {
                    header: 'Jobs',
                    sub: 'One-Click Applications',
                    bullets: [
                        'Use your Portfolio to apply to jobs.',
                        'Securely share reports in your applications.',
                        'Cut your hiring time.'
                    ],
                    image: '/modules/core/img/intro/jobs.png'
                },
                conclusion: [
                    {
                        title: 'Sign up',
                        description: 'Create your Driver Portfolio, upload your Resume, and order Background Reports to let employers know they can hire you immediately.'
                    },
                    {
                        title: 'Get Hired',
                        description: 'With your Driver Portfolio and Reports complete, use them over and over to search for and apply to jobs with one click.'
                    },
                    {
                        title: 'Drive',
                        description: 'By giving employers more information upfront, you not only standout, but they are able to hire you faster, so you\'ll be in the driver\'s seat in no time.'
                    }
                ]

            },
            owner: {
                header: {
                    lead: 'Increase your Hiring Efficiency.<br>Save Time and Money',
                    bullets: [
                        'Increase certainty in your hiring funnel.',
                        'Centralize applicant flow',
                        'Cut costs on Background Checks.',
                        'Digitize your Reporting process.'
                    ],
                    signup: 'Get Started'
                },
                subhero: {
                    videoURL: '//www.youtube.com/embed/Qzx1qTYLkrY',
                    title: 'Why Outset?',
                    bullets: [
                        'Designed to save you money.',
                        'Customize solutions to your company\'s needs.',
                        'Let technology take the headache out of hiring.'

                    ]
                },
                section1: {
                    header: 'Reports',
                    sub: 'Cut Background Check costs.',
                    bullets: [
                        'View & Download applicant reports immediately.',
                        'Require applicants to run your custom reports.',
                        'Fewer failed background checks',
                        'Faster hiring.'
                    ],
                    image: '/modules/core/img/intro/employer.png'
                },
                section2: {
                    header: 'Applicant Flow',
                    sub: '',
                    bullets: [
                        'View & Message all of your Applicants in one place.',
                        'Require external applicants to get reports.',
                        'Free up your email inbox.'
                    ],
                    image: '/modules/core/img/intro/employer-reports.png'
                },
                pricing: {
                    header: 'Pricing',
                    sub: 'Choose from one of the following packages:',
                    features: ['Job Posts', 'Applicant Redirect', 'Applicant Tracking', 'Downloadable Reports', 'Require Reports', 'Multiple Log-ins', 'Customized Background Checks'],
                    packages: [
                        {
                            price: 60,
                            title: 'Local',
                            features: [2, true, true, false, false, false, false]
                        },
                        {
                            price: 95,
                            title: 'Regional',
                            features: [5, true, true, true, false, false, '+ $65']
                        },
                        {
                            price: 145,
                            title: 'Fleet',
                            features: [15, true, true, true, true, true, '+ $65']
                        }
                    ]
                },
                conclusion: [
                    {
                        title: 'Simplify your Process',
                        description: 'Sign up and post a job. Then link other job postings you have to Outset, in order to manage all of your applicants in one place.'
                    },
                    {
                        title: 'Hire',
                        description: 'As people apply to your job, you will be able to message them, view their Resumes and Background Checks, and quickly decide who you want to interview.'
                    },
                    {
                        title: 'Save Time & Money',
                        description: 'By managing your hiring funnel within Outset, you\'ll fill your empty vehicles faster, taking the stress out of the hiring process.'
                    }
                ]


            }
        };

        vm.text = vm.textBase[vm.signupType];

        vm.videoURL = vm.text.subhero.videoURL; //= $sce.trustAsResourceUrl(vm.text.subhero.videoURL + '?controls=0&rel=0&showinfo=0&autohide=1&modestbranding=1');

        if ($location.hash()) {
            var element = angular.element(document.getElementById($location.hash()));

            $timeout(function () {
                $document.scrollToElementAnimated(element);
            }, 100);

        }
    }

    HomeController.$inject = ['$location', '$timeout', '$document', '$log', 'Authentication', '$state'];

    angular
        .module('core')
        .controller('HomeController', HomeController);
})();
