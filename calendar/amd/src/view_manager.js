// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * A javascript module to handler calendar view changes.
 *
 * @module     core_calendar/view_manager
 * @package    core_calendar
 * @copyright  2017 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
<<<<<<< OURS
define([
    'jquery',
    'core/templates',
    'core/str',
    'core/notification',
    'core_calendar/repository',
    'core_calendar/events',
    'core_calendar/selectors',
    'core/modal_factory',
    'core/modal_events',
    'core_calendar/summary_modal',
    'core/custom_interaction_events',
], function(
    $,
    Templates,
    Str,
    Notification,
    CalendarRepository,
    CalendarEvents,
    CalendarSelectors,
    ModalFactory,
    ModalEvents,
    SummaryModal,
    CustomEvents
) {

        /**
         * Register event listeners for the module.
         *
         * @param {object} root The root element.
         */
        var registerEventListeners = function(root) {
            root = $(root);

            // Bind click events to event links.
            root.on('click', CalendarSelectors.links.eventLink, function(e) {
                var target = $(e.target);
                var eventId = null;

                var eventLink;
                if (target.is(CalendarSelectors.actions.viewEvent)) {
                    eventLink = target;
                } else {
                    eventLink = target.closest(CalendarSelectors.actions.viewEvent);
                }

                if (eventLink.length) {
                    eventId = eventLink.data('eventId');
                } else {
                    eventId = target.find(CalendarSelectors.actions.viewEvent).data('eventId');
                }

                if (eventId) {
                    // A link was found. Show the modal.

                    e.preventDefault();
                    // We've handled the event so stop it from bubbling
                    // and causing the day click handler to fire.
                    e.stopPropagation();

                    renderEventSummaryModal(eventId);
                }
            });


            root.on('click', CalendarSelectors.links.navLink, function(e) {
                var wrapper = root.find(CalendarSelectors.wrapper);
                var view = wrapper.data('view');
                var courseId = wrapper.data('courseid');
                var categoryId = wrapper.data('categoryid');
                var link = $(e.currentTarget);

                if (view === 'month') {
                    changeMonth(root, link.attr('href'), link.data('year'), link.data('month'), courseId, categoryId,
                        link.data('day'));
                    e.preventDefault();
                } else if (view === 'day') {
                    changeDay(root, link.attr('href'), link.data('year'), link.data('month'), link.data('day'),
                        courseId, categoryId);
                    e.preventDefault();
                }

            });

            var viewSelector = root.find(CalendarSelectors.viewSelector);
            CustomEvents.define(viewSelector, [CustomEvents.events.activate]);
            viewSelector.on(
                CustomEvents.events.activate,
                function(e) {
                    e.preventDefault();

                    var option = $(e.target);
                    if (option.hasClass('active')) {
                        return;
                    }

                    var view = option.data('view'),
                        year = option.data('year'),
                        month = option.data('month'),
                        day = option.data('day'),
                        courseId = option.data('courseid'),
                        categoryId = option.data('categoryid');

                    if (view == 'month') {
                        refreshMonthContent(root, year, month, courseId, categoryId, root, 'core_calendar/calendar_month', day)
                            .then(function() {
                                return window.history.pushState({}, '', '?view=month');
                            }).fail(Notification.exception);
                    } else if (view == 'day') {
                        refreshDayContent(root, year, month, day, courseId, categoryId, root, 'core_calendar/calendar_day')
                            .then(function() {
                                return window.history.pushState({}, '', '?view=day');
                            }).fail(Notification.exception);
                    } else if (view == 'upcoming') {
                        reloadCurrentUpcoming(root, courseId, categoryId, root, 'core_calendar/calendar_upcoming')
                            .then(function() {
                                return window.history.pushState({}, '', '?view=upcoming');
                            }).fail(Notification.exception);
                    }
                }
            );
        };

        /**
         * Refresh the month content.
         *
         * @param {object} root The root element.
         * @param {Number} year Year
         * @param {Number} month Month
         * @param {Number} courseid The id of the course whose events are shown
         * @param {Number} categoryid The id of the category whose events are shown
         * @param {object} target The element being replaced. If not specified, the calendarwrapper is used.
         * @param {String} template The template to be rendered.
         * @param {Number} day Day (optional)
         * @return {promise}
         */
        var refreshMonthContent = function(root, year, month, courseid, categoryid, target, template, day) {
            startLoading(root);

            target = target || root.find(CalendarSelectors.wrapper);
            template = template || root.attr('data-template');
            day = day || 1;
            M.util.js_pending([root.get('id'), year, month, courseid].join('-'));
            var includenavigation = root.data('includenavigation');
            var mini = root.data('mini');
            return CalendarRepository.getCalendarMonthData(year, month, courseid, categoryid, includenavigation, mini, day)
                .then(function(context) {
                    context.viewingmonth = true;
                    return Templates.render(template, context);
                })
                .then(function(html, js) {
                    return Templates.replaceNode(target, html, js);
                })
                .then(function() {
                    $('body').trigger(CalendarEvents.viewUpdated);
                    return;
                })
                .always(function() {
                    M.util.js_complete([root.get('id'), year, month, courseid].join('-'));
                    return stopLoading(root);
                })
                .fail(Notification.exception);
        };

        /**
         * Handle changes to the current calendar view.
         *
         * @param {object} root The container element
         * @param {String} url The calendar url to be shown
         * @param {Number} year Year
         * @param {Number} month Month
         * @param {Number} courseid The id of the course whose events are shown
         * @param {Number} categoryid The id of the category whose events are shown
         * @param {Number} day Day (optional)
         * @return {promise}
         */
        var changeMonth = function(root, url, year, month, courseid, categoryid, day) {
            day = day || 1;
            return refreshMonthContent(root, year, month, courseid, categoryid, null, null, day)
                .then(function() {
                    if (url.length && url !== '#') {
                        window.history.pushState({}, '', url);
                    }
                    return arguments;
                })
                .then(function() {
                    $('body').trigger(CalendarEvents.monthChanged, [year, month, courseid, categoryid]);
                    return arguments;
                });
        };

        /**
         * Reload the current month view data.
         *
         * @param {object} root The container element.
         * @param {Number} courseId The course id.
         * @param {Number} categoryId The id of the category whose events are shown
         * @return {promise}
         */
        var reloadCurrentMonth = function(root, courseId, categoryId) {
            var year = root.find(CalendarSelectors.wrapper).data('year');
            var month = root.find(CalendarSelectors.wrapper).data('month');
            var day = root.find(CalendarSelectors.wrapper).data('day');

            if (typeof courseId === 'undefined') {
                courseId = root.find(CalendarSelectors.wrapper).data('courseid');
            }

            if (typeof categoryId === 'undefined') {
                categoryId = root.find(CalendarSelectors.wrapper).data('categoryid');
            }

            return refreshMonthContent(root, year, month, courseId, categoryId, null, null, day);
        };


        /**
         * Refresh the day content.
         *
         * @param {object} root The root element.
         * @param {Number} year Year
         * @param {Number} month Month
         * @param {Number} day Day
         * @param {Number} courseid The id of the course whose events are shown
         * @param {Number} categoryId The id of the category whose events are shown
         * @param {object} target The element being replaced. If not specified, the calendarwrapper is used.
         * @param {String} template The template to be rendered.
         *
         * @return {promise}
         */
        var refreshDayContent = function(root, year, month, day, courseid, categoryId, target, template) {
            startLoading(root);

            target = target || root.find(CalendarSelectors.wrapper);
            template = template || root.attr('data-template');
            M.util.js_pending([root.get('id'), year, month, day, courseid, categoryId].join('-'));
            var includenavigation = root.data('includenavigation');
            return CalendarRepository.getCalendarDayData(year, month, day, courseid, categoryId, includenavigation)
                .then(function(context) {
                    context.viewingday = true;
                    return Templates.render(template, context);
                })
                .then(function(html, js) {
                    return Templates.replaceNode(target, html, js);
                })
                .then(function() {
                    $('body').trigger(CalendarEvents.viewUpdated);
                    return;
                })
                .always(function() {
                    M.util.js_complete([root.get('id'), year, month, day, courseid, categoryId].join('-'));
                    return stopLoading(root);
                })
                .fail(Notification.exception);
        };

        /**
         * Reload the current day view data.
         *
         * @param {object} root The container element.
         * @param {Number} courseId The course id.
         * @param {Number} categoryId The id of the category whose events are shown
         * @return {promise}
         */
        var reloadCurrentDay = function(root, courseId, categoryId) {
            var wrapper = root.find(CalendarSelectors.wrapper);
            var year = wrapper.data('year');
            var month = wrapper.data('month');
            var day = wrapper.data('day');

            if (!courseId) {
                courseId = root.find(CalendarSelectors.wrapper).data('courseid');
            }

            if (typeof categoryId === 'undefined') {
                categoryId = root.find(CalendarSelectors.wrapper).data('categoryid');
            }

            return refreshDayContent(root, year, month, day, courseId, categoryId);
        };

        /**
         * Handle changes to the current calendar view.
         *
         * @param {object} root The root element.
         * @param {String} url The calendar url to be shown
         * @param {Number} year Year
         * @param {Number} month Month
         * @param {Number} day Day
         * @param {Number} courseId The id of the course whose events are shown
         * @param {Number} categoryId The id of the category whose events are shown
         * @return {promise}
         */
        var changeDay = function(root, url, year, month, day, courseId, categoryId) {
            return refreshDayContent(root, year, month, day, courseId, categoryId)
                .then(function() {
                    if (url.length && url !== '#') {
                        window.history.pushState({}, '', url);
                    }
                    return arguments;
                })
                .then(function() {
                    $('body').trigger(CalendarEvents.dayChanged, [year, month, courseId, categoryId]);
                    return arguments;
                });
        };

        /**
         * Set the element state to loading.
         *
         * @param {object} root The container element
         * @method startLoading
         */
        var startLoading = function(root) {
            var loadingIconContainer = root.find(CalendarSelectors.containers.loadingIcon);

            loadingIconContainer.removeClass('hidden');
        };

        /**
         * Remove the loading state from the element.
         *
         * @param {object} root The container element
         * @method stopLoading
         */
        var stopLoading = function(root) {
            var loadingIconContainer = root.find(CalendarSelectors.containers.loadingIcon);

            loadingIconContainer.addClass('hidden');
        };

        /**
         * Reload the current month view data.
         *
         * @param {object} root The container element.
         * @param {Number} courseId The course id.
         * @param {Number} categoryId The id of the category whose events are shown
         * @param {String} template The template to be rendered.
         * @param {object} target The element being replaced. If not specified, the calendarwrapper is used.
         * @return {promise}
         */
        var reloadCurrentUpcoming = function(root, courseId, categoryId, target, template) {
            startLoading(root);

            target = target || root.find(CalendarSelectors.wrapper);
            template = template || root.attr('data-template');

            if (typeof courseId === 'undefined') {
                courseId = root.find(CalendarSelectors.wrapper).data('courseid');
            }

            if (typeof categoryId === 'undefined') {
                categoryId = root.find(CalendarSelectors.wrapper).data('categoryid');
            }

            return CalendarRepository.getCalendarUpcomingData(courseId, categoryId)
                .then(function(context) {
                    context.viewingupcoming = true;
                    return Templates.render(template, context);
                })
                .then(function(html, js) {
                    return Templates.replaceNode(target, html, js);
                })
                .then(function() {
                    $('body').trigger(CalendarEvents.viewUpdated);
                    return;
                })
                .always(function() {
                    return stopLoading(root);
                })
                .fail(Notification.exception);
        };

        /**
         * Get the CSS class to apply for the given event type.
         *
         * @param {String} eventType The calendar event type
         * @return {String}
         */
        var getEventTypeClassFromType = function(eventType) {
            return 'calendar_event_' + eventType;
        };

        /**
         * Render the event summary modal.
         *
         * @param {Number} eventId The calendar event id.
         */
        var renderEventSummaryModal = function(eventId) {
            var typeClass = '';

            // Calendar repository promise.
            CalendarRepository.getEventById(eventId).then(function(getEventResponse) {
                if (!getEventResponse.event) {
                    throw new Error('Error encountered while trying to fetch calendar event with ID: ' + eventId);
                }
                var eventData = getEventResponse.event;
                typeClass = getEventTypeClassFromType(eventData.normalisedeventtype);

                return eventData;
            }).then(function(eventData) {
                // Build the modal parameters from the event data.
                var modalParams = {
                    title: eventData.name,
                    type: SummaryModal.TYPE,
                    body: Templates.render('core_calendar/event_summary_body', eventData),
                    templateContext: {
                        canedit: eventData.canedit,
                        candelete: eventData.candelete,
                        headerclasses: typeClass,
                        isactionevent: eventData.isactionevent,
                        url: eventData.url
                    }
                };

                // Create the modal.
                return ModalFactory.create(modalParams);

            }).done(function(modal) {
                // Handle hidden event.
                modal.getRoot().on(ModalEvents.hidden, function() {
                    // Destroy when hidden.
                    modal.destroy();
                });

                // Finally, render the modal!
                modal.show();

            }).fail(Notification.exception);
        };

        return {
            init: function(root, view) {
                registerEventListeners(root, view);
            },
            reloadCurrentMonth: reloadCurrentMonth,
            changeMonth: changeMonth,
            refreshMonthContent: refreshMonthContent,
            reloadCurrentDay: reloadCurrentDay,
            changeDay: changeDay,
            refreshDayContent: refreshDayContent,
            reloadCurrentUpcoming: reloadCurrentUpcoming
        };
    });
