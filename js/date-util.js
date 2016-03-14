// namespace to avoid potential conflicts 
var mcgavren = mcgavren || {};

mcgavren.dateUtil = (function() {
	'use strict';

	var oneDay = 24 * 60 * 60 * 1000;

	var dateUtil = {

		getMonths : function () {
			return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		},

		getNumWeeksBetweenDates: function( date1, date2 ) {  //check for valid dates
			var firstDate = new Date( date1 ),
				secondDate = new Date( date2 ),  // look at this scope
				numWweeks,
				days;
			
			days = Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay));
			numWweeks = days/ 7;

			return numWweeks;
		},

		getNumDaysBetweenDates: function( date1, date2 )  {  //check for valid dates
			var firstDate = new Date( date1 ),
				secondDate = new Date( date2 ),
				numDays;

			numDays = Math.round( Math.abs((firstDate.getTime() - secondDate.getTime()) / (oneDay)) );
			
			return numDays;
		},

		isLeapYear: function ( year ) {
			return (year % 100 === 0) ? (year % 400 === 0) : (year % 4 === 0);  
		},

		/**
		 * Determines how to color the cell background based if current date straggles monnths
		 * @param  Date  date     current date
		 * @return Boolean        is it at the end of a month?
		 */
		isEndOfMonth: function( date ) {
			var currentMonth = date.getMonth(),
				daysInFeb = ( this.isLeapYear(date.getFullYear()) ) ? 29 : 28,
				months = [31, daysInFeb, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
				daysInCurrentMonth = months[currentMonth];
		
			if( (date.getDate() + 6 ) > daysInCurrentMonth ) {
				return true;
			}
			return false;
		}


	};

	return dateUtil;
}());