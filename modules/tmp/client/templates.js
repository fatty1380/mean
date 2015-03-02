angular.module('oset-templates', []).run(['$templateCache', function($templateCache) {
 'use strict';
 $templateCache.put('/modules/addresses/views/address-list-edit.client.template.html',
  '<!-- os-address-list : address-list.client.template.html -->\n' +
  '<section ng-class="{\'row\' : !vm.fullWidth}">\n' +
  '    <div ng-repeat="(a,address) in vm.addresses track by a" ng-class="{\'col-sm-4\' : !vm.fullWidth}"\n' +
  '         ng-animate="\'animate\'" ng-form="vm.addressForms[$index]">\n' +
  '        <div ng-class="{\'form-group\': !vm.fullWidth}">\n' +
  '            <os-edit-address model="vm.addresses[a]" can-remove="vm.canRemove"></os-edit-address>\n' +
  '        </div>\n' +
  '    </div>\n' +
  '\n' +
  '    <div ng-show="vm.canAdd">\n' +
  '        <button type="button" class="btn btn-oset-link center-block" value="add" ng-click="vm.addAddress()">\n' +
  '            <i class="fa fa-plus"></i>\n' +
  '            <span ng-if="!vm.addresses.length">add address details ...</span>\n' +
  '            <span ng-if="!!vm.addresses.length">add another address</span>\n' +
  '        </button>\n' +
  '    </div>\n' +
  '\n' +
  '    <div ng-if="!vm.fullWidth && (!vm.addresses || vm.address.length < 1)" class="text-center">Fill out your profile by\n' +
  '        adding an address!\n' +
  '    </div>\n' +
  '</section>\n' +
  '');
 $templateCache.put('/modules/addresses/views/address-list.client.template.html',
  '<!-- os-address-list : address-list.client.template.html -->\n' +
  '<section ng-class="{\'row\' : !vm.fullWidth}">\n' +
  '    <div ng-repeat="(a,address) in vm.addresses track by a" ng-class="{\'col-sm-4\' : !vm.fullWidth}"\n' +
  '         ng-animate="\'animate\'">\n' +
  '        <div ng-class="{\'form-group\': !vm.fullWidth}">\n' +
  '            <os-address data-ng-if="!vm.inlineEdit" model="vm.addresses[a]" is-editing="vm.isEditing" can-edit="vm.canEdit" can-remove="vm.canRemove" remove="vm.removeAddress"></os-address>\n' +
  '            <os-edit-address data-ng-if="vm.inlineEdit" model="vm.addresses[a]" can-remove="vm.canRemove" remove="vm.removeAddress"></os-edit-address>\n' +
  '        </div>\n' +
  '    </div>\n' +
  '\n' +
  '    <div ng-show="vm.canAdd">\n' +
  '        <button type="button" class="btn btn-oset-link center-block" value="add" ng-click="vm.addAddress()">\n' +
  '            <i class="fa fa-plus"></i>\n' +
  '            <span ng-if="!vm.addresses.length">add address details ...</span>\n' +
  '            <span ng-if="!!vm.addresses.length">add another address</span>\n' +
  '        </button>\n' +
  '\n' +
  '    </div>\n' +
  '\n' +
  '    <div ng-if="!vm.fullWidth && (!vm.addresses || vm.address.length < 1)" class="text-center">Fill out your profile by\n' +
  '        adding an address!\n' +
  '    </div>\n' +
  '</section>\n' +
  '');
 $templateCache.put('/modules/addresses/views/address.client.template.html',
  '<!-- os-address : address.client.template.html -->\n' +
  '<div class="panel" ng-if="!!vm.address">\n' +
  '     <div class="panel-heading">\n' +
  '        <span class="h4">{{vm.getAddressType()}}</span>\n' +
  '        <button data-ng-if="vm.canEdit" type="button" class="pull-right btn-link" value="edit"\n' +
  '                ng-click="vm.editAddress(this)">\n' +
  '            <i class="fa fa-pencil"></i>\n' +
  '        </button>\n' +
  '        <button data-ng-show="vm.canRemove()" type="button" class="pull-right btn-link" value="delete"\n' +
  '                ng-click="vm.removeAddress">\n' +
  '            <i class="fa fa-trash-o"></i>\n' +
  '        </button>\n' +
  '    </div>\n' +
  '    <div class="panel-body">\n' +
  '        <address>\n' +
  '            <div ng-repeat="(s,street) in vm.address.streetAddresses track by s">\n' +
  '                {{vm.address.streetAddresses[s]}}\n' +
  '            </div>\n' +
  '            {{vm.address.city}}, {{vm.address.state}} {{vm.address.zipCode}}\n' +
  '            <br/>\n' +
  '        </address>\n' +
  '    </div>\n' +
  '</div>\n' +
  '\n' +
  '\n' +
  '<script type="text/ng-template" id="addressEditModal.html" ng-if="vm.canEdit">\n' +
  '\n' +
  '    <div class="modal-header">\n' +
  '        <span class="modal-title h3 text-center">Add Address</span>\n' +
  '\n' +
  '        <div class="pull-right">\n' +
  '            <button class="btn btn-text" ng-click="$dismiss(\'cancel\')">X</button>\n' +
  '        </div>\n' +
  '    </div>\n' +
  '\n' +
  '    <form role="form" data-ng-submit="signin()" class="signin form-horizontal" spellcheck="false" novalidate>\n' +
  '        <div class="modal-body">\n' +
  '            Address: {{ vm.address }}, Text: {{ vm.text }}, debugger? {{ debugger; }}\n' +
  '            <os-edit-address model="vm.address" enable-edit="true"></os-edit-address>\n' +
  '        </div>\n' +
  '\n' +
  '        <div class="modal-footer">\n' +
  '            <div class="text-center form-group">\n' +
  '                <button type="submit" class="btn btn-oset-primary">{{vm.text.submit || \'Save\' }}</button>\n' +
  '            </div>\n' +
  '            <div data-ng-show="error" class="text-center text-danger">\n' +
  '                <strong data-ng-bind="error"></strong>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '    </form>\n' +
  '\n' +
  '</script>\n' +
  '');
 $templateCache.put('/modules/addresses/views/edit-address.client.template.html',
  '<!-- os-edit-address : edit-address.client.template.html -->\n' +
  '<section class="well">\n' +
  '    <div class="animate-show" ng-animate="\'animate\'">\n' +
  '\n' +
  '        <div ng-class="{\'input-group\' : !!vm.address.type}">\n' +
  '\n' +
  '            <span class="dropdown input-group-btn" dropdown is-open="vm.ddlStatus.isopen" on-toggle="vm.toggled(open)">\n' +
  '                <button type="button" class="btn btn-oset-link dropdown-toggle" dropdown-toggle\n' +
  '                        ng-class="{\'btn-block\':!vm.address.type}" >\n' +
  '                    <b><span ng-show="!vm.address.type">select address type<span class="caret"></span></span>\n' +
  '                    <span ng-show="!!vm.address.type">address type:</span></b>\n' +
  '                </button>\n' +
  '                <ul class="dropdown-menu" role="menu">\n' +
  '                    <li ng-repeat="type in vm.types"><a href="#" ng-click="vm.setType(type, $event)">{{type}}</a></li>\n' +
  '                    <li class="divider"></li>\n' +
  '                    <li><a ng-click="vm.setType(\'other\', $event)">other ...</a></li>\n' +
  '                </ul>\n' +
  '            </span>\n' +
  '\n' +
  '            <p class="form-control-static" ng-show="vm.address.type !== \'other\' && !!vm.address.type"><b>{{vm.address.type | titlecase }}</b></p>\n' +
  '            <input type="text" id="typeOther" name="typeOther" class="form-control" data-ng-model="vm.address.typeOther"\n' +
  '                   data-ng-show="vm.address.type === \'other\'" placeholder="Address Type"/>\n' +
  '            <!-- /btn-group -->\n' +
  '\n' +
  '        </div>\n' +
  '\n' +
  '        <div ng-repeat="(s,street) in vm.address.streetAddresses track by s">\n' +
  '            <input type="text" id="street-address" name="street-address" class="form-control"\n' +
  '                   ng-required="false"\n' +
  '                   data-ng-model="vm.address.streetAddresses[s]"\n' +
  '                   ng-model-options="{ updateOn: \'default blur\', debounce: { \'default\': 1000, \'blur\': 0 } }"\n' +
  '                   placeholder="Street Address {{$index+1}}">\n' +
  '        </div>\n' +
  '\n' +
  '        <label class="sr-only" for="city">City</label>\n' +
  '        <input type="text" id="city" name="city" class="form-control" data-ng-model="vm.address.city"\n' +
  '               ng-model-options="{ updateOn: \'default blur\', debounce: { \'default\': 1000, \'blur\': 0 } }"\n' +
  '               placeholder="City" ng-required="false">\n' +
  '\n' +
  '        <label class="sr-only" for="state">State</label>\n' +
  '        <input type="text" id="state" name="state" class="form-control" data-ng-model="vm.address.state"\n' +
  '               ng-model-options="{ updateOn: \'default blur\', debounce: { \'default\': 1000, \'blur\': 0 } }"\n' +
  '               placeholder="State" ng-required="false">\n' +
  '\n' +
  '        <label class="sr-only" for="address-zip">Zip Code</label>\n' +
  '        <input type="text" id="address-zip" name="zip" class="form-control" data-ng-model="vm.address.zipCode"\n' +
  '               ng-model-options="{ updateOn: \'default blur\', debounce: { \'default\': 1000, \'blur\': 0 } }"\n' +
  '               placeholder="ZIP">\n' +
  '    </div>\n' +
  '</section>\n' +
  '');
 $templateCache.put('/modules/applications/views/templates/application-summary.client.template.html',
  '<section name=\'oset-application-summary\'>\n' +
  '\n' +
  '    <!--This view is used primarily for the display of simple inline template views.-->\n' +
  '    <div ng-show="vm.application">\n' +
  '        <div data-ng-if="vm.displayMode === \'minimal\' || vm.displayMode === \'mine\'" class="panel panel-default pad">\n' +
  '            <dl class="dl-horizontal">\n' +
  '                <dt>Status:</dt>\n' +
  '                <dd>\n' +
  '                    <os-application-status-badge model="vm.application"></os-application-status-badge>\n' +
  '                </dd>\n' +
  '                <dt>Applied On:</dt>\n' +
  '                <dd>{{vm.application.created | date:\'short\'}}</dd>\n' +
  '            </dl>\n' +
  '            <div class="text-center" data-ng-if="vm.displayMode === \'mine\'">\n' +
  '                <button type="button" class="btn-link read-more strong mgn-left"\n' +
  '                        ui-sref="applications.view({applicationId: vm.application._id})">\n' +
  '                    Review<i class="fa fa-external-link fa-lg mgn-left"></i>\n' +
  '                </button>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '\n' +
  '        <section data-ng-if="vm.displayMode === \'table\'" class="applicant mini-table">\n' +
  '            <td>{{vm.index}}</td>\n' +
  '            <td>\n' +
  '                <img ng-src="{{vm.user.profileImageURL}}"\n' +
  '                     class="profile-image medium center-block">\n' +
  '            </td>\n' +
  '            <td>\n' +
  '                <span class="stronger">{{vm.user.firstName}}&nbsp;{{vm.user.lastName.substring(0,1)}}</span>\n' +
  '                <br>\n' +
  '                <os-application-status-badge model="vm.application"></os-application-status-badge>\n' +
  '            </td>\n' +
  '            <td>\n' +
  '                <dl class="dl-horizontal mini-table">\n' +
  '                    <dt>License</dt>\n' +
  '                    <dd>\n' +
  '                        <p style="margin-bottom: 2px;">\n' +
  '                            <i class="fa fa-credit-card"></i> &nbsp;{{vm.license.state.name}}\n' +
  '                            <span ng-show="vm.license.type">\n' +
  '                                <span ng-if="vm.license.rating"> Class {{vm.license.rating | uppercase }}</span>\n' +
  '                                {{vm.license.type}}\n' +
  '                            </span>\n' +
  '                            Driver License\n' +
  '                        </p>\n' +
  '                    </dd>\n' +
  '                    <dt>Endorsements</dt>\n' +
  '                    <dd>\n' +
  '                        <p style="margin-bottom: 2px;">\n' +
  '                            <oset-list-endorsements model="vm.license.endorsements"></oset-list-endorsements>\n' +
  '                        </p>\n' +
  '                    </dd>\n' +
  '                    <dt>Interests</dt>\n' +
  '                    <dd>\n' +
  '                        <p style="margin-bottom: 2px;">\n' +
  '                        <span ng-repeat="interest in visibleInterests = (vm.driver.interests | filter: {value: true})"\n' +
  '                              class="label label-primary mgn-right">{{interest.key}}&nbsp;</span>\n' +
  '\n' +
  '                        <span ng-show="!visibleInterests.length">\n' +
  '                            <span ng-show="!vm.canEdit">none entered</span>\n' +
  '                        </span>\n' +
  '                        </p>\n' +
  '                    </dd>\n' +
  '                    <dt>Messages:</dt>\n' +
  '                    <dd ng-show="!!vm.application.isConnected"\n' +
  '                        ng-init="otherMsgs = (vm.application.messages | filter : {\'sender\' : (\'!\'+vm.user._id)})">\n' +
  '                        <p style="margin-bottom: 2px;" ng-show="vm.application.messages && vm.application.messages.length">\n' +
  '                            {{otherMsgs.length ? otherMsgs.length : \'no\'}} received messages\n' +
  '                            <a class="pull-right"\n' +
  '                               ui-sref="applications.view({applicationId: vm.application._id, target: \'message\'})">\n' +
  '                                send a new message\n' +
  '                            </a>\n' +
  '                        </p>\n' +
  '\n' +
  '                        <p style="margin-bottom: 2px;" ng-hide="vm.application.messages && vm.application.messages.length">\n' +
  '                            discuss the job and schedule an interview\n' +
  '                            <a class="pull-right"\n' +
  '                               ui-sref="applications.view({applicationId: vm.application._id, target: \'message\'})">\n' +
  '                                send a new message\n' +
  '                            </a>\n' +
  '                        </p>\n' +
  '                    </dd>\n' +
  '                    <dd ng-hide="!!vm.application.isConnected">\n' +
  '                        <p style="margin-bottom: 2px;">\n' +
  '                            <em class="text-muted" ng-if="vm.user.type === \'owner\'">\n' +
  '                                once connected, you will be able to exchange messages with the applicant\n' +
  '                            </em>\n' +
  '                            <em class="text-muted" ng-if="vm.user.type === \'driver\'">\n' +
  '                                once connected, you will be able to exchange messages with the employer\n' +
  '                            </em>\n' +
  '                        </p>\n' +
  '                    </dd>\n' +
  '                </dl>\n' +
  '            </td>\n' +
  '            <td style="white-space: nowrap">\n' +
  '                <a class="read-more strong align-right mgn-bottom pull-right"\n' +
  '                   ui-sref="applications.view({applicationId: vm.application._id, action: \'read\'})">\n' +
  '                    Review\n' +
  '                    <i class="fa fa-external-link fa-lg mgn-left"></i>\n' +
  '                </a>\n' +
  '                <br>\n' +
  '                <a class="read-more strong align-right mgn-bottom pull-right"\n' +
  '                   tooltip="vm.messagingText" tooltip-popup-delay="1000"\n' +
  '                   ui-sref="applications.view({applicationId: vm.application._id, action: \'message\'})">\n' +
  '                    Messages\n' +
  '                    <i class="fa fa-comments-o fa-lg mgn-left"></i>\n' +
  '                </a>\n' +
  '                <!--TODO: Change the "Reject" into a state rather than a callback-->\n' +
  '                <!--<br>-->\n' +
  '                <!--<a class="read-more align-right hidden mgn-bottom pull-right"-->\n' +
  '                <!--ng-click="vm.setApplicationStatus(job.applications[$index], \'rejected\', $event, this)">-->\n' +
  '                <!--Reject<i class="fa fa-close fa-lg mgn-left"></i>-->\n' +
  '                <!--</a>-->\n' +
  '            </td>\n' +
  '\n' +
  '        </section>\n' +
  '\n' +
  '        <div data-ng-if="vm.displayMode === \'inline\'" class="row">\n' +
  '            <dl class="dl-horizontal">\n' +
  '                <dt>Applicant:</dt>\n' +
  '                <dd>{{vm.application.user.displayName}}</dd>\n' +
  '                <dt>Job:</dt>\n' +
  '                <dd>{{vm.application.job.name || \'UNKNOWN\'}}\n' +
  '                    <span class="label label-info">{{vm.application.status}}</span>\n' +
  '                </dd>\n' +
  '                <dt>Applied On:</dt>\n' +
  '                <dd>{{vm.application.created | date:\'short\'}}</dd>\n' +
  '            </dl>\n' +
  '        </div>\n' +
  '\n' +
  '        <div data-ng-if="!vm.displayMode || vm.displayMode === \'normal\'" class="row">\n' +
  '            <div class="col-md-4">\n' +
  '                <dl class="dl-horizontal">\n' +
  '                    <dt>Job:</dt>\n' +
  '                    <dd>{{vm.application.job.name || \'UNKNOWN\'}}\n' +
  '                        <span class="label label-info">{{vm.application.status}}</span>\n' +
  '                    </dd>\n' +
  '                    <dt>Applicant:</dt>\n' +
  '                    <dd>{{vm.application.user.displayName}}</dd>\n' +
  '                    <dt>Applied On:</dt>\n' +
  '                    <dd>{{vm.application.created | date:\'short\'}}</dd>\n' +
  '                </dl>\n' +
  '            </div>\n' +
  '            <div class="col-md-8">\n' +
  '                <dl class="dl-horizontal"\n' +
  '                    ng-repeat="message in vm.application.messages | orderBy:\'-created\' | limitTo: 1">\n' +
  '                    <dt>Last Message:</dt>\n' +
  '                    <dd>{{message.text | limitTo : 100}}</dd>\n' +
  '                    <dt>Sent:</dt>\n' +
  '                    <dd>{{message.created | date: \'short\'}}</dd>\n' +
  '                </dl>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '    </div>\n' +
  '\n' +
  '    <!-- Show this if there is no application present -->\n' +
  '    <!------------------------------------------------->\n' +
  '    <!-- For drivers, link to the new application creation -->\n' +
  '    <!-- For owners, tell them sorry :(                    -->\n' +
  '    <section ng-show="!vm.application">\n' +
  '        <!-- Show "Job Apply" button if job is specified and no application is found for the user. -->\n' +
  '        <div data-ng-if="!!vm.job && vm.user.type === \'driver\' && !vm.job.externalApplicationLink" os-new-application-modal job=\'vm.job\'>\n' +
  '            <button class="btn btn-cta-primary btn-lg btn-block bigger">\n' +
  '                apply now!\n' +
  '            </button>\n' +
  '        </div>\n' +
  '        <div data-ng-if="!!vm.job && vm.user.type === \'driver\' && !!vm.job.externalApplicationLink" job=\'vm.job\'>\n' +
  '            <a class="btn btn-cta-primary btn-lg btn-block bigger" data-ng-href="{{vm.job.externalApplicationLink}}" target="_blank">\n' +
  '                apply now! <i class="fa fa-external-link mgn-left"></i>\n' +
  '            </a>\n' +
  '        </div>\n' +
  '        <div data-ng-if="!!vm.job && vm.user.type === \'owner\'">\n' +
  '            Sorry, no applicants yet. Please check back later.\n' +
  '        </div>\n' +
  '    </section>\n' +
  '</section>\n' +
  '');
 $templateCache.put('/modules/applications/views/templates/os-applicant.client.template.html',
  '<div class="applicant" name="os-applicant.client-template">\n' +
  '    <div class="h4 stronger">{{vm.applicant.displayName}}\n' +
  '        <small class="pull-right">Applied {{vm.application.created | date: \'short\'}}</small>\n' +
  '    </div>\n' +
  '    <hr/>\n' +
  '    <div class="row">\n' +
  '        <div class="col-sm-12">\n' +
  '            <dl class="dl-horizontal">\n' +
  '                <dt> <img ng-src="{{vm.applicant.profileImageURL}}" class="img-responsive center-block"></dt>\n' +
  '                <dd>\n' +
  '                    <span class="strong">Cover Letter:</span>\n' +
  '                    <p class="panel panel-default letter" data-ng-bind-html="vm.application.introduction"></p>\n' +
  '                </dd>\n' +
  '                <dt>About:</dt>\n' +
  '                <dd ng-show="vm.isConnected">\n' +
  '                    <p class="panel panel-default letter" data-ng-bind-html="vm.driver.about"></p>\n' +
  '                </dd>\n' +
  '                <dd ng-hide="vm.isConnected">\n' +
  '                    <em class="text-muted" ng-bind-html="vm.text.pre.about"> </em>\n' +
  '                </dd>\n' +
  '\n' +
  '                <dt>Messages:</dt>\n' +
  '                <dd ng-show="vm.isConnected">\n' +
  '                    <p ng-show="vm.application.messages && vm.application.messages.length">\n' +
  '                        {{vm.application.messages.length}} Total Messages\n' +
  '                        <a href="#messaging" class="pull-right" ng-click="vm.scrollToMessageFn()">\n' +
  '                            send a new message\n' +
  '                        </a>\n' +
  '                    </p>\n' +
  '\n' +
  '                    <p class="panel panel-info letter"\n' +
  '                       ng-hide="vm.application.messages && vm.application.messages.length">\n' +
  '                        Now that you are connected, use the messaging functionality to communicate with the\n' +
  '                        {{vm.user.type === \'driver\' ? \'Employer\' : \'Applicant\'}}.\n' +
  '                        You can ask and answer questions, and coordinate a telephone or in-person interview.\n' +
  '                        <br/>\n' +
  '                        <a href="#messaging" class="btn btn-primary"\n' +
  '                           ng-click="vm.scrollToMessageFn()">\n' +
  '                            Click Here to Begin\n' +
  '                        </a>\n' +
  '                    </p>\n' +
  '                </dd>\n' +
  '                <dd ng-hide="vm.isConnected">\n' +
  '                    <p>\n' +
  '                        <em class="text-muted" ng-if="vm.user.type === \'owner\'"\n' +
  '                            ng-bind-html="vm.text.pre.messaging.owner"></em>\n' +
  '                        <em class="text-muted" ng-if="vm.user.type === \'driver\'"\n' +
  '                            ng-bind-html="vm.text.pre.messaging.driver"></em>\n' +
  '                    </p>\n' +
  '                </dd>\n' +
  '\n' +
  '                <dt>License:</dt>\n' +
  '                <dd>\n' +
  '                    <p>\n' +
  '                        <i class="fa fa-credit-card"></i> &nbsp;{{vm.license.state.name}}\n' +
  '                    <span ng-show="vm.license.type">\n' +
  '                        <span ng-if="vm.license.rating"> Class {{vm.license.rating | uppercase }}</span>\n' +
  '                        {{vm.license.type}}\n' +
  '                    </span>\n' +
  '                        Driver License\n' +
  '                    </p>\n' +
  '                </dd>\n' +
  '\n' +
  '                <dt>Endorsements</dt>\n' +
  '                <dd>\n' +
  '                    <p>\n' +
  '                        <oset-list-endorsements model="vm.license.endorsements"></oset-list-endorsements>\n' +
  '                    </p>\n' +
  '                </dd>\n' +
  '\n' +
  '                <dt ng-if="vm.debug">raw</dt>\n' +
  '                <dd ng-if="vm.debug"><pre>{{vm.driver.reports | prettyPrint}}</pre></dd>\n' +
  '\n' +
  '                <dt>Reports</dt>\n' +
  '                <dd class="report-badges" ng-class="{\'not-visible\':!vm.isConnected}">\n' +
  '\n' +
  '                <span class="fa-stack fa-3x report-badge mgn-right"\n' +
  '                      tooltip="Resume{{vm.isConnected ? (!!vm.driver.resume ? \' - click to download\': \' - not available\') : \'\'}}"\n' +
  '                        ng-class="{\'available\': !!vm.driver.resume}"\n' +
  '                        ng-click="vm.isConnected && vm.openResumeFile()">\n' +
  '                    <i class="fa fa-file fa-stack-2x"></i>\n' +
  '                    <span class="badge-info">\n' +
  '                        <span class="badge-info-inner fa fa-stack-1x">\n' +
  '                            <i class="fa fa-check fa-1x"></i>\n' +
  '                            <span class="title">Resume</span>\n' +
  '                        </span>\n' +
  '                    </span>\n' +
  '                </span>\n' +
  '\n' +
  '                <span class="fa-stack fa-3x report-badge mgn-right"\n' +
  '                      tooltip="Motor Vehicle Report{{vm.isConnected ? (!!vm.driver.reports[\'mvr\']  ? \' - click to download\': \' - not available\') : \'\'}}"\n' +
  '                      ng-class="{\'available\': !!vm.driver.reports[\'mvr\']}"\n' +
  '                      ng-click="vm.isConnected && vm.openReport(\'mvr\')">\n' +
  '                    <i class="fa fa-certificate fa-stack-2x"></i>\n' +
  '                    <span class="badge-info">\n' +
  '                        <span class="badge-info-inner fa fa-stack-1x">\n' +
  '                            <i class="fa fa-check fa-1x hidden"></i>\n' +
  '                            <span class="title">MVR</span>\n' +
  '                        </span>\n' +
  '                    </span>\n' +
  '                </span>\n' +
  '\n' +
  '                <span class="fa-stack fa-3x report-badge mgn-right"\n' +
  '                      tooltip="Background Check{{vm.isConnected ? (!!vm.driver.reports[\'bgcheck\']  ? \' - click to download\': \' - not available\') : \'\'}}"\n' +
  '                      ng-class="{\'available\': !!vm.driver.reports[\'bgcheck\']}"\n' +
  '                      ng-click="vm.isConnected && vm.openReport(\'bgcheck\')">\n' +
  '                    <i class="fa fa-certificate fa-stack-2x"></i>\n' +
  '                    <span class="badge-info">\n' +
  '                        <span class="badge-info-inner fa fa-stack-1x">\n' +
  '                        <i class="fa fa-times fa-1x hidden"></i>\n' +
  '                        <span class="title">BG</span>\n' +
  '                    </span>\n' +
  '                    </span>\n' +
  '                </span>\n' +
  '\n' +
  '                <span class="fa-stack fa-3x report-badge mgn-right"\n' +
  '                      tooltip="National Criminal{{vm.isConnected ? (!!vm.driver.reports[\'ncrim\']  ? \' - click to download\': \' - not available\') : \'\'}}"\n' +
  '                      ng-class="{\'available\': !!vm.driver.reports[\'ncrim\']}"\n' +
  '                      ng-click="vm.isConnected && vm.openReport(\'ncrim\')">\n' +
  '                    <i class="fa fa-certificate fa-stack-2x"></i>\n' +
  '                    <span class="badge-info">\n' +
  '                        <span class="badge-info-inner fa fa-stack-1x">\n' +
  '                        <i class="fa fa-question fa-1x hidden"></i>\n' +
  '                        <span class="title">N-CRIM</span>\n' +
  '                    </span>\n' +
  '                    </span>\n' +
  '                </span>\n' +
  '\n' +
  '                <span class="fa-stack fa-3x report-badge mgn-right"\n' +
  '                      tooltip="Drug Screen{{vm.isConnected ? (!!vm.driver.reports[\'drugs\'] ? \' - click to download\': \' - not available\') : \'\'}}"\n' +
  '                      ng-class="{\'available\': !!vm.driver.reports[\'drugs\']}"\n' +
  '                      ng-click="vm.isConnected && vm.openReport(\'drugs\')">\n' +
  '                    <i class="fa fa-certificate fa-stack-2x"></i>\n' +
  '                    <span class="badge-info">\n' +
  '                        <span class="badge-info-inner fa fa-stack-1x">\n' +
  '                        <i class="fa fa-question fa-1x hidden"></i>\n' +
  '                        <span class="title">DRUG</span>\n' +
  '                    </span>\n' +
  '                    </span>\n' +
  '                </span>\n' +
  '\n' +
  '\n' +
  '                </dd>\n' +
  '                <dd ng-hide="vm.isConnected">\n' +
  '                    <em class="text-muted">\n' +
  '                        <span ng-hide="vm.driver.reports.length || !!vm.driver.resume">No reports on file</span>\n' +
  '                        <span ng-show="vm.driver.reports.length || !!vm.driver.resume">You will be able to download reports once connected</span>\n' +
  '                    </em>\n' +
  '                </dd>\n' +
  '                <dd ng-show="vm.isConnected">\n' +
  '                    <em class="text-muted">\n' +
  '                        <span ng-hide="vm.driver.reports.length || !!vm.driver.resume">No reports on file</span>\n' +
  '                        <span ng-show="vm.driver.reports.length || !!vm.driver.resume">Click on available reports to view or download</span>\n' +
  '\n' +
  '                    </em>\n' +
  '                </dd>\n' +
  '\n' +
  '                <dt>Interests</dt>\n' +
  '                <dd><p>\n' +
  '                    <span ng-repeat="interest in visibleInterests = (vm.driver.interests | filter: {value: true})"\n' +
  '                          class="label label-primary mgn-right">{{interest.key}}&nbsp;</span></span>\n' +
  '\n' +
  '                    <span ng-show="!visibleInterests.length">\n' +
  '                        <span ng-show="!vm.canEdit">The applicant has not yet entered any job type preferences or interests.</span>\n' +
  '                    </span>\n' +
  '                    </p>\n' +
  '                </dd>\n' +
  '\n' +
  '                <dt ng-init="vm.expCt=4">\n' +
  '                    Experience\n' +
  '                    <br ng-show="vm.isConnected"/>\n' +
  '                    <span ng-show="vm.isConnected && vm.driver.experience.length"\n' +
  '                          ng-switch="!vm.expCt && !!vm.driver.experience.length">\n' +
  '                        <button type="button" class="btn btn-oset-link"\n' +
  '                                ng-click="vm.expCt = 0;" ng-switch-when="false">\n' +
  '                            hide\n' +
  '                        </button>\n' +
  '                        <button type="button" class="btn btn-oset-link"\n' +
  '                                ng-click="vm.expCt = 4;" ng-switch-when="true">\n' +
  '                            show\n' +
  '                        </button>\n' +
  '                    </span>\n' +
  '                </dt>\n' +
  '                <dd ng-show="vm.isConnected">\n' +
  '                    <div class="panel-body" ng-switch="!!(vm.driver.experience.length)">\n' +
  '                        <oset-experience-list ng-switch-when="true"\n' +
  '                                              list="vm.driver.experience" view-only="true" max-ct="vm.expCt">\n' +
  '\n' +
  '                        </oset-experience-list>\n' +
  '\n' +
  '                        <p class="text-center" ng-switch-default>None Added</p>\n' +
  '                    </div>\n' +
  '                </dd>\n' +
  '                <dd ng-hide="vm.isConnected"><em class="text-muted" ng-bind-html="vm.experienceText">\n' +
  '                    experience will be available once you have connected</em>\n' +
  '                </dd>\n' +
  '            </dl>\n' +
  '        </div>\n' +
  '    </div>\n' +
  '</div>\n' +
  '');
 $templateCache.put('/modules/applications/views/templates/os-list-applications.client.template.html',
  '<section name="os-list-applications.directive" class="application-list">\n' +
  '\n' +
  '    <div class="row">\n' +
  '        <div class="job-list blog-category-list" ng-switch="vm.user.type">\n' +
  '\n' +
  '            <!-- Iterate over the list of jobs ... For Owners -->\n' +
  '\n' +
  '            <article class="post col-sm-12 applicant"\n' +
  '                     ng-switch-when="owner" ng-repeat="job in vm.jobs"\n' +
  '                     ng-show="vm.visibleId === job._id || !vm.visibleId"\n' +
  '                     ng-init="job.newMessages=0;">\n' +
  '\n' +
  '                <!--INNER OWNER CONTENT-->\n' +
  '                <div class="post-inner">\n' +
  '                    <div class="content lead-content">\n' +
  '                        <div class="date-label">\n' +
  '                            <span class="month">{{(job.posted || job.created)  | amDateFormat : \'MMM\' | uppercase}}</span>\n' +
  '                            <span class="date-number">{{job.posted | amDateFormat : \'D\'}}</span>\n' +
  '                        </div>\n' +
  '                        <h3 class="post-title" ng-click="vm.showTab(job._id, \'applicants\', job.applications.length)">\n' +
  '                            {{job.name}}</h3>\n' +
  '\n' +
  '                        <!--meta-->\n' +
  '                        <div class="row">\n' +
  '                            <div class="pull-right">\n' +
  '                                <button type="button" class="btn-tab btn-link read-more strong"\n' +
  '                                        ng-click="vm.showTab()" ng-class="{\'hidden\':!vm.visibleId}">\n' +
  '                                    <i class="fa fa-close fa-lg"></i><span class="hidden-xs mgn-left">&nbsp;</span>\n' +
  '                                </button>\n' +
  '                                <button type="button" class="btn-tab btn-link read-more strong"\n' +
  '                                        ng-click="vm.showTab(job._id, \'applicants\', job.applications.length)"\n' +
  '                                        ng-class="{\'active\': vm.visibleId === job._id && vm.visibleTab === \'applicants\'}">\n' +
  '                                    <i class="fa fa-users fa-lg"></i><span class="hidden-xs mgn-left">{{job.applications.length}} Applicant{{job.applications.length === 1 ? \'\' : \'s\'}}</span>\n' +
  '                                    <i class="fa fa-comments-o fa-lg mgn-left"></i>\n' +
  '                                    <span class="badge" ng-show="!!job.newMessages"\n' +
  '                                          tooltip="{{job.newMessages}} new message{{job.newMessages>1?\'s\':\'\'}}">{{job.newMessages}}</span>\n' +
  '                                </button>\n' +
  '                                <button type="button" class="btn-tab btn-link read-more strong mgn-left"\n' +
  '                                        ng-click="vm.showTab(job._id, \'details\')"\n' +
  '                                        ng-class="{\'active\': vm.visibleId === job._id && vm.visibleTab === \'details\'}">\n' +
  '                                    <i class="fa fa-lg fa-file-text"></i><span class="hidden-xs mgn-left">View Description</span>\n' +
  '                                </button>\n' +
  '                                <button type="button" class="btn-tab btn-link read-more strong mgn-left"\n' +
  '                                        ui-sref="jobs.edit({jobId: job._id})">\n' +
  '                                    <i class="fa fa-edit fa-lg"></i><span class="hidden-xs mgn-left">Edit</span>\n' +
  '                                </button>\n' +
  '                            </div>\n' +
  '                        </div>\n' +
  '                    </div>\n' +
  '\n' +
  '                    <div class="content body">\n' +
  '                        <div class="tab-body">\n' +
  '                            <div class="post-entry" ng-show="vm.visibleTab === \'applicants\'">\n' +
  '                                <div class="row applicant_item" ng-show="vm.visibleId === job._id"\n' +
  '                                     data-ng-repeat="application in job.applications"\n' +
  '                                     data-ng-init="user = application.user; driver = user.driver;license = driver.licenses[0]; vm.checkMessages(application, job)"\n' +
  '                                     ui-sref="applications.view({\'applicationId\': application._id})"\n' +
  '                                     ng-class="{\'disabled\': application.disabled}">\n' +
  '\n' +
  '                                    <div class="col-lg-1 col-md-2 col-sm-3 col-xs-4 center-block">\n' +
  '                                        <img ng-src="{{user.profileImageURL}}"\n' +
  '                                             class="img-responsive">\n' +
  '                                    </div>\n' +
  '\n' +
  '                                    <div class="col-lg-9 col-md-10 col-sm-9 col-xs-8">\n' +
  '                                        <p>\n' +
  '                                            <span\n' +
  '                                                    class="stronger">{{user.firstName}}&nbsp;{{user.lastName.substring(0,1)}}</span>\n' +
  '                                            <br class="hidden-lg hidden-md">\n' +
  '                                            <os-application-status-badge\n' +
  '                                                    model="application"></os-application-status-badge>\n' +
  '                                        </p>\n' +
  '                                        <p>\n' +
  '\n' +
  '                                        <div class="col-md-3 col-lg-2 hidden-sm hidden-xs stronger text-right">\n' +
  '                                            License\n' +
  '                                        </div>\n' +
  '                                        <div class="col-md-9 col-lg-10 col-xs-12">\n' +
  '                                            <p style="margin-bottom: 2px;">\n' +
  '                                                <i class="fa fa-credit-card"></i> &nbsp;{{license.state.name}}\n' +
  '                                            <span ng-show="license.type">\n' +
  '                                                <span ng-if="license.rating"> Class {{license.rating | uppercase }}</span>\n' +
  '                                                {{license.type}}\n' +
  '                                            </span>\n' +
  '                                                Driver License\n' +
  '                                            </p>\n' +
  '                                        </div>\n' +
  '\n' +
  '\n' +
  '                                        <div class="col-md-3 col-lg-2 hidden-sm hidden-xs stronger text-right">\n' +
  '                                            Endorsements\n' +
  '                                        </div>\n' +
  '                                        <div class="col-md-9 col-lg-10 col-xs-12">\n' +
  '                                            <p style="margin-bottom: 2px;">\n' +
  '                                                <oset-list-endorsements\n' +
  '                                                        model="license.endorsements"></oset-list-endorsements>\n' +
  '                                            </p>\n' +
  '                                        </div>\n' +
  '\n' +
  '\n' +
  '                                        <div class="col-md-3 col-lg-2 hidden-sm hidden-xs stronger text-right">\n' +
  '                                            Interests\n' +
  '                                        </div>\n' +
  '                                        <div class="col-md-9 col-lg-10 col-xs-12">\n' +
  '                                            <p style="margin-bottom: 2px;">\n' +
  '                                        <span ng-repeat="interest in visibleInterests = (driver.interests | filter: {value: true})"\n' +
  '                                              class="label label-primary mgn-right">{{interest.key}}&nbsp;</span>\n' +
  '\n' +
  '                                        <span ng-show="!visibleInterests.length">\n' +
  '                                            <span ng-show="!vm.canEdit">none entered</span>\n' +
  '                                        </span>\n' +
  '                                            </p>\n' +
  '                                        </div>\n' +
  '\n' +
  '\n' +
  '                                        <div class="col-md-3 col-lg-2 hidden-sm hidden-xs stronger text-right"\n' +
  '                                             ng-hide="!!application.messages && !!application.messages.length">\n' +
  '                                            Messages\n' +
  '                                        </div>\n' +
  '                                        <div class="col-md-9 col-lg-10 col-xs-12"\n' +
  '                                             ng-hide="!!application.messages && !!application.messages.length">\n' +
  '                                            <span ng-show="!!application.isConnected">\n' +
  '                                                <p style="margin-bottom: 2px;">\n' +
  '                                                    discuss the job and schedule an interview\n' +
  '                                                    <a ui-sref="applications.view({applicationId: application._id, target: \'message\'})">\n' +
  '                                                        by sending a message\n' +
  '                                                    </a>\n' +
  '                                                </p>\n' +
  '                                            </span>\n' +
  '                                            <span ng-hide="!!application.isConnected">\n' +
  '                                                <p style="margin-bottom: 2px;">\n' +
  '                                                    <em class="text-muted" ng-if="user.type === \'owner\'">\n' +
  '                                                        once connected, you will be able to exchange messages with\n' +
  '                                                        the applicant\n' +
  '                                                    </em>\n' +
  '                                                    <em class="text-muted" ng-if="user.type === \'driver\'">\n' +
  '                                                        once connected, you will be able to exchange messages with\n' +
  '                                                        the employer\n' +
  '                                                    </em>\n' +
  '                                                </p>\n' +
  '                                            </span>\n' +
  '                                        </div>\n' +
  '\n' +
  '                                        </p>\n' +
  '                                    </div>\n' +
  '                                    <br class="hidden-lg"/>\n' +
  '\n' +
  '                                    <div class="col-lg-2 col-md-3 col-xs-12 text-right">\n' +
  '                                        <a class="read-more strong"\n' +
  '                                           style="white-space: nowrap"\n' +
  '                                           ui-sref="applications.view({applicationId: application._id, action: \'read\'})">\n' +
  '                                            Review&nbsp<i class="fa fa-external-link fa-lg mgn-left"></i>\n' +
  '                                        </a>\n' +
  '                                        <br class="visible-lg mgn-vert"/>\n' +
  '                                        <a class="read-more strong"\n' +
  '                                           style="white-space: nowrap"\n' +
  '                                           tooltip="{{application.messagingText || vm.messagingText}}"\n' +
  '                                           tooltip-popup-delay="1000"\n' +
  '                                           ui-sref="applications.view({applicationId: application._id, action: \'message\'})">\n' +
  '                                            {{application.newMessages ? application.newMessages + \' New \' :\n' +
  '                                            \'\'}}Message{{application.newMessages === 1 ? \'\': \'s\'}}&nbsp;<i\n' +
  '                                                class="fa fa-comments-o fa-lg mgn-left"></i>\n' +
  '                                        </a>\n' +
  '                                        <!--TODO: Change the "Reject" into a state rather than a callback-->\n' +
  '                                        <!--<br>-->\n' +
  '                                        <!--<a class="read-more align-right hidden mgn-bottom pull-right"-->\n' +
  '                                        <!--ng-click="vm.setApplicationStatus(job.applications[$index], \'rejected\', $event, this)">-->\n' +
  '                                        <!--Reject<i class="fa fa-close fa-lg mgn-left"></i>-->\n' +
  '                                        <!--</a>-->\n' +
  '                                    </div>\n' +
  '                                </div>\n' +
  '\n' +
  '\n' +
  '                                <div class="list-group" ng-if="!(job.applications && job.applications.length)"\n' +
  '                                     ng-show="vm.visibleId === job._id">\n' +
  '                                    <div class="list-group-item text-center">\n' +
  '                                        <h4>No one has applied to this job yet. Would you like to <a\n' +
  '                                                ui-sref="jobs.edit({\'jobId\':job._id})">edit\n' +
  '                                            your post?</a></h4>\n' +
  '                                    </div>\n' +
  '                                </div>\n' +
  '                            </div>\n' +
  '\n' +
  '                            <div class="post-entry col-sm-10 col-sm-offset-1" ng-show="vm.visibleTab === \'details\'">\n' +
  '\n' +
  '                                <h4>Description\n' +
  '                                </h4>\n' +
  '\n' +
  '                                <p ng-bind-html="job.description"></p>\n' +
  '                                <h4>Requirements</h4>\n' +
  '\n' +
  '                                <p ng-bind-html="job.requirements"></p>\n' +
  '                                <hr/>\n' +
  '\n' +
  '                                <button type="button" class="btn-tab btn-link read-more center-block"\n' +
  '                                        ui-sref="jobs.view({jobId: job._id})">\n' +
  '                                    view full job post\n' +
  '                                    <i class="fa fa-external-link fa-lg"></i><span class="hidden-xs mgn-left">\n' +
  '                                </span>\n' +
  '                                </button>\n' +
  '                            </div>\n' +
  '                        </div>\n' +
  '                        <a class="read-more strong pull-right" ng-click="vm.visibleId = null"\n' +
  '                           ng-class="{\'hidden\':!vm.visibleId}"> </a>\n' +
  '                    </div>\n' +
  '\n' +
  '                </div>\n' +
  '\n' +
  '                <!--//post-inner-->\n' +
  '            </article>\n' +
  '            <!--//post-->\n' +
  '\n' +
  '\n' +
  '            <!-- Iterate over the list of applications ... For Drivers -->\n' +
  '\n' +
  '            <article class="post job-post col-sm-12 applicant"\n' +
  '                     ng-switch-when="driver"\n' +
  '                     ng-repeat="application in vm.applications"\n' +
  '                     ng-init="job = application.job;  vm.checkMessages(application, job)">\n' +
  '                <!--ng-show="vm.visibleId === application._id || !vm.visibleId">-->\n' +
  '                <div class="post-inner">\n' +
  '                    <div class="content lead-content">\n' +
  '                        <img ng-src="{{application.company.profileImageURL}}"\n' +
  '                             ng-if="!!application.company.profileImageURL"\n' +
  '                             class="col-xs-hidden col-sm-2 img-responsive medium">\n' +
  '\n' +
  '                        <div ng-class="{\'col-sm-10\':!!application.company.profileImageURL, \'col-sm-12\':!application.company.profileImageURL}">\n' +
  '                            <h3 class="post-title" ui-sref="jobs.view({jobId: job._id})">{{job.name}}</h3>\n' +
  '\n' +
  '                            <div class="row"\n' +
  '                                 ng-init="user = application.user; driver = user.driver; license = driver.licenses[0]"\n' +
  '                                 ui-sref="applications.view({\'applicationId\': application._id})"\n' +
  '                                 ng-class="{\'disabled\': application.disabled}">\n' +
  '\n' +
  '                                <dl class="dl-horizontal" style="margin-bottom: 0;">\n' +
  '                                    <dt>Applied On</dt>\n' +
  '                                    <dd>{{application.created | amDateFormat : \'LL LT\'}}</dd>\n' +
  '                                    <dt>Status</dt>\n' +
  '                                    <dd>\n' +
  '                                        <os-application-status-badge\n' +
  '                                                model="application"></os-application-status-badge>\n' +
  '                                    </dd>\n' +
  '\n' +
  '                                    <dt ng-hide="!!application.messages && !!application.messages.length">\n' +
  '                                        Messages\n' +
  '                                    </dt>\n' +
  '                                    <dd ng-hide="!!application.messages && !!application.messages.length">\n' +
  '                                            <span ng-show="!!application.isConnected">\n' +
  '                                                <p style="margin-bottom: 2px;">\n' +
  '                                                    discuss the job and schedule an interview\n' +
  '                                                    <a ui-sref="applications.view({applicationId: application._id, target: \'message\'})">\n' +
  '                                                        by sending a message\n' +
  '                                                    </a>\n' +
  '                                                </p>\n' +
  '                                            </span>\n' +
  '                                            <span ng-hide="!!application.isConnected">\n' +
  '                                                <p style="margin-bottom: 2px;">\n' +
  '                                                    <em class="text-muted">chat available once connected</em></span>\n' +
  '                                        </p>\n' +
  '                                        </span>\n' +
  '                                    </dd>\n' +
  '                                </dl>\n' +
  '\n' +
  '                            </div>\n' +
  '                        </div>\n' +
  '                    </div>\n' +
  '\n' +
  '                    <div class="content body">\n' +
  '                        <!--meta-->\n' +
  '                        <div class="row">\n' +
  '                            <div class="pull-right">\n' +
  '                                <button type="button" class="btn-tab btn-link read-more strong"\n' +
  '                                        ng-click="vm.showTab()" ng-class="{\'hidden\':!vm.visibleId}">\n' +
  '                                    <i class="fa fa-close fa-lg mgn-right"></i>\n' +
  '                                </button>\n' +
  '                                <button type="button" class="btn-tab btn-link read-more strong"\n' +
  '                                        ng-click="vm.showTab(application._id, \'application\')"\n' +
  '                                        ng-class="{\'active\': vm.visibleId === job._id && vm.visibleTab === \'application\'}">\n' +
  '                                    <i class="fa fa-lg fa-file-text mgn-right"></i> Your Application\n' +
  '                                </button>\n' +
  '                                <button type="button" class="btn-tab btn-link read-more strong mgn-left"\n' +
  '                                        ng-click="vm.showTab(application._id, \'details\')"\n' +
  '                                        ng-class="{\'active\': vm.visibleId === job._id && vm.visibleTab === \'details\'}">\n' +
  '                                    <i class="fa fa-lg fa-info mgn-right"></i> Job Description\n' +
  '                                </button>\n' +
  '                                <button type="button" class="btn-tab btn-link read-more strong mgn-left"\n' +
  '                                        ng-show="application.isConnected || !!application.messages.length"\n' +
  '                                        tooltip="{{application.messagingText || vm.messagingText}}"\n' +
  '                                        tooltip-popup-delay="1000"\n' +
  '                                        ui-sref="applications.view({applicationId: application._id})">\n' +
  '                                    {{application.newMessages ? application.newMessages + \' New \' :\n' +
  '                                    \'\'}}Message{{application.newMessages === 1 ? \'\': \'s\'}}&nbsp;<i\n' +
  '                                        class="fa fa-comments-o fa-lg mgn-left"></i>\n' +
  '                                </button>\n' +
  '                            </div>\n' +
  '                        </div>\n' +
  '                    </div>\n' +
  '\n' +
  '                    <div class="content body">\n' +
  '                        <div class="row  tab-body" ng-show="vm.visibleId === application._id">\n' +
  '                            <div class="post-entry col-sm-10 col-sm-offset-1" ng-show="vm.visibleTab === \'application\'">\n' +
  '                                <div class="post-entry col-sm-10 col-sm-offset-1">\n' +
  '                                    <dt>Intro</dt>\n' +
  '                                    <dd ng-bind-html="application.introduction"></dd>\n' +
  '                                </div>\n' +
  '                            </div>\n' +
  '\n' +
  '                            <div class="post-entry col-sm-10 col-sm-offset-1" ng-show="vm.visibleTab === \'details\'">\n' +
  '                                <h4>Description</h4>\n' +
  '\n' +
  '                                <p ng-bind-html="job.description"></p>\n' +
  '                                <h4>Requirements</h4>\n' +
  '\n' +
  '                                <p ng-bind-html="job.requirements"></p>\n' +
  '                            </div>\n' +
  '                        </div>\n' +
  '                        <a class="read-more strong pull-right" ng-click="vm.visibleId = null"\n' +
  '                           ng-class="{\'hidden\':!vm.visibleId}"> </a>\n' +
  '                    </div>\n' +
  '\n' +
  '\n' +
  '                    <!--//content-->\n' +
  '                </div>\n' +
  '                <!--//post-inner-->\n' +
  '            </article>\n' +
  '        </div>\n' +
  '    </div>\n' +
  '</section>\n' +
  '');
 $templateCache.put('/modules/bgchecks/views/bgcheck-summary.client.template.html',
  '<section class="pricing">\n' +
  '    <div class="item price text-center" ng-click="vm.viewReports()">\n' +
  '        <div class="item-inner">\n' +
  '            <div class="heading text-center">\n' +
  '                <h3>Enhance Your Profile!</h3>\n' +
  '\n' +
  '                <div class="row item-content center-block">\n' +
  '                    <div class="col-xs-12">\n' +
  '                        <span class="fa-stack fa-3x">\n' +
  '                            <i class="fa fa-certificate fa-stack-2x text-primary"></i>\n' +
  '                            <i class="fa fa-check fa-stack-1x text-success"></i>\n' +
  '                        </span>\n' +
  '                    </div>\n' +
  '\n' +
  '                </div>\n' +
  '            </div>\n' +
  '            <div class="item-content">\n' +
  '                <ul class="list-unstyled feature-list">\n' +
  '                    <li><i class="fa fa-check"></i>Motor Vehicle Report</li>\n' +
  '                    <li><i class="fa fa-check"></i>National &amp; County Background Check</li>\n' +
  '                    <li><i class="fa fa-check"></i>Drug Test</li>\n' +
  '                    <li><a class="btn btn-block btn-cta-secondary" ng-sref="reviewReports">Get Reports!</a>\n' +
  '                    </li>\n' +
  '                </ul>\n' +
  '\n' +
  '            </div>\n' +
  '            <!--//item-content-->\n' +
  '        </div>\n' +
  '        <!--//item-inner-->\n' +
  '    </div>\n' +
  '</section>\n' +
  '');
 $templateCache.put('/modules/chat/views/chat-console.client.template.html',
  '<div class="row chat-window" ng-show="vm.activeConnection">\n' +
  '    <div class="col-sm-12">\n' +
  '        <h4>Messages\n' +
  '            <small class="pull-right">\n' +
  '                <em>\n' +
  '                    <strong>Connection Status</strong>\n' +
  '                    Me:\n' +
  '                    <div class="label label-{{vm.status.me ? \'success\' : vm.status.me === null ? \'default\' : \'warning\'}}">\n' +
  '                        &nbsp;</div>\n' +
  '                    Them:\n' +
  '                    <div class="label label-{{vm.status.them ? \'success\' : vm.status.them === null ? \'default\' : \'warning\'}}">\n' +
  '                        &nbsp;</div>\n' +
  '                </em>\n' +
  '            </small>\n' +
  '        </h4>\n' +
  '\n' +
  '\n' +
  '        <div class="chat-section"\n' +
  '             scroll-bottom="vm.messages">\n' +
  '            <div ng-repeat="message in vm.messages | filter : {type: \'!status\'}"\n' +
  '                 ng-init="message.username = message.username || message.sender.username"\n' +
  '                 ng-class="{\'last\':!!$last,\'first\':!!$first}" class="{{vm.getSenderClass(message.username)}}">\n' +
  '\n' +
  '                <div class="separator row">\n' +
  '                    <div class="col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2"></div>\n' +
  '                </div>\n' +
  '\n' +
  '                <div class="row chat-box">\n' +
  '                    <div class="col-md-8 col-md-offset-2 col-sm-10 col-sm-offset-1 col-xs-12">\n' +
  '                        <img class="profile-image medium"\n' +
  '                             ng-src="{{message.profileImageURL || message.sender.profileImageURL}}">\n' +
  '\n' +
  '\n' +
  '                        <div class="chat-details">\n' +
  '                            <div class="row">\n' +
  '                                <div class="col-sm-12">\n' +
  '                                    <blockquote><p ng-bind-html="message.text"></p></blockquote>\n' +
  '                                </div>\n' +
  '                            </div>\n' +
  '                            <div class="row ts">\n' +
  '                                <div class="col-sm-12">\n' +
  '                                    <span class="timestamp smaller">{{message.created | date: \'short\' }}</span>\n' +
  '                                </div>\n' +
  '                            </div>\n' +
  '                        </div>\n' +
  '                    </div>\n' +
  '                </div>\n' +
  '            </div>\n' +
  '\n' +
  '        </div>\n' +
  '        <div class="chat-entry" id="messaging">\n' +
  '            <div class="row mgn-vert">\n' +
  '                <div class="col-md-8 col-md-offset-2">\n' +
  '                    <input type="text" ng-show="vm.messageMode === \'text\'"\n' +
  '                           data-ng-model="vm.message" class="form-control "\n' +
  '                           placeholder="new message ..."/>\n' +
  '\n' +
  '                    <textarea type="text" ng-show="vm.messageMode === \'multiline\'" rows="3"\n' +
  '                              data-ng-model="vm.message" class="form-control"\n' +
  '                              placeholder="new message..." modal-focus="vm.msgFocus"></textarea>\n' +
  '\n' +
  '                    <div ng-show="vm.messageMode === \'html\'">\n' +
  '                        <textarea os-html-edit minimal class="editor-min" data-ng-model="vm.message"></textarea>\n' +
  '                    </div>\n' +
  '                </div>\n' +
  '            </div>\n' +
  '            <div class="row mgn-vert no-mgn-sides">\n' +
  '                <div class="col-xs-12 col-sm-8 col-md-6 col-md-offset-2">\n' +
  '                    <span data-ng-show="vm.error" class="text-danger text-center">\n' +
  '                        <strong data-ng-bind="vm.error"></strong>\n' +
  '                    </span>\n' +
  '                </div>\n' +
  '                <div class="col-xs-10 col-xs-offset-1 col-sm-4 col-sm-offset-0 col-md-2">\n' +
  '                    <!--<div class="btn-group" dropdown>-->\n' +
  '                    <button type="button" class="btn btn-oset-primary btn-block" value="send"\n' +
  '                            ng-click="vm.postMessage();"\n' +
  '                            ng-class="{\'disabled\':(vm.sending || !vm.message)}">Send\n' +
  '                    </button>\n' +
  '                </div>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '    </div>\n' +
  '</div>\n' +
  '');
 $templateCache.put('/modules/companies/views/templates/company-list.client.template.html',
  '<section ng-init="findByUser(profile)" data-ng-controller="CompaniesController">\n' +
  '    <h1>TODO: Determine if needed</h1>\n' +
  '\n' +
  '    <span class="col-md-12 opaque-bg">\n' +
  '        <legend>Company Profile?????????</legend>\n' +
  '        <div class="list-group">\n' +
  '            <a data-ng-repeat="company in companies" data-ng-href="companies/{{company._id}}" class="list-group-item">\n' +
  '                <div class="row">\n' +
  '                    <div class="col-md-8">\n' +
  '                        <h4 class="list-group-item-heading">{{company.name}}\n' +
  '                        </h4>\n' +
  '                    </div>\n' +
  '                    <div class="col-md-4">\n' +
  '                        <small class="list-group-item-text">\n' +
  '                            <p class="text-right">Added on\n' +
  '                                <span data-ng-bind="company.created | date:\'shortDate\'"></span>\n' +
  '    </p>\n' +
  '    </small>\n' +
  '    </div>\n' +
  '    </div>\n' +
  '\n' +
  '    <div class="row">\n' +
  '        <div class="col-md-8 opaque-bg" data-ng-bind-html="company.about"></div>\n' +
  '        <div class="col-md-4">\n' +
  '            <label>Location:\n' +
  '                <strong>{{company.zipCode}}</strong>\n' +
  '            </label>\n' +
  '        </div>\n' +
  '    </div>\n' +
  '    </a>\n' +
  '    </div>\n' +
  '    <div class="alert alert-warning text-center" data-ng-hide="!companies.$resolved || companies.length">\n' +
  '        Do you own a company? <a href="/companies/create">create a profile</a>?\n' +
  '    </div>\n' +
  '    </span>\n' +
  '</section>\n' +
  '');
 $templateCache.put('/modules/companies/views/templates/view-company.client.template.html',
  '<section name="os-company.directive">\n' +
  '    <!-- os-company directive : view-company.client.template.html -->\n' +
  '    <div ng-if="inline">\n' +
  '        <div class="row">\n' +
  '            <div class="col-md-8">\n' +
  '                <h4 class="list-group-item-heading">{{vm.company.name}}</h4>\n' +
  '            </div>\n' +
  '            <div class="col-md-4">\n' +
  '                <small class="list-group-item-text">\n' +
  '                    <p class="text-right">Added on<span data-ng-bind="vm.company.created | date:\'shortDate\'"></span></p>\n' +
  '                </small>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '\n' +
  '        <div class="row">\n' +
  '            <div class="col-md-8 opaque-bg">\n' +
  '                <span class="nowrap"\n' +
  '                      style="white-space: nowrap; overflow:hidden; text-overflow: ellipsis; display: block;">{{ vm.company.about | limitTo : 100 }}</span>\n' +
  '            </div>\n' +
  '            <div class="col-md-4">\n' +
  '                <label>Location:\n' +
  '                    <strong>{{vm.company.zipCode}}</strong>\n' +
  '                </label>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '    </div>\n' +
  '\n' +
  '    <div ng-if="!inline">\n' +
  '        <div class="panel panel-default" ng-if="!!vm.company && vm.company.about">\n' +
  '            <div class="panel-heading">\n' +
  '                <span class="h4">\n' +
  '                    About Us\n' +
  '                    <a data-ng-if="vm.canEdit"\n' +
  '                                            class="btn btn-link pull-right"\n' +
  '                                            ui-sref="companies.create({\'companyId\': vm.company._id})">\n' +
  '                        edit company profile\n' +
  '                    <i class="fa fa-pencil-square-o"></i></a>\n' +
  '                </span>\n' +
  '            </div>\n' +
  '            <div class="panel-body">\n' +
  '                <div data-ng-bind-html="vm.company.about"></div>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '        <div class="panel panel-default" ng-if="(!vm.company || !vm.company.about) && vm.createEnabled">\n' +
  '            <div class="panel-heading"><span class="h4">Please create your company profile</span></div>\n' +
  '            <div class="panel-body">\n' +
  '                <p class="text-muted">Hi {{::vm.user.firstName}},<br/>{{::vm.createText}}</p><br/>\n' +
  '\n' +
  '                <p class="text-right" ng-if="!vm.createEnabled"><img src="/modules/core/img/brand/logo-blue.png"\n' +
  '                                                                     alt="The Outset Team"/></p>\n' +
  '\n' +
  '                <div class="text-center" ng-if="vm.createEnabled">\n' +
  '                    <button type="button" class="btn btn-cta-secondary btn-lg" ng-click="vm.creEdit()">Get Started!\n' +
  '                    </button>\n' +
  '                </div>\n' +
  '\n' +
  '            </div>\n' +
  '        </div>\n' +
  '    </div>\n' +
  '    <!-- os-company directive : END -->\n' +
  '</section>\n' +
  '');
 $templateCache.put('/modules/core/views/templates/os-datepicker.client.template.html',
  '<input type="text" ng-model="vm.shadow" name="{{vm.osName}}" ng-required="vm.required"\n' +
  '       ng-model-options="{ updateOn: \'blur\' }" ui-mask="{{vm.mask}}" placeholder="{{vm.displayFormat}}"/>\n' +
  '');
 $templateCache.put('/modules/core/views/templates/os-debug-info.client.template.html',
  '<div ng-if="enabled" class="row alert alert-info" role="alert" ng-click="toggle()" ng-class="{collapsed: collapsed}">\n' +
  '    <div ng-repeat="info in debugInfo" ng-hide="collapsed">\n' +
  '        <span class="col-xs-3 col-md-2 text-right">\n' +
  '            <b>{{info.key}}:</b>\n' +
  '        </span>\n' +
  '        <span class="col-xs-9">{{info.value || "UNDEFINED"}}</span>\n' +
  '    </div>\n' +
  '    <div ng-hide="!!collapsed">\n' +
  '        <span class="col-xs-3 col-md-2 text-right"><b>View Size:</b>\n' +
  '        </span>\n' +
  '        <span class="col-xs-9 visible-xs">XS</span>\n' +
  '        <span class="col-xs-9 visible-sm">SM</span>\n' +
  '        <span class="col-xs-9 visible-md">MD</span>\n' +
  '        <span class="col-xs-9 visible-lg">LG</span>\n' +
  '    </div>\n' +
  '\n' +
  '\n' +
  '    <i class="fa fa-plus-circle" style="padding-right: 10px;" ng-show="collapsed"></i>\n' +
  '</div>\n' +
  '');
 $templateCache.put('/modules/core/views/templates/os-page-header.client.template.html',
  '<div class="row" style="height: 39px;">\n' +
  '    <h2 ng-if="!vm.level" class="title container-fluid text-center" data-ng-bind="vm.title"\n' +
  '        ng-class="{\'col-sm-8\':!!vm.pictureUrl}"></h2>\n' +
  '    <span ng-if="vm.level" class="title container-fluid text-center {{vm.level}}" data-ng-bind="vm.title"\n' +
  '          ng-class="{\'col-sm-8\':!!vm.pictureUrl}"></span>\n' +
  '</div>\n' +
  '\n' +
  '<!-- os-page-header directive : os-page-header.client.template -->\n' +
  '<div class="page-header row" data-ng-if="vm.showHeader || vm.includeTransclude" ng-class="{well : !vm.level}"\n' +
  '     ng-mouseenter="vm.hover=true" ng-mouseleave="vm.hover=false">\n' +
  '\n' +
  '    <div ng-class="{\'col-sm-8\':!!vm.pictureUrl}">\n' +
  '        <button ng-if="vm.showBackBtn" class="btn btn-oset-primary pull-left mgn-right"\n' +
  '                ng-click="vm.backBtnFn()">\n' +
  '            <i class="fa fa-arrow-left"></i>{{::vm.backBtnText || \'Back\'}}\n' +
  '        </button>\n' +
  '        <span class="h3" data-ng-bind-html="vm.subTitle" data-ng-if="vm.showHeader">&nbsp;</span>\n' +
  '        <span data-ng-if="!!vm.editSref" data-ng-show="vm.showEdit">\n' +
  '            <a class="btn btn-link" ui-sref="{{vm.editSref}}">edit\n' +
  '                <i class="fa fa-pencil-square-o"></i>\n' +
  '            </a>\n' +
  '        </span>\n' +
  '        <button ng-if="vm.btnShow && (!!vm.btnText && !!vm.btnSref)" class="btn btn-oset-primary pull-right"\n' +
  '                ui-sref="{{vm.btnSref}}">{{::vm.btnText}}\n' +
  '        </button>\n' +
  '\n' +
  '        <!-- Sub-heading -->\n' +
  '        <small ng-if="vm.includeTransclude"><br ng-if="vm.showHeader"/><em class="text-muted" ng-transclude></em></small>\n' +
  '    </div>\n' +
  '\n' +
  '    <div class="profile-floater col-sm-4 center-block" data-ng-if="!!vm.pictureUrl">\n' +
  '        <div class="center-block">\n' +
  '            <img data-ng-src="{{vm.pictureUrl}}" alt="profile picture"\n' +
  '                 class="img-thumbnail user-profile-picture img-responsive">\n' +
  '            <br data-ng-if="vm.showPicEdit"/>\n' +
  '            <a class="btn btn-link" data-ng-click="vm.editPicFn()" data-ng-if="vm.showPicEdit" ui-sref="{{vm.editPicSref || \'.\'}}">edit\n' +
  '                <i class="fa fa-pencil-square-o"></i>\n' +
  '            </a>\n' +
  '        </div>\n' +
  '    </div>\n' +
  '</div>\n' +
  '<!-- os-page-header directive : END -->\n' +
  '');
 $templateCache.put('/modules/core/views/templates/oset-categories.client.template.html',
  '<section class="category-directive">\n' +
  '    <section ng-if="vm.mode === \'edit\' || vm.mode === \'select\'">\n' +
  '    <pre ng-if="vm.debug">Categories Model: {{vm.categories}}</pre>\n' +
  '\n' +
  '        <label class="bgn btn-cta-secondary btn-md no-border oset-toggles {{vm.lblClass}}"\n' +
  '               ng-click="vm.allClicked()"\n' +
  '               ng-if="vm.mode===\'select\'"\n' +
  '               data-ng-class="{\'active\': vm.showAll}">All</label>\n' +
  '\n' +
  '    <!-- List of available Categories -->\n' +
  '    <label ng-repeat="category in vm.categories"\n' +
  '           class="btn btn-cta-secondary btn-md no-border oset-toggles {{vm.lblClass}}"\n' +
  '           ng-click="vm.toggle(category)"\n' +
  '           ng-dblclick="vm.toggle(category, true)"\n' +
  '           data-ng-class="{\'active\':category.value}">\n' +
  '        <i class="fa pull-left"></i>\n' +
  '\n' +
  '        <div class="col-xs-12">{{category.key}}</div>\n' +
  '    </label>\n' +
  '\n' +
  '    <!-- Input for "other" -->\n' +
  '    <label class="btn btn-cta-secondary oset-input btn-md oset-toggles {{vm.lblClass}}"\n' +
  '           data-ng-if="vm.mode===\'edit\'"\n' +
  '           data-ng-class="{\'active\':vm.newCategory != null}">\n' +
  '\n' +
  '        <div ng-click="vm.toggleCategory()">{{ vm.newCategory != null ? \'cancel\' : \'other ...\'}}\n' +
  '        </div>\n' +
  '        <input ng-show="vm.newCategory != null" type="text" style="display: inline;"\n' +
  '               ng-model="vm.newCategory">\n' +
  '\n' +
  '        <div style="display: inline;" ng-show="vm.newCategory !== null" ng-click="vm.addCategory()">\n' +
  '            add&nbsp;<i class="fa fa-plus"></i>\n' +
  '        </div>\n' +
  '\n' +
  '    </label>\n' +
  '    </section>\n' +
  '\n' +
  '    <section ng-if="vm.mode === \'view\'">\n' +
  '        <label ng-repeat="category in visibleCats = (vm.categories | filter: {value: true})"\n' +
  '               class="btn btn-cta-secondary btn-md no-border {{vm.lblClass}}"\n' +
  '               data-ng-class="{\'active\':category.value}">\n' +
  '            <i class="fa pull-left"></i>\n' +
  '\n' +
  '            <div class="col-xs-12">{{category.key}}</div>\n' +
  '        </label>\n' +
  '\n' +
  '        <p ng-if="!visibleCats.length" ng-transclude>\n' +
  '           </p>\n' +
  '    </section>\n' +
  '\n' +
  '</section>\n' +
  '');
 $templateCache.put('/modules/core/views/templates/privacy.template.html',
  '<section class="content-section">\n' +
  '    <h3 class="title container text-center">Outset Partners, Inc. Privacy Policy</h3>\n' +
  '\n' +
  '    <div class="content-container container text-center">\n' +
  '        <div class="content-container-inner">\n' +
  '            <div class="about">\n' +
  '                <p class="text-center">(POSTED September 5, 2014. EFFECTIVE IMMEDIATELY FOR USERS WHO JOIN WWW.JOINOUTSET.COM ON OR\n' +
  '                    AFTER\n' +
  '                    September 5, 2014 SUPERSEDES ALL PREVIOUS VERSIONS OF THE OUTSET PARTNERS, INC PRIVACY\n' +
  '                    POLICY.)</p>\n' +
  '\n' +
  '                <div class="container-fluid row">\n' +
  '\n' +
  '                    <p></p>\n' +
  '\n' +
  '                    <p>Outset Partners, Inc. ("Outset") offers various services to help its users find, coordinate, and\n' +
  '                        maintain quality transportation and driver connections. Outset\'s Privacy Policy ("Privacy\n' +
  '                        Policy")\n' +
  '                        is designed to provide a clear understanding of the information we collect and how we use it to\n' +
  '                        provide our services and give users a better experience. It applies to any users of\n' +
  '                        www.joinoutset.com and any US affiliated websites, web pages, mobile applications and mobile\n' +
  '                        websites operated by Outset (the "Site"), including those who are seeking to find a service\n' +
  '                        provider\n' +
  '                        through Outset ("Job Providers") as well as those who are looking to promote their services\n' +
  '                        through\n' +
  '                        Outset ("Drivers"), and any users of any of the various services that Outset provides through\n' +
  '                        the\n' +
  '                        Site or any other channels, including over the telephone ("Services"). For purposes of this\n' +
  '                        Agreement, the terms "Outset," "we," "us," and "our" refer to Outset Partners, Inc. "You" refers\n' +
  '                        to\n' +
  '                        you, as a visitor or user or the Site or the Services. Please note that our subsidiaries have\n' +
  '                        separate privacy policies. In addition, this Privacy Policy does not apply to third party\n' +
  '                        entities\n' +
  '                        that may use the Outset Site or Services. Such entities\' use of the Outset Site and Services are\n' +
  '                        subject to separate terms that they agreed when they registered with Outset.</p>\n' +
  '\n' +
  '                    <p>By using the Site and/or the Services, you consent to our collection, storage, use and disclosure\n' +
  '                        of\n' +
  '                        your personal information and other information as described in this Privacy Policy.</p>\n' +
  '\n' +
  '                    <p>I. [endif]Information We Collect\n' +
  '                        A. [endif]Information you provide\n' +
  '                        B. [endif]Information provided by others\n' +
  '                        C. [endif]Information you expressly authorize us to collect\n' +
  '                        D. [endif]Technical and usage information\n' +
  '                        II. [endif]How We Use Information\n' +
  '                        A. [endif]Personal Information\n' +
  '                        B. [endif]Non Personal Information\n' +
  '                        III. [endif]How We Share Information\n' +
  '                        A. [endif]Personal Information\n' +
  '                        B. [endif]Background checks\n' +
  '                        C. [endif]Non Personal Information\n' +
  '                        D. [endif]Business transactions\n' +
  '                        IV. [endif]Your Choices Regarding the Sharing of your Personal Information\n' +
  '                        V. [endif]Your Communication Choices\n' +
  '                        VI. [endif]Changing or Removing your Personal Information and Closing your Account\n' +
  '                        VII. [endif]Collection of Information from Children\n' +
  '                        VIII. [endif]How We Protect Information\n' +
  '                        IX. [endif]Links to other Websites\n' +
  '                        X. [endif]Changes to our Privacy Policy\n' +
  '                        XI. [endif]Contact Us</p>\n' +
  '\n' +
  '                    <p>Information We Collect</p>\n' +
  '\n' +
  '                    <p>We collect both "Personal Information" and "Non Personal Information" about our users. In this\n' +
  '                        policy, Personal Information is information that can be used to contact or identify you, such as\n' +
  '                        your full name and email address, and information that is linked to such information. "Non\n' +
  '                        Personal\n' +
  '                        Information" is information that cannot be used to contact or identify you and is not linked to\n' +
  '                        information that can be used to contact or identify you and includes passively collected\n' +
  '                        information\n' +
  '                        about your activities on our Site, such as usage data, to the extent that information is not\n' +
  '                        linked\n' +
  '                        to your Personal Information.</p>\n' +
  '\n' +
  '                    <p>Site Visitors can access and browse certain portions of the Site without disclosing Personal\n' +
  '                        Information, although, like most websites, we passively collect certain information from your\n' +
  '                        computer, such as your IP address and web browser user agent, when you browse the Site. Visitors\n' +
  '                        who\n' +
  '                        access and browse the Site without registering are "Site Visitors". In order to utilize some of\n' +
  '                        the\n' +
  '                        Services offered by Outset, you must register with Outset. All users who\n' +
  '\n' +
  '                        register with Outset are "Registered Users".</p>\n' +
  '\n' +
  '                    <p>Information you provide</p>\n' +
  '\n' +
  '                    <p>Regardless of whether you are a Site Visitor or a Registered User, all Personal Information that\n' +
  '                        you\n' +
  '                        provide to us when registering, posting a job, posting a profile, communicating through the\n' +
  '                        Site,\n' +
  '                        discussing service options over the phone, utilizing our mobile applications or that you\n' +
  '                        otherwise\n' +
  '                        provide on the Site or by phone, email or postal mail, will be stored by us. You represent and\n' +
  '                        warrant to us that you have the right and authority to provide us all Personal Information you\n' +
  '                        provide about yourself or others. You may provide us this Personal Information in various ways,\n' +
  '                        including:</p>\n' +
  '\n' +
  '                    <p>When registering</p>\n' +
  '\n' +
  '                    <p>When you register directly through Outset, we will collect and store the information that you\n' +
  '                        provide to us directly on our online registration forms. This may include, among other\n' +
  '                        information:</p>\n' +
  '\n' +
  '                    <p>your first and last name your email address your home address your gender your birthday your\n' +
  '                        phone\n' +
  '                        number</p>\n' +
  '\n' +
  '                    <p>Some users may have the opportunity to register with Outset by connecting through Facebook\'s\n' +
  '                        application programming interface (API). Please see Section I.B.4 below to learn about the\n' +
  '                        information we access, collect and store if you register for Outset through Facebook.</p>\n' +
  '\n' +
  '                    <p>If you register for a Service that requires you to pay a fee, Outset will also collect your\n' +
  '                        credit\n' +
  '                        card type, number, expiration date, and security code as well as your billing address for\n' +
  '                        payment\n' +
  '                        purposes and your birthday, if not previously provided.</p>\n' +
  '\n' +
  '                    <p>When posting a job</p>\n' +
  '\n' +
  '                    <p>If you are a Job Provider, we collect and store all of the additional information that you\n' +
  '                        provide\n' +
  '                        to us on your job posting or that is otherwise included in an auto-generated job posting. This\n' +
  '                        may\n' +
  '                        include, among other information:</p>\n' +
  '\n' +
  '                    <p>the type of service you are looking for, your schedule, location, hourly rate, licensing\n' +
  '                        requirements, narrative job description, requirements for a Driver (such as ability to drive,\n' +
  '                        distances to drive, and other service related notes) pictures you choose to provide\n' +
  '                        any other information you choose to include in your job posting</p>\n' +
  '\n' +
  '                    <p>When posting a profile</p>\n' +
  '\n' +
  '                    <p>If you are a Driver, we collect and store all of the additional information that you provide to\n' +
  '                        us\n' +
  '                        in your profile. This may include, among other information:</p>\n' +
  '\n' +
  '                    <p>details on the services you offer, including for example the type of service you provide, your\n' +
  '                        availability, your location, your level of education, licenses you have, languages you speak,\n' +
  '                        your\n' +
  '                        ability to drive\n' +
  '                        related services you provide pictures you choose to post your phone numbers\n' +
  '                        references, if you choose to provide them\n' +
  '                        any other information you choose to include in your profile\n' +
  '\n' +
  '                        By telephone</p>\n' +
  '\n' +
  '                    <p>Both Site Visitors and Registered Users may provide Personal Information to Outset when they\n' +
  '                        contact\n' +
  '                        Member Services or utilize certain Services Outset may offer by telephone. For example, if you\n' +
  '                        call\n' +
  '                        a Outset to discuss service options over the phone, we will collect and store all of the\n' +
  '                        Personal\n' +
  '                        Information you chose to provide to us, including but not limited to financial information,\n' +
  '                        license\n' +
  '                        information, information about the services you or your corporation needs, your contact\n' +
  '                        information,\n' +
  '                        etc. If you provide information about someone other than yourself, you represent that you have\n' +
  '                        authority to do so.</p>\n' +
  '\n' +
  '                    <p>Otherwise through the Site or by telephone, email, postal mail or chat</p>\n' +
  '\n' +
  '                    <p>Certain Registered Users may provide Personal Information on the Site through other Site features\n' +
  '                        and offerings such as our online communications, messaging, groups and payment platforms. In\n' +
  '                        some\n' +
  '                        cases, Site Visitors may have the ability to provide us Personal Information through the Site,\n' +
  '                        such\n' +
  '                        as contact information. In addition, both Registered Users and Site Visitors may choose to\n' +
  '                        provide\n' +
  '                        us additional Personal Information by phone, email, postal mail, or chat. We collect and store\n' +
  '                        all\n' +
  '                        of the Personal Information you provide us through these channels. Moreover, if you provide\n' +
  '                        information about someone other than yourself through any of these channels, you represent that\n' +
  '                        you\n' +
  '                        have authority to do so.</p>\n' +
  '\n' +
  '                    <p>Information provided by others\n' +
  '                        By Site Visitors, Registered Users and others</p>\n' +
  '\n' +
  '                    <p>Outset also captures and collects information that Site Visitors, Registered Users and others\n' +
  '                        provide about each other. For example, Drivers may invite Site Visitors, Registered Users or\n' +
  '                        others\n' +
  '                        to rate and indicate their relationship to the Driver on the Site. Additionally, certain Outset\n' +
  '                        Registered Users may post reviews about individual Drivers. In addition, certain Registered\n' +
  '                        Users\n' +
  '                        may communicate directly with each other through Outset platforms. Site Visitors, Registered\n' +
  '                        Users\n' +
  '                        and others also may provide us information about Registered Users by phone, email or postal\n' +
  '                        mail.\n' +
  '                        Outset captures and stores all information it receives from Site Visitors, Registered Users and\n' +
  '                        others about other Registered Users and Site Visitors.</p>\n' +
  '\n' +
  '                    <p>By Facebook if you connect to Outset through Facebook</p>\n' +
  '\n' +
  '                    <p>You may have the opportunity to connect to Outset through Facebook\'s API when you register for\n' +
  '                        Outset or after you have registered for Outset. If you connect to Outset through Facebook,\n' +
  '                        either\n' +
  '                        when you register or after you have registered, we will collect, store, and use in accordance\n' +
  '                        with\n' +
  '                        this Privacy Policy any and all information you agreed that Facebook could provide to Outset\n' +
  '                        through\n' +
  '                        its API. Your agreement (and our access to your information) takes place when you instruct,\n' +
  '                        accept\n' +
  '                        or allow Facebook to register you for an Outset account or otherwise connect to Outset through\n' +
  '                        Facebook. The information Outset may access, collect and store may include the following, among\n' +
  '                        other information, as allowed by you, Facebook\'s API, and your Facebook privacy settings:</p>\n' +
  '\n' +
  '                    <p>your name\n' +
  '                        your profile picture your email address your gender\n' +
  '                        your birthday\n' +
  '                        your location (i.e. city)\n' +
  '                        the names and pictures of your Facebook friends\n' +
  '\n' +
  '                        your interests and affinity networks\n' +
  '                        other information you make publicly available via Facebook</p>\n' +
  '\n' +
  '                    <p>By service providers you use in connection with our Services</p>\n' +
  '\n' +
  '                    <p>If you engage a service provider through Outset, such as a licensing agency, or a payments\n' +
  '                        processor, that service provider may provide us Personal Information about you or your\n' +
  '                        corporation\n' +
  '                        such as information relating to your transactions with them.</p>\n' +
  '\n' +
  '                    <p>By other sources</p>\n' +
  '\n' +
  '                    <p>In addition, we may obtain from other sources publicly available Personal Information, such as\n' +
  '                        demographic data, and other information to enable us to comply with regulatory requirements,\n' +
  '                        ensure\n' +
  '                        the accuracy of data, better understand your likely interests, prevent fraud, etc.</p>\n' +
  '\n' +
  '                    <p>Information you expressly authorize us to collect</p>\n' +
  '\n' +
  '                    <p>We may from time to time request permission for collect Personal Information from or about you.\n' +
  '                        For\n' +
  '                        example, if you use a Outset mobile application, we may request permission to access information\n' +
  '                        about the contacts listed in your mobile device phone book when you initiate an address book\n' +
  '                        search\n' +
  '                        for friends who have downloaded the application. We may also request permission to access and\n' +
  '                        store\n' +
  '                        your location. If you grant your permission, we will access and or store such information unless\n' +
  '                        you\n' +
  '                        subsequently opt out by adjusting the settings in your mobile device.</p>\n' +
  '\n' +
  '                    <p>Technical and usage information\n' +
  '                        Log files, IP addresses and information about your computer and mobile device</p>\n' +
  '\n' +
  '                    <p>When you visit the Site, Outset receives the internet protocol ("IP") address of your computer\n' +
  '                        (or\n' +
  '                        the proxy server you use to access the internet), your computer operating system and type of web\n' +
  '                        browser you are using. If you are using a mobile device, Outset may also receive your mobile\n' +
  '                        device\n' +
  '                        id (UDID), or another unique identifier, and mobile operating system. We may correlate this\n' +
  '                        information with other Personal Information we have about you. Additionally, when you visit the\n' +
  '                        Outset website we and any third parties we use to place ads on our Site automatically receive\n' +
  '                        the\n' +
  '                        URL of the webpage from which you came. If you click on an ad, we and any such third party may\n' +
  '                        also\n' +
  '                        receive the URL of the page you were on when you clicked the ad and the URL of the site\n' +
  '                        associated\n' +
  '                        with the ad that you clicked.</p>\n' +
  '\n' +
  '                    <p>Cookies and other technologies</p>\n' +
  '\n' +
  '                    <p>Like most websites, we and our service providers use cookies and tracking pixels to track Site\n' +
  '                        usage\n' +
  '                        and trends, evaluate the effectiveness of our ads both on and off our Site, customize your\n' +
  '                        experience on the Site and improve the quality of our Services. For example, using these\n' +
  '                        technologies we can determine, among other things, which pages of our Site you visit and which\n' +
  '                        ads\n' +
  '                        you click on. A cookie is a tiny data file that resides on your computer, mobile phone, or other\n' +
  '                        device, and allows us to recognize you when you return to the Site using the same computer (or\n' +
  '                        mobile device) and web browser. You can remove or block cookies using the settings in your\n' +
  '                        browser,\n' +
  '                        but in some cases doing so may impact your ability to use Outset. Tracking pixels do not\n' +
  '                        identify\n' +
  '                        individual users and the analysis of data obtained by tracking pixels is performed on an\n' +
  '                        aggregate\n' +
  '                        basis.</p>\n' +
  '\n' +
  '                    <p>When you visit our Site or open one of our emails, we may allow authorized third parties, such as\n' +
  '                        ad\n' +
  '                        servers, ad agencies, ad exchanges, ad technology vendors and research firms, to place or\n' +
  '                        recognize\n' +
  '                        a unique cookie, pixel, and/or similar technologies on your browser in order to provide you\n' +
  '                        relevant\n' +
  '                        Outset advertisements as you surf the Internet. These advertisements may be targeted to you\n' +
  '                        based on\n' +
  '                        information these authorized third parties know or infer about you and include in the cookies\n' +
  '                        placed\n' +
  '                        on your browser and/or information about your Internet browsing activities gathered through your\n' +
  '                        browser. If you prefer not to receive these online behavioral advertisements, you may opt-out\n' +
  '                        here.\n' +
  '                        In order for the opt-out to work, your browser must be set to accept third party cookies.\n' +
  '                        Furthermore, if you buy a new computer or mobile device, change web browsers or delete the\n' +
  '                        opt-out\n' +
  '                        cookie, you will need to perform the opt-out task again. Please note that if you opt-out you may\n' +
  '                        continue to receive Outset advertisements as you surf the Internet, including contextual ads\n' +
  '                        based\n' +
  '                        on the content on a webpage you are visiting. However, these advertisements will not be\n' +
  '                        displayed\n' +
  '                        based on information contained in, or collected by, cookies or other technologies\n' +
  '\n' +
  '                        placed on your browser when you visit our Site or open our emails.</p>\n' +
  '\n' +
  '                    <p>Social media features and widgets</p>\n' +
  '\n' +
  '                    <p>Our Site may include social media features and widgets, such as the Facebook "Like" button and\n' +
  '                        the\n' +
  '                        Facebook "Share" button. These features may collect your IP address, the URL of the page you are\n' +
  '                        visiting on our Site, and may set a cookie to enable the feature to function properly. Social\n' +
  '                        media\n' +
  '                        features and widgets are either hosted by a third party or hosted directly on our Site. Your\n' +
  '                        interactions with these features are governed by the privacy policy of the company providing\n' +
  '                        it.</p>\n' +
  '\n' +
  '                    <p>How We Use Information\n' +
  '                        Personal Information</p>\n' +
  '\n' +
  '                    <p>In general, the Personal Information we collect is used (1) to improve our Services and enhance\n' +
  '                        your\n' +
  '                        experience with Outset, (2) to enable us to provide a safer community for all of our Registered\n' +
  '                        Users, and (3) to help us communicate with you. For example, we may use your Personal\n' +
  '                        Information\n' +
  '                        to:</p>\n' +
  '\n' +
  '                    <p>register and service your account.\n' +
  '                        include in Job Provider job postings and Driver profiles.\n' +
  '                        contact you in response to questions and solicit feedback and input from you.\n' +
  '                        enable Job Providers and Drivers to search based on the Personal Information the other has made\n' +
  '                        available on the Site, and the information others have provided about them.\n' +
  '                        connect Job Providers with Drivers that appear to meet their needs and preferences.\n' +
  '                        enable Registered Users to search for, find, interact, connect and share information with other\n' +
  '                        Registered Users they may have an interest in interacting with.\n' +
  '                        enable Registered Users who connect to Outset through Facebook to see which of their Facebook\n' +
  '                        friends who have connected to Outset through Facebook are Registered Users or friends with other\n' +
  '                        Registered Users who have connected to Outset through Facebook.\n' +
  '                        verify information you provide us as well as the representations and warranties you make to us\n' +
  '                        in\n' +
  '                        the Terms of Use or on the Site.\n' +
  '                        otherwise help protect the safety and integrity of the Site and Outset users.\n' +
  '                        target promotional messages or content on the Site, via email or other ads on Outset or third\n' +
  '                        party\n' +
  '                        sites.\n' +
  '                        Non Personal Information</p>\n' +
  '\n' +
  '                    <p>In general, we use the Non Personal Information we collect to help us improve our Services and\n' +
  '                        customize the user experience, such as by providing targeted useful features and promotions\n' +
  '                        based on\n' +
  '                        the type of Service you seek. We also aggregate the information collected via cookies and\n' +
  '                        similar\n' +
  '                        technologies to use in statistical analysis to help us track trends, evaluate the effectiveness\n' +
  '                        of\n' +
  '                        our ads and analyze patterns in the use of Outset.</p>\n' +
  '\n' +
  '                    <p>How We Share Information</p>\n' +
  '\n' +
  '                    <p>In addition to using the information collected by Outset for the purposes described above, we may\n' +
  '                        also share your information with various third parties, as described below. Please review our\n' +
  '                        sharing policy closely, especially with respect to your Personal Information. By using our Site\n' +
  '                        or\n' +
  '                        our Services, you agree to allow us to share the Personal Information you provide to us in the\n' +
  '                        ways\n' +
  '                        described below. Your ability to make changes to what information is shared is described below\n' +
  '                        in\n' +
  '                        Section IV.</p>\n' +
  '\n' +
  '                    <p>Personal Information\n' +
  '                        With All Site Visitors and Registered Users</p>\n' +
  '\n' +
  '                    <p>If you are a Job Provider or a Driver, in order to increase your chances of finding a job or\n' +
  '                        finding\n' +
  '                        the services you need, we share with Site Visitors and Registered Users the information that is\n' +
  '                        included in your job posting or profile, aside from your contact information, as well as the\n' +
  '                        following registration information, which we may include in your job posting or profile: your\n' +
  '                        first\n' +
  '                        name, first initial of your last name, city, state, profile picture, licensing details,\n' +
  '                        background\n' +
  '                        check and MVR details and if you are a Driver, unless you opt-out, your age. With certain\n' +
  '                        exceptions, you choose how much detail you want to include in either your job posting or your\n' +
  '                        profile; the more information you share, however, the better\n' +
  '\n' +
  '                        chance you have of finding either drivers or a job. We may also share on your profile or job\n' +
  '                        posting\n' +
  '                        any company reviews you have posted on our Site and whether you have connected to Outset through\n' +
  '                        Facebook. If you are a Driver and have elected to verify certain information with Outset or to\n' +
  '                        have\n' +
  '                        a background check or MVR performed, we may also disclose that information in your profile in\n' +
  '                        addition to any payment or payroll preferences you have indicated.</p>\n' +
  '\n' +
  '                    <p>If you post information in an Outset online group forum, that information may be viewed by any\n' +
  '                        Site\n' +
  '                        Visitor or Registered User who accesses the forum.</p>\n' +
  '\n' +
  '                    <p>We may display personal testimonials of Registered Users and other endorsements on our Site or in\n' +
  '                        other marking materials. These testimonials or endorsements may include Non Personal Information\n' +
  '                        such as the Registered User\'s first name, first initial of last name, town and state. With a\n' +
  '                        Registered User\'s consent, we may include Personal Information such as their full name.</p>\n' +
  '\n' +
  '                    <p>With other Registered Users and corporate providers</p>\n' +
  '\n' +
  '                    <p>In addition to the information that is provided to all visitors to Outset, Driver reviews and\n' +
  '                        references are made available to certain Registered Users. If you are a Driver, your phone\n' +
  '                        number\n' +
  '                        and other contact information may be visible to certain Registered Users if you elect to share\n' +
  '                        it in\n' +
  '                        your profile.</p>\n' +
  '\n' +
  '                    <p>If you are a Job Provider or a Driver, you will appear in search result listings if you match the\n' +
  '                        search criteria used by a Driver or Job Provider, as applicable. Similarly, you may appear in\n' +
  '                        emails\n' +
  '                        sent to Drivers or Job Providers in your area. Job Providers may opt-out of being included in\n' +
  '                        Driver\n' +
  '                        search results and in certain emails sent to Drivers.</p>\n' +
  '\n' +
  '                    <p>If you connect to Outset through Facebook, we may allow any of your Facebook friends who have\n' +
  '                        connected to Outset through Facebook to see that you are a Registered User. In addition, other\n' +
  '                        Registered Users who have connected to Outset through Facebook will be able to see if you are\n' +
  '                        friends with any of their Facebook friends or if you share certain affinities or interests with\n' +
  '                        them.</p>\n' +
  '\n' +
  '                    <p>If we terminate your registration for any reason, we reserve the right to send a notice of your\n' +
  '                        termination to other Registered Users with whom we believe you have corresponded.</p>\n' +
  '\n' +
  '                    <p>With vendors/service providers</p>\n' +
  '\n' +
  '                    <p>We also share Personal Information with vendors who perform services on behalf of Outset,\n' +
  '                        including\n' +
  '                        without limitation vendors who provide email services, demographic information, or geo-location\n' +
  '                        information, vendors who perform background checks (including MVR�s and other verification\n' +
  '                        checks),\n' +
  '                        vendors who process credit card payments, vendors who run classified advertising businesses, and\n' +
  '                        vendors who send SMS messages to Registered Users\' mobile phone numbers, in each case to the\n' +
  '                        extent\n' +
  '                        applicable. Outset has selected vendors who maintain high standards with respect to privacy and\n' +
  '                        agree to use the Personal Information only to perform specific services on behalf of Outset.</p>\n' +
  '\n' +
  '                    <p>With listings in Google and other public search engines</p>\n' +
  '\n' +
  '                    <p>In an effort to further facilitate the ability for Job Providers or Drivers to find a drivers or\n' +
  '                        job, selected information contained in Job Provider job postings and Driver profiles, which may\n' +
  '                        include photo, first name, first initial of last name, city, state, and job/provider\n' +
  '                        description,\n' +
  '                        may also be shared with third party search engines, job boards, job sites, trade publications,\n' +
  '                        newspapers, broadcast media organizations and other vendors who run classified advertising\n' +
  '                        businesses, and thus may be listed in third party web site search results (e.g., Google,\n' +
  '                        Craigslist,\n' +
  '                        Indeed, etc.), which would make that information available to the public and allow them to link\n' +
  '                        to\n' +
  '                        your Outset posting.</p>\n' +
  '\n' +
  '                    <p>\n' +
  '                        With Facebook if you connect to Outset through Facebook</p>\n' +
  '\n' +
  '                    <p>If you connect to Outset through Facebook\'s API, you may elect to post certain of your activities\n' +
  '                        on\n' +
  '                        Outset back to your Facebook account. You will be prompted to decide whether or not to share\n' +
  '                        those\n' +
  '                        Outset activities back to your\n' +
  '\n' +
  '                        Facebook account.</p>\n' +
  '\n' +
  '                    <p>As required by law or for reasons of safety</p>\n' +
  '\n' +
  '                    <p>You acknowledge and agree that we may disclose information we\'ve collected about you if required\n' +
  '                        to\n' +
  '                        do so by law or if we, in our sole discretion, believe that disclosure is reasonable to comply\n' +
  '                        with\n' +
  '                        the law, requests or orders from law enforcement, or any legal process (whether or not such\n' +
  '                        disclosure is required by applicable law), or to protect or defend Outset\'s, or a third party\'s,\n' +
  '                        rights or property. We may also reserve the right to disclose information we\'ve collected about\n' +
  '                        you\n' +
  '                        for purposes of protecting the health and safety of our community and Registered Users, such as\n' +
  '                        in\n' +
  '                        the case of risk of harm or violence against any person (including you).</p>\n' +
  '\n' +
  '                    <p>With our affiliates</p>\n' +
  '\n' +
  '                    <p>You acknowledge and agree that to the maximum extent permitted by law we may disclose any of the\n' +
  '                        information we\'ve collected about you to any of our affiliates or subsidiaries, for the purposes\n' +
  '                        of\n' +
  '                        providing you with the Services, operating the Site, and our other commercial purposes.</p>\n' +
  '\n' +
  '                    <p>With Your Consent</p>\n' +
  '\n' +
  '                    <p>We also may share your Personal Information with a third party if you consent to the sharing.</p>\n' +
  '\n' +
  '                    <p>Background checks</p>\n' +
  '\n' +
  '                    <p>If you request us to do so, Outset can provide background check services on you which are\n' +
  '                        prepared\n' +
  '                        by a consumer reporting agency. If you request and order a Background Check (including a Motor\n' +
  '                        Vehicle Record Report) to be run on you in response to a request by a Job Provider who is\n' +
  '                        considering hiring you, we will forward the report to you. It is your decision and\n' +
  '                        responsibility to\n' +
  '                        authorize the background check to be forwarded to the prospective Job Provider, if you wish to\n' +
  '                        do\n' +
  '                        so. Please be aware that Outset will also view the background check report and Outset may\n' +
  '                        suspend or\n' +
  '                        terminate your account with Outset, based on information contained in that report. The\n' +
  '                        information\n' +
  '                        and results of a Background Check (including the Motor Vehicle Records Report) that resulted in\n' +
  '                        Outset suspending or terminating your account will not be shared with other parties including\n' +
  '                        Site\n' +
  '                        Visitor�s and Registered User�s unless you specifically request us to do so. If you have\n' +
  '                        requested\n' +
  '                        a background check through Outset, a statement may be included in your profile to confirm that\n' +
  '                        you\n' +
  '                        have completed that background check. The consumer reporting agency who completes the background\n' +
  '                        check may send the results to you by email or postal mail. You acknowledge that sensitive\n' +
  '                        material\n' +
  '                        may be included in your background check, and that you are responsible for providing us and our\n' +
  '                        service provider (if applicable) with correct mailing information.</p>\n' +
  '\n' +
  '                    <p>Non Personal Information</p>\n' +
  '\n' +
  '                    <p>This Privacy Policy does not limit our use or disclosure of any Non Personal Information, such as\n' +
  '                        information passively collected from your computer via cookies, web beacons, or standard logging\n' +
  '                        of\n' +
  '                        website activity. If you do not wish to share this information with Outset, then you should take\n' +
  '                        steps to limit the passive collection of data about your activities on our site, for example, by\n' +
  '                        changing your browser settings to disable cookies. We reserve the right to use and disclose such\n' +
  '                        Non\n' +
  '                        Personal Information, as well as any other Non Personal Information we collect, with our\n' +
  '                        advertisers\n' +
  '                        and other third parties at our discretion.</p>\n' +
  '\n' +
  '                    <p>Business transactions</p>\n' +
  '\n' +
  '                    <p>In the event we go through a business transition such as a merger, acquisition by another\n' +
  '                        company,\n' +
  '                        or sale of all or a portion of our assets, your Personal Information may be among the assets\n' +
  '                        transferred. You acknowledge and consent that such transfers may occur and are permitted by this\n' +
  '                        Privacy Policy, and that any acquirer of ours or that acquirer\'s affiliates may continue to\n' +
  '                        process\n' +
  '                        your Personal Information as set forth in this Privacy Policy.</p>\n' +
  '\n' +
  '                    <p>Your Choices Regarding the Sharing of your Personal Information</p>\n' +
  '\n' +
  '                    <p>Registered Users have control over what optional Personal Information they choose to share with\n' +
  '                        us\n' +
  '                        when utilizing\n' +
  '\n' +
  '                        our Services (such as pictures, certain details in a job description or profile, etc.).</p>\n' +
  '\n' +
  '                    <p>In addition, Registered Users have the following opt out choices with respect to the sharing of\n' +
  '                        their Personal Information:</p>\n' +
  '\n' +
  '                    <p>Registered Users who have connected to Outset through Facebook may subsequently opt out of having\n' +
  '                        certain of their Facebook information shared with Outset and certain of their Outset information\n' +
  '                        shared with Facebook by disabling Facebook Connect in their account settings.\n' +
  '                        If a Driver has chosen to have their phone number made available to other Registered Users but\n' +
  '                        later\n' +
  '                        decides they no longer wish to make it available, they may change their election.\n' +
  '                        Drivers can opt out of having their age visible to Registered Users.\n' +
  '                        Job Providers can opt out of appearing in Driver search results and in certain Driver emails by\n' +
  '                        adjusting their account settings to not allow Drivers to initiate contact with them.\n' +
  '                        Users of an Outset mobile application, who have given Outset permission to access certain\n' +
  '                        information from their mobile device such as their location, may subsequently opt out of that\n' +
  '                        information sharing by adjusting the settings in their mobile device.</p>\n' +
  '\n' +
  '                    <p>Except as otherwise provided above, you may adjust your account settings to opt out of any of the\n' +
  '                        above information sharing that is applicable to your account. Your opt out preferences will take\n' +
  '                        effect within 10 days of receipt of your request.</p>\n' +
  '\n' +
  '                    <p>Your Communication Choices</p>\n' +
  '\n' +
  '                    <p>By becoming a Outset Registered User, you are consenting to receive certain email communications\n' +
  '                        from us, such as special offers, tips and advice, notifications of new Job Providers or Drivers\n' +
  '                        in\n' +
  '                        your area, customer surveys and administrative notices.</p>\n' +
  '\n' +
  '                    <p>You have a choice at any time to stop us from sending you emails for marketing purposes by\n' +
  '                        adjusting\n' +
  '                        your settings in your account settings. You also have the option to opt out of receiving certain\n' +
  '                        other emails from Outset, such as certain educational emails, by adjusting your settings in your\n' +
  '                        account settings. Go to your account settings for a complete list of the email types you may opt\n' +
  '                        out\n' +
  '                        of receiving. If you receive promotional or other email communications from us that you have the\n' +
  '                        option to opt out of, you also will be able to opt out of receiving further communications of\n' +
  '                        that\n' +
  '                        type by following the unsubscribe instructions provided in the e-mail. Please note that despite\n' +
  '                        any\n' +
  '                        indicated email marketing preferences, we may send you administrative emails regarding Outset,\n' +
  '                        including, for example, notices of updates to our Privacy Policy, notifications of new Job\n' +
  '                        Providers\n' +
  '                        or Drivers in your area, responses to job postings from Drivers, and responses to job\n' +
  '                        applications\n' +
  '                        from Drivers, if we choose to provide such notices to you in this manner.</p>\n' +
  '\n' +
  '                    <p>If you are a Job Provider, certain Drivers may initiate contact with you directly using the\n' +
  '                        messaging features of the Outset Site. You have an option at any time to stop permitting Drivers\n' +
  '                        from initiating contact with you by adjusting your settings in your account settings.</p>\n' +
  '\n' +
  '                    <p>Changing or Removing your Personal Information and Closing your Account</p>\n' +
  '\n' +
  '                    <p>If the Personal Information you provided when you registered changes, you may update this\n' +
  '                        information by logging into your account and accessing your account settings. If you would like\n' +
  '                        to\n' +
  '                        remove some of the Personal Information you have posted on the Site, such as information you\n' +
  '                        posted\n' +
  '                        in profiles and job postings, you may do so by editing or deleting that item in your Profile &\n' +
  '                        Settings sections or your Jobs section. To request removal of other Personal Information you\n' +
  '                        have\n' +
  '                        voluntarily posted on our Site, such as information you may have posted in online group forums,\n' +
  '                        contact support@joinoutset.com In some cases, we may not be able to reasonably accommodate your\n' +
  '                        request to remove your Personal Information, in which case we will let you know if we are unable\n' +
  '                        to\n' +
  '                        do so and why.</p>\n' +
  '\n' +
  '                    <p>If you no longer wish to participate in our Services you may close your account directly in the\n' +
  '                        account settings portion of your account.</p>\n' +
  '\n' +
  '                    <p>If you close your Outset account, we will remove your name and other Personal Information from\n' +
  '                        our\n' +
  '                        publicly viewable database. If you close your account, we have no obligation to retain your\n' +
  '                        information, and may delete any or all of your account information without liability. However,\n' +
  '                        we\n' +
  '                        may retain information related to you if we believe it may\n' +
  '\n' +
  '                        be necessary to prevent fraud or future abuse, or for legitimate business purposes, such as\n' +
  '                        analysis\n' +
  '                        of aggregated, Non Personal Information, account recovery, auditing our records, enforcing our\n' +
  '                        rights and obligations under our agreements or if required by law. Outset may also retain and\n' +
  '                        use\n' +
  '                        your information if necessary to provide the Services to other Registered Users. For example,\n' +
  '                        just\n' +
  '                        as an email you may send to another person through an email service provider resides in that\n' +
  '                        person\'s inbox even after you delete it from your sent files or close your account, emails you\n' +
  '                        send\n' +
  '                        to others through Outset to other Users, as well as your contributions to Outset groups, may\n' +
  '                        remain\n' +
  '                        visible to others after you have closed your account. Similarly, other information you have\n' +
  '                        shared\n' +
  '                        with others, or that others have copied, may also remain visible. Outset disclaims any liability\n' +
  '                        in\n' +
  '                        relation to the deletion or retention (subject to the terms herein) of information or any\n' +
  '                        obligation\n' +
  '                        not to delete the information. Outset does not control when search engines update their search\n' +
  '                        index\n' +
  '                        or cache, which may contain certain job post, profile or other information that has since been\n' +
  '                        removed from Outset\'s Site.</p>\n' +
  '\n' +
  '                    <p>Collection of Information from Children</p>\n' +
  '\n' +
  '                    <p>Outset\'s Site and Services are not intended for individuals under the age of 18. Accordingly,\n' +
  '                        Outset\n' +
  '                        does not knowingly collect, either online or offline, personal information from individuals\n' +
  '                        under\n' +
  '                        the age of 18.</p>\n' +
  '\n' +
  '                    <p>How We Protect Information</p>\n' +
  '\n' +
  '                    <p>We have implemented industry-recognized safeguards to help protect your information from\n' +
  '                        unauthorized access. These safeguards include:</p>\n' +
  '\n' +
  '                    <p>Outset uses SSL (Secure Socket Layer), the industry standard method for computers to communicate\n' +
  '                        securely without risk of manipulation or recipient impersonation. We utilize SSL in the online\n' +
  '                        registration process, in the login process, and in the account management section of the Site.\n' +
  '                        Outset uses strong encryption technology to protect sensitive information.\n' +
  '                        Outset employs firewalls, intrusion detection systems, and system monitoring to protect against\n' +
  '                        unauthorized access of our systems.</p>\n' +
  '\n' +
  '                    <p>Your user accounts are also protected by the password you use to access your online account with\n' +
  '                        Outset, and we urge you to take steps to keep your password safe. If you feel your password has\n' +
  '                        been\n' +
  '                        compromised, you should change it immediately by logging into your account and visiting the\n' +
  '                        "Settings" section. After you have finished using our Site, you should log out of your Outset\n' +
  '                        account and exit your browser.</p>\n' +
  '\n' +
  '                    <p>WE TAKE THESE PRECAUTIONS IN AN EFFORT TO PROTECT YOUR INFORMATION AGAINST SECURITY BREACHES.\n' +
  '                        HOWEVER, THIS IS NOT A GUARANTEE THAT SUCH INFORMATION MAY NOT BE ACCESSED, DISCLOSED, ALTERED,\n' +
  '                        OR\n' +
  '                        DESTROYED BY BREACH OF SUCH FIREWALLS AND SECURE SERVER SOFTWARE. BY USING OUR SITE, YOU\n' +
  '                        ACKNOWLEDGE\n' +
  '                        THAT YOU UNDERSTAND AND AGREE TO ASSUME THESE RISKS.</p>\n' +
  '\n' +
  '                    <p>Links to Other Websites</p>\n' +
  '\n' +
  '                    <p>Outset may provide links to other web sites that we believe may be of interest to our users.\n' +
  '                        However, we are not responsible for the privacy practices employed by those web sites, nor are\n' +
  '                        we\n' +
  '                        responsible for the information or content they contain. This Privacy Policy applies solely to\n' +
  '                        information collected by us through Outset; thus when you use a link to go from our web site to\n' +
  '                        another third party web site, this policy is no longer in effect. We encourage our users to read\n' +
  '                        the\n' +
  '                        privacy policies of these other web sites before proceeding to use them.</p>\n' +
  '\n' +
  '                    <p>Changes to Our Privacy Policy</p>\n' +
  '\n' +
  '                    <p>Outset reserves the right to change this Privacy policy and our Terms of Service at any time. We\n' +
  '                        will notify you about significant changes in the way we treat Personal Information by sending a\n' +
  '                        notice to the email address registered in your account, or by placing a prominent notice on our\n' +
  '                        Site, so that you can choose whether to continue using our Services. Significant changes will go\n' +
  '                        into effect 30 days after we notify. Non-material changes or clarifications will take effect\n' +
  '                        immediately upon posting of the updated policy on our Site. You should\n' +
  '                        periodically\n' +
  '                        check www.joinoutset/privacy for updates. Your use of the Site or the Services after such\n' +
  '                        effective\n' +
  '                        date will constitute acceptance by you of such changes.</p>\n' +
  '\n' +
  '                    <p>Contact Us</p>\n' +
  '\n' +
  '                    <p>If you have any questions on our Privacy Policy, you can contact us via email at\n' +
  '                        info@joinoutset.com\n' +
  '                        or at:</p>\n' +
  '\n' +
  '                    <p>Attn: Legal Department Outset Partners, Inc</p>\n' +
  '\n' +
  '                    <p>2269 Chestnut St #607 San Francisco, CA 94123</p>\n' +
  '                </div>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '    </div>\n' +
  '</section>\n' +
  '');
 $templateCache.put('/modules/core/views/templates/termsofservice.template.html',
  '<DIV ID="TextSection" DIR="LTR">\n' +
  '\n' +
  '\n' +
  '    <div class="panel panel-info"> (POSTED January 5, 2015.\n' +
  '        EFFECTIVE IMMEDIATELY FOR USERS WHO JOIN JOINOUTSET.COM ON OR AFTER January 5, 2015. SUPERSEDES ALL PREVIOUS\n' +
  '        VERSIONS OF THE OUTSET PARTNERS Inc. TERMS OF USE.)\n' +
  '    </div>\n' +
  '\n' +
  '    <P> These Terms of\n' +
  '        Use (the &quot;Terms&quot; or &quot;Agreement&quot;) set forth the terms and conditions under which individuals\n' +
  '        residing in the United States may use the Outset Partners, Inc. (“Outset”) Site located at <A\n' +
  '                HREF="http://www.joinoutset.com/">www.joinoutset.com </A>and all related webpages and/or\n' +
  '        the Outset Services (described below). Certain Outset Services are subject to additional policies, rules and\n' +
  '        terms and conditions, which are set forth in the printed or online Service materials relating to those Services\n' +
  '        (&quot;Additional Terms&quot;).</P>\n' +
  '\n' +
  '\n' +
  '    <UL>\n' +
  '        <LI><P> Please read these Terms\n' +
  '            and any applicable Additional Terms before using the Site or the Services. By using the Site or the\n' +
  '            Services, you hereby represent, warrant, understand, agree to and accept these Terms and any applicable\n' +
  '            Additional Terms in their entirety whether or not you register as a user of the Site or Services (&quot;Registered\n' +
  '            Users&quot;).</P>\n' +
  '        <LI><H3> This\n' +
  '            Agreement contains an Agreement to Arbitrate, which will, with limited exception, require you to submit\n' +
  '            claims you have against us to binding and final arbitration, unless you opt out of the Agreement to\n' +
  '            Arbitrate (see Section 13 &quot;Agreement to Arbitrate&quot;) by the later of January 5, 2015 or 30 days\n' +
  '            after the date you accept these Terms for the first time. Unless you opt out: (1) you will only be permitted\n' +
  '            to pursue claims against Outset on an individual basis, not as a plaintiff or class member in any class or\n' +
  '            representative action or proceeding, and (2) you will only be permitted to seek relief (including monetary,\n' +
  '            injunctive, and declaratory relief) on an individual basis.\n' +
  '        </H3>\n' +
  '        <LI><P> These\n' +
  '            Terms include the Outset <U>Privacy Policy</U>, which is incorporated herein. If you object to\n' +
  '            anything in these Terms, the Privacy Policy or any applicable Additional Terms, do not use the Site or the\n' +
  '            Services.\n' +
  '        </P>\n' +
  '        <LI><P><A\n' +
  '                NAME="_GoBack"></A> These Terms, including the Privacy Policy, are subject to change by Outset at any\n' +
  '            time. We will notify you about significant changes in these Terms by sending a notice to the email address\n' +
  '            registered in your account, or by placing a prominent notice on our Site, so that you can choose whether to\n' +
  '            continue using our Services. Significant changes will go into effect no less than 30 days after we notify\n' +
  '            you. Non-material changes or clarifications will take effect immediately upon posting of the updated Terms\n' +
  '            on our Site. You should periodically check <A HREF="\\h">www.joinoutset.com/terms </A>for\n' +
  '            updates. Additional Terms are also subject to change by Outset at any time and take effect immediately upon\n' +
  '            publishing. Any use of the Site or the Services by you after the effective date of any changes will\n' +
  '            constitute your acceptance of such changes.\n' +
  '        </P>\n' +
  '    </UL>\n' +
  '    <P> For purposes\n' +
  '        of these Terms, the &quot;Site&quot; shall mean <A HREF="http://www.joinoutset.com/">www.joinoutset.com</A> and\n' +
  '        any other Outset branded websites, web pages, mobile applications and mobile websites operated by Outset\n' +
  '        Partners, Inc. (&quot;Outset&quot; or &quot;we&quot;) in the United States, and the &quot;Services&quot; shall\n' +
  '        mean any of the various services that Outset provides through the Site or any other channels, including over the\n' +
  '        telephone. In addition, these Terms do not apply to third party entities that may use the Outset Site or\n' +
  '        Services. Such entities\' use of the Outset Site and Services are subject to separate terms that they agreed when\n' +
  '        they registered with Outset.</P>\n' +
  '\n' +
  '\n' +
  '    <UL>\n' +
  '        <OL>\n' +
  '            <LI><P ALIGN=LEFT><U>Description of Services; Limitations; User Responsibilities</U>\n' +
  '            </P>\n' +
  '            <LI><P ALIGN=LEFT><U>Eligibility to Use The Site and Services; Representations\n' +
  '                and Warranties</U>\n' +
  '            </P>\n' +
  '            <LI><P ALIGN=LEFT>\n' +
  '                <U>Rules For User Conduct and Use of Services</U>\n' +
  '            </P>\n' +
  '            <LI><P ALIGN=LEFT><U>Background and Verification Checks</U>\n' +
  '            </P>\n' +
  '            <LI><P ALIGN=LEFT><U>Termination of Registration</U>\n' +
  '            </P>\n' +
  '            <LI><P ALIGN=LEFT><U>Privacy</U></P>\n' +
  '            <LI><P ALIGN=LEFT><U>Links to External Sites</U>\n' +
  '            </P>\n' +
  '            <LI><P ALIGN=LEFT><U>Payment and Refund Policy</U>\n' +
  '            </P>\n' +
  '            <LI><P ALIGN=LEFT><U>Release of Liability for Conduct and Disputes</U>\n' +
  '            </P>\n' +
  '            <LI><P ALIGN=LEFT><U>Age Restrictions</U></P>\n' +
  '            <LI><P ALIGN=LEFT>\n' +
  '                <U>Disclaimers; Limitations; Waivers; and Indemnification</U>\n' +
  '            </P>\n' +
  '            <LI><P ALIGN=LEFT>\n' +
  '                <U>Copyright Notices/Complaints</U></P>\n' +
  '            <LI><P ALIGN=LEFT><U>Agreement to Arbitrate</U>\n' +
  '            </P>\n' +
  '            <LI><P ALIGN=LEFT><U>Governing Law and Venue</U>\n' +
  '            </P>\n' +
  '            <LI><P ALIGN=LEFT><U>Miscellaneous</U></P>\n' +
  '        </OL>\n' +
  '    </UL>\n' +
  '</DIV>\n' +
  '<UL>\n' +
  '    <OL>\n' +
  '        <LI><P ALIGN=LEFT>\n' +
  '            <U>Contact Information</U></P>\n' +
  '    </OL>\n' +
  '</UL>\n' +
  '<OL>\n' +
  '    <LI><H1> Description of Services; Limitations; User\n' +
  '        Responsibilities</H1>\n' +
  '        <OL>\n' +
  '            <LI><H2>1.1 About Our Services</H2>\n' +
  '        </OL>\n' +
  '</OL>\n' +
  '<P>\n' +
  '    Outset offers various Services to help its users find, coordinate, and maintain quality transportation and driver\n' +
  '    connections. The Services we offer include, among others:</P>\n' +
  '<P CLASS="western"\n' +
  '        ><BR>\n' +
  '</P>\n' +
  '<OL>\n' +
  '    <OL>\n' +
  '        <UL>\n' +
  '            <LI><P> We enable individuals\n' +
  '                or corporations seeking providers of driving services (such as taxi, limo, chauffer, independent,\n' +
  '                ridesharing, bus, delivery and/or trucking services) “Drivers” (each &quot;Job Providers&quot;) to post\n' +
  '                jobs on the Site, and we enable individuals and entities who provide driving services (&quot;Drivers&quot;)\n' +
  '                to post profiles on the Site and apply to jobs.</P>\n' +
  '            <LI><P> We\n' +
  '                provide search functionality on the Site to allow Job Providers and individual Drivers to narrow the\n' +
  '                pool of Job Providers or Drivers they are interested in meeting based on their needs and preferences,\n' +
  '                and we provide a communications platform that allows Job Providers and Drivers to communicate without\n' +
  '                sharing contact information.</P>\n' +
  '            <LI><P> We\n' +
  '                provide tools and information to help Job Providers and Drivers make more informed decisions, such as\n' +
  '                (i) verification dashboards on Driver profiles, which enable Job Providers to check the status of a\n' +
  '                Driver\'s various verifications, and (ii) a process for Job Providers to obtain background check reports\n' +
  '                on individual Drivers who consent to the running and sharing of those reports.</P>\n' +
  '        </UL>\n' +
  '    </OL>\n' +
  '</OL>\n' +
  '<OL>\n' +
  '    <OL>\n' +
  '        <UL>\n' +
  '            <LI><P> We\n' +
  '                may operate a group’s platform on the Site that enables Registered Users to communicate and share\n' +
  '                information with other Registered Users who share a common interest or bond.</P>\n' +
  '            <LI><P> We\n' +
  '                may offer a service that facilitates the payment by Job Providers to Drivers via credit card.</P>\n' +
  '        </UL>\n' +
  '    </OL>\n' +
  '</OL>\n' +
  '<P>\n' +
  '    Our Services continue to grow and change. Please refer to our Site for further information about the Services we\n' +
  '    provide.</P>\n' +
  '<H2>1.2. Limitations of our Services</H2>\n' +
  '<P>\n' +
  '    We offer a variety of Services to help our users find, coordinate, and maintain quality transportation and driver\n' +
  '    connections. However, we do not employ any Drivers. Except as set forth below, Job Providers are the potential\n' +
  '    employers of Drivers and are responsible for compliance with all applicable employment and other laws in connection\n' +
  '    with any employment relationship they establish (such as applicable payroll, tax and minimum wage laws). Unless\n' +
  '    otherwise provided in any Additional Terms from Outset regarding Services, the third party service provider is the\n' +
  '    employer of the Driver.</P>\n' +
  '<P CLASS="western"\n' +
  '\n' +
  '        >\n' +
  '    Further, we do not have control over the quality, timing, or legality of the services actually delivered by Drivers,\n' +
  '    nor of the integrity, responsibility or actions of Job Providers or Drivers. We do not refer or recommend either Job\n' +
  '    Providers or Drivers nor do we make any representations about the suitability, reliability, timeliness, and accuracy\n' +
  '    of the services provided by Drivers or the integrity, responsibility or actions of Job Providers or Drivers whether\n' +
  '    in public, private or offline interactions.</P>\n' +
  '<P> Job Provider\n' +
  '    and Driver content is primarily user generated, and we do not control or vet user generated content for accuracy as\n' +
  '    a general matter. Outset does not assume any responsibility for the accuracy or reliability of any information\n' +
  '    provided by Drivers or Job Providers on or off</P>\n' +
  '<P>\n' +
  '    this Site. We may offer certain Registered Users the opportunity to verify certain information such as their email\n' +
  '    address or cell phone number. If we indicate that a Registered User has verified certain information, it means that\n' +
  '    the user has complied with the process we have established for verifying such information. However, we do not\n' +
  '    guarantee, nor do we represent or warrant as to, the accuracy of such information.</P> <H2\n' +
  '        >\n' +
  '    Outset\n' +
  '    is not responsible for the conduct, whether online or offline, of any Job Provider, Driver or other user of the Site\n' +
  '    or Services. Moreover, Outset does not assume and expressly disclaims any liability that may result from the use of\n' +
  '    information provided on our Site. All users, including both Job Providers and Drivers, hereby expressly agree not to\n' +
  '    hold Outset (or Outset\'s officers, directors, shareholders, employees, subsidiaries, other affiliates, successors,\n' +
  '    assignees, agents, representatives, advertisers, marketing partners, licensors, independent contractors, recruiters,\n' +
  '    corporate partners or resellers, hereinafter &quot;Affiliates&quot;) liable for the actions or inactions of any Job\n' +
  '    Provider, Driver or other third party or for any information, instruction, advice or services which originated\n' +
  '    through the Site, and, to the maximum extent permissible under applicable law, Outset and its Affiliates expressly\n' +
  '    disclaims any liability whatsoever for any damage, suits, claims, and/or controversies that have arisen or may\n' +
  '    arise, whether known or unknown therefrom.</H2>\n' +
  '<OL>\n' +
  '    <OL>\n' +
  '        <LI><P CLASS="western"><B>1.3. User Responsibilities</B></P>\n' +
  '    </OL>\n' +
  '</OL>\n' +
  '<P>\n' +
  '    <B>Any screening of a Job Provider or Driver and his, her or its information by Outset is limited and should not be\n' +
  '        taken as complete, accurate, up-to-date or conclusive of the individual\'s or entity\'s suitability as an employer\n' +
  '        or Driver. Registered Users are solely responsible for interviewing, performing background and reference checks\n' +
  '        on, verifying information provided by, and selecting an appropriate Job Provider or Driver for themselves or\n' +
  '        their corporation.</B></P>\n' +
  '<P><B>Each Job Provider is also\n' +
  '    responsible for complying with all applicable employment and other laws in connection with any employment\n' +
  '    relationship they establish, including verifying the age of the Driver they select as well as that Driver\'s\n' +
  '    eligibility to work in the US.</B></P>\n' +
  '<OL>\n' +
  '    <LI><P CLASS="western"><B>Eligibility to Use the Site and Services; Representations and Warranties</B></P>\n' +
  '        <OL>\n' +
  '            <LI><P><B>2.1. Eligibility</B></P>\n' +
  '        </OL>\n' +
  '</OL>\n' +
  '<P>To be\n' +
  '    eligible to use our Services, you must meet the following criteria:</P>\n' +
  '<OL>\n' +
  '    <OL>\n' +
  '        <UL>\n' +
  '            <LI><P> Our Services are\n' +
  '                available only to individuals who are eighteen (18) years of age or older. If you do not meet the above\n' +
  '                age requirements, do not register to use the Site or Services.</P>\n' +
  '            <LI><P> The\n' +
  '                Site and the Services are currently available only to individuals who are legally in the jurisdiction of\n' +
  '                the United States or the territory of Puerto Rico. If you reside outside the United States or Puerto\n' +
  '                Rico, visit our Site homepage for a listing of other countries where Outset subsidiaries or affiliates\n' +
  '                offer similar services.</P>\n' +
  '            <LI><P> If\n' +
  '                you are registering to be a Driver, you must be permitted to legally work within the United States.</P>\n' +
  '            <LI><P> You\n' +
  '                may never have ever been (i) the subject of a complaint, restraining order or any other legal action\n' +
  '                involving, arrested for, charged with, or convicted of any felony, any criminal offense involving\n' +
  '                violence, abuse, neglect, fraud or larceny, or any offense that involves endangering the safety of\n' +
  '                others, dishonesty, negligence or drugs, or (ii) registered, or currently required to register, as a sex\n' +
  '                offender with any government entity.</P>\n' +
  '            <LI><P> You\n' +
  '                must not be a competitor of Outset or using our Services for reasons that are in competition with\n' +
  '                Outset.</P>\n' +
  '        </UL>\n' +
  '        <LI><H2> 2.2. Representations and\n' +
  '            Warranties</H2>\n' +
  '    </OL>\n' +
  '</OL>\n' +
  '<P>\n' +
  '    By requesting to use, registering to use and/or using the Site or the Services, you represent and warrant that you\n' +
  '    have the right, authority and capacity to enter into these Terms and you commit to abide by all of the terms and\n' +
  '    conditions hereof.</P>\n' +
  '<P CLASS="western"\n' +
  '\n' +
  '        >\n' +
  '    In addition, you represent and warrant that you and/or each member of your corporation (i) have never been the\n' +
  '    subject of a complaint, restraining order or any other legal action involving, arrested for, charged with, or\n' +
  '    convicted of any felony, any criminal offense involving violence, abuse, neglect, fraud or larceny, or any offense\n' +
  '    that involves endangering the safety of others, dishonesty, negligence, drugs or alcohol and (ii) are not nor have\n' +
  '    ever been registered, and are not currently required to register, as a sex offender with any government entity.</P>\n' +
  '<P></P>\n' +
  '<OL>\n' +
  '    <LI><H1>Rules for User Conduct and Use of Services</H1>\n' +
  '        <OL>\n' +
  '            <LI><H2>3.1. Registration, Posting, and Content Restrictions</H2>\n' +
  '        </OL>\n' +
  '</OL>\n' +
  '<P>\n' +
  '    The following rules pertain to &quot;Content&quot;, defined as any communications, images, sounds, videos, and all\n' +
  '    the material, data, and information that you upload or transmit through Outset\'s Services, or that other users\n' +
  '    upload or transmit, including without limitation any content, messages, photos, audios, videos, reviews or profiles\n' +
  '    that you publish or display (hereinafter, &quot;post&quot;). By transmitting and submitting any Content while using\n' +
  '    our Service, you agree, represent and warrant as follows:</P>\n' +
  '<OL>\n' +
  '    <OL>\n' +
  '        <UL>\n' +
  '            <LI><P> You are responsible\n' +
  '                for providing accurate, current and complete information in connection with your registration for use of\n' +
  '                the Site and the Services.</P>\n' +
  '            <LI><P> You\n' +
  '                will register your account in your own legal name, even if you are seeking transportation or driving\n' +
  '                services for another individual and/or corporation.</P>\n' +
  '            <LI><P> All\n' +
  '                Content you post will be in English, as the Site and Services are not currently supported in any other\n' +
  '                languages.</P>\n' +
  '            <LI><P> You\n' +
  '                are solely responsible for any Content that you post on the Site, or transmit to other users of the\n' +
  '                Site. You will not post on the Site, or transmit to other users, any defamatory, inaccurate, abusive,\n' +
  '                obscene, profane, offensive, sexually oriented, threatening, harassing, defamatory, racially offensive,\n' +
  '                or illegal material, or any material that infringes or violates another party\'s rights (including, but\n' +
  '                not limited to, intellectual property rights, and rights of privacy and publicity), or advocate, promote\n' +
  '                or assist any unlawful act such as (by way of example only) copyright infringement or computer misuse,\n' +
  '                or give the impression that any Content emanates from Outset where this is not the case. You will not\n' +
  '                provide inaccurate, misleading, defamatory or false information to Outset or to any other user of the\n' +
  '                Site, and all opinions stated, as part of Content must be genuinely held. Without limiting the\n' +
  '                foregoing, you represent and warrant to us that you have the right and authority to post all information\n' +
  '                you post about yourself or others, including without limitation that you have authorization from a\n' +
  '                corporation who is the subject of any Content you post to post such Content.</P>\n' +
  '            <LI><P> You\n' +
  '                understand and agree that Outset may, in its sole discretion, review and delete any Content, in each\n' +
  '                case in whole or in part, that in the sole judgment of Outset violates these Terms or which Outset\n' +
  '                determines in its sole discretion might be offensive, illegal, or that might violate the rights, harm,\n' +
  '                or threaten the safety of users of the Site or others.</P>\n' +
  '            <LI><P> You\n' +
  '                have the right, and hereby grant, to Outset, its Affiliates, licensees and successors, an irrevocable,\n' +
  '                perpetual, non-exclusive, fully paid, worldwide license to use, copy, perform, display, reproduce,\n' +
  '                adapt, modify and distribute your Content and to prepare derivative works of, or incorporate into other\n' +
  '                works, such Content, and to grant and authorize sublicenses of the foregoing. You further represent and\n' +
  '                warrant that public posting and use of your Content by Outset will not infringe or violate the rights of\n' +
  '                any third party.</P>\n' +
  '            <LI><P>Your use of the Service, including but not\n' +
  '                limited to the Content you post on the Service,</P>\n' +
  '        </UL>\n' +
  '    </OL>\n' +
  '</OL>\n' +
  '<P> must be in\n' +
  '    accordance with any and all applicable laws and regulations.</P>\n' +
  '<OL>\n' +
  '    <OL>\n' +
  '        <UL>\n' +
  '            <LI><P class="panel panel-info">\n' +
  '                Outset is not responsible for any claims relating to any inaccurate, untimely or incomplete information\n' +
  '                provided by users of the Site.</P>\n' +
  '        </UL>\n' +
  '    </OL>\n' +
  '</OL>\n' +
  '<P>\n' +
  '    Opinions, advice, statements, offers, or other information or content made available on the Site or through the\n' +
  '    Service, but not directly by Outset, are those of their respective authors. Such authors are solely responsible for\n' +
  '    such content. Outset does not: (i) guarantee the accuracy, completeness, or usefulness of any information on the\n' +
  '    Site or available through the Service, or</P>\n' +
  '<P> (ii) adopt,\n' +
  '    endorse or accept responsibility for the accuracy or reliability of any opinion, advice, or statement made by any\n' +
  '    party that appears on the Site or through the Service. Under no circumstances will Outset or its Affiliates be\n' +
  '    responsible for any loss or damage resulting from:</P>\n' +
  '<P> a) your\n' +
  '    reliance on information or other content posted on the Site or transmitted to or by any user of the Site or Service;\n' +
  '    or b) reviews or comments made about you on the Site by other users.</P>\n' +
  '<P> You agree that Outset has no\n' +
  '    obligation to remove any reviews or other information posted on the Site about you or any other person or entity. If\n' +
  '    you disagree with a review, you may post one rebuttal to the review, provided your rebuttal complies with these\n' +
  '    Terms. You may not terminate your registration and re-register in order to prevent a review from being associated\n' +
  '    with your account. The author of a review can always remove or request removal of a review they have written.</P>\n' +
  '<H2>\n' +
  '    To the maximum extent permitted by law, Outset disclaims any liability whatsoever for any misstatements and/or\n' +
  '    misrepresentations made by any users of the site. Users do hereby represent, understand and agree to hold Outset\n' +
  '    harmless for any misstatements and/or misrepresentations made by or on behalf of them on this site or in any other\n' +
  '    venue.</H2>\n' +
  '<OL>\n' +
  '    <OL>\n' +
  '        <LI><P CLASS="western"><B>3.2. Exclusive Use</B></P>\n' +
  '    </OL>\n' +
  '</OL>\n' +
  '<P>\n' +
  '    If you are a Job Provider, you may use your account only to find Drivers for yourself or your corporation. If you\n' +
  '    are a Driver, you may use your account only to find driving jobs for yourself. You are responsible for all activity\n' +
  '    on and use of your account, and you may not assign or otherwise transfer your account to any other person or\n' +
  '    entity.</P>\n' +
  '<H2>3.4. Prohibited Uses</H2>\n' +
  '<P>By using\n' +
  '    the Site or Services of Outset, you agree that you will not under any circumstances:</P>\n' +
  '<OL>\n' +
  '    <OL>\n' +
  '        <UL>\n' +
  '            <LI><P> use the Site,\n' +
  '                Services, or any information contained therein in any way that is abusive, threatening, obscene,\n' +
  '                defamatory, libelous, or racially, sexually, religiously, or otherwise objectionable and offensive;</P>\n' +
  '            <LI><P> use\n' +
  '                the Site or Services for any unlawful purpose, for any purpose not expressly intended by Outset or for\n' +
  '                the promotion of illegal activities;</P>\n' +
  '            <LI><P>attempt to, or harass, abuse or harm another\n' +
  '                person or group;</P>\n' +
  '            <LI><P>use another user\'s Outset account;</P>\n' +
  '            <LI><P>\n' +
  '                provide false or inaccurate information when registering an account on Outset, using the Services or\n' +
  '                communicating with other Registered Users;</P>\n' +
  '            <LI><P>\n' +
  '                attempt to re-register with Outset if we have terminated your account for any or no reason or terminate\n' +
  '                your registration and re-register in order to prevent a review from being associated with your\n' +
  '                account;</P>\n' +
  '            <LI><P>interfere or attempt to interfere with the\n' +
  '                proper functioning of Outset\'s Services;</P>\n' +
  '            <LI><P>make any automated use of the system, or take\n' +
  '                any action that we deem to impose or to</P>\n' +
  '        </UL>\n' +
  '    </OL>\n' +
  '</OL>\n' +
  '<P CLASS="western"\n' +
  '        >\n' +
  '    potentially impose an unreasonable or disproportionately large load on our servers or network infrastructure;</P>\n' +
  '<OL>\n' +
  '    <OL>\n' +
  '        <UL>\n' +
  '            <LI><P>\n' +
  '                bypass any robot exclusion headers or other measures we take to restrict access to the Service or use\n' +
  '                any software, technology, or device to scrape, spider, or crawl the Service or harvest or manipulate\n' +
  '                data;</P>\n' +
  '            <LI><P> use\n' +
  '                the communication systems provided by or contacts made on Outset for any commercial solicitation\n' +
  '                purposes;</P>\n' +
  '            <LI><P>\n' +
  '                publish or link to malicious content intended to damage or disrupt another user\'s browser or\n' +
  '                computer.</P>\n' +
  '        </UL>\n' +
  '    </OL>\n' +
  '</OL>\n' +
  '<P>\n' +
  '    In order to protect our users from prohibited activity, we reserve the right to take appropriate actions, including\n' +
  '    but not limited to restricting the number of phone numbers or messages a Job Provider may view or the number of\n' +
  '    connections a user may request in any period to a number which we deem appropriate in our sole discretion.</P>\n' +
  '<P>\n' +
  '    Should Outset find that you violated the terms of this Section or any terms stated herein, Outset reserves the\n' +
  '    right, at its sole discretion, to immediately terminate your use of the Site and Services. By using the Site and/or\n' +
  '    Services, you agree that Outset may assess, and you will be obligated to pay, a $10,000 daily penalty for scraping,\n' +
  '    either in a manual or automatic manner, Driver or Job Provider information, including but not limited to, names,\n' +
  '    addresses, phone numbers, or email addresses, copying copyrighted text, or otherwise mis-using or mis- appropriating\n' +
  '    Site content, including but not limited to, use on a &quot;mirrored&quot;, competitive, or third party site. This\n' +
  '    fee shall be in addition to any other rights Outset may have under these Terms or applicable law.</P>\n' +
  '<P>\n' +
  '    Further, in order to protect the integrity of the Site and the Services, Outset reserves the right at any time in\n' +
  '    its sole discretion to block users from certain IP addresses from accessing the Site.</P>\n' +
  '<OL>\n' +
  '    <LI><H1>Background and Verification Checks</H1>\n' +
  '        <OL>\n' +
  '            <LI><H2 CLASS="western"\n' +
  '                    > 4.1 Drivers\n' +
  '                Can Order or Authorize Background Checks about Themselves and Can Authorize the Sharing of Them with\n' +
  '                Other Members</H2>\n' +
  '        </OL>\n' +
  '</OL>\n' +
  '<P>\n' +
  '    Outset offers the following background check services from consumer reporting agencies: Background checks and Motor\n' +
  '    Vehicle Reports (collectively &quot;Background Check(s)&quot;). Background Checks must be ordered by Drivers about\n' +
  '    themselves either on their own initiative to increase their chances of employment by Job Providers or in response to\n' +
  '    a request by a Job Provider who is considering hiring them. Background Check services require payment of a separate\n' +
  '    fee by the Member who is initiating the background check request.</P>\n' +
  '<P>\n' +
  '    You understand and agree\n' +
  '    that Outset is not a consumer reporting agency as such term is defined by the Fair Credit Reporting Act, 15 U.S.C.\n' +
  '    Section 1681 (the &quot;FCRA&quot;). Unless Outset is reviewing the Background Check report for its own purposes,\n' +
  '    Outset is merely operating as a conduit of the Background Check for the benefit of the Driver or the Job Provider\n' +
  '    and is storing or forwarding the Background Check at their request.</P>\n' +
  '<P>\n' +
  '    The Background Check\n' +
  '    services are regulated by the FCRA, and the background reports resulting from these services are considered &quot;consumer\n' +
  '    reports&quot; under the FCRA. Consumer reports may contain information on your character, general reputation,\n' +
  '    personal characteristics, and mode of living, including but not limited to consumer credit, criminal history,\n' +
  '    workers\' compensation, driving, employment, military, civil, and educational data and reports.</P>\n' +
  '<P>\n' +
  '    You may authorize Outset to receive a copy of the Background Check you ordered and authorized through Outset. See\n' +
  '    Section 4.3 below for information regarding Outset\'s use of these Background Checks. If you order a Background Check\n' +
  '    about yourself, you will be emailed a copy of the results. It is your decision and responsibility to authorize\n' +
  '    Outset to forward the Background Check to the prospective Job Provider, if you wish to do so. You are also\n' +
  '    responsible for making sure that the email addresses you provide to Outset is correct, knowing that sensitive\n' +
  '    information will be sent to it.</P>\n' +
  '<P CLASS="western"\n' +
  '        >\n' +
  '    If you order Background Check in response to a request by a Job Provider who is considering hiring you we will\n' +
  '    forward the report to you. It is your decision and responsibility to authorize Outset to forward the Background\n' +
  '    Check to the prospective Job Provider, if you wish to do so. In accordance with your authorization at the time you\n' +
  '    ordered the Background Check. The results of any Background Check you order that results in Outset suspending or\n' +
  '    terminating your account will not be shared with other users.</P>\n' +
  '<P>\n' +
  '    If you have ordered a\n' +
  '    Background Check through Outset, we may indicate in your profile that you have completed that check. However, we\n' +
  '    will not share the results with any other site visitor or Registered User without your specific consent.</P>\n' +
  '<H2>4.2. Job Providers- Specific Terms of Use and Special Responsibilities of Job Providers\n' +
  '    under FCRA</H2>\n' +
  '<P>\n' +
  '    Job Providers may request and receive a copy of a Background Check on a Driver, subject to the Driver\'s explicit\n' +
  '    instructions about who may have access to such a report.</P>\n' +
  '<P CLASS="western"\n' +
  '        ><BR>\n' +
  '</P>\n' +
  '<P> If you receive a copy of a\n' +
  '    background report, you warrant that you will use such information only for a purpose permitted by FCRA, such as an\n' +
  '    employment purpose, and that you will comply with any and all applicable obligations of the FCRA as well as all\n' +
  '    other applicable consumer reporting laws.</P>\n' +
  '<P> Your responsibilities in using the\n' +
  '    information contained the background check can be found at <A\n' +
  '            HREF="http://www.ftc.gov/os/statutes/fcrajump.shtm"><U>http://www.ftc.gov/os/statutes/fcrajump.shtm</U>.</A>\n' +
  '    The FCRA governs the use of reports obtained from a consumer reporting agency.</P>\n' +
  '<P>\n' +
  '    If there is negative data\n' +
  '    in a Background Check you receive, and you choose to take &quot;adverse action&quot; (i.e. choose to not hire that\n' +
  '    individual due to information in the Background Check), the FCRA requires you to take certain procedural steps,\n' +
  '    which can be found at <A HREF="http://www.ftc.gov/os/statutes/fcrajump.shtm"><U>http://www.ftc.gov/os/statutes/fcrajump.shtm</U>.</A>\n' +
  '    These include but are not necessarily limited to: providing pre-adverse notice to the individual who is subject to\n' +
  '    the Background Check report (Driver), suspend the hiring process for a period of time for the Driver to dispute the\n' +
  '    information with the consumer reporting agency and notifying the Driver who is the subject of the report of your\n' +
  '    decision to take adverse action based on information contained in the Background Check report. We recommend working\n' +
  '    with an attorney to ensure you comply with your requirements under the FCRA.</P>\n' +
  '<H2> 4.3 Outset May Review\n' +
  '    and Use Background Checks You Order or Authorize About Yourself</H2> <H3\n' +
  '        >\n' +
  '    By using the Site or Services as a Driver, you acknowledge and agree Outset may review and use any Background Checks\n' +
  '    you have ordered or authorized about yourself for the legitimate business purpose of protecting the safety and\n' +
  '    integrity of our Site and its users and reserves the right to terminate your membership based on the information\n' +
  '    contained in such report, even if such information was subsequently dismissed.</H3>\n' +
  '<P>\n' +
  '    If Outset terminates your\n' +
  '    membership or access to the Site on the basis of information in a Background Check, we will notify you and provide\n' +
  '    you the name and contact information of the consumer reporting agency that created the report. We will also provide\n' +
  '    you a copy of the report. You hereby represent, understand and expressly agree that Outset does not have control\n' +
  '    over or assume any responsibility for the quality, accuracy, or reliability of the information included in these\n' +
  '    Background Checks. Furthermore, any inaccuracies in the report must be addressed with the consumer reporting agency\n' +
  '    that issued it and not Outset.</P>\n' +
  '<OL>\n' +
  '    <OL>\n' +
  '        <LI><P><B>4.4 Job Provider Release of Liability\n' +
  '            for Results of Background Checks, Verification Checks, and Motor Vehicle Reports</B></P>\n' +
  '    </OL>\n' +
  '</OL>\n' +
  '<P>\n' +
  '    As a Job Provider, if you decide to use or access information included in a MVR and/or a Background Check, you\n' +
  '    hereby represent, understand and expressly agree that those checks are not always accurate or complete (or based on\n' +
  '    information that is accurate or complete) and that the specific records searched, and the comprehensiveness of the\n' +
  '    search, varies by the type of Background Check ordered as well as the state and county where the check is performed.\n' +
  '    For example, many jurisdictions only include felony conviction records (and not, for example, misdemeanor or arrest\n' +
  '    records) in the national criminal database, which is the only data source utilized for preliminary background checks\n' +
  '    other than the sexual offender registry. Moreover, some states include only registered sex offenders in that\n' +
  '    database.</P>\n' +
  '<P>\n' +
  '    If you decide to access, use, or share information provided by a Background Check, you agree to do so in accordance\n' +
  '    with applicable law. You also agree to indemnify and hold harmless Outset from any loss, liability, damage, or costs\n' +
  '    that may result from such access, use, or sharing of this information regardless of the cause. Outset does not\n' +
  '    assume and expressly disclaims, and you hereby agree to release Outset from, any loss, liability, damage, or costs\n' +
  '    that may result from the use of information provided in a background report including, without limitation, the\n' +
  '    inaccuracy or incompleteness of any such information.</P>\n' +
  '<P> If you decide to use or access\n' +
  '    information included in a MVR you hereby represent, understand and expressly agree that those checks are not always\n' +
  '    accurate or complete (or based on information that is accurate or complete) and that the specific records searched,\n' +
  '    and the comprehensiveness of the search, varies by the state or other jurisdiction that the MVR report was performed\n' +
  '    (for example, each state may have its own MVR database and the MVR report you use or access may only be for a single\n' +
  '    state, and not accurately reporting MVR records from another state).</P>\n' +
  '<P>\n' +
  '    You expressly acknowledge\n' +
  '    that Outset has no obligation to perform MVR, Background Checks, or Verification Checks on any Registered Users. A\n' +
  '    User’s status as a Registered User on <A HREF="http://www.joinoutset.com/">www.joinoutset.com </A>should\n' +
  '    not be taken as complete, accurate, up-to-date or conclusive evidence of the accuracy of any information those users\n' +
  '    have provided or of their eligibility to use the Services.</P>\n' +
  '<H1> Termination of\n' +
  '    Registration</H1>\n' +
  '<P>\n' +
  '    Should Outset determine that you are not eligible to use the Services, have violated any terms stated herein or in\n' +
  '    any of the Additional Terms, are not suitable for participation as a Registered User, or have mis-used or\n' +
  '    mis-appropriated Site content, including but not limited to use on a &quot;mirrored&quot;, competitive, or third\n' +
  '    party site, Outset reserves the right, at its sole discretion, to immediately terminate your access to all or part\n' +
  '    of the Outset Site, to remove your profile and/or any content posted by or about you from the Site, and/or to\n' +
  '    terminate your registration in Outset, with or without notice.</P>\n' +
  '<P CLASS="western"\n' +
  '        ><BR>\n' +
  '</P> <H3> In any\n' +
  '    event, Outset also reserves the right, in its sole discretion, to terminate your access to all or part of the Outset\n' +
  '    Site, to remove your profile and/or any content posted by or about you from the Site, and/or to terminate your\n' +
  '    registration in Outset, for any reason or no reason, with or without notice. If we terminate your registration, we\n' +
  '    have no obligation to notify you of the reason, if any, for your termination.</H3>\n' +
  '<P>\n' +
  '    <I><B>Following</B></I><I><B> </B></I><I><B>any</B></I><I><B> </B></I><I><B>termination</B></I><I><B> </B></I><I><B>of</B></I><I><B> </B></I><I><B>any</B></I><I><B> </B></I><I><B>individual\'s</B></I><I><B> </B></I><I><B>use</B></I><I><B> </B></I><I><B>of</B></I><I><B> </B></I><I><B>the</B></I><I><B> </B></I><I><B>Site</B></I><I><B> </B></I><I><B>or</B></I><I><B> </B></I><I><B>the</B></I><I><B> </B></I><I><B>Services,</B></I><I><B> </B></I><I><B>Outset</B></I><I><B> </B></I><I><B>reserves</B></I><I><B> </B></I><I><B>the</B></I><I><B> </B></I><I><B>right</B></I><I><B> </B></I><I><B>to</B></I><I><B> </B></I><I><B>send</B></I><I><B> </B></I><I><B>a</B></I><I><B> </B></I><I><B>notice</B></I><I><B> </B></I><I><B>thereof</B></I><I><B> </B></I><I><B>to</B></I><I><B> </B></I><I><B>other</B></I><I><B> </B></I><I><B>Registered</B></I><I><B> </B></I><I><B>Users</B></I><I><B> </B></I><I><B>with</B></I><I><B> </B></I><I><B>whom</B></I><I><B> </B></I><I><B>we</B></I><I><B> </B></I><I><B>believe</B></I><I><B> </B></I><I><B>the</B></I><I><B> </B></I><I><B>individual</B></I><I><B> </B></I><I><B>has</B></I><I><B> </B></I><I><B>corresponded.</B></I>\n' +
  '</P>\n' +
  '<P>\n' +
  '    Our decision to terminate an individual\'s or corporations registration and/or to notify other Registered Users with\n' +
  '    whom we believe the individual has corresponded does not constitute, and should not be interpreted or used as\n' +
  '    information bearing on, the individual\'s or corporations character, general reputation, personal characteristics, or\n' +
  '    mode of living.</P>\n' +
  '<H1>Privacy</H1>\n' +
  '<P>\n' +
  '    Outset will only use the information you provide on the Site or via other channels in accordance with our\n' +
  '    <U>Privacy Policy</U>. For more information, see our full Privacy Policy, the terms of which are\n' +
  '    incorporated herein.</P>\n' +
  '<H1>Links To External Sites</H1>\n' +
  '<P>\n' +
  '    Links from the Site to external sites (including external sites that are framed by Outset) or inclusion of\n' +
  '    advertisements do not constitute an endorsement by Outset of such sites or the content, products, advertising and\n' +
  '    other materials presented on such sites or of the products and services that are the subject of such advertisements,\n' +
  '    but are for users\' reference and convenience.</P>\n' +
  '<P>\n' +
  '    Users access\n' +
  '    them at their own risk. It is the responsibility of the user to evaluate the content and usefulness of the\n' +
  '    information obtained from other sites. Outset does not control such sites, and is not responsible for their content.\n' +
  '    Just because Outset has hyperlinks to such sites does not mean that Outset endorses any of the material on such\n' +
  '    sites, or has any association with their operators.</P>\n' +
  '<P> Users\n' +
  '    further acknowledge that use of any site controlled, owned or operated by third parties is governed by the terms and\n' +
  '    conditions of use for those sites, and not by Outset\'s Terms of Use and Privacy Policy. Outset expressly disclaims\n' +
  '    any liability derived from the use and/or viewing of links that may appear on this Site. All users hereby agree to\n' +
  '    hold Outset harmless from any liability that may result from the use of links that may appear on the Site.</P>\n' +
  '<H1>Payment And Refund Policy</H1>\n' +
  '<P>\n' +
  '    In order to utilize some Outset Services or product offerings, the user of such Services or product offerings must\n' +
  '    pay Outset either a recurring subscription or one-time fee. In addition, the user is responsible for any state or\n' +
  '    local sales taxes associated with the Services or product offerings purchased.</P>\n' +
  '<H2>8.1 Billing and Payment</H2>\n' +
  '<P> If you sign up\n' +
  '    for an Outset paid membership subscription, you agree to pay Outset all subscription charges associated with the\n' +
  '    plan you subscribe to as described on the Site at the time you subscribe and provide your payment information. You\n' +
  '    also authorize Outset to charge your chosen payment provider according to the terms of the plan to which you\n' +
  '    subscribe. The subscription period and the amount and frequency of the charges will vary depending on the\n' +
  '    subscription plan you select. Outset reserves the right to correct any errors or mistakes that it makes even if it\n' +
  '    has already requested or received payment.</P>\n' +
  '<P> To the extent you elect to purchase\n' +
  '    other Services or product offerings we may offer for a fee, you authorize Outset to charge your chosen payment\n' +
  '    provider for the Services and/or products you purchase. You agree that if Outset already has your credit card on\n' +
  '    file as a result of prior purchases you have made, we may charge that credit card for the additional\n' +
  '    Services/products you purchase.</P>\n' +
  '<H2>8.2 Automatic Subscription Renewal and Cancellation</H2>\n' +
  '<P>\n' +
  '    Outset paid membership subscriptions will continue indefinitely until cancelled by the user. After your initial\n' +
  '    subscription commitment period, and again after any subsequent subscription period, your subscription will\n' +
  '    automatically renew for an additional equivalent period as the subscription term you originally selected and at the\n' +
  '    subscription rate and frequency disclosed to you on the Site when you originally subscribed, unless otherwise\n' +
  '    provided at the time you subscribed. If you sign up for a payment plan that allows you to be charged monthly over\n' +
  '    the subscription period and you decide to cancel your subscription during the subscription period, you acknowledge\n' +
  '    and agree that you will continue to be billed for the subscription on a monthly basis until its originally scheduled\n' +
  '    expiration date.</P>\n' +
  '<P CLASS="western"\n' +
  '\n' +
  '        >\n' +
  '    You may cancel your paid membership subscription by adjusting your <U>account settings</U>. If you\n' +
  '    cancel your subscription, you typically will be permitted to use your subscription until the end of your\n' +
  '    then-current subscription term. Your subscription will not be renewed after your then- current term expires, but\n' +
  '    your credit card will be charged, and you will be required to pay, any cancellation or other fees associated with\n' +
  '    your early termination and disclosed to you at the time you signed up for the subscription plan.</P>\n' +
  '<H2>8.3 Refund Policy</H2>\n' +
  '<P>\n' +
  '    <I><B>Except</B></I><I><B> </B></I><I><B>as</B></I><I><B> </B></I><I><B>set</B></I><I><B> </B></I><I><B>forth</B></I><I><B> </B></I><I><B>below,</B></I><I><B> </B></I><I><B>all</B></I><I><B> </B></I><I><B>payments</B></I><I><B> </B></I><I><B>for</B></I><I><B> </B></I><I><B>services/products</B></I><I><B> </B></I><I><B>are</B></I><I><B> </B></I><I><B>non-refundable</B></I><I><B> </B></I><I><B>and</B></I><I><B> </B></I><I><B>there</B></I><I><B> </B></I><I><B>are</B></I><I><B> </B></I><I><B>no</B></I><I><B> </B></I><I><B>refunds</B></I><I><B> </B></I><I><B>or</B></I><I><B> </B></I><I><B>credits</B></I><I><B> </B></I><I><B>for</B></I><I><B> </B></I><I><B>unused</B></I><I><B> </B></I><I><B>or</B></I><I><B> </B></I><I><B>partially</B></I><I><B> </B></I><I><B>used</B></I><I><B> </B></I><I><B>services/products</B></I><I><B> </B></I><I><B>or</B></I><I><B> </B></I><I><B>service/product</B></I><I><B> </B></I><I><B>cancellations.</B></I><I><B> </B></I>Notwithstanding\n' +
  '    the foregoing, if you have a paid membership subscription that is automatically renewed, we will refund the most\n' +
  '    recent charge to your credit card if (i) you cancel your subscription within thirty (30) days after the most recent\n' +
  '    charge, and </P>\n' +
  '<P> (ii) you have not\n' +
  '    used your subscription during the current renewal period. The refund will apply to the most recent charge only. In\n' +
  '    addition, Outset reserves the right to immediately downgrade or cancel your membership after payment of your refund.\n' +
  '    Outset does not provide refunds or credits under any other circumstances, unless it determines in its sole\n' +
  '    discretion that a refund or credit is warranted due to extenuating circumstances, such as a duplicate account.</P>\n' +
  '<P></P>\n' +
  '<H2>8.4 Free Trial Offers</H2>\n' +
  '<P>\n' +
  '    Outset may offer limited-time free trial subscriptions to certain users from time-to-time. Users who sign up for an\n' +
  '    Outset Service on a free trial basis may have limited access to the Service and/or features of the Site. If a user\n' +
  '    signs up for a free trial subscription, after the expiration of the free trial period, the user will be charged the\n' +
  '    price then in effect for a subscription to the Service, unless otherwise provided to him or her when he or she\n' +
  '    originally subscribed. If a user does not want to continue with the Service after the expiration of the free trial\n' +
  '    period, the Job Provider or Driver must cancel their subscription within thirty (30) days of being charged the\n' +
  '    subscription fee for the Service. Upon cancellation, the Driver or Employment Provider’s credit card will be\n' +
  '    refunded for the amount of the most recent subscription charge so long as he or she has not used the subscription\n' +
  '    after the expiration of the free trial period.</P>\n' +
  '<H1> Release of\n' +
  '    Liability for Conduct and Disputes</H1>\n' +
  '<P>\n' +
  '    We are not an employer of Drivers. Job Providers may seek the services of a Driver through the use of the Site or\n' +
  '    Services, and Drivers may post profiles and submit proposals to Job Providers regarding their services. Outset will\n' +
  '    not be held responsible and expressly disclaims any liability whatsoever for any claims, demands or damages direct\n' +
  '    or indirect of every kind and nature, known and unknown, suspected and unsuspected, disclosed and undisclosed,\n' +
  '    arising out of or in any way connected with such issues. By using this Site or our Services, you do hereby\n' +
  '    represent, understand, and expressly agree to hold Outset harmless for any claim or controversy that may arise from\n' +
  '    any disputes between you and any Job Provider, Driver or other user(s) of the Site. You agree to take reasonable\n' +
  '    precautions in all interactions with Job Providers, Drivers or other users of the Site or the Services, particularly\n' +
  '    if you decide to meet offline. By using the Site or the Services, you do hereby agree to report any alleged\n' +
  '    improprieties of any users therein to Outset immediately by notifying Outset of the same via electronic\n' +
  '    correspondence.</P>\n' +
  '<H1>Age Restrictions</H1>\n' +
  '<P>\n' +
  '    Outset is intended for people 18 or over. Job Providers and Drivers should monitor children\'s use of the Internet\n' +
  '    and deny access to the Site to anyone under the age of 18.</P>\n' +
  '<OL>\n' +
  '    <LI><H1>Disclaimers; Limitations; Waivers; Indemnification</H1>\n' +
  '        <OL>\n' +
  '            <LI><H2>11.1. No Warranty</H2>\n' +
  '        </OL>\n' +
  '</OL>\n' +
  '<P>\n' +
  '    The information and materials contained on the Site, including text, graphics, information, links or other items are\n' +
  '    provided &quot;as is&quot;, &quot;as available&quot;. Further, opinions, advice, statements, offers, or other\n' +
  '    information or content made available through the Services, but not directly by Outset, are those of their\n' +
  '    respective authors, and should not necessarily be relied upon. Such authors are solely responsible for such content.\n' +
  '    <I><B>TO</B></I><I><B> </B></I><I><B>THE</B></I><I><B> </B></I><I><B>MAXIMUM</B></I><I><B> </B></I><I><B>EXTENT</B></I><I><B> </B></I><I><B>PERMITTED</B></I><I><B> </B></I><I><B>BY</B></I><I><B> </B></I><I><B>APPLICABLE</B></I><I><B> </B></I><I><B>LAW,</B></I><I><B> </B></I><I><B>OUTSET</B></I><I><B> </B></I><I><B>DOES</B></I><I><B> </B></I><I><B>NOT:</B></I><I><B> </B></I><I><B>(1)</B></I><I><B> </B></I><I><B>WARRANT</B></I><I><B> </B></I><I><B>THE</B></I><I><B> </B></I><I><B>ACCURACY,</B></I><I><B> </B></I><I><B>ADEQUACY</B></I><I><B> </B></I><I><B>OR</B></I><I><B> </B></I><I><B>COMPLETENESS</B></I><I><B> </B></I><I><B>OF</B></I><I><B> </B></I><I><B>THIS</B></I><I><B> </B></I><I><B>INFORMATION</B></I><I><B> </B></I><I><B>AND</B></I><I><B> </B></I><I><B>MATERIALS;</B></I><I><B> </B></I><I><B>(2)</B></I><I><B> </B></I><I><B>ADOPT,</B></I><I><B> </B></I><I><B>ENDORSE</B></I><I><B> </B></I><I><B>OR</B></I><I><B> </B></I><I><B>ACCEPT</B></I><I><B> </B></I><I><B>RESPONSIBILITY</B></I><I><B> </B></I><I><B>FOR</B></I><I><B> </B></I><I><B>THE</B></I><I><B> </B></I><I><B>ACCURACY</B></I><I><B> </B></I><I><B>OR</B></I><I><B> </B></I><I><B>RELIABILITY</B></I><I><B> </B></I><I><B>OF</B></I><I><B> </B></I><I><B>ANY</B></I><I><B> </B></I><I><B>OPINION,</B></I><I><B> </B></I><I><B>ADVICE,</B></I><I><B> </B></I><I><B>OR</B></I><I><B> </B></I><I><B>STATEMENT</B></I><I><B> </B></I><I><B>MADE</B></I><I><B> </B></I><I><B>BY</B></I><I><B> </B></I><I><B>ANY</B></I><I><B> </B></I><I><B>PARTY</B></I><I><B> </B></I><I><B>OTHER</B></I><I><B> </B></I><I><B>THAN</B></I><I><B> </B></I><I><B>OUTSET;</B></I><I><B> </B></I><I><B>(3)</B></I><I><B> </B></I><I><B>WARRANT</B></I><I><B> </B></I><I><B>THAT</B></I><I><B> </B></I><I><B>YOUR</B></I><I><B> </B></I><I><B>USE</B></I><I><B> </B></I><I><B>OF</B></I><I><B> </B></I><I><B>THE</B></I><I><B> </B></I><I><B>SERVICES</B></I><I><B> </B></I><I><B>WILL</B></I><I><B> </B></I><I><B>BE</B></I><I><B> </B></I><I><B>SECURE,</B></I><I><B> </B></I><I><B>FREE</B></I><I><B> </B></I><I><B>FROM</B></I><I><B> </B></I><I><B>COMPUTER</B></I><I><B> </B></I><I><B>VIRUSES,</B></I><I><B> </B></I><I><B>UNINTERRUPTED,</B></I><I><B> </B></I><I><B>ALWAYS</B></I><I><B> </B></I><I><B>AVAILABLE,</B></I><I><B> </B></I><I><B>ERROR-FREE</B></I><I><B> </B></I><I><B>OR</B></I><I><B> </B></I><I><B>WILL</B></I><I><B> </B></I><I><B>MEET</B></I><I><B> </B></I><I><B>YOUR</B></I><I><B> </B></I><I><B>REQUIREMENTS,</B></I><I><B> </B></I><I><B>OR</B></I><I><B> </B></I><I><B>THAT</B></I><I><B> </B></I><I><B>ANY</B></I><I><B> </B></I><I><B>DEFECTS</B></I><I><B> </B></I><I><B>IN</B></I><I><B> </B></I><I><B>THE</B></I><I><B> </B></I><I><B>SERVICES</B></I><I><B> </B></I><I><B>WILL</B></I><I><B> </B></I><I><B>BE</B></I><I><B> </B></I><I><B>CORRECTED;</B></I><I><B> </B></I><I><B>OR</B></I><I><B> </B></I><I><B>(4)</B></I><I><B> </B></I><I><B>GIVE</B></I><I><B> </B></I><I><B>ANY</B></I><I><B> </B></I><I><B>WARRANTIES</B></I><I><B> </B></I><I><B>OF</B></I><I><B> </B></I><I><B>FITNESS</B></I><I><B> </B></I><I><B>FOR</B></I><I><B> </B></I><I><B>A</B></I><I><B> </B></I><I><B>PARTICULAR</B></I><I><B> </B></I><I><B>PURPOSE</B></I><I><B> </B></I><I><B>OR</B></I><I><B> </B></I><I><B>NON-INFRINGEMENT</B></I><I><B> </B></I><I><B>OF</B></I><I><B> </B></I><I><B>THIRD</B></I><I><B> </B></I><I><B>PARTY</B></I><I><B> </B></I><I><B>RIGHTS.</B></I><I><B> </B></I><I><B>TO</B></I><I><B> </B></I><I><B>THE</B></I><I><B> </B></I><I><B>EXTENT</B></I><I><B> </B></I><I><B>PERMITTED</B></I><I><B> </B></I><I><B>BY</B></I><I><B> </B></I><I><B>APPLICABLE</B></I><I><B> </B></I><I><B>LAW,</B></I><I><B> </B></I><I><B>OUTSET</B></I><I><B> </B></I><I><B>EXPRESSLY</B></I><I><B> </B></I><I><B>EXCLUDES</B></I><I><B> </B></I><I><B>ALL</B></I><I><B> </B></I><I><B>CONDITIONS,</B></I><I><B> </B></I><I><B>WARRANTIES</B></I><I><B> </B></I><I><B>AND</B></I><I><B> </B></I><I><B>OTHER</B></I><I><B> </B></I><I><B>TERMS</B></I><I><B> </B></I><I><B>WHICH</B></I><I><B> </B></I><I><B>MIGHT</B></I><I><B> </B></I><I><B>OTHERWISE</B></I><I><B> </B></I><I><B>BE</B></I><I><B> </B></I><I><B>IMPLIED\n' +
  '    BY STATUTE,</B></I><I><B> </B></I><I><B>COMMON</B></I><I><B> LAW OR THE LAW OF</B></I><I><B> </B></I><I><B>EQUITY\n' +
  '    AND DISCLAIMS</B></I><I><B> </B></I><I><B>LIABILITY</B></I><I><B> </B></I><I><B>FOR</B></I><I><B> </B></I><I><B>ERRORS</B></I><I><B> </B></I><I><B>OR</B></I><I><B> </B></I><I><B>OMISSIONS</B></I><I><B> </B></I><I><B>IN</B></I><I><B> </B></I><I><B>THIS</B></I><I><B> </B></I><I><B>INFORMATION</B></I><I><B> </B></I><I><B>AND</B></I><I><B> </B></I><I><B>MATERIALS.</B></I>\n' +
  '</P> <H3\n' +
  '        >\n' +
  '    IN ADDITION AND WITHOUT LIMITING THE FOREGOING, OUTSET MAKES NO REPRESENTATION OR WARRANTIES OF ANY KIND WHETHER\n' +
  '    EXPRESS OR IMPLIED REGARDING THE SUITABILITY OF ANY USER OF OUR SITE TO PROVIDE SERVICES AS A DRIVER OR TO EMPLOY\n' +
  '    THE SERVICES OF A DRIVER.</H3>\n' +
  '<OL>\n' +
  '    <OL>\n' +
  '        <LI><P CLASS="western"><B>11.2. Assumption of Risk</B></P>\n' +
  '    </OL>\n' +
  '</OL>\n' +
  '<P>\n' +
  '    You assume all risk when using the Site and the Services, including but not limited to all of the risks associated\n' +
  '    with any online or offline interactions with users of the Site or the Services. You agree to take all necessary\n' +
  '    precautions when interacting with other site visitors or Registered Users.</P>\n' +
  '<H2>11.3. Limitation of Liability</H2>\n' +
  '<P>\n' +
  '    <I><B>Incidental</B></I><I><B> Damages</B></I><I><B> </B></I><I><B>and</B></I><I><B> </B></I><I><B>Aggregate</B></I><I><B> </B></I><I><B>Liability.</B></I><I><B> </B></I>In\n' +
  '    no event will Outset be liable for any indirect, special, incidental, or consequential damages, losses or expenses\n' +
  '    arising out of or relating to the use or inability to use the Site or Services, including without limitation damages\n' +
  '</P>\n' +
  '<P> related to any\n' +
  '    information received from the Site or Services, removal of content from the Site, including profile information, any\n' +
  '    email distributed to any user or any linked web site or use thereof or inability to use by any party, or in\n' +
  '    connection with any termination of your subscription or ability to access the Site or Services, failure of\n' +
  '    performance, error, omission, interruption, defect, delay in operation or transmission, computer virus or line or\n' +
  '    system failure, even if Outset, or representatives thereof, are advised of the possibility of such damages, losses\n' +
  '    or expenses. UNDER NO CIRCUMSTANCES WILL OUTSET\'S AGGREGATE LIABILITY, IN ANY FORM OF ACTION WHATSOEVER IN\n' +
  '    CONNECTION WITH THIS AGREEMENT OR THE USE OF THE SERVICES OR THE SITE, EXCEED THE PRICE PAID BY YOU FOR YOUR ACCOUNT\n' +
  '    NOT TO EXCEED YOUR MOST RECENT TWO BILLING CHARGES, OR, IF YOU HAVE NOT PAID OUTSET FOR THE USE OF ANY SERVICES, THE\n' +
  '    AMOUNT OF $25.00 OR ITS EQUIVALENT.</P>\n' +
  '<P>\n' +
  '    <I><B>No</B></I><I><B> </B></I><I><B>Liability</B></I><I><B> </B></I><I><B>for</B></I><I><B> </B></I><I><B>non-Outset</B></I><I><B> </B></I><I><B>Actions.</B></I><I><B> </B></I>TO\n' +
  '    THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL OUTSET BE LIABLE FOR ANY DAMAGES WHATSOEVER,\n' +
  '    WHETHER DIRECT, INDIRECT, GENERAL, SPECIAL, COMPENSATORY, AND/OR CONSEQUENTIAL, ARISING OUT OF OR RELATING TO THE\n' +
  '    CONDUCT OF YOU OR ANYONE ELSE IN CONNECTION WITH THE USE OF THE SITE OR THE SERVICES, INCLUDING WITHOUT LIMITATION,\n' +
  '    BODILY INJURY, EMOTIONAL DISTRESS, AND/OR ANY OTHER DAMAGES RESULTING FROM ANYONE\'S RELIANCE ON INFORMATION OR OTHER\n' +
  '    CONTENT POSTED ON THE SITE, OR TRANSMITTED TO OR BY ANY USERS OR ANY OTHER INTERACTIONS WITH OTHER REGISTERED USERS\n' +
  '    OF THE SITE OR SERVICES, WHETHER ONLINE OR OFFLINE. THIS INCLUDES ANY CLAIMS, LOSSES OR DAMAGES ARISING FROM THE\n' +
  '    CONDUCT OF USERS WHO HAVE REGISTERED UNDER FALSE PRETENSES OR WHO ATTEMPT TO DEFRAUD OR HARM YOU.</P>\n' +
  '<P>\n' +
  '    In addition to the preceding paragraphs of this section and other provisions of these Terms, any advice that may be\n' +
  '    posted on the Site is for informational purposes only and is not intended to replace or substitute for any\n' +
  '    professional financial, employment, licensing, medical, legal, or other advice. Outset makes no representations or\n' +
  '    warranties and expressly disclaims any and all liability concerning any employment and/or services, action by, or\n' +
  '    effect on any person following the information offered or provided within or through the Site. If you have specific\n' +
  '    concerns or a situation arises in which you require any professional advice, you should consult with an\n' +
  '    appropriately trained and qualified specialist.</P>\n' +
  '<H2>11.4. Indemnification</H2>\n' +
  '<P>\n' +
  '    By agreeing to these Terms, users of the Site and Services agree to indemnify, defend and hold harmless Outset and\n' +
  '    its Affiliates from and against any and all claims, losses, expenses or demands of liability, including reasonable\n' +
  '    attorneys\' fees and costs incurred by Outset and its Affiliates in connection with any claim by a third party\n' +
  '    (including an intellectual property claim) arising out of (I) materials and content you submit, post or transmit\n' +
  '    through the Site, or (ii) use of the Site or Services by you in violation of these Terms of Use or in violation of\n' +
  '    any applicable law. Users further agree that they will cooperate as reasonably required in the defense of such\n' +
  '    claims. Outset and its Affiliates reserve the right, at their own expense, to assume the exclusive defense and\n' +
  '    control of any matter otherwise subject to indemnification by users, and users shall not, in any event, settle any\n' +
  '    claim or matter without the written consent of Outset. Users further agree to hold harmless Outset and its\n' +
  '    Affiliates from any claim arising from a third party\'s use of information or materials of any kind that users post\n' +
  '    to the Site.</P>\n' +
  '<H1>Copyright Notices/Complaints</H1>\n' +
  '<P>\n' +
  '    It is Outset\'s policy to respond to notices of alleged copyright infringement with the Digital Millennium Copyright\n' +
  '    Act (&quot;DMCA&quot;). If you believe any materials accessible on or from our Site infringe your copyright, you may\n' +
  '    request removal of those materials (or access thereto) from the Site by contacting Outset\'s copyright agent\n' +
  '    (identified below) and providing the following information:</P>\n' +
  '<P CLASS="western"\n' +
  '        ><BR>\n' +
  '</P>\n' +
  '<OL>\n' +
  '    <OL>\n' +
  '        <LI><P> Identification of the copyrighted work\n' +
  '            that you believe to be infringed. Please describe the work, and where possible include a copy or the\n' +
  '            location (e.g., URL) of an authorized version of</P>\n' +
  '    </OL>\n' +
  '</OL>\n' +
  '<P> the work.</P>\n' +
  '<OL>\n' +
  '    <OL>\n' +
  '        <LI><P>\n' +
  '            Identification of the material that you believe to be infringing and its location. Please describe the\n' +
  '            material, and provide us with its URL or any other pertinent information that will allow us to locate the\n' +
  '            material.</P>\n' +
  '        <LI><P>Your name, address, telephone number and (if available)\n' +
  '            e-mail address.</P>\n' +
  '        <LI><P> A\n' +
  '            statement that you have a good faith belief that the complained of use of the materials is not authorized by\n' +
  '            the copyright owner, its agent, or the law.</P>\n' +
  '        <LI><P> A statement that the\n' +
  '            information that you have supplied is accurate, and indicating that &quot;under penalty of perjury,&quot;\n' +
  '            you are the copyright owner or are authorized to act on the copyright owner\'s behalf.</P>\n' +
  '        <LI><P> A signature or the electronic equivalent\n' +
  '            from the copyright holder or authorized representative. Outset\'s agent for copyright issues relating to this\n' +
  '            Site is as follows:</P>\n' +
  '    </OL>\n' +
  '</OL>\n' +
  '<P CLASS="western"\n' +
  '        >\n' +
  '    Copyright Agent Attn: Legal Department</P>\n' +
  '<P ALIGN=CENTER\n' +
  '        >\n' +
  '    Outset Partners, Inc. </P>\n' +
  '<P ALIGN=CENTER\n' +
  '        >\n' +
  '    The Vault</P>\n' +
  '<P ALIGN=CENTER\n' +
  '        >\n' +
  '    415 Jackson St. Suite B, San Francisco, CA 94111</P>\n' +
  '<P CLASS="western"\n' +
  '        >\n' +
  '    In an effort to protect the rights of copyright owners, Outset maintains a policy for the termination, in\n' +
  '    appropriate circumstances, of Members and other users of this Site who are repeat infringers.</P>\n' +
  '<OL>\n' +
  '    <LI><H1>Agreement to Arbitrate</H1>\n' +
  '        <OL>\n' +
  '            <LI><H2>13.1 Agreement to Arbitrate</H2>\n' +
  '        </OL>\n' +
  '</OL>\n' +
  '<P>\n' +
  '    This Section 13 is referred to in these Terms as the &quot;Arbitration Agreement&quot;. Unless you opt- out in\n' +
  '    accordance with the opt-out procedures set forth below, you agree that any and all disputes or claims that have\n' +
  '    arisen or may arise between you and Outset or a Outset Affiliate, whether relating to these Terms (including any\n' +
  '    alleged breach thereof), the Services, the Site, or otherwise, shall be resolved exclusively through <I><B>final</B></I><I><B> </B></I><I><B>and</B></I><I><B> </B></I><I><B>binding</B></I><I><B> </B></I><I><B>arbitration,</B></I><I><B> </B></I><I><B>rather</B></I><I><B> </B></I><I><B>than</B></I><I><B> </B></I><I><B>a</B></I><I><B> </B></I><I><B>court</B></I><I><B> </B></I>in\n' +
  '    accordance with the terms of this Arbitration Agreement, except you may assert individual claims in small claims\n' +
  '    court, if your claims qualify. Your rights will be determined by a <I><B>neutral</B></I><I><B> </B></I><I><B>arbitrator,</B></I><I><B> </B></I><I><B>not</B></I><I><B> </B></I><I><B>a</B></I><I><B> </B></I><I><B>judge</B></I><I><B> </B></I><I><B>or</B></I><I><B> </B></I><I><B>jury</B></I>.\n' +
  '    The Federal Arbitration Act governs the interpretation and enforcement of this Arbitration Agreement.</P>\n' +
  '<H2>13.2 Prohibition of Class and Representative Actions and Non-Individualized Relief</H2> <H3\n' +
  '        >\n' +
  '    YOU AND OUTSET AGREE THAT EACH OF US MAY BRING CLAIMS AGAINST THE OTHER ONLY ON AN INDIVIDUAL BASIS AND NOT AS A\n' +
  '    PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE ACTION OR PROCEEDING. UNLESS BOTH YOU AND OUTSET\n' +
  '    AGREE OTHERWISE, THE ARBITRATOR MAY NOT CONSOLIDATE OR JOIN MORE THAN ONE PERSON\'S OR PARTY\'S CLAIMS AND MAY NOT\n' +
  '    OTHERWISE PRESIDE OVER ANY FORM OF A CONSOLIDATED, REPRESENTATIVE, OR CLASS PROCEEDING. ALSO, THE ARBITRATOR MAY\n' +
  '    AWARD RELIEF (INCLUDING MONETARY, INJUNCTIVE, AND DECLARATORY RELIEF) ONLY IN FAVOR OF THE INDIVIDUAL PARTY SEEKING\n' +
  '    RELIEF AND ONLY TO THE EXTENT NECESSARY TO PROVIDE RELIEF NECESSITATED BY THAT PARTY\'S INDIVIDUAL CLAIM(S). ANY\n' +
  '    RELIEF AWARDED CANNOT AFFECT OTHER OUTSET USERS.</H3>\n' +
  '<OL>\n' +
  '    <OL>\n' +
  '        <LI><P><B>13.3 Pre- Arbitration Dispute\n' +
  '            Resolution</B></P>\n' +
  '    </OL>\n' +
  '</OL>\n' +
  '<P>\n' +
  '    Outset is always interested in resolving disputes amicably and efficiently. So before you commence arbitration, we\n' +
  '    suggest that you contact us to explain your complaint, as we may be able to resolve it without the need for\n' +
  '    arbitration. You may contact us via email at <A HREF="mailto:support@joinoutset.com">support@joinoutset.com</A> or\n' +
  '    at Outset Partners, Inc., Attn: Legal Department, The Vault,415 Jackson St. Suite B, San Francisco, CA 94111.</P>\n' +
  '<H2>13.4 Arbitration Procedures</H2>\n' +
  '<P>\n' +
  '    Arbitration will be conducted by a neutral arbitrator in accordance with the American Arbitration Association\'s (&quot;AAA&quot;)\n' +
  '    rules and procedures, including the AAA\'s Supplementary Procedures for Consumer-Related Disputes (collectively, the\n' +
  '    &quot;AAA Rules&quot;), as modified by this Arbitration Agreement. For information on the AAA, please visit its\n' +
  '    website, <A HREF="http://www.adr.org/"><U>http://www.adr.org</U>.</A> Information about the AAA\'s Rules and fees for\n' +
  '    consumer disputes can be found at the AAA\'s consumer arbitration page, <A\n' +
  '        HREF="http://www.adr.org/consumer_arbitration"><U>http://www.adr.org/consumer_arbitration</U>.</A> If there is\n' +
  '    any inconsistency between the AAA Rules and this Arbitration Agreement, the terms of this Arbitration Agreement will\n' +
  '    control unless the arbitrator determines that the application of the inconsistent Arbitration Agreement terms would\n' +
  '    not result in a fundamentally fair arbitration. The arbitrator must also follow the provisions of these Terms as a\n' +
  '    court would, including without limitation, the limitation of liability provisions in Section 11. Although\n' +
  '    arbitration proceedings are usually simpler and more streamlined than trials and other judicial proceedings, the\n' +
  '    arbitrator can award the same damages and relief on an individual basis that a court can award to an individual\n' +
  '    under the Terms and applicable law. Decisions by the arbitrator are enforceable in court and may be overturned by a\n' +
  '    court only for very limited reasons.</P>\n' +
  '<P> To commence an arbitration\n' +
  '    against Outset, you must complete a short form, submit it to the AAA, and send a copy to Outset at Outset Partners,\n' +
  '    Inc., Attn: Legal Department, The Vault, 415 Jackson St. Suite B San Francisco, CA 94111. For more information, see\n' +
  '    the AAA\'s claim filing page, <A HREF="http://www.adr.org/fileacase"><U>http://www.adr.org/fileacase</U>.</A> You may\n' +
  '    represent yourself in the arbitration or be represented by an attorney or another representative. Once we receive\n' +
  '    your arbitration claim, we may assert any counterclaims we may have against you.</P>\n' +
  '<P>\n' +
  '    The arbitration shall be\n' +
  '    held in the county in which you reside or at another mutually agreed location. If the value of the relief sought is\n' +
  '    $10,000 or less you or Outset may elect to have the arbitration conducted by telephone or based solely on written\n' +
  '    submissions, which election shall be binding on you and Outset subject to the arbitrator\'s discretion to require an\n' +
  '    in-person hearing, if the circumstances warrant. Attendance at any in-person hearing may be made by telephone by you\n' +
  '    and/or Outset, unless the arbitrator requires otherwise.</P>\n' +
  '<P> The arbitrator will decide the\n' +
  '    substance of all claims in accordance with the laws of the State of Delaware, including recognized principles of\n' +
  '    equity, and will honor all claims of privilege recognized by law. The arbitrator shall not be bound by rulings in\n' +
  '    prior arbitrations involving different Outset users, but is bound by rulings in prior arbitrations involving the\n' +
  '    same Outset user to the extent required by applicable law.</P>\n' +
  '<H2>13.5 Costs of Arbitration</H2>\n' +
  '<P>\n' +
  '    Payment of all filing, administration, and arbitrator fees (collectively, the &quot;Arbitration Fees&quot;) will be\n' +
  '    governed by the AAA\'s Rules, unless otherwise provided in this Agreement to Arbitrate. If you demonstrate to the\n' +
  '    arbitrator that you are economically unable to pay your portion of the Arbitration Fees or if the arbitrator\n' +
  '    otherwise determines for any reason that you should not be required to pay your portion of the Arbitration Fees,\n' +
  '    Outset will pay your portion of such fees. In addition, if you demonstrate to the arbitrator that the costs of\n' +
  '    arbitration will be prohibitive as compared to the costs of litigation, Outset will pay as much of the Arbitration\n' +
  '    Fees as the arbitrator deems necessary to prevent the arbitration from being cost-prohibitive. Each party will be\n' +
  '    responsible for all other fees it incurs in connection with the arbitration, including without limitation, all\n' +
  '    attorney fees. In the event the arbitrator determines the claim(s) you assert in the</P>\n' +
  '<P CLASS="western"\n' +
  '\n' +
  '        >\n' +
  '    arbitration to be frivolous, you agree to reimburse Outset for all fees associated with the arbitration paid by\n' +
  '    Outset on your behalf that you otherwise would be obligated to pay under the AAA\'s rules.</P>\n' +
  '<H2>13.6 Confidentiality</H2>\n' +
  '<P>\n' +
  '    All aspects of the arbitration proceeding, and any ruling, decision or award by the arbitrator, will be strictly\n' +
  '    confidential for the benefit of all parties.</P>\n' +
  '<H2>13.7 Severability</H2>\n' +
  '<P>If a court\n' +
  '    decides that any term or provision of this Arbitration Agreement other than Section</P>\n' +
  '<P CLASS="western"\n' +
  '\n' +
  '        >\n' +
  '    13.2 is invalid or unenforceable, the parties agree to replace such term or provision with a term or provision that\n' +
  '    is valid and enforceable and that comes closest to expressing the intention of the invalid or unenforceable term or\n' +
  '    provision, and this Arbitration Agreement shall be enforceable as so modified. If a court decides that any of the\n' +
  '    provisions of Section 13.2 is invalid or unenforceable, then the entirety of this Arbitration Agreement shall be\n' +
  '    null and void. The remainder of the Terms will continue to apply.</P>\n' +
  '<H2>13.8 Opt-Out Procedure</H2>\n' +
  '<P>\n' +
  '    You can choose to reject this Arbitration Agreement by mailing us a written opt-out notice (&quot;Opt-Out Notice&quot;)\n' +
  '    in accordance with the terms of this Section. For new Outset users, the Opt- Out Notice must be postmarked no later\n' +
  '    than 30 Days after the date you accept these Terms for the first time or January 5, 2015, whichever is later. 3. You\n' +
  '    must mail the Opt-Out Notice to Outset Partners, Inc., Attn: Legal Department, 415 Jackson St Suite B, San\n' +
  '    Francisco, CA 94111. The Opt-Out Notice must state that you do not agree to the Arbitration Agreement and must\n' +
  '    include your name, address, phone number, and the email address(es) used to log in to the Outset account(s) to which\n' +
  '    the opt-out applies. You must sign the Opt-Out Notice for it to be effective. This procedure is the only way you can\n' +
  '    opt out of the Arbitration Agreement. If you opt out of the Arbitration Agreement, all other terms of these Terms\n' +
  '    will continue to apply. Opting out of the Arbitration Agreement has no effect on any previous, other, or future\n' +
  '    arbitration agreements that you may have with us.</P>\n' +
  '<H2>13.9 Future Changes to this Arbitration Agreement</H2>\n' +
  '<P>\n' +
  '    Notwithstanding any provision in these Terms to the contrary, you and we agree that if we make any change to this\n' +
  '    Arbitration Agreement (other than a change to any notice address or website link provided herein) in the future,\n' +
  '    that change shall not apply to any claim that was filed in a legal proceeding against Outset prior to the effective\n' +
  '    date of the change. Moreover, if we seek to terminate this Arbitration Agreement from these Terms, such termination\n' +
  '    shall not be effective until 30 days after the version of these Terms not containing the Arbitration Agreement is\n' +
  '    posted to the Site, and shall not be effective as to any claim that was filed in a legal proceeding against Outset\n' +
  '    prior to the effective date of removal.</P>\n' +
  '<H1>Governing Law and Jurisdiction</H1>\n' +
  '<P>\n' +
  '    These Terms, and any dispute between you and Outset, shall be governed by the laws of the State of Delaware without\n' +
  '    regard to principles of conflicts of law, provided that the Federal Arbitration Act shall govern the interpretation\n' +
  '    and enforcement of Section 13, the Arbitration Agreement. Unless you and we agree otherwise, in the event that the\n' +
  '    Arbitration Agreement 13 is found not to apply to you or to a particular claim or dispute (except for small-claims\n' +
  '    court actions), either as a result of your decision to opt- out of the Arbitration Agreement or as a result of a\n' +
  '    decision by the arbitrator or a court order, you agree that any claim or dispute that has arisen or may arise\n' +
  '    between you and Outset must be resolved exclusively by a state or federal court located in the State of Delaware. .\n' +
  '    You and Outset agree to submit to the personal jurisdiction of the courts located within the State of Delaware for\n' +
  '    the purpose of litigating all such claims or disputes.</P>\n' +
  '<H1> Miscellaneous</H1>\n' +
  '<P>\n' +
  '    Nothing in this Agreement shall be construed as making either party the partner, joint venture, agent, legal\n' +
  '    representative, employer, contractor or employee of the other. Neither party shall have, or hold itself out to any\n' +
  '    third party as having any authority to make any statements, representations or commitments of any kind, or to take\n' +
  '    any action, that shall be binding on the other, except as provided for herein or authorized in writing by the party\n' +
  '    to be bound. The invalidity, illegality or unenforceability of any term or provision of these Terms shall in no way\n' +
  '    effect the validity, legality or enforceability of any other term or provision of these Terms. In the event a term\n' +
  '    or provision is determined to be invalid or unenforceable, the parties agree to replace such term or provision with\n' +
  '    a term or provision that is valid and enforceable and that comes closest to expressing the intention of the invalid\n' +
  '    or unenforceable term or provision, and these Terms shall be enforceable as so modified. Each Affiliate (as defined\n' +
  '    in Section 1.2) is expressly made a third party beneficiary of this Agreement and may enforce this Agreement\n' +
  '    directly against you. This Agreement will be binding on and will inure to the benefit of the legal representatives,\n' +
  '    successors and assigns of the parties hereto.</P>\n' +
  '<H1>Contact Information</H1>\n' +
  '<P>\n' +
  '    If you have any questions or need further information as to the Site or Services provided by Outset, or need to\n' +
  '    notify Outset as to any matters relating to the Site or Services please contact Outset at:</P>\n' +
  '<P ALIGN=CENTER\n' +
  '        >\n' +
  '    Attn:\n' +
  '    Legal Department Outset Partners Inc. </P>\n' +
  '<P ALIGN=CENTER\n' +
  '        >\n' +
  '    The Vault</P>\n' +
  '<P ALIGN=CENTER>\n' +
  '    415 Jackson St Suite B</P>\n' +
  '<P ALIGN=CENTER> San\n' +
  '    Francisco, CA 94123</P> </BODY> \n' +
  '');
 $templateCache.put('/modules/drivers/views/templates/driver-badge.client.template.html',
  '<section>\n' +
  '    <h3 class="text-center text-danger">Controller Moved</h3>\n' +
  '    <span class="col-md-12 opaque-bg">\n' +
  '        <legend>Driver Profile</legend>\n' +
  '        <div class="list-group" data-ng-show="driver">\n' +
  '            <a data-ng-href="drivers/{{driver._id}}" class="list-group-item">\n' +
  '                <div class="row">\n' +
  '                    <div class="col-md-8">\n' +
  '                        <h4 class="list-group-item-heading">{{driver.name}}\n' +
  '                        </h4>\n' +
  '                    </div>\n' +
  '                    <div class="col-md-4">\n' +
  '                        <small class="list-group-item-text">\n' +
  '                            <p class="text-right">Added on\n' +
  '                                <span data-ng-bind="driver.created | date:\'shortDate\'"></span>\n' +
  '                            </p>\n' +
  '                        </small>\n' +
  '                    </div>\n' +
  '                </div>\n' +
  '\n' +
  '                <div class="row">\n' +
  '                    <div class="col-md-8 opaque-bg">\n' +
  '                        {{driver.about}}\n' +
  '                    </div>\n' +
  '                    <div class="col-md-4">\n' +
  '                        <label>Location:\n' +
  '                            <strong>{{driver.zip}}</strong>\n' +
  '                        </label>\n' +
  '                    </div>\n' +
  '                </div>\n' +
  '            </a>\n' +
  '        </div>\n' +
  '        <div class="alert alert-warning text-center" data-ng-hide="driver || !createEnabled">\n' +
  '            Want to drive? <a href="/drivers/create">create a profile</a>?\n' +
  '        </div>\n' +
  '    </span>\n' +
  '</section>\n' +
  '');
 $templateCache.put('/modules/drivers/views/templates/driver-inline.client.template.html',
  '<section name="os-driver-inline.directive">\n' +
  '\n' +
  '    <div class="col-md-2 text-center">\n' +
  '        <img ng-src="{{vm.driver.user.profileImageURL}}" class="img-thumbnail user-profile-picture" />\n' +
  '    </div>\n' +
  '\n' +
  '    <!-- Driver Inline Template Begin -->\n' +
  '\n' +
  '    <div class="col-md-10">\n' +
  '        <os-page-header title="{{vm.driver.user.displayName}}" level="h3">\n' +
  '            Member Since <span data-ng-bind="vm.driver.user.created | date:\'mediumDate\'"></span>\n' +
  '        </os-page-header>\n' +
  '\n' +
  '        <div class="row col-sm-12">\n' +
  '            <div data-ng-bind-html="vm.driver.about"></div>\n' +
  '\n' +
  '            <div class="col-sm-4">\n' +
  '                <label>Experience:</label>\n' +
  '                <div ng-repeat="exp in vm.driver.experience">\n' +
  '                    {{exp.title || \'Job\'}} - {{exp.startDate | date: \'shortDate\'}} to {{exp.endDate | date: \'shortDate\'}}\n' +
  '                    <span ng-hide="$last">,&nbsp;</span>\n' +
  '                    <p ng-hide="vm.driver.experience && vm.driver.experience.length > 0">None Added</p>\n' +
  '                </div>\n' +
  '            </div>\n' +
  '\n' +
  '            <div class="col-sm-4">\n' +
  '                <label>Location:</label>\n' +
  '                <span class="text-danger">TODO: Directivize</span>\n' +
  '                <ul><small>\n' +
  '                <li ng-show="vm.driver.user.addresses.length > 0" ng-repeat="address in vm.driver.user.addresses">\n' +
  '                    <strong>{{address.type}}</strong> {{address.city}}, {{address.state}} {{address.zipCode}}\n' +
  '                    <br ng-hide="$last"/>\n' +
  '                </li></small></ul>\n' +
  '\n' +
  '                <p ng-hide="vm.driver.user.addresses && vm.driver.user.addresses.length > 0">No Address on File</p>\n' +
  '            </div>\n' +
  '\n' +
  '            <div class="col-sm-4">\n' +
  '                <label>Licenses</label>\n' +
  '                <div ng-repeat="license in vm.driver.licenses">\n' +
  '\n' +
  '                    <p>\n' +
  '                        <i class="fa fa-credit-card"></i> &nbsp;{{license.state}}<span ng-if="license.type"> {{license.type}}</span> Driver License\n' +
  '                        <span ng-if="license.rating">: Class {{license.rating}}</span>\n' +
  '\n' +
  '                        <oset-list-endorsements model="vm.license.endorsements"></oset-list-endorsements>\n' +
  '                    </p>\n' +
  '\n' +
  '                </div>\n' +
  '                <p ng-show="vm.driver.licenses.length === 0">No License on File</p>\n' +
  '            </div>\n' +
  '\n' +
  '        </div>\n' +
  '    </div>\n' +
  '</section>\n' +
  '');
 $templateCache.put('/modules/drivers/views/templates/driver-profile.client.template.html',
  '<section name="os-driver.directive" class="panel panel-default">\n' +
  '    <div class="panel-heading">\n' +
  '        <h4>About Me<a data-ng-if="vm.canEdit" class="btn btn-link pull-right"\n' +
  '                       ui-sref="drivers.edit({driverId: vm.driver._id })">edit driver profile\n' +
  '            <i class="fa fa-pencil-square-o"></i>\n' +
  '        </a></h4>\n' +
  '    </div>\n' +
  '\n' +
  '    <div class="panel-body">\n' +
  '        <div data-ng-bind-html="vm.driver.about"></div>\n' +
  '    </div>\n' +
  '\n' +
  '    <div class="panel-heading" ng-show="vm.driver.experience.length > 0">\n' +
  '        <h4>Experience:</h4>\n' +
  '    </div>\n' +
  '    <div class="panel-body" ng-switch="!!(vm.driver.experience.length)">\n' +
  '        <oset-experience-list ng-switch-when="true"\n' +
  '                              list="vm.driver.experience" view-only="true" max-ct="5">\n' +
  '\n' +
  '        </oset-experience-list>\n' +
  '\n' +
  '        <p class="text-center" ng-switch-default>None Added</p>\n' +
  '    </div>\n' +
  '\n' +
  '    <div class="panel-heading" ng-show="vm.driver.interests.length > 0">\n' +
  '        <h4>Interests</h4>\n' +
  '    </div>\n' +
  '    <div class="panel-body text-center">\n' +
  '        <oset-categories model="vm.driver.interests" mode="view">\n' +
  '             <span ng-if="vm.canEdit">You can specify what kind of jobs you are interested in finding by <a\n' +
  '                     ui-sref="drivers.edit({driverId: vm.driver._id})">editing your driver profile</a>!</span>\n' +
  '            <span ng-if="!vm.canEdit">{{vm.driver.displayName}} has not yet entered any job type preferences or interests.</span></span>\n' +
  '        </oset-categories>\n' +
  '\n' +
  '    </div>\n' +
  '\n' +
  '    <div class="panel-heading">\n' +
  '        <h4>\n' +
  '            License\n' +
  '        </h4>\n' +
  '    </div>\n' +
  '    <div class="panel-body">\n' +
  '\n' +
  '        <div ng-repeat="license in vm.driver.licenses" class="license"\n' +
  '             ng-init="filtered = (vm.filterEndorsements(license))">\n' +
  '            <p>\n' +
  '                <i class="fa fa-credit-card"></i> &nbsp;{{license.state.name}}<span\n' +
  '                    ng-if="license.type"><span ng-if="license.rating"> Class {{license.rating | uppercase }}</span> {{license.type}}</span>\n' +
  '                Driver License\n' +
  '                <span class="pull-right" ng-if="!!filtered.length">\n' +
  '                    <small class="strong">Endorsements:</small>\n' +
  '\n' +
  '                    <oset-list-endorsements model="license.endorsements"></oset-list-endorsements>\n' +
  '                </span>\n' +
  '            </p>\n' +
  '\n' +
  '        </div>\n' +
  '        <p ng-show="!vm.driver.licenses || vm.driver.licenses.length <= 0">No License on File</p>\n' +
  '    </div>\n' +
  '\n' +
  '    <os-view-schedule data-ng-if="false" model="vm.driver.schedule"></os-view-schedule>\n' +
  '</section>\n' +
  '');
 $templateCache.put('/modules/drivers/views/templates/driver.client.template.html',
  '<section >\n' +
  '    <h3 class="text-center text-danger">Controller Moved</h3>\n' +
  '    <span class="col-md-12 opaque-bg">\n' +
  '        <div data-ng-show="!!driver.$resolved || !!driver">\n' +
  '            <div class="row">\n' +
  '                <div class="col-md-8">\n' +
  '                    <h4 class="list-group-item-heading">{{driver.user.displayName}}\n' +
  '                    </h4>\n' +
  '                </div>\n' +
  '                <div class="col-md-4">\n' +
  '                    <small class="list-group-item-text">\n' +
  '                        <p class="text-right">Added on\n' +
  '                            <span data-ng-bind="driver.created | date:\'shortDate\'"></span>\n' +
  '                        </p>\n' +
  '                    </small>\n' +
  '                </div>\n' +
  '            </div>\n' +
  '\n' +
  '            <div class="row">\n' +
  '                <div class="col-md-8 opaque-bg">\n' +
  '                    {{driver.experience}}\n' +
  '                </div>\n' +
  '                <div class="col-md-4">\n' +
  '                    <label>IsActive:\n' +
  '                        <strong>{{driver.isActive}}</strong>\n' +
  '                    </label>\n' +
  '                </div>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '        <div class="alert alert-warning text-center" data-ng-hide="!!driver || !createEnabled">\n' +
  '            Are you a driver? <a href="/drivers/create">create a profile!</a>?\n' +
  '        </div>\n' +
  '        <div>Create Enabled: {{createEnabled}}</div>\n' +
  '    </span>\n' +
  '</section>\n' +
  '');
 $templateCache.put('/modules/drivers/views/templates/experience-list.client.template.html',
  '<section name="experience-list.client.template">\n' +
  '    <div class="row profile-row">\n' +
  '        <div class="col-sm-12" ng-switch="!!(vm.models && vm.models.length > 0)">\n' +
  '\n' +
  '            <oset-experience-item data-ng-repeat="exp in vm.models | limitTo: vm.maxCt"\n' +
  '                                  model="exp" is-last="$last" ng-switch-when="true"\n' +
  '                                  view-only="vm.viewOnly" can-edit="vm.canEdit" edit-mode="exp.isFresh && vm.isEditing"\n' +
  '                                  add-fn="vm.add" drop-fn="vm.drop" is-last="$last">\n' +
  '            </oset-experience-item>\n' +
  '\n' +
  '            <div class="text-center" ng-switch-default>\n' +
  '                <button type="button" class="btn btn-oset-primary" ng-click="vm.add()">\n' +
  '                    <i class="fa fa-plus-circle" style="padding-right: 10px;"></i> Add Experience\n' +
  '                </button>\n' +
  '            </div>\n' +
  '\n' +
  '            <p class="text-center" ng-if="vm.models.length > vm.maxCt">\n' +
  '                <button type="button" class="btn btn-oset-link" ng-click="(vm.maxCt = vm.maxCt+5);">view more ...</button>\n' +
  '            </p>\n' +
  '\n' +
  '        </div>\n' +
  '    </div>\n' +
  '</section>\n' +
  '');
 $templateCache.put('/modules/drivers/views/templates/experience.client.template.html',
  '<section class="experience">\n' +
  '\n' +
  '    <ng-form name="vm.experienceForm" ng-init="vm.activate()" class="edit form-horizontal" ng-show="vm.isEditing"\n' +
  '             ng-if="!vm.viewOnly">\n' +
  '\n' +
  '        <div class="row" ng-show="vm.experienceForm.$invalid && (vm.experienceForm.$submitted)">\n' +
  '            <div class="panel panel-danger mgn-btm col-md-8 col-md-offset-2">\n' +
  '                <div class="text-danger text-center mgn-vert">\n' +
  '                    {{vm.error || \'Please fill in required fields and correct errors\'}}\n' +
  '                </div>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '\n' +
  '        <div class="row mgn-vert"\n' +
  '             ng-class="{\'has-error\':(vm.experienceForm.title.$invalid || vm.experienceForm[\'hidden_title\'].$invalid) && (vm.experienceForm.$submitted || vm.experienceForm.title.$touched)}">\n' +
  '            <label class="col-sm-2 control-label">Job Title</label>\n' +
  '\n' +
  '            <div class="controls col-sm-9 controls">\n' +
  '                <input type="text" name="title" data-ng-model="vm.model.title" class="form-control"\n' +
  '                       placeholder="your title at this position"\n' +
  '                       ng-required="true"/>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '\n' +
  '        <div class="row mgn-vert"\n' +
  '             ng-class="{\'has-error\':(vm.experienceForm.description.$invalid || vm.experienceForm[\'hidden_description\'].$invalid) && (vm.experienceForm.$submitted || vm.experienceForm.description.$touched)}">\n' +
  '            <label class="col-sm-2 control-label">About</label>\n' +
  '\n' +
  '            <div class="controls col-sm-9 controls">\n' +
  '                <textarea name="description" class="form-control" data-ng-model="vm.model.description"\n' +
  '                          rows="3" ng-required="true" placeholder="describe your experience"></textarea>\n' +
  '                <!--<textarea os-html-edit model="vm.model.description"></textarea>-->\n' +
  '            </div>\n' +
  '        </div>\n' +
  '\n' +
  '        <div class="row mgn-vert">\n' +
  '            <label class="col-sm-2 control-label"\n' +
  '                   ng-class="{\'has-error\':(vm.experienceForm.time_start.$invalid || vm.experienceForm[\'hidden_time_start\'].$invalid) && vm.experienceForm.$submitted}">\n' +
  '                Time Period\n' +
  '            </label>\n' +
  '\n' +
  '            <div class="col-sm-9 form-inline">\n' +
  '                <div class="col-sm-5 input-group"\n' +
  '                     ng-class="{\'has-error\':(vm.experienceForm.time_start.$invalid || vm.experienceForm[\'hidden_time_start\'].$invalid) && (vm.experienceForm.$submitted || vm.experienceForm.time_start.$touched)}">\n' +
  '                    <div class="input-group-addon">{{ \'start\' | titlecase }}</div>\n' +
  '                    <date-input class="form-control" model="vm.model.startDate" os-name="time_start"\n' +
  '                                dformat="MM/DD/YYYY"></date-input>\n' +
  '\n' +
  '                    <input type="hidden" ng-model="vm.model.startDate" ng-required="vm.isRequired"\n' +
  '                           name="hidden_time_start">\n' +
  '                </div>\n' +
  '\n' +
  '                <div class="col-sm-5 input-group"\n' +
  '                     ng-class="{\'has-error\':(vm.experienceForm.time_end.$invalid || vm.experienceForm[\'hidden_time_end\'].$invalid) && (vm.experienceForm.$submitted || vm.experienceForm.time_end.$touched)}">\n' +
  '                    <div class="input-group-addon">{{ \'end\' | titlecase }}</div>\n' +
  '\n' +
  '                    <date-input class="form-control" model="vm.model.endDate" os-name="time_end"></date-input>\n' +
  '                    <input type="hidden" ng-model="vm.model.endDate" ng-required="vm.isRequired"\n' +
  '                           name="hidden_time_end">\n' +
  '\n' +
  '                </div>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '\n' +
  '        <div class="row mgn-vert"\n' +
  '             ng-class="{\'has-error\':(vm.experienceForm.location.$invalid || vm.experienceForm[\'hidden_location\'].$invalid) && (vm.experienceForm.$submitted || vm.experienceForm.location.$touched)}">\n' +
  '            <label class="col-sm-2 control-label">Location</label>\n' +
  '\n' +
  '            <div class="col-md-9 controls">\n' +
  '                <input type="text" data-ng-model="vm.model.location" class="form-control"\n' +
  '                       placeholder="where was this job?"\n' +
  '                       ng-required="true" name="location"/>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '\n' +
  '        <div class="clearfix"></div>\n' +
  '\n' +
  '        <div class="row">\n' +
  '            <div class="col-sm-11">\n' +
  '                <div class="pull-right">\n' +
  '                    <button type="button" class="btn btn-link" ng-click="vm.cancel($event)">\n' +
  '                        cancel\n' +
  '                    </button>\n' +
  '\n' +
  '                    <button type="button" class="btn btn-oset-primary" ng-click="vm.save(\'save\')">\n' +
  '                        <i class="fa fa-check-circle" style="padding-right: 10px;"></i>save\n' +
  '                    </button>\n' +
  '\n' +
  '                    <button type="button" class="btn btn-oset-primary" ng-click="vm.save(\'add\')" ng-if="!!vm.addFn">\n' +
  '                        <i class="fa fa-plus-circle" style="padding-right: 10px;"></i> add another\n' +
  '                    </button>\n' +
  '                </div>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '    </ng-form>\n' +
  '\n' +
  '    <section class="experience view col-xs-12" ng-hide="vm.isEditing" ng-switch="vm.confirmDelete"\n' +
  '             ng-class="{\'last\':vm.isLast && !vm.canEdit}">\n' +
  '        <p class="top-header">\n' +
  '            <strong>\n' +
  '                {{vm.model.title}}\n' +
  '            </strong>\n' +
  '            <small class="pull-right">\n' +
  '                {{vm.model.location}}\n' +
  '            </small>\n' +
  '        </p>\n' +
  '\n' +
  '        <p class="sub-header" ng-class="{\'no-mgn-btm\': !vm.canEdit && !vm.model.expanded}">\n' +
  '            <small>\n' +
  '                <span ng-show="!vm.canEdit"\n' +
  '                      ng-click="vm.model.expanded = !vm.model.expanded"\n' +
  '                      class="pull-left pointer text-oset">\n' +
  '                    <i class="fa" ng-class="{\'fa-caret-right\': !vm.model.expanded, \'fa-caret-down\': !!vm.model.expanded}"></i>\n' +
  '                    {{ !!vm.model.expanded ? \'hide\' : \'show details...\'}}\n' +
  '                </span>\n' +
  '                &nbsp;\n' +
  '                <span class="text-muted pull-right"\n' +
  '                      ng-bind="vm.getDateRangeString(vm.model.startDate, vm.model.endDate)">\n' +
  '\n' +
  '                </span>\n' +
  '            </small>\n' +
  '        </p>\n' +
  '\n' +
  '        <p class="pnl-body" ng-show="vm.model.expanded || vm.canEdit">{{vm.model.description}}</p>\n' +
  '\n' +
  '        <p class="pnl-controls" ng-if="vm.canEdit">\n' +
  '            &nbsp;\n' +
  '            <span class="pull-right">\n' +
  '                <span class="text-danger" ng-switch-when="true">\n' +
  '                    Are you sure you wish to delete this experience item?\n' +
  '                    <button type="button" class="btn btn-oset-link btn-oset-danger"\n' +
  '                            ng-click="vm.drop(vm.model)">\n' +
  '                        YES\n' +
  '                    </button>\n' +
  '                    <button type="button" class="btn btn-oset-link btn-oset-danger"\n' +
  '                            ng-click="vm.confirmDelete = false;">\n' +
  '                        NO\n' +
  '                    </button>\n' +
  '                </span>\n' +
  '\n' +
  '                <span ng-switch-default>\n' +
  '                    <button type="button" class="btn btn-oset-link"\n' +
  '                            ng-click="vm.confirmDelete = true;">\n' +
  '                        <i class="fa fa-trash"></i>delete\n' +
  '                    </button>\n' +
  '\n' +
  '                    <button type="button" class="btn btn-oset-link" ng-click="vm.edit()">\n' +
  '                        <i class="fa fa-pencil"></i>edit\n' +
  '                    </button>\n' +
  '                </span>\n' +
  '            </span>\n' +
  '        </p>\n' +
  '\n' +
  '    </section>\n' +
  '    <div class="pull-right" data-ng-show="vm.isLast && !vm.isEditing && vm.canEdit">\n' +
  '        <button type="button" class="btn btn-oset-primary" ng-click="vm.push()" ng-if="!!vm.push">\n' +
  '            <i class="fa fa-plus-circle" style="padding-right: 10px;"></i> add\n' +
  '        </button>\n' +
  '    </div>\n' +
  '</section>\n' +
  '');
 $templateCache.put('/modules/jobs/views/templates/job-list.client.template.html',
  '<section name="os-job-list.directive" class="outset-list">\n' +
  '\n' +
  '    <!-- SEARCH HEADER --->\n' +
  '    <div class="panel panel-default search-section" data-ng-if="!!vm.showSearch && !!vm.jobs.length">\n' +
  '        <form class="panel-body form-inline">\n' +
  '            <div class="col-sm-12 text-center mgn-btm">\n' +
  '                <oset-categories model="vm.jobTypes" summary="vm.jobCats" show-all="vm.showAllTypes" lbl-class="btn-sm no-mgn" mode="select"></oset-categories>\n' +
  '            </div>\n' +
  '\n' +
  '            <div class="form-group search">\n' +
  '                <input id="job-search" ng-model="vm.searchTerms" type="search"\n' +
  '                       class="form-control job-search"\n' +
  '                       ng-model-options="{ updateOn: \'default blur\', debounce: { \'default\': 300, \'blur\': 0 } }"\n' +
  '                       placeholder="search terms ...">\n' +
  '            </div>\n' +
  '\n' +
  '            <div class="form-group pull-right">\n' +
  '\n' +
  '                <div class="btn-group" role="group" aria-label="...">\n' +
  '                    <button type="button" class="btn btn-link no-pad-right" ng-show="!!vm.predicate"\n' +
  '                            ng-click="vm.toggleSort(null,true)">\n' +
  '                        <i class="fa fa-times"></i>\n' +
  '                    </button>\n' +
  '                    <button type="button" class="btn btn-link" ng-click="vm.toggleSort(\'posted\',true)">\n' +
  '                        <span ng-hide="!!vm.predicate">Sort by </span>\n' +
  '                        Posting Date\n' +
  '                        <i class="fa"\n' +
  '                           ng-show="!!vm.predicate"\n' +
  '                           ng-class="{\'fa-sort-amount-desc\':vm.reverse, \'fa-sort-amount-asc\':!vm.reverse}"></i>\n' +
  '                    </button>\n' +
  '                </div>\n' +
  '\n' +
  '                <button type="button" class="btn-tab btn-link read-more btn-sm"\n' +
  '                        ng-click="vm.toggleFilter(\'clear\')"\n' +
  '                        ng-disabled="vm.filters.clear"\n' +
  '                        name="clear"><i class="fa fa-times"></i></button>\n' +
  '\n' +
  '                <div class="btn-group">\n' +
  '                    <label class="btn btn-cta-secondary btn-sm"\n' +
  '                           ng-if="vm.user.type === \'owner\'"\n' +
  '                           ng-click="vm.toggleFilterMine()" btn-checkbox\n' +
  '                           ng-model="vm.filters.mine" name="mine">My Jobs</label>\n' +
  '                    <label class="btn btn-cta-secondary btn-sm"\n' +
  '                           ng-if="!!vm.user.driver.jobStatuses"\n' +
  '                           ng-click="vm.toggleFilter(\'unseen\')" btn-checkbox\n' +
  '                           ng-model="vm.filters.unseen" name="unseen">New</label>\n' +
  '                    <label class="btn btn-cta-secondary btn-sm"\n' +
  '                           ng-click="vm.toggleFilter(\'today\')" btn-checkbox\n' +
  '                           ng-model="vm.filters.day" name="newest">New Today</label>\n' +
  '                    <label class="btn btn-cta-secondary btn-sm"\n' +
  '                           ng-click="vm.toggleFilter(\'week\')" btn-checkbox\n' +
  '                           ng-model="vm.filters.week" name="newest">New This Week</label>\n' +
  '                </div>\n' +
  '\n' +
  '            </div>\n' +
  '        </form>\n' +
  '    </div>\n' +
  '\n' +
  '    <!--LIST ITEM REPEATER-->\n' +
  '    <div class="row">\n' +
  '        <div class="job-list blog-category-list">\n' +
  '\n' +
  '            <article class="post col-sm-12"\n' +
  '                     data-ng-repeat="job in (vm.jobs | filter: vm.jobCatFilter | filter: vm.filter | withinPastDays: \'posted\': vm.filters.numDays | filter: vm.searchTermFilter | orderBy: vm.predicate : vm.reverse | orderBy: vm.random  | limitTo: vm.limitTo)"\n' +
  '                     ng-if="vm.jobs"\n' +
  '                     ng-init="job.cats=_.pluck(_.where(job.categories, \'value\'), \'key\')"\n' +
  '                     ng-show="vm.visibleId === job._id || !vm.visibleId">\n' +
  '\n' +
  '                <!--Begin Job Item Content-->\n' +
  '                <div class="post-inner">\n' +
  '                    <div class="content lead-content">\n' +
  '                        <div class="list-picture" ng-if="job.company.profileImageURL">\n' +
  '                            <img ng-src="{{job.company.profileImageURL}}" class="img-responsive"/>\n' +
  '                        </div>\n' +
  '                        <div class="list-date">\n' +
  '                            {{job.posted | amDateFormat : \'L LT\'}}\n' +
  '                        </div>\n' +
  '                        <div class="date-label" ng-if="!job.company.profileImageURL">\n' +
  '                            <span class="month">{{(job.posted || job.created)  | amDateFormat : \'MMM\' | uppercase}}</span>\n' +
  '                            <span class="date-number">{{job.posted | amDateFormat : \'D\'}}</span>\n' +
  '                        </div>\n' +
  '                        <h3 class="post-title" ui-sref="jobs.view({jobId: job._id})">{{job.name}}</h3>\n' +
  '\n' +
  '                        <p>\n' +
  '                            <oset-categories model="job.categories" mode="view" lbl-class="btn-xs"></oset-categories>\n' +
  '                        </p>\n' +
  '                        <!--meta-->\n' +
  '                        <div class="row">\n' +
  '                            <div class="pull-right">\n' +
  '                                <button type="button" class="btn-tab btn-link read-more strong {{vm.btnClass}}"\n' +
  '                                        ng-click="vm.showTab()" ng-class="{\'hidden\':!vm.visibleId}">\n' +
  '                                    <i class="fa fa-close fa-lg mgn-right"></i>\n' +
  '                                </button>\n' +
  '                                <button type="button" class="btn-tab btn-link read-more strong {{vm.btnClass}}"\n' +
  '                                        ng-click="vm.showTab(job._id, \'applicants\', job.applications.length)"\n' +
  '                                        ng-show="job.company._id === (vm.companyId || vm.user.company.id)"\n' +
  '                                        ng-class="{\'active\': vm.visibleId === job._id && vm.visibleTab === \'applicants\'}">\n' +
  '                                    <i class="fa fa-users fa-lg mgn-right"></i>{{job.applications.length}} Applicants\n' +
  '                                </button>\n' +
  '                                <button type="button"\n' +
  '                                        class="btn-tab btn-link read-more strong {{vm.btnClass || \'mgn-left\'}}"\n' +
  '                                        ng-click="vm.showTab(job._id, \'details\')"\n' +
  '                                        ng-class="{\'active\': vm.visibleId === job._id && vm.visibleTab === \'details\'}">\n' +
  '                                    <i class="fa fa-lg fa-file-text mgn-right"></i>View Description\n' +
  '                                </button>\n' +
  '                                <button type="button"\n' +
  '                                        class="btn-tab btn-link read-more strong {{vm.btnClass || \'mgn-left\'}}"\n' +
  '                                        ui-sref="jobs.edit({jobId: job._id})"\n' +
  '                                        ng-show="job.company._id === (vm.companyId || vm.user.company.id)">\n' +
  '                                    <i class="fa fa-edit fa-lg mgn-right"></i>Edit\n' +
  '                                </button>\n' +
  '                                <button type="button"\n' +
  '                                        class="btn-tab btn-link read-more strong {{vm.btnClass || \'mgn-left\'}}"\n' +
  '                                        ui-sref="jobs.view({jobId: job._id})">\n' +
  '                                    <i class="fa fa-external-link fa-lg" ng-class="{\'mgn-right\': !vm.btnClass}"></i>\n' +
  '                                    <span ng-if="!vm.btnClass">{{vm.user.type === \'owner\' ? \'View\' : \'Apply\'}}</span>\n' +
  '                                </button>\n' +
  '                            </div>\n' +
  '                        </div>\n' +
  '                    </div>\n' +
  '\n' +
  '                    <div class="content body">\n' +
  '                        <div class="row  tab-body" ng-show="vm.visibleId === job._id">\n' +
  '                            <div class="post-entry col-xs-12" ng-show="vm.visibleTab === \'applicants\'">\n' +
  '                                <div class="text-center" ng-if="job.applications && job.applications.length">\n' +
  '                                    <button type="button" class="btn btn-cta-secondary">\n' +
  '                                        applicant details available here... <i class="fa fa-external-link"></i>\n' +
  '                                    </button>\n' +
  '                                </div>\n' +
  '                                <!--Disabled until applicant data can be fully populated-->\n' +
  '                                <!--<table class="table" ng-if="false && job.applications && job.applications.length">-->\n' +
  '                                    <!--<thead>-->\n' +
  '                                    <!--<tr>-->\n' +
  '                                        <!--<th></th>-->\n' +
  '                                        <!--<th>Applicant</th>-->\n' +
  '                                        <!--<th class="hidden-sm"></th>-->\n' +
  '                                        <!--<th></th>-->\n' +
  '                                        <!--<th></th>-->\n' +
  '                                    <!--</tr>-->\n' +
  '                                    <!--</thead>-->\n' +
  '                                    <!--<tbody>-->\n' +
  '                                    <!--<tr data-ng-repeat="application in job.applications"-->\n' +
  '                                        <!--ui-sref="applications.view({\'applicationId\': application._id})"-->\n' +
  '                                        <!--ng-class="{\'disabled\': application.disabled}"-->\n' +
  '                                        <!--oset-application-summary model="application" display-mode="table">-->\n' +
  '                                    <!--</tr>-->\n' +
  '                                    <!---->\n' +
  '                                    <!--</tbody>-->\n' +
  '                                <!--</table>-->\n' +
  '\n' +
  '                                <div class="list-group" ng-if="!(job.applications && job.applications.length)"\n' +
  '                                     ng-show="vm.visibleId === job._id">\n' +
  '                                    <div class="list-group-item text-center">\n' +
  '                                        <h4>No one has applied to this job yet. Would you like to <a\n' +
  '                                                ui-sref="jobs.edit({\'jobId\':job._id})">edit\n' +
  '                                            your post?</a></h4>\n' +
  '                                    </div>\n' +
  '\n' +
  '                                </div>\n' +
  '                            </div>\n' +
  '\n' +
  '                            <div class="post-entry col-sm-10 col-sm-offset-1" ng-show="vm.visibleTab === \'details\'">\n' +
  '                                <h4>Description</h4>\n' +
  '\n' +
  '                                <p ng-bind-html="job.description">No Description Available</p>\n' +
  '                                <h4>Requirements</h4>\n' +
  '\n' +
  '                                <p ng-bind-html="job.requirements">No Requirements Listed</p>\n' +
  '                            </div>\n' +
  '                        </div>\n' +
  '                        <a class="read-more strong pull-right" ng-click="vm.visibleId = null"\n' +
  '                           ng-class="{\'hidden\':!vm.visibleId}"> </a>\n' +
  '                    </div>\n' +
  '                    <!--//content-->\n' +
  '                </div>\n' +
  '                <!--//post-inner-->\n' +
  '            </article>\n' +
  '            <!--//post-->\n' +
  '\n' +
  '        </div>\n' +
  '    </div>\n' +
  '</section>\n' +
  '');
 $templateCache.put('/modules/jobs/views/templates/job.client.template.html',
  '<section class=\'job-item\' name="os-dm.job.directive">\n' +
  '    <section ng-if="dm.inline">\n' +
  '        <div class="row">\n' +
  '            <div class="col-md-8">\n' +
  '                <h4 class="list-group-item-heading">{{dm.job.name}}\n' +
  '                </h4>\n' +
  '            </div>\n' +
  '            <div class="col-md-4">\n' +
  '                <small class="list-group-item-text">\n' +
  '                    <p class="text-right">Added on\n' +
  '                        <span data-ng-bind="dm.job.created | date:\'shortDate\'"></span>\n' +
  '                    </p>\n' +
  '                </small>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '\n' +
  '        <div class="row hidden">\n' +
  '            <div class="col-md-12 opaque-bg">\n' +
  '                <span class="" ng-bind-html=\'dm.job.description | streamline | limitTo : 100\'\n' +
  '                      style="white-space: wrap; overflow:hidden; text-overflow: ellipsis; display: block;"></span>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '\n' +
  '        <div class="row">\n' +
  '            <div class="col-md-3">\n' +
  '                <span class="fa-stack fa-md pull-left">\n' +
  '                    <i class="fa fa-circle fa-stack-2x"></i>\n' +
  '                    <i class="fa fa-usd fa-stack-1x fa-inverse"></i>\n' +
  '                </span>\n' +
  '                <span>${{ dm.job.payRate.min }} to ${{ dm.job.payRate.max }} per Hour</span>\n' +
  '            </div>\n' +
  '            <div class="col-md-3">\n' +
  '                <span class="fa-stack fa-md pull-left">\n' +
  '                    <i class="fa fa-circle fa-stack-2x"></i>\n' +
  '                    <i class="fa fa-credit-card fa-stack-1x fa-inverse"></i>\n' +
  '                </span>\n' +
  '                <span>{{ dm.job.endorsements || "Operator - Class D" }}</span>\n' +
  '            </div>\n' +
  '            <div class="col-md-3">\n' +
  '                <span class="fa-stack fa-md pull-left">\n' +
  '                    <i class="fa fa-circle fa-stack-2x"></i>\n' +
  '                    <i class="fa fa-map-marker pull-left fa-stack-1x fa-inverse"></i>\n' +
  '                </span>\n' +
  '                <span>{{ dm.job.location.zipCode }}</span>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '    </section>\n' +
  '\n' +
  '    <section ng-if="!dm.inline">\n' +
  '\n' +
  '        <div class="panel panel-default job-info">\n' +
  '            <div class="panel-heading">\n' +
  '                <div class="btn-group" role="group" aria-label="...">\n' +
  '                    <button type="button" ng-class="{active : dm.showSection(\'description\', true)}"\n' +
  '                            ng-click=" dm.setDisplay( \'description\') " class="btn btn-link "><span class="h4">Description</span>\n' +
  '                    </button>\n' +
  '                    <button type="button" ng-class="{active : dm.showSection(\'requirements\', true)}"\n' +
  '                            ng-click="dm.setDisplay( \'requirements\') " class="btn btn-link "><span class="h4">Requirements</span>\n' +
  '                    </button>\n' +
  '                    <button type="button" ng-class="{active : dm.showSection(\'location\', true)}"\n' +
  '                            ng-click="dm.setDisplay( \'location\') " class="btn btn-link "><span\n' +
  '                            class="h4">Location</span>\n' +
  '                    </button>\n' +
  '                    <button type="button" ng-class="{active : dm.showSection(\'about\', true)}"\n' +
  '                            ng-click="dm.setDisplay( \'about\') " class="btn btn-link "><span\n' +
  '                            class="h4">About</span>\n' +
  '                    </button>\n' +
  '                </div>\n' +
  '\n' +
  '                <button type="button" ng-click="dm.setDisplay()" class="btn btn-link pull-right"><span\n' +
  '                        class="h4">&times;</span>\n' +
  '                </button>\n' +
  '            </div>\n' +
  '\n' +
  '            <div>\n' +
  '                <div class="panel-body" ng-show="dm.job.categories.length || dm.canEdit">\n' +
  '                    <oset-categories model="dm.job.categories" mode="view">\n' +
  '                         <span ng-if="dm.showEdit" class="text-center">You can help users to find your job by adding specific categories in\n' +
  '                             <a ui-sref="jobs.edit({jobId: dm.job._id})"> your driver profile</a></span>\n' +
  '                    </oset-categories>\n' +
  '                </div>\n' +
  '            </div>\n' +
  '\n' +
  '            <div ng-show="dm.showSection( \'description\') ">\n' +
  '                <div class="panel-heading" ng-show="dm.showSection(\'all\')"><span class="h4">Description</span></div>\n' +
  '                <div class="panel-body ">\n' +
  '                    <div ng-bind-html="dm.job.description">No Description Listed</div>\n' +
  '                    <hr/>\n' +
  '                </div>\n' +
  '            </div>\n' +
  '\n' +
  '            <div ng-show="dm.showSection( \'requirements\') ">\n' +
  '                <div class="panel-heading" ng-show="dm.showSection(\'all\')"><span class="h4">Requirements</span></div>\n' +
  '                <div class="panel-body ">\n' +
  '                    <div ng-bind-html="dm.job.requirements">No Requirements Listed</div>\n' +
  '                    <hr/>\n' +
  '                </div>\n' +
  '            </div>\n' +
  '\n' +
  '            <div ng-show="dm.showSection( \'location\') ">\n' +
  '                <div class="panel-heading" ng-show="dm.showSection(\'all\')"><span class="h4">Location</span></div>\n' +
  '                <div class="panel-body ">\n' +
  '                    <os-address model="dm.job.location[0]" data-ng-show="dm.job.location[0]"\n' +
  '                                enable-edit="false"></os-address>\n' +
  '                    <div class="text-center" data-ng-hide="dm.job.location[0]">No Location Available</div>\n' +
  '                    <hr/>\n' +
  '                </div>\n' +
  '            </div>\n' +
  '\n' +
  '            <div ng-show="dm.showSection( \'about\') ">\n' +
  '                <div class="panel-heading" ng-show="dm.showSection(\'all\')"><span class="h4">About the Company</span>\n' +
  '                </div>\n' +
  '                <div class="panel-body "><p data-ng-bind-html="dm.job.company.about">not available</p></div>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '    </section>\n' +
  '</section>\n' +
  '');
 $templateCache.put('/modules/jobs/views/templates/os-new-application-modal.client.template.html',
  '<span ng-click="vm.showModal()" ng-transclude>Apply</span>\n' +
  '\n' +
  '<script type="text/ng-template" id="applyModal.html">\n' +
  '    <div class="modal-header bg-primary" ng-init="yo()">\n' +
  '        <span class="h4" data-ng-bind="vm.placeholders.title">Apply to job</span>\n' +
  '\n' +
  '        <div class="pull-right">\n' +
  '            <button type="button" class="close modal-title" ng-click="$dismiss(\'cancel\')">\n' +
  '                <span aria-hidden="true">&times;<span class="sr-only">Close</span></span>\n' +
  '            </button>\n' +
  '        </div>\n' +
  '    </div>\n' +
  '    <form class="form-horizontal applicant-form" name="vm.applicantForm" data-ng-submit="vm.createApplication()" novalidate>\n' +
  '        <div class="modal-body">\n' +
  '            <fieldset>\n' +
  '                <span class="h4" for="message" ng-bind-html="vm.placeholders.messageHeading"></span>\n' +
  '                <p class="text-muted text-center" ng-bind-html="vm.placeholders.messageSubHeading"></p>\n' +
  '\n' +
  '                <div class="controls">\n' +
  '                    <div class="text-center text-muted" ng-show="!vm.application.message">\n' +
  '                        Please introduce yourself to the employer here\n' +
  '                    </div>\n' +
  '                    <textarea os-html-edit minimal type="text" data-ng-model="vm.application.message" name="message"\n' +
  '                              id="message" class="editor-md" placeholder="{{vm.placeholders.intro}}" ng-required="true"></textarea>\n' +
  '                </div>\n' +
  '                <div class="checkbox">\n' +
  '                    <label class="small">\n' +
  '                        <input type="checkbox" data-ng-model="vm.application.termsAccepted" data-ng-required="true" name="disclaimer"/>\n' +
  '                        <small data-ng-bind-html="vm.placeholders.disclaimer"></small>\n' +
  '                    </label>\n' +
  '                </div>\n' +
  '            </fieldset>\n' +
  '        </div>\n' +
  '        <div class="modal-footer">\n' +
  '            <div class="pull-right">\n' +
  '                <input type="button" class="btn btn-link" value="cancel" ng-click="$dismiss(\'cancel\')">\n' +
  '                <!--<input type="button" class="btn btn-oset-secondary" value="Save as draft" ng-click="vm.saveDraft()">-->\n' +
  '                <input type="submit" class="btn btn-oset-success" ng-class="{disabled:(!vm.job)}" value="Apply!">\n' +
  '            </div>\n' +
  '            <div data-ng-show="vm.error" class="text-danger text-center">\n' +
  '                <strong data-ng-bind="vm.error"></strong>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '    </form>\n' +
  '</script>\n' +
  '');
 $templateCache.put('/modules/license/views/license.client.template.html',
  '<ng-form name="vm.licenseForm" ng-init="vm.activate()">\n' +
  '    <div class="container-fluid license-details" ng-class="{\'form-horizontal\':vm.view.horizontal}">\n' +
  '\n' +
  '        <div class="row" ng-show="vm.licenseForm.$invalid && (vm.licenseForm.$submitted || vm.licenseForm.description.$dirty)">\n' +
  '            <div class="panel panel-danger mgn-btm col-md-8 col-md-offset-2">\n' +
  '                <div class="text-danger text-center mgn-vert">\n' +
  '                    Please fill in required fields and correct errors\n' +
  '                </div>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '\n' +
  '        <div class="row profile-row">\n' +
  '            <div ng-class="{\'col-sm-6\':vm.view.cols === 2, \'col-sm-12\': vm.view.cols === 1}">\n' +
  '\n' +
  '                <div class="form-group" ng-if="!!vm.view.types" ng-class="{\'col-sm-6\':vm.view.horizontal}">\n' +
  '                    <label class="control-label"\n' +
  '                           ng-class="{\'col-sm-12 col-md-6\': !vm.view.horizontal, \'col-sm-5\': vm.view.horizontal, \'text-danger\':vm.licenseForm.type.$invalid && vm.licenseForm.$submitted}">\n' +
  '                        License Type\n' +
  '                    </label>\n' +
  '\n' +
  '                    <div class="controls"\n' +
  '                         ng-class="{\'col-sm-10 col-md-6\': !vm.view.horizontal, \'col-sm-7\': vm.view.horizontal}">\n' +
  '                        <div class="btn-group">\n' +
  '                            <label ng-repeat="licenseType in vm.licenseTypes" class="btn btn-cta-secondary btn-sm"\n' +
  '                                   ng-model="vm.license.type" ng-required="true" name="type"\n' +
  '                                   btn-radio="licenseType">{{licenseType}}</label>\n' +
  '                        </div>\n' +
  '                    </div>\n' +
  '                </div>\n' +
  '\n' +
  '                <div class="form-group" ng-if="!!vm.view.classes"\n' +
  '                     ng-hide="vm.view.hideClasses && vm.license.type != \'Commercial\'"\n' +
  '                     ng-class="{\'col-sm-6\':vm.view.horizontal, \'disabled\':vm.license.type != \'Commercial\'}">\n' +
  '                    <label class="control-label"\n' +
  '                           ng-class="{\'col-sm-12 col-md-6\': !vm.view.horizontal, \'col-sm-5\': vm.view.horizontal}">\n' +
  '                        Class Rating\n' +
  '                    </label>\n' +
  '\n' +
  '                    <div class="controls"\n' +
  '                         ng-class="{\'col-sm-10 col-md-6\': !vm.view.horizontal, \'col-sm-7\': vm.view.horizontal}">\n' +
  '                        <div class="btn-group">\n' +
  '                            <label ng-repeat="val in vm.ratings" class="btn btn-cta-secondary btn-sm"\n' +
  '                                   ng-model="vm.license.rating" name="classRating"\n' +
  '                                   btn-radio="val">{{val}}</label>\n' +
  '                        </div>\n' +
  '                    </div>\n' +
  '                </div>\n' +
  '\n' +
  '                <div class="form-group" ng-if="!!vm.view.state" ng-class="{\'col-sm-6\':vm.view.horizontal}">\n' +
  '                    <label class="control-label"\n' +
  '                           ng-class="{\'col-sm-12 col-md-6\': !vm.view.horizontal, \'col-sm-5\': vm.view.horizontal,\'text-danger\':vm.licenseForm.state.$invalid && vm.licenseForm.$submitted}">\n' +
  '                        State\n' +
  '                    </label>\n' +
  '\n' +
  '                    <div class="controls"\n' +
  '                         ng-class="{\'col-sm-10 col-md-6\': !vm.view.horizontal, \'col-sm-7\': vm.view.horizontal}">\n' +
  '                        <input type="text" ng-model="vm.license.state" autocomplete="off"\n' +
  '                               typeahead="state as state.name for state in vm.states | filter:$viewValue | limitTo:8"\n' +
  '                               name="state" ng-required="true" class="form-control">\n' +
  '                    </div>\n' +
  '                </div>\n' +
  '\n' +
  '                <div class="form-group" ng-if="!!vm.view.expires" ng-class="{\'col-sm-6\':vm.view.horizontal}">\n' +
  '                    <label class="control-label"\n' +
  '                           ng-class="{\'col-sm-12 col-md-6\': !vm.view.horizontal, \'col-sm-5\': vm.view.horizontal, \'text-danger\':vm.licenseForm.expires.$invalid}">\n' +
  '                        Expiration Date\n' +
  '                    </label>\n' +
  '\n' +
  '                    <div class="controls"\n' +
  '                         ng-class="{\'col-sm-10 col-md-6\': !vm.view.horizontal, \'col-sm-7\': vm.view.horizontal}">\n' +
  '                        <date-input model="vm.license.expires" class="form-control" name="expires" placeholder="{{vm.dateFormat}}" name="expires" id="expiration"></date-input>\n' +
  '                    </div>\n' +
  '                </div>\n' +
  '\n' +
  '                <div class="form-group" ng-if="!!vm.view.dob" ng-class="{\'col-sm-6\':vm.view.horizontal}">\n' +
  '                    <label class="control-label"\n' +
  '                           ng-class="{\'col-sm-12 col-md-6\': !vm.view.horizontal, \'col-sm-5\': vm.view.horizontal, \'text-danger\':vm.licenseForm.dob.$invalid}">\n' +
  '                        Date of Birth\n' +
  '                        <br/>\n' +
  '                        <small>Your birthdate</small>\n' +
  '                    </label>\n' +
  '\n' +
  '                    <div class="controls"\n' +
  '                         ng-class="{\'col-sm-10 col-md-6\': !vm.view.horizontal, \'col-sm-7\': vm.view.horizontal}">\n' +
  '                        <date-input model="vm.license.dateOfBirth" class="form-control" name="dob" placeholder="{{vm.dateFormat}}"></date-input>\n' +
  '                    </div>\n' +
  '                </div>\n' +
  '            </div>\n' +
  '\n' +
  '            <div ng-class="{\'col-sm-6\':vm.view.cols === 2, \'col-sm-12\': vm.view.cols === 1}">\n' +
  '\n' +
  '\n' +
  '                <div class="form-group" ng-if="!!vm.view.endorsements">\n' +
  '                    <label class="control-label col-md-8 col-md-offset-2 col-xs-12 text-left-force">Endorsements<br>\n' +
  '                        <small>any endorsements on your license?</small>\n' +
  '                    </label>\n' +
  '                    <pre class=\'row\' ng-if="vm.debug">{{vm.license.endorsements}}</pre>\n' +
  '                    <div class="controls col-md-8 col-md-offset-2 col-xs-12">\n' +
  '                        <div class="btn-group btn-group-vertical center-block">\n' +
  '                            <label ng-repeat="endorsement in vm.endorsements"\n' +
  '                                   class="btn btn-cta-secondary btn-md container-fluid oset-toggles"\n' +
  '                                   ng-model="vm.license.endorsements[endorsement.key]"\n' +
  '                                   btn-checkbox data-ng-class="{\'active\':endorsement.value}">\n' +
  '                                <i class="fa pull-left"></i>\n' +
  '                                <div class="col-xs-4 text-left">{{endorsement.key}}</div>\n' +
  '                                <div class="col-xs-7 text-left">\n' +
  '                                    <small>{{endorsement.description}}\n' +
  '                                    </small>\n' +
  '                                </div>\n' +
  '                            </label>\n' +
  '                        </div>\n' +
  '                    </div>\n' +
  '                </div>\n' +
  '\n' +
  '            </div>\n' +
  '        </div>\n' +
  '    </div>\n' +
  '</ng-form>\n' +
  '');
 $templateCache.put('/modules/users/views/settings/file-upload.client.template.html',
  '<section class="container-fluid">\n' +
  '    <form class="signin form-horizontal" ng-show="vm.initialized">\n' +
  '        <fieldset>\n' +
  '\n' +
  '            <div class="text-center form-group" ng-if="!!vm.title">\n' +
  '                <span>{{vm.title}}</span>\n' +
  '            </div>\n' +
  '\n' +
  '            <div class="text-center form-group">\n' +
  '\n' +
  '                <div class="report-badges uploader mgn-vert" ng-if="!vm.hideIcon">\n' +
  '                    <span class="fa-stack fa-3x report-badge"\n' +
  '                            ng-class="{\'available\': !!vm.fileName}">\n' +
  '                        <i class="fa fa-file-o fa-stack-2x"></i>\n' +
  '                        <i class="fa fa-check fa-1x"></i>\n' +
  '                        <i class="fa fa-file fa-stack-2x"></i>\n' +
  '                        <i class="fa fa-question fa-1x"></i>\n' +
  '                    </span>\n' +
  '                </div>\n' +
  '\n' +
  '                <span class="btn {{vm.uploadBtnClass || \'btn-oset-secondary\'}} btn-file"\n' +
  '                      data-ng-hide="vm.uploader.queue.length && !vm.autoUpload">\n' +
  '                    {{vm.uploadBtnText || \'Select File ...\'}}\n' +
  '                    <input type="file" nv-file-select uploader="vm.uploader">\n' +
  '                </span>\n' +
  '            </div>\n' +
  '\n' +
  '            <div class="text-center form-group" data-ng-show="vm.uploader.queue.length && !vm.autoUpload">\n' +
  '                <button class="btn btn-link" data-ng-click="vm.cancelUpload();">Cancel</button>\n' +
  '                <button class="btn btn-oset-primary" data-ng-click="vm.uploadProfilePicture();">Upload</button>\n' +
  '            </div>\n' +
  '\n' +
  '            <div data-ng-show="!vm.success && !vm.error && vm.fileName && !vm.uploader.queue.length">\n' +
  '                {{vm.fileName}}\n' +
  '            </div>\n' +
  '            \n' +
  '            <div data-ng-show="vm.success" class="text-center text-success">\n' +
  '                <strong>{{!!vm.fileName ? vm.fileName + \' uploaded successfully!\' : \'Success!\'}}</strong>\n' +
  '            </div>\n' +
  '            <div data-ng-show="vm.error" class="text-center text-danger">\n' +
  '                <strong data-ng-bind="vm.error"></strong>\n' +
  '            </div>\n' +
  '\n' +
  '\n' +
  '        </fieldset>\n' +
  '    </form>\n' +
  '    <div ng-hide="vm.initialized" class="alert alert-danger" role="alert"><strong>Error!</strong> Unable to initialize\n' +
  '        the resume uploader. Please try again later.\n' +
  '    </div>\n' +
  '</section>\n' +
  '');
 $templateCache.put('/modules/users/views/settings/picture-modal.client.template.html',
  '<a class="btn btn-link" data-ng-click="show()">edit\n' +
  '    <i class="fa fa-pencil-square-o"></i>\n' +
  '\n' +
  '    <script type="text/ng-template" id="uploadPictureModal.html">\n' +
  '\n' +
  '        <div class="modal-header">\n' +
  '            <span class="modal-title h3 text-center">Upload a new picture</span>\n' +
  '            <div class="pull-right">\n' +
  '                <button type="button" class="close modal-title" ng-click="$dismiss(\'cancel\')"><span aria-hidden="true">&times;<span class="sr-only">Close</span></span></button>\n' +
  '            </div>\n' +
  '\n' +
  '            <div class="modal-body">\n' +
  '                <span ng-transclude></span>\n' +
  '            </div>\n' +
  '\n' +
  '            <div class="modal-footer">\n' +
  '\n' +
  '\n' +
  '            </div>\n' +
  '\n' +
  '        </div>\n' +
  '\n' +
  '    </script>\n' +
  '</a>\n' +
  '\n' +
  '\n' +
  '');
 $templateCache.put('/modules/users/views/settings/picture-upload.client.template.html',
  '<section class="container-fluid">\n' +
  '    <form class="signin form-horizontal" ng-show="vm.initialized">\n' +
  '        <fieldset>\n' +
  '\n' +
  '            <!--Section 1: Base State - Nothing Uploaded, nothing active -->\n' +
  '            <div class="form-group text-center mgn-vert" ng-hide="vm.newImage || vm.uploader.queue.length">\n' +
  '                <img data-ng-show="!!vm.imageURL" data-ng-src="{{vm.imageURL}}"\n' +
  '                     alt="{{vm.title}}" class="img-thumbnail user-profile-picture ng-hide">\n' +
  '\n' +
  '                <div data-ng-hide="!!vm.imageURL" class="report-badges uploader mgn-vert">\n' +
  '                    <span class="fa-stack fa-3x report-badge">\n' +
  '                        <i class="fa fa-user fa-stack-2x"></i>\n' +
  '                        <i class="fa fa-question fa-1x"></i>\n' +
  '                    </span>\n' +
  '                </div>\n' +
  '\n' +
  '                <div class="text-center form-group mgn-top" data-ng-hide="vm.uploader.queue.length">\n' +
  '                    <span ng-show="false && !!vm.imageURL" class="btn {{vm.uploadBtnClass || \'btn-oset-link\'}} btn-file"\n' +
  '                          ng-click="vm.startCrop()">\n' +
  '                        <!--Adjust Image Disabled due to imageURL != Image Object-->\n' +
  '                    </span>\n' +
  '                    <span class="btn {{vm.uploadBtnClass || \'btn-oset-secondary\'}} btn-file">\n' +
  '                        {{vm.uploadBtnText || \'Select Image ...\'}}\n' +
  '                        <input type="file" nv-file-select uploader="vm.uploader">\n' +
  '                    </span>\n' +
  '                </div>\n' +
  '            </div>\n' +
  '\n' +
  '            <!--Section 2: Upload in Progress-->\n' +
  '            <div class="form-group tvm.newImage text-center mgn-vert"\n' +
  '                 ng-show="(vm.newImage || vm.uploader.queue.length) && ( vm.autoCrop && !vm.isCropping || !vm.autoCrop )">\n' +
  '                <h4>Preview:</h4>\n' +
  '\n' +
  '                <div>\n' +
  '                    <img ng-src="{{vm.croppedImage}}" ng-show="vm.useCropped || vm.isCropping"\n' +
  '                         class="img-thumbnail user-profile-picture"/>\n' +
  '                    <img ng-src="{{vm.newImage}}" ng-hide="vm.useCropped || vm.isCropping"\n' +
  '                         class="img-thumbnail user-profile-picture"/>\n' +
  '\n' +
  '                </div>\n' +
  '\n' +
  '                <div class="text-center form-group" data-ng-show="vm.uploader.queue.length && !vm.isCropping">\n' +
  '                    <button class="btn btn-link" data-ng-click="vm.cancelUpload();">cancel</button>\n' +
  '                    <button class="btn btn-oset-primary" data-ng-click="vm.startCrop()">\n' +
  '                        {{ vm.useCropped ? \'Adjust\' : \'Crop\'}} Image\n' +
  '                    </button>\n' +
  '                    <button class="btn btn-oset-primary" data-ng-click="vm.uploadProfilePicture();">Upload</button>\n' +
  '                </div>\n' +
  '            </div>\n' +
  '\n' +
  '            <!--Section 3: Cropping in Progress-->\n' +
  '            <div class="form-group tvm.newImage mgn-vert" ng-show="vm.isCropping">\n' +
  '                <h4>Use the circle to select the best part of the image</h4>\n' +
  '\n' +
  '                <div class="text-center form-group" data-ng-hide="vm.autoCrop">\n' +
  '                    <button class="btn btn-link" data-ng-click="vm.cancelCrop()">cancel</button>\n' +
  '                    <button class="btn btn-link" data-ng-click="vm.saveCrop();">Save</button>\n' +
  '                </div>\n' +
  '\n' +
  '                <div class="form-group-text-center-mgn-vert">\n' +
  '                    <div class="cropArea center-block" class="img-thumbnail user-profile-picture"\n' +
  '                         style="background: #E4E4E4;overflow: hidden; width:400px; height:300px;">\n' +
  '                        <img-crop image="vm.newImage" area-type="{{vm.shape}}"\n' +
  '                                  result-image="vm.croppedImage"></img-crop>\n' +
  '                    </div>\n' +
  '                </div>\n' +
  '\n' +
  '                <div class="text-center form-group" data-ng-show="vm.autoCrop">\n' +
  '                    <button class="btn btn-link" data-ng-click="vm.cancelCrop()">cancel</button>\n' +
  '                    <button class="btn btn-oset-primary" data-ng-click="vm.saveCrop();">Save</button>\n' +
  '                </div>\n' +
  '            </div>\n' +
  '\n' +
  '            <!--Section 4: Status Text for success or error-->\n' +
  '            <div data-ng-show="vm.success" class="text-center text-success">\n' +
  '                <strong>Profile Picture Changed Successfully</strong>\n' +
  '            </div>\n' +
  '            <div data-ng-show="vm.error" class="text-center text-danger">\n' +
  '                <strong data-ng-bind="vm.error"></strong>\n' +
  '            </div>\n' +
  '        </fieldset>\n' +
  '        </fieldset>\n' +
  '    </form>\n' +
  '    <div ng-hide="vm.initialized" class="alert alert-danger" role="alert"><strong>Error!</strong> Unable to initialize\n' +
  '        the image uploader. Please try again later.\n' +
  '    </div>\n' +
  '</section>\n' +
  '');
 $templateCache.put('/modules/users/views/templates/addons.client.template.html',
  '<section>\n' +
  '        <div class="col-md-12">\n' +
  '            <div class="row-fluid">\n' +
  '            <h3>Make yourself stand out!\n' +
  '                <br>\n' +
  '                <small class="">add these premium features</small>\n' +
  '            </h3>\n' +
  '        </div>\n' +
  '\n' +
  '        <div class="col-md-12">\n' +
  '            <div class="col-md-1">\n' +
  '                <span class="glyphicon btn-lg glyphicon-certificate"></span>\n' +
  '            </div>\n' +
  '            <div class="col-md-9 col-md-offset-1">\n' +
  '                <h4>Background Check</h4>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '        <div class="col-md-12">\n' +
  '            <div class="col-md-1">\n' +
  '                <span class="glyphicon btn-lg glyphicon-certificate"></span>\n' +
  '            </div>\n' +
  '            <div class="col-md-9 col-md-offset-1">\n' +
  '                <h4>Drug Test Results</h4>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '        <div class="col-md-12">\n' +
  '            <div class="col-md-1">\n' +
  '                <span class="glyphicon btn-lg glyphicon-certificate"></span>\n' +
  '            </div>\n' +
  '            <div class="col-md-9 col-md-offset-1">\n' +
  '                <h4>DMV Records</h4>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '        <div class="col-md-12" style="height:10px;"></div>\n' +
  '        <div class="col-md-12 text-center ">\n' +
  '            <button type="submit" class="btn btn-large btn-oset-success">Go Premium!</button>\n' +
  '        </div>\n' +
  '</section>\n' +
  '');
 $templateCache.put('/modules/users/views/templates/edit-settings.client.template.html',
  '<form name="vm.userForm" data-ng-submit="vm.updateUserProfile(vm.userForm.$valid)" class="form" autocomplete="off">\n' +
  '    <fieldset class="create">\n' +
  '        <div class="form-group">\n' +
  '            <label class="control-label" for="name">Name</label>\n' +
  '\n' +
  '            <div class="form-inline margin-bottom-sm" name="name" id="name">\n' +
  '                <div class="input-group margin-bottom-sm" name="First">\n' +
  '                    <span class="input-group-addon">First</span>\n' +
  '                    <input class="form-control" type="text" data-ng-model="vm.profile.firstName" placeholder="First">\n' +
  '                </div>\n' +
  '\n' +
  '                <div class="input-group margin-bottom-sm" name="Last">\n' +
  '                    <span class="input-group-addon">Last</span>\n' +
  '                    <input class="form-control" type="text" data-ng-model="vm.profile.lastName" placeholder="Last">\n' +
  '                </div>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '\n' +
  '        <div class="form-group">\n' +
  '            <label for="email">Email/Username</label>\n' +
  '\n' +
  '            <div class="input-group margin-bottom-sm" id="email">\n' +
  '                <span class="input-group-addon">\n' +
  '                    <i class="fa fa-envelope-o fa-fw"></i>\n' +
  '                </span>\n' +
  '\n' +
  '                <p class="form-control-static" type="text" placeholder="Email address"\n' +
  '                   data-ng-bind="vm.profile.email"></p>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '\n' +
  '        <div class="form-group">\n' +
  '            <div class="panel panel-info col-md-10 col-md-offset-1">\n' +
  '                <h4>Looking for your username?</h4>\n' +
  '\n' +
  '                <p>In order to keep accounts linked with people, we use your email address as your username. If you\'d\n' +
  '                    like to change it, please <a href="mailto:accounts@joinoutset.com">let us know</a>!</p>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '\n' +
  '        <div class="form-group">\n' +
  '            <label for="addresses">Addresses</label>\n' +
  '            <div class="container-fluid" id="addresses">\n' +
  '                <os-address-list models="vm.profile.addresses" inline-edit="true" full-width="true" required="false"></os-address-list>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '\n' +
  '        <!-- Driver\'s Telephone -->\n' +
  '        <div class="form-group">\n' +
  '            <label for="phone">Phone</label>\n' +
  '\n' +
  '            <div class="input-group margin-bottom-sm" id="phone">\n' +
  '                <input class="form-control" type="tel" name="phone" data-ng-model="vm.profile.phone"\n' +
  '                       placeholder="(xxx) xxx-xxxx">\n' +
  '                <span class="input-group-addon">\n' +
  '                    <i class="fa fa-phone fa-fw"></i>\n' +
  '                </span>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '\n' +
  '        <div class="form-group" data-ng-show="vm.show">\n' +
  '            <div class="text-right form-group">\n' +
  '                <button type="button" value="cancel" class="btn btn-large btn-link" ng-click="vm.cancel()">cancel\n' +
  '                </button>\n' +
  '                <button type="submit" value="update" class="btn btn-large btn-oset-primary">Save Profile</button>\n' +
  '            </div>\n' +
  '            <div data-ng-show="vm.error" class="text-center text-danger">\n' +
  '                <strong data-ng-bind="vm.error"></strong>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '\n' +
  '\n' +
  '    </fieldset>\n' +
  '\n' +
  '    <div class="pull-right">\n' +
  '        <input type="submit" class="btn btn-oset-success" data-ng-class="{\'disabled\': vm.userForm.$pristine}" value="Save Changes">\n' +
  '    </div>\n' +
  '    <div data-ng-show="vm.error" class="text-center text-danger">\n' +
  '        <strong data-ng-bind="vm.error"></strong>\n' +
  '    </div>\n' +
  '    <div data-ng-show="vm.success" class="text-center text-success">\n' +
  '        <strong>Profile Saved Successfully!</strong>\n' +
  '    </div>\n' +
  '</form>\n' +
  '');
 $templateCache.put('/modules/users/views/templates/login-modal.client.template.html',
  '<span ng-click="vm.showLogin()" ng-transclude>Signin</span>\n' +
  '<!-- <a data-ui-sref="authentication.signin" target="_self">Sign In</a> -->\n' +
  '\n' +
  '<script type="text/ng-template" id="loginModal.html">\n' +
  '\n' +
  '    <div class="modal-header bg-primary" ng-init="vm.isOpen = true;">\n' +
  '        <span class="modal-title h3 text-center">Login to your account</span>\n' +
  '\n' +
  '        <span class="pull-right">\n' +
  '            <button type="button" class="close modal-title"\n' +
  '                    ng-click="$dismiss(\'cancel:\'+vm.credentials.username)"><span aria-hidden="true">\n' +
  '                <i class="fa fa-close fa-lg"></i>\n' +
  '                <span class="sr-only">Close</span></span>\n' +
  '            </button>\n' +
  '        </span>\n' +
  '    </div>\n' +
  '\n' +
  '    <form role="form" data-ng-submit="vm.signin()" class="signin form-horizontal" spellcheck="false" novalidate>\n' +
  '        <div class="modal-body">\n' +
  '\n' +
  '            <div class="form-group">\n' +
  '                <label ng-init="$element.focus()" for="username" class="col-sm-2 control-label">Email</label>\n' +
  '\n' +
  '                <div class="col-sm-10">\n' +
  '                    <input modal-focus="vm.isOpen" type="text" id="username" name="username" class="form-control"\n' +
  '                           data-ng-model="vm.credentials.username" placeholder="email address used for sign up">\n' +
  '                </div>\n' +
  '            </div>\n' +
  '\n' +
  '            <div class="form-group">\n' +
  '                <label for="password" class="col-sm-2 control-label">Password</label>\n' +
  '\n' +
  '                <div class="col-sm-10">\n' +
  '                    <input type="password" id="password" name="password" class="form-control"\n' +
  '                           data-ng-model="vm.credentials.password" placeholder="your password">\n' +
  '                </div>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '\n' +
  '        <div class="modal-footer">\n' +
  '            <div class="text-center form-group">\n' +
  '                <button type="submit" class="btn btn-oset-primary">Sign in</button>\n' +
  '            </div>\n' +
  '            <div class="forgot-password text-center mgn-vert" ng-show="vm.error">\n' +
  '                <a ui-sref="password.forgot" data-ng-click="$dismiss(\'forgot\')">Forgot your password?</a>\n' +
  '            </div>\n' +
  '            <div data-ng-show="vm.error" class="text-center text-danger mgn-top">\n' +
  '                <strong data-ng-bind="vm.error"></strong>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '\n' +
  '        </div>\n' +
  '\n' +
  '\n' +
  '    </form>\n' +
  '\n' +
  '</script>\n' +
  '');
 $templateCache.put('/modules/users/views/templates/schedule.client.template.html',
  '<section class="schedule">\n' +
  '    <div class="row availability-row">\n' +
  '        <div class="col-md-5">\n' +
  '            <label class="control-label" title="{{schedule.time.start}} to {{schedule.time.end}}">{{ schedule.description }}</label>\n' +
  '        </div>\n' +
  '\n' +
  '        <h3>Days: {{schedule.days}} ({{schedule.days.length}})</h3>\n' +
  '\n' +
  '        <div class="col-md-1" ng-repeat=\'(i,day) in schedule.days track by i\' ng-class="{yes: day, no: !day, unknown: (day || null === null)}">\n' +
  '            <input ng-disabled="!editMode" type="checkbox" ng-bind="schedule.days[i]" name="">\n' +
  '        </div>\n' +
  '    </div>\n' +
  '</section>\n' +
  '');
 $templateCache.put('/modules/users/views/templates/signup-apply.client.template.html',
  '<span ng-click="vm.show()" ng-transclude>Signup</span>\n' +
  '<!-- <a data-ui-sref="authentication.signup" target="_self">Sign Up</a>  -->\n' +
  '\n' +
  '<script type="text/ng-template" id="signupApplyModal.html">\n' +
  '    <div class="modal-header bg-primary" ng-show="!!vm.currentStep">\n' +
  '        <span class="modal-title h3 text-center">\n' +
  '            New Job Application\n' +
  '            </span>\n' +
  '    </div>\n' +
  '\n' +
  '    <form id="vm.newUserApplicationForm" class="modal-form">\n' +
  '        <div class="modal-body" ng-class="{\'bg-primary\': vm.currentStep === 0}">\n' +
  '\n' +
  '            <section class="signup-type row" id="step_0_signupType"\n' +
  '                     ng-form="vm.subForm0" ng-show="vm.currentStep === 0">\n' +
  '                <div class="row text-center">\n' +
  '                    <h2 class="lead-question">I want to ...</h2>\n' +
  '                </div>\n' +
  '                <div class="row text-center">\n' +
  '                    <div class="col-sm-6" ng-click="vm.selectUserType(\'driver\')">\n' +
  '                        <div class="type-option col-xs-offset-1 col-sm-offset-0 col-xs-10 col-sm-12">\n' +
  '                            <div class="col-xs-10 col-xs-offset-1 col-sm-12 col-sm-offset-0">\n' +
  '                                <img src="modules/users/img/steering-wheel.png" class="img-responsive center-block"/>\n' +
  '                            </div>\n' +
  '                            <br class="hidden-xs"/>\n' +
  '\n' +
  '                            <div class="heading h3">Drive</div>\n' +
  '                        </div>\n' +
  '                    </div>\n' +
  '                    <br class="visible-xs"/>\n' +
  '\n' +
  '                    <div class="col-sm-6" ng-click="vm.selectUserType(\'owner\')">\n' +
  '                        <div class="type-option col-xs-offset-1 col-sm-offset-0 col-xs-10 col-sm-12">\n' +
  '                            <div class="col-xs-10 col-xs-offset-1 col-sm-12 col-sm-offset-0">\n' +
  '                                <img src="modules/users/img/owner-group.png"\n' +
  '                                     class="img-responsive center-block text-center"/>\n' +
  '                            </div>\n' +
  '                            <br class="hidden-xs"/>\n' +
  '\n' +
  '                            <div class="heading h3">Hire</div>\n' +
  '                        </div>\n' +
  '                    </div>\n' +
  '                </div>\n' +
  '                <input type="hidden" ng-required="true" ng-model="vm.credentials.signupType"/>\n' +
  '            </section>\n' +
  '\n' +
  '            <section class="row" id="step_1_welcome"\n' +
  '                     ng-form="vm.subForm1" ng-show="vm.currentStep === 1">\n' +
  '\n' +
  '                <div class="col-sm-12">\n' +
  '\n' +
  '                    <p class="info col-sm-10 col-sm-offset-1">Lets get started with your email address and some basic\n' +
  '                        information\n' +
  '                        <br/>\n' +
  '                        <em class="text-muted">... or <a ng-click="$dismiss(\'login\')" login-modal>apply with an existing user</a> </em>\n' +
  '                    </p>\n' +
  '\n' +
  '                    <div class="form-group has-feedback col-md-8 col-md-offset-2 col-lg-6 col-lg-offset-3">\n' +
  '\n' +
  '                        <label for="email" class="control-label col-xs-12">Email</label>\n' +
  '\n' +
  '                        <div class="col-xs-12">\n' +
  '                            <input modal-focus="true" type="email" id="email" name="email"\n' +
  '                                   class="form-control" debounce\n' +
  '                                   data-ng-model="vm.credentials.email"\n' +
  '                                   placeholder="Email" ng-required="true">\n' +
  '\n' +
  '                            <span class="form-control-feedback"\n' +
  '                                  ng-show="vm.subForm0.email.$valid && vm.subForm0.email.$touched">\n' +
  '                                <i class="fa fa-check text-success"></i>\n' +
  '                            </span>\n' +
  '                            <span class="form-control-feedback"\n' +
  '                                  ng-show="vm.subForm0.email.$touched && vm.subForm0.email.$error.required">\n' +
  '                                <i class="fa fa-times text-danger" tootltip="Please enter an email address"></i>\n' +
  '                            </span>\n' +
  '                        </div>\n' +
  '\n' +
  '                    </div>\n' +
  '                </div>\n' +
  '\n' +
  '                <div class="col-xs-12">\n' +
  '                    <!--Enter your name-->\n' +
  '                    <div class="form-group has-feedback col-md-8 col-md-offset-2 col-lg-6 col-lg-offset-3">\n' +
  '                        <label class="control-label col-xs-12">Your Name</label>\n' +
  '\n' +
  '                        <div class="col-xs-6">\n' +
  '                            <input type="text" id="firstName" name="firstName"\n' +
  '                                   class="form-control" debounce ng-required="true"\n' +
  '                                   data-ng-model="vm.credentials.firstName" placeholder="First Name">\n' +
  '                        </div>\n' +
  '                        <div class="col-xs-6">\n' +
  '                            <input type="text" id="lastName" name="lastName"\n' +
  '                                   class="form-control" debounce ng-required="true"\n' +
  '                                   data-ng-model="vm.credentials.lastName" placeholder="Last Name">\n' +
  '                        </div>\n' +
  '                    </div>\n' +
  '\n' +
  '                    <p class="verify col-xs-12 text-center">\n' +
  '                        Your name will appear as <strong>{{vm.credentials.firstName || \'_________\'}}\n' +
  '                        {{vm.credentials.lastName || \'_________\'}}</strong>\n' +
  '                    </p>\n' +
  '                </div>\n' +
  '                <div class="col-xs-12">\n' +
  '                    <div class="form-group has-feedback col-md-8 col-md-offset-2 col-lg-6 col-lg-offset-3">\n' +
  '                        <label class="control-label col-xs-12">Your Zip Code\n' +
  '                            <i class="fa fa-info-circle mgn-left text-muted" tooltip="{{vm.about.zip}}"></i>\n' +
  '                        </label>\n' +
  '\n' +
  '                        <div class="col-xs-12">\n' +
  '                            <input type="text" id="zipCode" name="zipCode"\n' +
  '                                   class="form-control" debounce ng-required="true"\n' +
  '                                   data-ng-model="vm.credentials.addresses[0].zipCode" placeholder="Zip Code">\n' +
  '                        </div>\n' +
  '                    </div>\n' +
  '                </div>\n' +
  '\n' +
  '                <div class="col-sm-12">\n' +
  '                    <p class="info">\n' +
  '                    </p>\n' +
  '\n' +
  '                    <div class="form-group has-feedback col-md-8 col-md-offset-2 col-lg-6 col-lg-offset-3">\n' +
  '                        <label class="control-label col-xs-12">Password\n' +
  '                            <i class="fa fa-info-circle mgn-left text-muted" tooltip="{{vm.about.password}}"></i>\n' +
  '                        </label>\n' +
  '\n' +
  '                        <div class="col-xs-12">\n' +
  '                            <input type="password" id="password" name="password" class="form-control mgn-vert"\n' +
  '                                   data-ng-model="vm.credentials.password" placeholder="Password"\n' +
  '                                   ng-required="true">\n' +
  '\n' +
  '                            <input type="password" id="confirmPassword" name="confirmPassword"\n' +
  '                                   class="form-control mgn-vert"\n' +
  '                                   data-ng-model="vm.credentials.confirmPassword" placeholder="Confirm Password"\n' +
  '                                   ng-required="true" compare-to="vm.credentials.password">\n' +
  '                        </div>\n' +
  '                    </div>\n' +
  '\n' +
  '                    <div class="col-sm-10 col-sm-offset-1">\n' +
  '                        <p class="text-center">Do you agree to all conditions in the Outset <span\n' +
  '                                tos>Terms of Service</span>\n' +
  '                            <i class="fa"\n' +
  '                               ng-class="{\'fa-question\' : !vm.credentials.terms, \'fa-check-circle text-success fa-2x\': vm.credentials.terms==\'yes\', \'fa-times-circle-o text-danger\' : vm.credentials.terms==\'no\'}"></i>\n' +
  '                            <button ng-hide="vm.credentials.terms === \'yes\'" type="button"\n' +
  '                                    ng-click="vm.credentials.terms=\'yes\'" class="btn btn-oset-success btn-sm mgn-left">\n' +
  '                                Yes, I Agree\n' +
  '                            </button>\n' +
  '                        </p>\n' +
  '                    </div>\n' +
  '                </div>\n' +
  '\n' +
  '            </section>\n' +
  '\n' +
  '            <section class="row" id="step_2_background"\n' +
  '                     ng-form="vm.subForm2" ng-show="vm.currentStep === 2">\n' +
  '\n' +
  '\n' +
  '                <div class="col-xs-12">\n' +
  '                    <!--What type of license do you have? -->\n' +
  '                    <div class="form-group">\n' +
  '                        <p class="info col-sm-10 col-sm-offset-1">\n' +
  '                            What type of driver license do you have?\n' +
  '                        </p>\n' +
  '\n' +
  '                        <div class="col-sm-12 text-center">\n' +
  '                            <os-edit-license model="vm.driver.licenses[0]" form-name="licenseForm"\n' +
  '                                             mode="minimal"></os-edit-license>\n' +
  '                        </div>\n' +
  '                    </div>\n' +
  '                </div>\n' +
  '\n' +
  '                <div class="col-xs-12">\n' +
  '                    <!--What are you interested in -->\n' +
  '                    <div class="form-group">\n' +
  '                        <p class="info col-sm-10 col-sm-offset-1">\n' +
  '                            What types of jobs are you interested in?\n' +
  '                        </p>\n' +
  '\n' +
  '                        <div class="col-sm-12 text-center">\n' +
  '                            <oset-categories model="vm.driver.interests" mode="edit"></oset-categories>\n' +
  '                            <input type="hidden" name="interests" ng-model="vm.driver.interests"/>\n' +
  '                        </div>\n' +
  '                    </div>\n' +
  '                </div>\n' +
  '\n' +
  '                <div class="col-sm-12">\n' +
  '\n' +
  '                    <h4 class="col-sm-12">Work Experience</h4>\n' +
  '                    <p class="info col-sm-12">\n' +
  '                        Add information about past Experience to help employers know more about you and your\n' +
  '                        background.\n' +
  '                        <button type="button" class="btn btn-oset-link" ng-show="vm.driver.experience.length === 1"\n' +
  '                                ng-click="vm.driver.experience = [];"\n' +
  '                                event-focus="click" event-focus-id="introText">\n' +
  '                            skip\n' +
  '                        </button>\n' +
  '                    </p>\n' +
  '\n' +
  '                    <!--What are you interested in -->\n' +
  '                    <div class="form-group">\n' +
  '                        <div class="col-sm-12">\n' +
  '                            <oset-experience-list list="vm.driver.experience" can-edit="true"></oset-experience-list>\n' +
  '                        </div>\n' +
  '                    </div>\n' +
  '\n' +
  '                </div>\n' +
  '\n' +
  '                <div class="col-sm-12">\n' +
  '                    <!--Cover Letter-->\n' +
  '\n' +
  '                    <h4 class="col-sm-12">Cover Letter</h4>\n' +
  '                    <p class="info col-sm-12" ng-if="vm.about.messageSubHeading"\n' +
  '                       ng-bind-html="vm.about.messageSubHeading"></p>\n' +
  '\n' +
  '                    <div class="form-group"\n' +
  '                         ng-class="{\'has-error\': vm.subForm2.introText.$error && (vm.subForm2.$submitted || vm.subForm2.introText.$touched)}">\n' +
  '                        <div class="col-sm-12">\n' +
  '                            <div class="text-center text-muted pad-btm" ng-show="!vm.driver.about && !vm.introTextError">\n' +
  '                                Please introduce yourself to the employer here\n' +
  '                            </div>\n' +
  '                            <div class="text-center text-danger pad-btm" ng-show="vm.introTextError">\n' +
  '                                {{vm.introTextError}}\n' +
  '                            </div>\n' +
  '                            <textarea os-html-edit minimal type="text" data-ng-model="vm.driver.about"\n' +
  '                                      name="introText" id="introText" class="editor-md"\n' +
  '                                      placeholder="Please introduce yourself to the employer here"\n' +
  '                                      ng-required="true"></textarea>\n' +
  '                        </div>\n' +
  '\n' +
  '                    </div>\n' +
  '\n' +
  '                </div>\n' +
  '\n' +
  '            </section>\n' +
  '\n' +
  '            <section class="row" id="step_3_docs"\n' +
  '                     ng-form="vm.subForm3" ng-show="vm.currentStep === 3">\n' +
  '\n' +
  '                <div class="col-sm-12">\n' +
  '\n' +
  '                    <div class="col-sm-6">\n' +
  '                        <div class="text-center control-label">Profile Picture</div>\n' +
  '                        <os-picture-uploader model="vm.user" mode="user" success-callback="vm.userPicUploaded"\n' +
  '                                             auto-crop="true"\n' +
  '                                             title="Profile Picture" is-editing="vm.picIsEditing"></os-picture-uploader>\n' +
  '                    </div>\n' +
  '                    <div class="col-sm-6">\n' +
  '                        <oset-file-upload mode="resume"\n' +
  '                                          model="vm.driver.resume" model-id="vm.driver._id"\n' +
  '                                          title="Resume Upload" auto-upload="true"></oset-file-upload>\n' +
  '                    </div>\n' +
  '                </div>\n' +
  '\n' +
  '                <div class="col-sm-12">\n' +
  '                    <div class="checkbox">\n' +
  '                        <label class="small">\n' +
  '                            <input type="checkbox" data-ng-model="vm.application.termsAccepted" data-ng-required="true"\n' +
  '                                   name="disclaimer"/>\n' +
  '                            <small data-ng-bind-html="vm.about.disclaimer"></small>\n' +
  '                        </label>\n' +
  '                    </div>\n' +
  '                </div>\n' +
  '\n' +
  '            </section>\n' +
  '        </div>\n' +
  '\n' +
  '        <div class="modal-footer" ng-show="!!vm.currentStep || !!vm.error">\n' +
  '            <div class="pull-left">\n' +
  '                <button type="button" class="btn btn-oset-secondary"\n' +
  '                        ng-click="vm.prevStep()"\n' +
  '                        ng-hide="vm.currentStep === 0 || vm.currentStep === 1"\n' +
  '                        ng-class="{\'disabled\': vm.currentStep === 2}"\n' +
  '                        tabindex="-1">\n' +
  '                    <i class="fa fa-arrow-circle-left"></i>&nbsp;Back\n' +
  '                </button>\n' +
  '            </div>\n' +
  '            <div class="pull-right">\n' +
  '                <button type="button" class="btn btn-oset-primary"\n' +
  '                        ng-click="vm.createUser()"\n' +
  '                        ng-show="vm.currentStep === 1"\n' +
  '                        ng-class="{\'disabled\':vm.loading, \'disabled\':vm.credentials.terms != \'yes\'}">\n' +
  '                    Next&nbsp;<i class="fa fa-arrow-circle-right"></i>\n' +
  '                </button>\n' +
  '                <button type="button" class="btn btn-oset-primary"\n' +
  '                        ng-click="vm.saveDriverDetails()"\n' +
  '                        ng-show="vm.currentStep === 2"\n' +
  '                        ng-class="{\'disabled\':vm.loading}">\n' +
  '                    Next&nbsp;<i class="fa fa-arrow-circle-right"></i>\n' +
  '                </button>\n' +
  '                <button type="button" class="btn btn-oset-primary"\n' +
  '                        ng-click="vm.createApplication()"\n' +
  '                        ng-show="vm.currentStep === 3"\n' +
  '                        ng-class="{\'disabled\':vm.loading}">\n' +
  '                    Submit Application&nbsp;<i class="fa fa-check-circle"></i>\n' +
  '                </button>\n' +
  '            </div>\n' +
  '            <div data-ng-show="vm.error" class="text-center text-danger">\n' +
  '                <strong data-ng-bind="vm.error"></strong>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '\n' +
  '\n' +
  '    </form>\n' +
  '\n' +
  '</script>\n' +
  '');
 $templateCache.put('/modules/users/views/templates/signup-modal.client.template.html',
  '<span ng-click="vm.showSignup()" ng-transclude>Signup</span>\n' +
  '<!-- <a data-ui-sref="authentication.signup" target="_self">Sign Up</a>  -->\n' +
  '\n' +
  '<script type="text/ng-template" id="signupModal.html">\n' +
  '    <div class="modal-header bg-primary">\n' +
  '\n' +
  '        <div ng-hide="vm.credentials.signupType" class="container-fluid">\n' +
  '            <section class="signup-type">\n' +
  '                <div class="row text-center">\n' +
  '                    <h2 class="lead-question">I want to ... {{vm.credentials.signupType}}</h2>\n' +
  '                </div>\n' +
  '                <div class="row text-center">\n' +
  '                    <div class="col-sm-6" ng-click="vm.selectType(\'driver\', $event)">\n' +
  '                        <div class="type-option col-xs-offset-1 col-sm-offset-0 col-xs-10 col-sm-12">\n' +
  '                            <div class="col-xs-10 col-xs-offset-1 col-sm-12 col-sm-offset-0">\n' +
  '                            <img src="modules/users/img/steering-wheel.png" class="img-responsive center-block"/>\n' +
  '                            </div><br class="hidden-xs"/>\n' +
  '\n' +
  '                            <div class="heading h3">Drive</div>\n' +
  '                        </div>\n' +
  '                    </div>\n' +
  '                    <br class="visible-xs"/>\n' +
  '\n' +
  '                    <div class="col-sm-6" ng-click="vm.selectType(\'owner\', $event)">\n' +
  '                        <div class="type-option col-xs-offset-1 col-sm-offset-0 col-xs-10 col-sm-12">\n' +
  '                            <div class="col-xs-10 col-xs-offset-1 col-sm-12 col-sm-offset-0">\n' +
  '                            <img src="modules/users/img/owner-group.png" class="img-responsive center-block text-center"/>\n' +
  '                            </div><br class="hidden-xs"/>\n' +
  '\n' +
  '                            <div class="heading h3">Hire</div>\n' +
  '                        </div>\n' +
  '                    </div>\n' +
  '                </div>\n' +
  '            </section>\n' +
  '        </div>\n' +
  '\n' +
  '\n' +
  '        <div class="hidden-xs" ng-show="vm.credentials.signupType">\n' +
  '            <span class="modal-title h3 text-center">\n' +
  '                <button type="button" class="btn btn-link" ng-click="vm.credentials.signupType = null;"><i\n' +
  '                        class="fa fa-arrow-left fa-2x"></i></button>&nbsp;\n' +
  '                Sign up as {{vm.credentials.signupType == \'owner\' ? \'an\' : \'a\'}} {{vm.credentials.signupType}}\n' +
  '            </span>\n' +
  '\n' +
  '            <div class="pull-right">\n' +
  '                <button type="button" class="close modal-title"\n' +
  '                        ng-click="$dismiss(\'cancel:\'+vm.credentials.signupType)"><span aria-hidden="true">\n' +
  '                    <i class="fa fa-close fa-2x"></i>\n' +
  '                    <span class="sr-only">Close</span></span>\n' +
  '                </button>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '\n' +
  '        <div class="visible-xs" ng-show="vm.credentials.signupType">\n' +
  '            <span class="modal-title h4 text-center">\n' +
  '                <button type="button" class="btn btn-link" ng-click="vm.credentials.signupType = null;"><i\n' +
  '                        class="fa fa-arrow-left fa-lg"></i></button>&nbsp;\n' +
  '                {{vm.credentials.signupType | titlecase }} Sign Up\n' +
  '            </span>\n' +
  '\n' +
  '            <span class="pull-right">\n' +
  '                <button type="button" class="close modal-title"\n' +
  '                        ng-click="$dismiss(\'cancel:\'+vm.credentials.signupType)"><span aria-hidden="true">\n' +
  '                    <i class="fa fa-close fa-lg"></i>\n' +
  '                    <span class="sr-only">Close</span></span>\n' +
  '                </button>\n' +
  '            </span>\n' +
  '        </div>\n' +
  '    </div>\n' +
  '\n' +
  '\n' +
  '    <form role="form" data-ng-submit="vm.signup($event)" name="vm.signupForm"\n' +
  '          class="signin form-horizontal" spellcheck="false" novalidate>\n' +
  '\n' +
  '        <div class="modal-body" ng-show="vm.credentials.signupType">\n' +
  '            <p ng-if="!!vm.srefRedirect" class="text-muted text-center mgn-vert">\n' +
  '                <em><span>{{vm.extraText || \'Before continuing, please create an account\'}}</span> or <a ng-click="$dismiss(\'login\')" login-modal redirect="vm.srefRedirect">Log in with an existing account</a></span> </em>\n' +
  '            </p>\n' +
  '\n' +
  '            <div class="form-group" ng-show="vm.credentials.signupType === \'owner\'">\n' +
  '                <label for="companyName" class="col-sm-2 control-label">Business Name</label>\n' +
  '\n' +
  '                <div class="col-sm-10">\n' +
  '                    <input modal-focus="!!vm.credentials.signupType && vm.credentials.signupType === \'owner\'"\n' +
  '                           type="text" id="companyName" name="companyName" class="form-control"\n' +
  '                           data-ng-model="vm.credentials.companyName" placeholder="Name of your Business"\n' +
  '                            ng-required="!!vm.credentials.signupType && vm.credentials.signupType === \'owner\'">\n' +
  '                </div>\n' +
  '            </div>\n' +
  '\n' +
  '            <div class="form-group">\n' +
  '                <label for="firstName" class="col-sm-2 control-label">First Name</label>\n' +
  '\n' +
  '                <div class="col-sm-10">\n' +
  '                    <input modal-focus="!!vm.credentials.signupType && vm.credentials.signupType === \'driver\'"\n' +
  '                           type="text" ng-required="true" id="firstName" name="firstName" class="form-control"\n' +
  '                           data-ng-model="vm.credentials.firstName" placeholder="First Name">\n' +
  '                </div>\n' +
  '            </div>\n' +
  '\n' +
  '            <div class="form-group">\n' +
  '                <label for="lastName" class="col-sm-2 control-label">Last Name</label>\n' +
  '\n' +
  '                <div class="col-sm-10">\n' +
  '                    <input type="text" id="lastName" name="lastName" class="form-control"\n' +
  '                           data-ng-model="vm.credentials.lastName" placeholder="Last Name"\n' +
  '                           ng-required="true">\n' +
  '                </div>\n' +
  '            </div>\n' +
  '            <div class="form-group">\n' +
  '                <label for="email" class="col-sm-2 control-label">Email</label>\n' +
  '\n' +
  '                <div class="col-sm-10">\n' +
  '                    <input type="text" id="email" name="email" class="form-control" data-ng-model="vm.credentials.email"\n' +
  '                           placeholder="Email" ng-required="true">\n' +
  '                </div>\n' +
  '            </div>\n' +
  '            <div class="form-group">\n' +
  '                <label for="password" class="col-sm-2 control-label">Password</label>\n' +
  '\n' +
  '                <div class="col-sm-10">\n' +
  '                    <input type="password" id="password" name="password" class="form-control"\n' +
  '                           data-ng-model="vm.credentials.password" placeholder="Password"\n' +
  '                            ng-required="true">\n' +
  '                    <br/>\n' +
  '                    <input type="password" id="confirmPassword" name="confirmPassword" class="form-control"\n' +
  '                           data-ng-model="vm.credentials.confirmPassword" placeholder="Confirm Password"\n' +
  '                            ng-required="true" compare-to="vm.credentials.password">\n' +
  '                </div>\n' +
  '            </div>\n' +
  '\n' +
  '        </div>\n' +
  '\n' +
  '        <div class="modal-footer" ng-show="vm.credentials.signupType">\n' +
  '            <div class="col-sm-2 ">\n' +
  '                <label class="strong text-right" style="height:30px;">\n' +
  '                    Terms\n' +
  '                </label>\n' +
  '            </div>\n' +
  '\n' +
  '            <div class="col-sm-10">\n' +
  '                <p class="text-left">Do you agree to all conditions in the Outset <span tos>Terms of Service</span>\n' +
  '                    <i class="fa"\n' +
  '                       ng-class="{\'fa-question\' : !vm.credentials.terms, \'fa-check-circle text-success fa-2x\': vm.credentials.terms==\'yes\', \'fa-times-circle-o text-danger\' : vm.credentials.terms==\'no\'}"></i>\n' +
  '                    <button ng-hide="vm.credentials.terms === \'yes\'" type="button"\n' +
  '                            ng-click="vm.credentials.terms=\'yes\'" class="btn btn-oset-success btn-sm mgn-left">Yes,\n' +
  '                        I Agree!\n' +
  '                    </button>\n' +
  '                </p>\n' +
  '            </div>\n' +
  '\n' +
  '        </div>\n' +
  '\n' +
  '        <div class="modal-footer" ng-show="vm.credentials.signupType">\n' +
  '            <button type="submit" class="btn btn-oset-primary" ng-class="{\'disabled\':vm.credentials.terms != \'yes\'}">Sign\n' +
  '                Up!\n' +
  '            </button>\n' +
  '            <div data-ng-show="vm.error" class="text-center text-danger">\n' +
  '                <strong data-ng-bind="vm.error"></strong>\n' +
  '            </div>\n' +
  '        </div>\n' +
  '    </form>\n' +
  '\n' +
  '\n' +
  '</script>\n' +
  '');
 $templateCache.put('/modules/users/views/templates/user-badge.client.template.html',
  '<section>\n' +
  '    <a class="list-group-item row" data-ng-href="profiles/{{profile._id}}">\n' +
  '        <div class="col-md-3">\n' +
  '            <span class="fa-stack fa-2x">\n' +
  '                <i class="fa fa-square-o fa-stack-2x"></i>\n' +
  '                <i class="fa fa-user fa-stack-1x"></i>\n' +
  '            </span>\n' +
  '        </div>\n' +
  '\n' +
  '        <div class="col-md-9">\n' +
  '            <span class="h3">{{profile.displayName}}</span>\n' +
  '        </div>\n' +
  '    </a>\n' +
  '</section>\n' +
  '');
 $templateCache.put('/modules/users/views/templates/user-profile.client.template.html',
  '<section>\n' +
  '    <div ng-hide="ctrl.editMode.enabled" class="row-fluid">\n' +
  '        <legend class="pull-left">{{ctrl.title || \'Personal Information\'}}\n' +
  '            <div class="pull-right">\n' +
  '                <a class="btn btn-link" ng-click="ctrl.edit()" ng-if="ctrl.editable">\n' +
  '                    <i class="fa fa-pencil"></i>&nbsp;edit\n' +
  '                </a>\n' +
  '            </div>\n' +
  '        </legend>\n' +
  '\n' +
  '        <dl class="dl-horizontal">\n' +
  '            <dt>Name</dt>\n' +
  '            <dd>{{ctrl.profile.displayName}}</dd>\n' +
  '            <dt>Email</dt>\n' +
  '            <dd>{{ctrl.profile.email}}</dd>\n' +
  '            <dt>Phone</dt>\n' +
  '            <dd>{{ctrl.profile.phone}}</dd>\n' +
  '            <dt>({{ctrl.profile.addresses.length}}) Addresses</dt>\n' +
  '            <dd>\n' +
  '                <os-address-list addresses="ctrl.profile.addresses" is-editing="false" required="false"></os-address-list>\n' +
  '            </dd>\n' +
  '        </dl>\n' +
  '    </div>\n' +
  '</section>\n' +
  '');
}]);