=======

import $ from 'jquery';
import Templates from 'core/templates';
import Notification from 'core/notification';
import * as CalendarRepository from 'core_calendar/repository';
import CalendarEvents from 'core_calendar/events';
import * as CalendarSelectors from 'core_calendar/selectors';
import ModalFactory from 'core/modal_factory';
import ModalEvents from 'core/modal_events';
import SummaryModal from 'core_calendar/summary_modal';
import CustomEvents from 'core/custom_interaction_events';

/**
 * Register event listeners for the module.
 *
 * @param {object} root The root element.
 */
const registerEventListeners = (root) => {
    root = $(root);

    // Bind click events to event links.
    root.on('click', CalendarSelectors.links.eventLink, (e) => {
        const target = e.target;
        let eventLink = null;
        let eventId = null;

        if (target.matches(CalendarSelectors.actions.viewEvent)) {
            eventLink = target;
        } else {
            eventLink = target.closest(CalendarSelectors.actions.viewEvent);
        }

        if (eventLink) {
            eventId = eventLink.dataset.eventId;
        } else {
            eventId = target.querySelector(CalendarSelectors.actions.viewEvent).dataset.eventId;
        }

        if (eventId) {
            // A link was found. Show the modal.

            e.preventDefault();
            // We've handled the event so stop it from bubbling
            // and causing the day click handler to fire.
            e.stopPropagation();

            renderEventSummaryModal(eventId);
        }
    });

    root.on('click', CalendarSelectors.links.navLink, (e) => {
        const wrapper = root.find(CalendarSelectors.wrapper);
        const view = wrapper.data('view');
        const courseId = wrapper.data('courseid');
        const categoryId = wrapper.data('categoryid');
        const link = e.currentTarget;

        if (view === 'month') {
            changeMonth(root, link.href, link.dataset.year, link.dataset.month, courseId, categoryId, link.dataset.day);
            e.preventDefault();
        } else if (view === 'day') {
            changeDay(root, link.href, link.dataset.year, link.dataset.month, link.dataset.day, courseId, categoryId);
            e.preventDefault();
        }
    });

    const viewSelector = root.find(CalendarSelectors.viewSelector);
    CustomEvents.define(viewSelector, [CustomEvents.events.activate]);
    viewSelector.on(
        CustomEvents.events.activate,
        (e) => {
            e.preventDefault();

            const option = e.target;
            if (option.classList.contains('active')) {
                return;
            }

            const view = option.dataset.view,
                year = option.dataset.year,
                month = option.dataset.month,
                day = option.dataset.day,
                courseId = option.dataset.courseid,
                categoryId = option.dataset.categoryid;

            if (view == 'month') {
                refreshMonthContent(root, year, month, courseId, categoryId, root, 'core_calendar/calendar_month', day)
                    .then(() => {
                        return window.history.pushState({}, '', '?view=month');
                    }).fail(Notification.exception);
            } else if (view == 'day') {
                refreshDayContent(root, year, month, day, courseId, categoryId, root, 'core_calendar/calendar_day')
                    .then(() => {
                        return window.history.pushState({}, '', '?view=day');
                    }).fail(Notification.exception);
            } else if (view == 'upcoming') {
                reloadCurrentUpcoming(root, courseId, categoryId, root, 'core_calendar/calendar_upcoming')
                    .then(() => {
                        return window.history.pushState({}, '', '?view=upcoming');
                    }).fail(Notification.exception);
            }
        }
    );
};

