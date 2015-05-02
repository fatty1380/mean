(function () {
    'use strict';

    function HomeController($location, $timeout, $document, $log, Authentication, $state) {
        var vm = this;

        // This provides Authentication context.
        vm.authentication = Authentication;

        vm.type = $state.is('intro.driver') ? 'driver' : 'owner';

        vm.textBase = {
            driver: {
                header: {
                    lead: 'Own your Reputation<br><small>With an Outset Driver Portfolio</small>',
                    bullets: [
                        'Pre-qualify for Jobs & Easily Apply with reusable Documents and saved Reports.',
                        'Create your Driver Portfolio and Make the First Impression you want with Companies.',
                        'Securely Share your: MVR, Resume, Background Check, Insurance etc. - From Anywhere.'
                    ],
                    signup: 'Get Started'
                },
                subhero: {
                    videoURL: '//www.youtube.com/embed/aj4vz1jMSR8',
                    title: 'Why Outset?',
                    subtitle: null,
                    bullets: [
                        {
                            title: 'Free Driver Focused Tools.',
                            description: 'Outset has been built from the ground up with a focus on the driver. This means that the tools will be available whenever and wherever you are, with the ability to share with whoever you want'
                        },
                        {
                            title: 'Own your Reputation',
                            description: 'Use your Electronic Driver Portfolio as a digital business card, allowing you to make the First Impression you want with Companies.'
                        },
                        {
                            title: 'Control your Information',
                            description: 'Forget about tracking down a Fax machine, securely send all of your necessary documents with your Electronic Driver Portfolio.'
                        }
                    ]
                },
                section1: {
                    header: 'Portfolio',
                    sub: 'Your digital business card.',
                    bullets: ['Easily share information with Employers and Shippers.',
                        'Don’t let previous employers control your first impression.',
                        'Grow your Electronic Driver Portfolio with your career.'],
                    image: '/modules/core/img/intro/driver.png'
                },
                section2: {
                    header: 'Reports',
                    sub: 'Your Pre-qualification tool.',
                    bullets: [
                        'Let Employers know you’re ready to roll <em>right now</em>.',
                        'Stand out from other applicants and Owner Operators.',
                        'Securely store and share your Motor Vehicle Reports, Background Checks, Drug Test Results and Proof of Insurance'
                    ],
                    image: '/modules/core/img/intro/reports.png'
                },
                section3: {
                    header: 'Jobs',
                    sub: 'One-Click Applications',
                    bullets: [
                        'Use your Portfolio to apply to jobs.',
                        'Securely share reports in your applications.',
                        'Never fax anything again.'
                    ],
                    image: '/modules/core/img/intro/jobs.png'
                },
                threeSteps: {
                    title: '<span>3 Simple Steps</span> to get you started with Outset',
                    subtitle: '',
                    bullets: [
                        {
                            title: 'Sign up',
                            description: 'Create your Driver Portfolio, upload your Resume, and order Background Reports to share with multiple employers.'
                        },
                        {
                            title: 'Get Hired',
                            description: 'With your Driver Portfolio and Reports complete, use them over and over to search for and apply to jobs with one click.'
                        },
                        {
                            title: 'Drive',
                            description: 'By giving employers more information upfront, you standout and get hired you faster - putting you in the driver’s seat in no time.'
                        }
                    ]
                }

            },
            owner: {
                header: {
                    lead: 'Automated Driver Hiring<br><small>Increase Operational and Hiring Efficiency</small>',
                    bullets: [
                        'Automate Background Checks, DOT Employment Verification, Applications & more.',
                        //'Utilize powerful active driver management & logistic tools.',
                        'Centralize & Manage your Applicant flow.',
                        'Schedule Recurring Checks for active drivers to stay in compliance.'
                    ],
                    signup: 'Get Started'
                },
                subhero: {
                    videoURL: '//www.youtube.com/embed/Qzx1qTYLkrY',
                    title: 'Why Outset?',
                    subtitle: null,
                    bullets: [
                        {title: 'Created for the Transportation Industry.', description: ''},
                        {title: 'Designed to save you money lost in the hiring process.', description: ''},
                        {title: 'Customized solutions for your company’s needs.', description: ''},
                        {
                            title: 'Let technology take the headache out of hiring and driver management.',
                            description: ''
                        }
                    ]
                },
                section1: {
                    header: 'Reports',
                    sub: 'Cut Hiring Costs.',
                    bullets: [
                        'Background Checks & Employment Verification',
                        'View & Download applicant reports immediately.',
                        'Get Applicants Authorization with an e-Signature.',
                        'Free up resources for recruiting, not paperwork',
                    ],
                    image: '/modules/core/img/intro/employer.png'
                },
                section2: {
                    header: 'Applicant Flow',
                    sub: '',
                    bullets: [
                        'Increase Operational Efficiency, centralize your process.',
                        'View all Applicant reports and verifications in one place.',
                        'Communicate with all applicants from within Outset.',
                        'Backup your reporting compliance with e-storage of documents.'
                    ],
                    image: '/modules/core/img/intro/employer-reports.png'
                },
                pricing: {
                    header: 'Pricing',
                    sub: 'Choose from one of the following packages:'
                },
                threeSteps: {
                    title: '<span>3 Simple Steps</span> to get you started with Outset',
                    subtitle: '',
                    bullets: [
                        {
                            title: 'Sign up',
                            description: 'Simplify your Process by linking job postings to Outset, and manage all of your applicants in one place.'
                        },
                        {
                            title: 'Hire',
                            description: 'Receive all of your applicant reports and employment verification electronically, and stop wasting time on bad apples.'
                        },
                        {
                            title: 'Save Time & Money',
                            description: 'By managing your hiring funnel within Outset, you’ll fill your empty vehicles faster, freeing up time for more driver recruiting.'
                        }
                    ]
                }


            }
        };

        vm.text = vm.textBase[vm.type];

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
