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
                    lead: 'Own your Reputation<br><small>With your Outset Trucker Profile</small>',
                    bullets: [
                        'Take back your Industry Reputation and own your future with your Driver Portfolio.',
                        'Connect with other truckers to stay in touch, share your location & get their recommendations.',
                        'Securely Share your: MVR, Resume, Background Check, Insurance etc. - Put yourself back in the driver’s seat.'
                    ],
                    signup: 'Get Started'
                },
                subhero: {
                    videoURL: '//www.youtube.com/embed/aj4vz1jMSR8',
                    videoID:'aj4vz1jMSR8',
                    title: 'Why Outset?',
                    subtitle: null,
                    bullets: [
                        {
                            title: 'Putting Trucker’s back in the Driver’s Seat.',
                            description: 'Outset has been built from the ground up with a focus on the driver. This means that everything we build is designed to help your career and make life on the road a little better.'
                        },
                        {
                            title: 'Own your Reputation',
                            description: 'Use your Driver Profile as your digital business card, allowing you to control your reputation in the industry.'
                        },
                        {
                            title: 'Tap into your Network',
                            description: 'Connect with Truckers you know - See when your friends are close by, share information with them and get their recommendations.'
                        }
                    ]
                },
                section1: {
                    header: 'Driver Portfolio',
                    sub: 'Your digital business card.',
                    bullets: [
                        'Don’t let previous employers control your first impression.',
                        'Easily share your professional information with Employers or Brokers.',
                        'Grow your Driver Portfolio with your career.'
                    ],
                    image: '/modules/core/img/intro/driver.png'
                },
                section2: {
                    header: 'Your Network',
                    sub: 'Your Biggest Asset.',
                    bullets: [
                        'Stay Connected and Share Information.',
                        'Have people you trust recommend you and your ability.',
                        'Update your network on your location, load and miles you’ve traveled'
                    ],
                    image: '/modules/core/img/intro/reports.png'
                },
                threeSteps: {
                    title: '<span>3 Simple Steps</span> to get you started with Outset',
                    subtitle: '',
                    bullets: [
                        {
                            title: 'Sign up',
                            description: 'Create your Driver Profile, Enter your Handle, update your experience, and order your MVR to be part of your Profile.'
                        },
                        {
                            title: 'Invite your Friends',
                            description: 'Connect with Drivers you know on Outset to build your Driver Network, and make life on the road more enjoyable.'
                        },
                        {
                            title: 'Get out there',
                            description: 'Use your Outset profile to: Apply for jobs, Host your documents and Connect with friends on the road.'
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
                    videoID:'Qzx1qTYLkrY',
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