/**
 * Refresh the month content.
 *
 * @param {object} root The root element.
 * @param {number} year Year
 * @param {number} month Month
 * @param {number} courseId The id of the course whose events are shown
 * @param {number} categoryId The id of the category whose events are shown
 * @param {object} target The element being replaced. If not specified, the calendarwrapper is used.
 * @param {string} template The template to be rendered.
 * @param {number} day Day (optional)
 * @return {promise}
 */
export const refreshMonthContent = (root, year, month, courseId, categoryId, target = null, template = '', day = 1) => {
    startLoading(root);

    target = target || root.find(CalendarSelectors.wrapper);
    template = template || root.attr('data-template');
    M.util.js_pending([root.get('id'), year, month, courseId].join('-'));
    const includenavigation = root.data('includenavigation');
    const mini = root.data('mini');
    return CalendarRepository.getCalendarMonthData(year, month, courseId, categoryId, includenavigation, mini, day)
        .then(context => {
            context.viewingmonth = true;
            return Templates.render(template, context);
        })
        .then((html, js) => {
            return Templates.replaceNode(target, html, js);
        })
        .then(() => {
            document.querySelector('body').dispatchEvent(new Event(CalendarEvents.viewUpdated));
            return;
        })
        .always(() => {
            M.util.js_complete([root.get('id'), year, month, courseId].join('-'));
            return stopLoading(root);
        })
        .fail(Notification.exception);
};

