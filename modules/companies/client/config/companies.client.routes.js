(function () {
    'use strict';

    function moduleConfigResolve(AppConfig, auth) {
        return AppConfig.getModuleConfig(auth.user.type, 'company');
    }

    function companyResolve(Companies, params, auth) {

        var val;

        if (!!params.companyId) {
            val = params.companyId;
            console.log('Searching for company ID: %s', val);

            return Companies.ById.get({
                companyId: val
            }).$promise;
        }

        if (!!params.userId) {
            console.log('Searching for company data for user %s', params.userId);
            val = params.userId;
        } else if (!!auth.user) {
            console.log('Searching for company data for logged in user');
            val = auth.user._id;
        } else {
            return null;
        }


        return Companies.ByUser.get({
            userId: val
        }).$promise.catch(function (error) {
                if (error.status === 404) {
                    console.log('Unable to find company');
                    return {};
                }
                else {
                    throw error;
                }
            });
    }

    function resolveSubscription(Payments, params, auth) {

        var companyId = params.companyId || auth.user && auth.user.company && (auth.user.company._id || auth.user.company);

        return Payments.Subscription.get({companyId: companyId}).$promise;
    }

    function resolveSubscriptions(config) {
        return config.getAsync('subscriptions');
    }

    function resolveSubscriptionDetails(config, $stateParams, $log) {
        var planId = $stateParams.planId;


        return config.getAsync('subscriptions').then(
            function(success) {
                var details = _.find(success.packages, {'planId': planId});

                if(!details) {
                    throw new Error('Subscription Information not found');
                }
                return details;
            },
            function(error) {
                $log.error('Error retreiving available subscription types', error);
            }
        );
    }

    function config($stateProvider) {
        // Companies state routing
        $stateProvider.

            state('companies', {
                abstract: true,
                url: '/companies',
                template: '<div ui-view class="content-section"></div>',
                parent: 'fixed-opaque'
            }).

            state('companies.list', {
                url: '/list',
                templateUrl: '/modules/companies/views/list-companies.client.view.html',
                parent: 'companies',
                controller: ['companies', function(companies) {
                    var vm = this;
                    vm.companies = companies;
                }],
                controllerAs: 'vm',
                resolve: {
                    companies: ['Companies', function (rsrc) {
                        return rsrc.ById.query().$promise;
                    }],
                    config: moduleConfigResolve
                }
            }).

            state('companies.home', {
                url: '/home',
                templateUrl: '/modules/companies/views/view-company.client.view.html',
                parent: 'companies',
                controller: 'CompaniesController',
                controllerAs: 'vm',
                resolve: {
                    company: companyResolve,
                    config: moduleConfigResolve
                }
            }).

            state('companies.view', {
                url: '/{companyId:[0-9a-fA-F]{24}}',
                templateUrl: '/modules/companies/views/view-company.client.view.html',
                parent: 'companies',
                controller: 'CompaniesController',
                controllerAs: 'vm',
                resolve: {
                    company: companyResolve,
                    config: moduleConfigResolve
                }
            }).

            state('companies.create', {
                url: '/create',
                templateUrl: '/modules/companies/views/edit-company.client.view.html',
                parent: 'companies',
                controller: 'CompanyEditController',
                controllerAs: 'vm',
                resolve: {
                    company: function () {
                        return null;
                    },
                    config: moduleConfigResolve
                }
            }).

            state('companies.edit', {
                url: '/{companyId:[0-9a-fA-F]{24}}/edit',
                templateUrl: '/modules/companies/views/edit-company.client.view.html',
                parent: 'companies',
                controller: 'CompanyEditController',
                controllerAs: 'vm',
                resolve: {
                    company: companyResolve,
                    config: moduleConfigResolve
                }
            }).


            state('subscriptionsReview', {
                url: '/subscriptions',
                templateUrl: '/modules/companies/views/review-subscriptions.client.view.html',
                parent: 'headline-bg',
                controller: 'SubscriptionListController',
                controllerAs: 'vm',
                bindToController: true,
                resolve: {
                    subscriptions: resolveSubscriptions,
                    subscription: resolveSubscription
                }
            }).
            state('subscriptionPayment', {
                url: '/subscriptions/:planId/pay?:promo',
                templateUrl: '/modules/bgchecks/views/paymentTest.client.view.html',
                parent: 'fixed-opaque',
                resolve: {
                    report: resolveSubscriptionDetails,
                    token: ['Payments', function(payments) {
                        return payments.getToken().$promise;
                    }],
                    company: companyResolve,
                    applicant: function() {return null;}
                },
                controller: 'PaymentController',
                controllerAs: 'vm',
                bindToController: true
            });
    }

// Dependency Injection
    companyResolve.$inject = ['Companies', '$stateParams', 'Authentication'];
    moduleConfigResolve.$inject = ['AppConfig', 'Authentication'];
    resolveSubscriptions.$inject=['AppConfig'];
    resolveSubscription.$inject=['Payments', '$stateParams', 'Authentication'];
    resolveSubscriptionDetails.$inject=['AppConfig', '$stateParams', '$log'];

    config.$inject = ['$stateProvider'];

//Setting up route
    angular.module('companies').config(config);
})
();
