(function () {
    'use strict';
    
    //Setting up route
    angular.module('companies').config(config);

    //////////////////////
    moduleConfigResolve.$inject = ['AppConfig', 'Authentication'];
    function moduleConfigResolve(AppConfig, auth) {
        return AppConfig.getModuleConfig(auth.user.type, 'company');
    }

    //////////////////////
    companyResolve.$inject = ['user', 'Companies', '$stateParams', 'Authentication'];
    function companyResolve(user, Companies, params, auth) {

        if (!!params.companyId) {
            return Companies.get(params.companyId);
        }

        var userId;

        if (!!params.userId) {
            console.log('Searching for company data for user %s', params.userId);
            userId = params.userId;
        } else if (!!auth.user) {
            console.log('Searching for company data for logged in user');
            userId = auth.user._id;
        } else {
            return null;
        }

        return Companies.getByUser(userId).catch(function (error) {
            if (error.status === 404) {
                console.log('Unable to find company');
                return {};
            }
            else {
                throw error;
            }
        });
    }

    //////////////////////
    resolveSubscription.$inject = ['Payments', '$stateParams', 'Authentication'];
    function resolveSubscription(Payments, params, auth) {

        var companyId = params.companyId || auth.user && auth.user.company && (auth.user.company._id || auth.user.company);

        return Payments.Subscription.get({ companyId: companyId }).$promise;
    }

    //////////////////////
    resolveSubscriptions.$inject = ['AppConfig'];
    function resolveSubscriptions(config) {
        return config.getAsync('subscriptions');
    }

    //////////////////////
    resolveSubscriptionDetails.$inject = ['AppConfig', '$stateParams', '$log'];
    function resolveSubscriptionDetails(config, $stateParams, $log) {
        var planId = $stateParams.planId;


        return config.getAsync('subscriptions').then(
            function (success) {
                var details = _.find(success.packages, { 'planId': planId });

                if (!details) {
                    throw new Error('Subscription Information not found');
                }
                return details;
            },
            function (error) {
                $log.error('Error retreiving available subscription types', error);
            });
    }

    //////////////////////
    config.$inject = ['$stateProvider'];
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
                controller: ['companies', function (companies) {
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
                    token: ['Payments', function (payments) {
                        return payments.getToken().$promise;
                    }],
                    company: companyResolve,
                    applicant: function () { return null; }
                },
                controller: 'PaymentController',
                controllerAs: 'vm',
                bindToController: true
            });
    }
})();