/**
 * Handle changes to the current calendar view.
 *
 * @param {object} root The container element
 * @param {string} url The calendar url to be shown
 * @param {number} year Year
 * @param {number} month Month
 * @param {number} courseId The id of the course whose events are shown
 * @param {number} categoryId The id of the category whose events are shown
 * @param {number} day Day (optional)
 * @return {promise}
 */
export const changeMonth = (root, url, year, month, courseId, categoryId, day = 1) => {
    return refreshMonthContent(root, year, month, courseId, categoryId, null, '', day)
        .then((...args) => {
            if (url.length && url !== '#') {
                window.history.pushState({}, '', url);
            }
            return args;
        })
        .then((...args) => {
            $('body').trigger(CalendarEvents.monthChanged, [year, month, courseId, categoryId]);
            return args;
        });
};

/**
 * Reload the current month view data.
 *
 * @param {object} root The container element.
 * @param {number} courseId The course id.
 * @param {number} categoryId The id of the category whose events are shown
 * @return {promise}
 */
export const reloadCurrentMonth = (root, courseId = 0, categoryId = 0) => {
    const year = root.find(CalendarSelectors.wrapper).data('year');
    const month = root.find(CalendarSelectors.wrapper).data('month');
    const day = root.find(CalendarSelectors.wrapper).data('day');

    courseId = courseId || root.find(CalendarSelectors.wrapper).data('courseid');
    categoryId = categoryId || root.find(CalendarSelectors.wrapper).data('categoryid');

    return refreshMonthContent(root, year, month, courseId, categoryId, null, '', day);
};


