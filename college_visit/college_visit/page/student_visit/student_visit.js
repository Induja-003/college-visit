frappe.pages['student-visit'].on_page_load = function (wrapper) {

    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Students Visit Registration',
        single_column: true
    });


    // =====================================================
    // SHOW DASHBOARD
    // =====================================================

    show_dashboard(wrapper);


    // =====================================================
    // DASHBOARD
    // =====================================================

    function show_dashboard(wrapper) {

        $(wrapper).find('.layout-main-section').html(`

            <div class="student-visit-dashboard">

                <!-- HEADER -->

                <div class="student-visit-header">

                    <div>
                        <h2>Students Visit Registration</h2>

                        <p>
                            Manage student campus visits
                        </p>
                    </div>

                    <button
                        class="btn btn-primary"
                        id="register-new-visit">

                        + Register New Visit

                    </button>

                </div>


                <!-- DASHBOARD CARDS -->

                <div class="dashboard-cards">

                    <!-- TOTAL VISITS -->

                    <div class="visit-card">

                        <h4>Total Visits</h4>

                        <h2 id="total-visits">0</h2>

                    </div>


                    <!-- TOTAL VISITS -->

                    <div class="visit-card">

                        <h4>Today's Visits</h4>

                        <h2 id="total_visits">0</h2>

                    </div>


                    <!-- COLLEGES -->

                    <div class="visit-card">

                        <h4>Colleges</h4>

                        <h2 id="college-count">0</h2>

                    </div>


                    <!-- DEPARTMENTS -->

                    <div class="visit-card">

                        <h4>Departments</h4>

                        <h2 id="department-count">0</h2>

                    </div>

                </div>


                <!-- CHARTS -->

                <div class="dashboard-charts">

                    <!-- DEPARTMENT CHART -->

                    <div class="chart-card">

                        <div class="chart-header">

                            <h3>
                                Visits by Department
                            </h3>

                        </div>

                        <div id="department-chart"></div>

                    </div>


                    <!-- YEAR CHART -->

                    <div class="chart-card">

                        <div class="chart-header">

                            <h3>
                                Visits by Year
                            </h3>

                        </div>

                        <div id="year-chart"></div>

                    </div>

                </div>


                <!-- RECENT REGISTRATIONS -->

                <div class="recent-visits-section">

                    <div class="section-header">

                        <h3>
                            Recent Registrations
                        </h3>

                    </div>


                    <div id="recent-visits-list">

                        <p class="dashboard-placeholder">
                            Loading recent registrations...
                        </p>

                    </div>

                </div>


            </div>

        `);


        // =====================================================
        // REGISTER BUTTON
        // =====================================================

        $(wrapper)
            .find('#register-new-visit')
            .on('click', function () {

                show_registration_form(wrapper);

            });


        // =====================================================
        // LOAD DASHBOARD DATA
        // =====================================================

        load_dashboard_stats(wrapper);

        load_recent_visits(wrapper);

        load_department_chart(wrapper);

        load_year_chart(wrapper);

    }


    // =====================================================
    // LOAD DASHBOARD STATISTICS
    // =====================================================

    function load_dashboard_stats(wrapper) {


        // =================================================
        // TOTAL VISITS
        // =================================================

        frappe.call({

            method: 'frappe.client.get_list',

            args: {

                doctype: 'Students Visit Registration',

                fields: ['name'],

                limit_page_length: 0

            },

            callback: function (response) {

                let records = response.message || [];

                $(wrapper)
                    .find('#total-visits')
                    .text(records.length);

            }

        });


        // =================================================
        // TODAY'S VISITS
        // =================================================

        frappe.call({

            method: 'college_visit.college_visit.page.student_visit.student_visit.get_today_visits_count',

            callback: function (response) {

                let today_count = response.message || 0;

                $(wrapper)
                    .find('#today-visits')
                    .text(today_count);

         },

            error: function (error) {

            console.error(
            'Today visits calculation error:',
            error
        );

                $(wrapper)
                     .find('#today-visits')
                     .text('0');

         }

});

        // =================================================
        // UNIQUE COLLEGES
        // =================================================

        frappe.call({

            method: 'frappe.client.get_list',

            args: {

                doctype: 'Students Visit Registration',

                fields: ['college_name'],

                limit_page_length: 0

            },

            callback: function (response) {

                let records =
                    response.message || [];

                let colleges = new Set();


                records.forEach(function (row) {

                    if (row.college_name) {

                        colleges.add(
                            row.college_name
                        );

                    }

                });


                $(wrapper)
                    .find('#college-count')
                    .text(colleges.size);

            }

        });


        // =================================================
        // UNIQUE DEPARTMENTS
        // =================================================

        frappe.call({

            method: 'frappe.client.get_list',

            args: {

                doctype: 'Students Visit Registration',

                fields: ['department'],

                limit_page_length: 0

            },

            callback: function (response) {

                let records =
                    response.message || [];

                let departments = new Set();


                records.forEach(function (row) {

                    if (row.department) {

                        departments.add(
                            row.department
                        );

                    }

                });


                $(wrapper)
                    .find('#department-count')
                    .text(departments.size);

            }

        });

    }


    // =====================================================
    // DEPARTMENT CHART
    // =====================================================

    function load_department_chart(wrapper) {

        frappe.call({

            method: 'frappe.client.get_list',

            args: {

                doctype: 'Students Visit Registration',

                fields: ['department'],

                limit_page_length: 0

            },

            callback: function (response) {

                let records =
                    response.message || [];

                let department_counts = {};


                records.forEach(function (row) {

                    if (row.department) {

                        if (
                            !department_counts[row.department]
                        ) {

                            department_counts[row.department] = 0;

                        }

                        department_counts[row.department]++;

                    }

                });


                let department_order = [

                    'CSE',
                    'ECE',
                    'EEE',
                    'MECH',
                    'IT'

                ];


                let labels = [];

                let values = [];


                department_order.forEach(function (department) {

                    labels.push(department);

                    values.push(
                        department_counts[department] || 0
                    );

                });


                $(wrapper)
                    .find('#department-chart')
                    .empty();


                new frappe.Chart(

                    $(wrapper)
                        .find('#department-chart')[0],

                    {

                        title:
                            'Visits by Department',

                        data: {

                            labels: labels,

                            datasets: [

                                {

                                    name: 'Visits',

                                    values: values

                                }

                            ]

                        },

                        type: 'bar',

                        height: 280,

                        axisOptions: {

                            xAxisMode: 'tick',

                            yAxisMode: 'tick',

                            xIsSeries: true

                        },

                        barOptions: {

                            spaceRatio: 0.4

                        }

                    }

                );

            }

        });

    }


    // =====================================================
    // YEAR CHART
    // =====================================================

    function load_year_chart(wrapper) {

        frappe.call({

            method: 'frappe.client.get_list',

            args: {

                doctype: 'Students Visit Registration',

                fields: ['year'],

                limit_page_length: 0

            },

            callback: function (response) {

                let records =
                    response.message || [];

                let year_counts = {};


                records.forEach(function (row) {

                    if (row.year) {

                        if (!year_counts[row.year]) {

                            year_counts[row.year] = 0;

                        }

                        year_counts[row.year]++;

                    }

                });


                let year_order = [

                    '1st Year',
                    '2nd Year',
                    '3rd Year',
                    '4th Year'

                ];


                let labels = [];

                let values = [];


                year_order.forEach(function (year) {

                    labels.push(year);

                    values.push(
                        year_counts[year] || 0
                    );

                });


                $(wrapper)
                    .find('#year-chart')
                    .empty();


                new frappe.Chart(

                    $(wrapper)
                        .find('#year-chart')[0],

                    {

                        title:
                            'Visits by Year',

                        data: {

                            labels: labels,

                            datasets: [

                                {

                                    name: 'Visits',

                                    values: values

                                }

                            ]

                        },

                        type: 'bar',

                        height: 280,

                        axisOptions: {

                            xAxisMode: 'tick',

                            yAxisMode: 'tick',

                            xIsSeries: true

                        },

                        barOptions: {

                            spaceRatio: 0.4

                        }

                    }

                );

            }

        });

    }


    // =====================================================
    // LOAD RECENT REGISTRATIONS
    // =====================================================

    function load_recent_visits(wrapper) {

        frappe.call({

            method: 'frappe.client.get_list',

            args: {

                doctype:
                    'Students Visit Registration',

                fields: [

                    'student_name',
                    'college_name',
                    'department',
                    'year',
                    'visit_date'

                ],

                order_by:
                    'creation desc',

                limit_page_length: 5

            },

            callback: function (response) {

                let records =
                    response.message || [];

                let container =
                    $(wrapper)
                        .find('#recent-visits-list');


                if (!records.length) {

                    container.html(`

                        <p class="dashboard-placeholder">
                            No registrations found.
                        </p>

                    `);

                    return;

                }


                let html = `

                    <div class="recent-visits-table-wrapper">

                        <table class="recent-visits-table">

                            <thead>

                                <tr>

                                    <th>Student</th>

                                    <th>College</th>

                                    <th>Department</th>

                                    <th>Year</th>

                                    <th>Visit Date</th>

                                </tr>

                            </thead>

                            <tbody>

                `;


                records.forEach(function (row) {

                    html += `

                        <tr>

                            <td>
                                ${row.student_name || '-'}
                            </td>

                            <td>
                                ${row.college_name || '-'}
                            </td>

                            <td>
                                ${row.department || '-'}
                            </td>

                            <td>
                                ${row.year || '-'}
                            </td>

                            <td>
                                ${row.visit_date || '-'}
                            </td>

                        </tr>

                    `;

                });


                html += `

                            </tbody>

                        </table>

                    </div>

                `;


                container.html(html);

            }

        });

    }


    // =====================================================
    // REGISTRATION FORM
    // =====================================================

    function show_registration_form(wrapper) {

        $(wrapper)
            .find('.layout-main-section')
            .html(`

            <div class="registration-page">

                <div class="registration-header">

                    <button
                        class="btn btn-default"
                        id="back-to-dashboard">

                        ← Back

                    </button>


                    <div>

                        <h2>
                            Register Student Visit
                        </h2>

                        <p>
                            Enter student visit details
                        </p>

                    </div>

                </div>


                <div class="registration-card">

                    <div class="form-grid">


                        <!-- STUDENT NAME -->

                        <div class="form-group">

                            <label>

                                Student Name

                                <span>*</span>

                            </label>

                            <input
                                type="text"
                                id="student_name"
                                class="form-control"
                                placeholder="Enter student name">

                        </div>


                        <!-- COLLEGE NAME -->

                        <div class="form-group">

                            <label>

                                College Name

                                <span>*</span>

                            </label>

                            <input
                                type="text"
                                id="college_name"
                                class="form-control"
                                placeholder="Enter college name">

                        </div>


                        <!-- DEPARTMENT -->

                        <div class="form-group">

                            <label>

                                Department

                                <span>*</span>

                            </label>

                            <select
                                id="department"
                                class="form-control">

                                <option value="">
                                    Select Department
                                </option>

                                <option value="CSE">
                                    CSE
                                </option>

                                <option value="ECE">
                                    ECE
                                </option>

                                <option value="EEE">
                                    EEE
                                </option>

                                <option value="MECH">
                                    MECH
                                </option>

                                <option value="IT">
                                    IT
                                </option>

                            </select>

                        </div>


                        <!-- YEAR -->

                        <div class="form-group">

                            <label>

                                Year

                                <span>*</span>

                            </label>

                            <select
                                id="year"
                                class="form-control">

                                <option value="">
                                    Select Year
                                </option>

                                <option value="1st Year">
                                    1st Year
                                </option>

                                <option value="2nd Year">
                                    2nd Year
                                </option>

                                <option value="3rd Year">
                                    3rd Year
                                </option>

                                <option value="4th Year">
                                    4th Year
                                </option>

                            </select>

                        </div>


                        <!-- EMAIL -->

                        <div class="form-group">

                            <label>

                                Email

                                <span>*</span>

                            </label>

                            <input
                                type="email"
                                id="email"
                                class="form-control"
                                placeholder="Enter email">

                        </div>


                        <!-- PHONE -->

                        <div class="form-group">

                            <label>

                                Phone Number

                                <span>*</span>

                            </label>

                            <input
                                type="text"
                                id="phone_number"
                                class="form-control"
                                maxlength="10"
                                inputmode="numeric"
                                placeholder="Enter 10 digit phone number">

                        </div>


                        <!-- VISIT DATE -->

                        <div class="form-group">

                            <label>

                                Visit Date

                                <span>*</span>

                            </label>

                            <input
                                type="date"
                                id="visit_date"
                                class="form-control">

                        </div>


                        <!-- PURPOSE -->

                        <div class="form-group">

                            <label>

                                Purpose of Visit

                                <span>*</span>

                            </label>

                            <textarea
                                id="purpose_of_visit"
                                class="form-control"
                                rows="3"
                                placeholder="Enter purpose of visit">
                            </textarea>

                        </div>


                    </div>


                    <!-- FORM BUTTON -->

                    <div class="form-actions">

                        <button
                            class="btn btn-primary"
                            id="save-registration">

                            Register Visit

                        </button>

                    </div>


                </div>

            </div>

        `);


        // =====================================================
        // SET TODAY'S DATE
        // =====================================================

        let today =
            frappe.datetime.get_today();


        $(wrapper)
            .find('#visit_date')
            .val(today);


        // Don't allow selecting past dates
        $(wrapper)
            .find('#visit_date')
            .attr('min', today);


        // =====================================================
        // PHONE NUMBER - ALLOW ONLY DIGITS
        // =====================================================

        $(wrapper)
            .find('#phone_number')
            .on('input', function () {

                this.value =
                    this.value
                        .replace(/\D/g, '')
                        .slice(0, 10);

            });


        // =====================================================
        // BACK BUTTON
        // =====================================================

        $(wrapper)
            .find('#back-to-dashboard')
            .on('click', function () {

                show_dashboard(wrapper);

            });


        // =====================================================
        // REGISTER BUTTON
        // =====================================================

        $(wrapper)
            .find('#save-registration')
            .on('click', function () {

                save_registration(wrapper);

            });

    }


    // =====================================================
    // SAVE REGISTRATION
    // =====================================================

    function save_registration(wrapper) {

        let student_name =
            $(wrapper)
                .find('#student_name')
                .val()
                .trim();


        let college_name =
            $(wrapper)
                .find('#college_name')
                .val()
                .trim();


        let department =
            $(wrapper)
                .find('#department')
                .val();


        let year =
            $(wrapper)
                .find('#year')
                .val();


        let email =
            $(wrapper)
                .find('#email')
                .val()
                .trim();


        let phone_number =
            $(wrapper)
                .find('#phone_number')
                .val()
                .trim();


        let visit_date =
            $(wrapper)
                .find('#visit_date')
                .val();


        let purpose_of_visit =
            $(wrapper)
                .find('#purpose_of_visit')
                .val()
                .trim();


        // =================================================
        // MANDATORY FIELD VALIDATION
        // =================================================

        if (
            !student_name ||
            !college_name ||
            !department ||
            !year ||
            !email ||
            !phone_number ||
            !visit_date ||
            !purpose_of_visit
        ) {

            frappe.msgprint({

                title:
                    'Missing Information',

                message:
                    'Please fill all mandatory fields.',

                indicator:
                    'red'

            });

            return;

        }


        // =================================================
        // PHONE VALIDATION
        // =================================================

        if (!/^\d{10}$/.test(phone_number)) {

            frappe.msgprint({

                title:
                    'Invalid Phone Number',

                message:
                    'Phone number must contain exactly 10 digits.',

                indicator:
                    'red'

            });

            return;

        }


        // =================================================
        // VISIT DATE VALIDATION
        // =================================================

        let today =
            frappe.datetime.get_today();


        if (visit_date < today) {

            frappe.msgprint({

                title:
                    'Invalid Visit Date',

                message:
                    'Past visit dates are not allowed. Please select today or a future date.',

                indicator:
                    'red'

            });

            return;

        }


        // =================================================
        // CALL PYTHON BACKEND
        // =================================================

        frappe.call({

            method:
                'college_visit.college_visit.page.student_visit.student_visit.register_student_visit',

            args: {

                data: {

                    student_name:
                        student_name,

                    college_name:
                        college_name,

                    department:
                        department,

                    year:
                        year,

                    email:
                        email,

                    phone_number:
                        phone_number,

                    visit_date:
                        visit_date,

                    purpose_of_visit:
                        purpose_of_visit

                }

            },

            freeze: true,

            freeze_message:
                'Registering student visit...',

            callback: function (response) {

                if (response.message) {

                    frappe.show_alert({

                        message:
                            'Student visit registered successfully!',

                        indicator:
                            'green'

                    });


                    // Reload dashboard
                    show_dashboard(wrapper);

                }

            },

            error: function (error) {

                console.error(
                    'Registration Error:',
                    error
                );

            }

        });

    }

};