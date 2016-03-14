
// namespace to avoid potential conflicts 
var mcgavren = mcgavren || {};
mcgavren.occupancyChart = mcgavren.occupancyChart || {};  

mcgavren.occupancyChart.occupancies = (function() {
	'use strict';

	var occupancyList = [],
		minDate = null,
		maxDate = null,
		useDefaultDates = false,
		numWeeks;

	function getUnitOccupancies( unitId ) {
		var unitOccupancies = _.filter( occupancyList, function( occupancy ) { 
			// only return flights with valid dates and the applicable unitId and are between min/max dates
			var start = occupancy.startDate,
				end = occupancy.endDate,
				min = moment(minDate),
				max = moment(maxDate);

			var	validDates = (occupancy.unitId == unitId) && start.isValid() && end.isValid(),
				startAfterMin = start.isSameOrAfter( min.subtract(1, 'days') ),
				endBeforeMax = end.isSameOrBefore( max.add(1,'days') ),
				startBeforeMax = start.isBefore(max) && !endBeforeMax,
				endBeforeMin = end.isAfter(min) && !startAfterMin;

			if( validDates ) {
				if( startAfterMin && endBeforeMax ) {
					return true;
				} else if ( startBeforeMax || endBeforeMin ) {
					return true;
				} else {
					return false;
				}
			} 
		});
		return unitOccupancies;
	}

	/*
	 * @return moment minimum chart date
	 */
	function getOffsetFromCurrentDate ( tdWidth ) {
		var weeksFromMinDate = mcgavren.dateUtil.getNumWeeksBetweenDates( minDate, new Date() );
		return weeksFromMinDate * tdWidth;
	}

	/*
	 * @return moment minimum chart date
	 */
	function getMinDate () {
		return minDate;
	}

	/*
	 * @return moment maximum chart date
	 */
	function getMaxDate () {
		
		// make sure the end date is a full week
		if( maxDate.date() < 8 ) {
	 		maxDate.date(8);
	 	}
		return maxDate;
	}

	function useDefaultMinMaxDates () {
		return useDefaultDates;
	}

	function setMinMaxDates( from, to ) {
		var min = (from) ? from.isValid() : null,
			max = (to) ? to.isValid() : null,
			date,
			diff;
		
		if( !min && !max ) {
			date = new Date();
			minDate = moment( date ).subtract( 2, 'months' );
			maxDate = moment( date ).add( 10, 'months' );

		} else if ( !min && max ) {
			date = new Date( to );
			minDate = moment( date ).subtract( 5, 'months' );
			maxDate = to;

		} else if ( min && !max ) {
			date = new Date( from );
			minDate = from;
			maxDate = moment( date ).add( 5, 'months' );

		} else {
			// Make sure that we show at leaset 5 months
			diff = to.diff(from, 'days');
			if( diff < 140 && diff >= 0 ) {
				date = new Date( from );	
				minDate = from;
				maxDate = moment( date ).add( 5, 'months' );
			} else {
				minDate = from;
				maxDate = to;
			}
		}
	}

	function initialize( arr, dates ) {
		var from, to;

		occupancyList = arr;
		from = ( dates.start ) ? dates.start : null; 
		to = ( dates.end ) ? dates.end : null;
		
		if( !from && !to ) {
			useDefaultDates = true;
		}

		setMinMaxDates( moment(from), moment(to) );
	}

	function destroy() {
		occupancyList = [];
		minDate = null;
		maxDate = null;
		numWeeks = null;
		useDefaultDates = false;
	}

	function getNumWeeksBetweenMinMaxDates() {
		if( !numWeeks ) {
			numWeeks = mcgavren.dateUtil.getNumWeeksBetweenDates( getMinDate(), getMaxDate() );
			numWeeks = Math.ceil( numWeeks );
		}
		return numWeeks;
	}

	function getList() {
		return occupancyList;
	}

	return {
		initialize: initialize,
		destroy: destroy,
		getMinDate: getMinDate,
		getMaxDate: getMaxDate,
		getUnitOccupancies : getUnitOccupancies,
		getNumWeeksBetweenMinMaxDates : getNumWeeksBetweenMinMaxDates,
		useDefaultMinMaxDates: useDefaultMinMaxDates,
		getOffsetFromCurrentDate: getOffsetFromCurrentDate,
		getList : getList
	};
}());