/**
 * Refresh the day content.
 *
 * @param {object} root The root element.
 * @param {number} year Year
 * @param {number} month Month
 * @param {number} day Day
 * @param {number} courseId The id of the course whose events are shown
 * @param {number} categoryId The id of the category whose events are shown
 * @param {object} target The element being replaced. If not specified, the calendarwrapper is used.
 * @param {string} template The template to be rendered.
 *
 * @return {promise}
 */
export const refreshDayContent = (root, year, month, day, courseId, categoryId, target = null, template = '') => {
    startLoading(root);

    target = target || root.find(CalendarSelectors.wrapper);
    template = template || root.attr('data-template');
    M.util.js_pending([root.get('id'), year, month, day, courseId, categoryId].join('-'));
    const includenavigation = root.data('includenavigation');
    return CalendarRepository.getCalendarDayData(year, month, day, courseId, categoryId, includenavigation)
        .then((context) => {
            context.viewingday = true;
            return Templates.render(template, context);
        })
        .then((html, js) => {
            return Templates.replaceNode(target, html, js);
        })
        .then(() => {
            document.querySelector('body').dispatchEvent(new Event(CalendarEvents.viewUpdated));
            return;
        })
        .always(() => {
            M.util.js_complete([root.get('id'), year, month, day, courseId, categoryId].join('-'));
            return stopLoading(root);
        })
        .fail(Notification.exception);
};

/**
 * Reload the current day view data.
 *
 * @param {object} root The container element.
 * @param {number} courseId The course id.
 * @param {number} categoryId The id of the category whose events are shown
 * @return {promise}
 */
export const reloadCurrentDay = (root, courseId = 0, categoryId = 0) => {
    const wrapper = root.find(CalendarSelectors.wrapper);
    const year = wrapper.data('year');
    const month = wrapper.data('month');
    const day = wrapper.data('day');

    courseId = courseId || root.find(CalendarSelectors.wrapper).data('courseid');
    categoryId = categoryId || root.find(CalendarSelectors.wrapper).data('categoryid');

    return refreshDayContent(root, year, month, day, courseId, categoryId);
};

