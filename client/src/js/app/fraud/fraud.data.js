(function(){
'use strict';

var coverageIcon = {
    color: "#e67e22",
    icon: "flag",
    markerIcon: "embassy"
};

var coverageSampleData = [
    {
        id: 27,
        userid: 2,
        merchantid: 296,
        address: "B. Rodriguez St, Cebu City, Cebu",
        type: "COVERAGE",
        cost: 1250,
        description: 'Product presentation',
        transaction_date: "2017-02-09T14:35:20",
        travel_time_in_minutes: 40,
        average_travel_time_in_minutes: 45,
        start_point_latlng: {
            lat: 10.306362,
            lng: 123.8995343
        },
        end_point_latlng: {
            lat: 10.3080171,
            lng: 123.8893832
        },
        icon: angular.merge({}, coverageIcon, {color: '#e74c3c'}),
        merchant: {
            address: "B. Rodriguez St, Cebu City, Cebu",
            latlng: {
                lat: 10.3080171,
                lng: 123.8893832
            },
            name: "VUIDEZ,LOLITA",
            specialty: "GENERAL MEDICINE"
        },
        remarks: 'employee is on leave during transaction date',
        status: 'FRAUD'
    },
    {
        id: 26,
        userid: 2,
        merchantid: 227,
        address: "BALIUAG",
        type: "COVERAGE",
        cost: 1550.75,
        description: 'Amoclav  dispensing deal',
        transaction_date: "2017-02-08T10:08:15",
        travel_time_in_minutes: 120,
        average_travel_time_in_minutes: 100,
        start_point_latlng: {
            lat: 10.306362,
            lng: 123.8995343
        },
        end_point_latlng: {
            lat: 10.2898386,
            lng: 123.9646196
        },
        icon: angular.merge({}, coverageIcon, {color: '#e74c3c'}),
        merchant: {
            address: "Maximo V. Patalinhug Jr. Avenue, Lapu-Lapu City, Cebu",
            latlng: {
                lat: 10.2898386,
                lng: 123.9646196
            },
            name: "ENRIQUEZ,MA. CONSUELO",
            specialty: "GENERAL MEDICINE"
        },
        remarks: 'out of territory',
        status: 'FRAUD'
    },
    {
        id: 28,
        userid: 2,
        merchantid: null,
        address: "B. Rodriguez St, Cebu City, Cebu",
        type: "FLEET",
        cost: 2000,
        description: '',
        transaction_date: "2017-02-07T14:05:00",
        travel_time_in_minutes: 40,
        average_travel_time_in_minutes: 45,
        start_point_latlng: null,
        end_point_latlng: {
            lat: 10.3083076,
            lng: 123.8894964
        },
        icon: {
            markerIcon: 'gas-station',
            color: '#f39c12',
            icon: 'local_gas_station'
        },
        merchant: null,
        remarks: 'less kilometers traveled from transactions over gas expenses',
        status: 'INVESTIGATE'
    },
    {
        id: 23,
        userid: 2,
        merchantid: 224,
        address: "Don Mariano Cui St, Cebu City, Cebu",
        type: "COVERAGE",
        cost: 450.00,
        description: 'Product presentation',
        transaction_date: "2017-02-06T14:35:20",
        travel_time_in_minutes: 45,
        average_travel_time_in_minutes: 60,
        start_point_latlng: {
            lat: 10.306362,
            lng: 123.8995343
        },
        end_point_latlng: {
            lat: 10.3098146,
            lng: 123.8872474
        },
        icon: angular.merge({}, coverageIcon, {color: '#95a5a6'}),
        merchant: {
            address: "Don Mariano Cui St, Cebu City, Cebu",
            latlng: {
                lat: 10.3098146,
                lng: 123.8872474
            },
            name: "QUETUA,ROWENA",
            specialty: "PEDIATRICS"
        },
        remarks: '',
        status: ''
    },
    {
        id: 24,
        userid: 2,
        merchantid: 225,
        address: "Don Mariano Cui St, Cebu City, Cebu",
        type: "COVERAGE",
        cost: 500.00,
        description: 'Product presentation',
        transaction_date: "2017-02-09T09:35:20",
        travel_time_in_minutes: 40,
        average_travel_time_in_minutes: 55,
        start_point_latlng: {
            lat: 10.306362,
            lng: 123.8995343
        },
        end_point_latlng: {
            lat: 10.3103062,
            lng: 123.8905109
        },
        icon: angular.merge({}, coverageIcon, {color: '#95a5a6'}),
        merchant: {
            address: "Don Mariano Cui St, Cebu City, Cebu",
            latlng: {
                lat: 10.3103062,
                lng: 123.8905109
            },
            name: "VALENZUELA,ELENA",
            specialty: "PEDIATRICS"
        },
        remarks: '',
        status: ''
    },
    {
        id: 25,
        userid: 2,
        merchantid: 226,
        address: "Osmeña Blvd, Cebu City,",
        type: "COVERAGE",
        cost: 850.50,
        description: 'Client visit and orientation',
        transaction_date: "2017-02-08T13:00:15",
        travel_time_in_minutes: 75,
        average_travel_time_in_minutes: 60,
        start_point_latlng: {
            lat: 10.306362,
            lng: 123.8995343
        },
        end_point_latlng: {
            lat: 10.3144225,
            lng: 123.8920168
        },
        icon: angular.merge({}, coverageIcon, {color: '#2ecc71'}),
        merchant: {
            address: "Osmeña Blvd, Cebu City,",
            latlng: {
                lat: 10.3144225,
                lng: 123.8920168
            },
            name: "GUICO,ELSA",
            specialty: "PEDIATRICS"
        },
        remarks: 'OK',
        status: 'CLEARED'
    },
    {
        id: 29,
        userid: 2,
        merchantid: null,
        address: "Fuente, Cebu City, Cebu",
        type: "1SS",
        cost: 2000,
        description: 'client meeting',
        transaction_date: "2017-02-10T10:05:00",
        travel_time_in_minutes: 40,
        average_travel_time_in_minutes: 45,
        start_point_latlng: null,
        end_point_latlng: {
            lat: 10.3101402,
            lng: 123.8923542
        },
        icon: {
            markerIcon: 'atm',
            color: '#2ecc71',
            icon: 'local_atm'
        },
        merchant: null,
        remarks: 'OK',
        status: 'CLEARED'
    },
];

    var dateMoment;

angular.module('demoApp.fraud')

    .constant('COVERAGE_DATA', coverageSampleData.map(function(item){
        dateMoment = moment(item.transaction_date);
        item.transaction_date_formatted = dateMoment.format('dddd, MMMM DD, YYYY h:mm:ss A');
        return item;
    }))

;

}());