/**
 * Handle changes to the current calendar view.
 *
 * @param {object} root The root element.
 * @param {String} url The calendar url to be shown
 * @param {Number} year Year
 * @param {Number} month Month
 * @param {Number} day Day
 * @param {Number} courseId The id of the course whose events are shown
 * @param {Number} categoryId The id of the category whose events are shown
 * @return {promise}
 */
export const changeDay = (root, url, year, month, day, courseId, categoryId) => {
    return refreshDayContent(root, year, month, day, courseId, categoryId)
        .then((...args) => {
            if (url.length && url !== '#') {
                window.history.pushState({}, '', url);
            }
            return args;
        })
        .then((...args) => {
            $('body').trigger(CalendarEvents.dayChanged, [year, month, courseId, categoryId]);
            return args;
        });
};

/**
 * Set the element state to loading.
 *
 * @param {object} root The container element
 * @method startLoading
 */
const startLoading = (root) => {
    const loadingIconContainer = root.find(CalendarSelectors.containers.loadingIcon);

    loadingIconContainer.removeClass('hidden');
};

/**
 * Remove the loading state from the element.
 *
 * @param {object} root The container element
 * @method stopLoading
 */
const stopLoading = (root) => {
    const loadingIconContainer = root.find(CalendarSelectors.containers.loadingIcon);

    loadingIconContainer.addClass('hidden');
};

/**
 * Reload the current month view data.
 *
 * @param {object} root The container element.
 * @param {number} courseId The course id.
 * @param {number} categoryId The id of the category whose events are shown
 * @param {object} target The element being replaced. If not specified, the calendarwrapper is used.
 * @param {string} template The template to be rendered.
 * @return {promise}
 */
export const reloadCurrentUpcoming = (root, courseId = 0, categoryId = 0, target = null, template = '') => {
    startLoading(root);

    target = target || root.find(CalendarSelectors.wrapper);
    template = template || root.attr('data-template');
    courseId = courseId || root.find(CalendarSelectors.wrapper).data('courseid');
    categoryId = categoryId || root.find(CalendarSelectors.wrapper).data('categoryid');

    return CalendarRepository.getCalendarUpcomingData(courseId, categoryId)
        .then((context) => {
            context.viewingupcoming = true;
            return Templates.render(template, context);
        })
        .then((html, js) => {
            return Templates.replaceNode(target, html, js);
        })
        .then(() => {
            document.querySelector('body').dispatchEvent(new Event(CalendarEvents.viewUpdated));
            return;
        })
        .always(function() {
            return stopLoading(root);
        })
        .fail(Notification.exception);
};

/**
 * Get the CSS class to apply for the given event type.
 *
 * @param {string} eventType The calendar event type
 * @return {string}
 */
const getEventTypeClassFromType = (eventType) => {
    return 'calendar_event_' + eventType;
};

/**
 * Render the event summary modal.
 *
 * @param {Number} eventId The calendar event id.
 */
const renderEventSummaryModal = (eventId) => {
    let typeClass = '';

    // Calendar repository promise.
    CalendarRepository.getEventById(eventId).then((getEventResponse) => {
        if (!getEventResponse.event) {
            throw new Error('Error encountered while trying to fetch calendar event with ID: ' + eventId);
        }
        const eventData = getEventResponse.event;
        typeClass = getEventTypeClassFromType(eventData.normalisedeventtype);

        return eventData;
    }).then((eventData) => {
        // Build the modal parameters from the event data.
        const modalParams = {
            title: eventData.name,
            type: SummaryModal.TYPE,
            body: Templates.render('core_calendar/event_summary_body', eventData),
            templateContext: {
                canedit: eventData.canedit,
                candelete: eventData.candelete,
                headerclasses: typeClass,
                isactionevent: eventData.isactionevent,
                url: eventData.url
            }
        };

        // Create the modal.
        return ModalFactory.create(modalParams);

    }).done(function(modal) {
        // Handle hidden event.
        modal.getRoot().on(ModalEvents.hidden, function() {
            // Destroy when hidden.
            modal.destroy();
        });

        // Finally, render the modal!
        modal.show();

    }).fail(Notification.exception);
};

export const init = (root, view) => {
    registerEventListeners(root, view);
};
>>>>>>> THEIRS
