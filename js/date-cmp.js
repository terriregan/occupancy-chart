/*
	Manages datepicker component
*/

var mcgavren = mcgavren || {};
mcgavren.occupancyChart = mcgavren.occupancyChart || {}; 

mcgavren.occupancyChart.dateCmp = (function( occupancies ) {
	var fromEl, toEl, fromDate, toDate;
	
	function addDatePicker( el, val, boundary ) {

		el.datepicker({
			showOn: 'button',
  			buttonText: '<i class="fa fa-calendar"></i></button>',
   			defaultDate: val,
   			dateFormat: 'M d, yy'
		});
	}

	function initialize( minEl, maxEl ) {
		var dr = $(".date-range");
			
		fromDate = occupancies.getMinDate();  
		toDate = occupancies.getMaxDate();
		fromEl = $( minEl );
		toEl = $( maxEl );		

		fromEl.val( fromDate.format('MMM D, YYYY') );
		toEl.val( toDate.format('MMM D, YYYY') );

		addDatePicker( fromEl, new Date(fromDate), 'from' );
		addDatePicker( toEl, new Date(toDate), 'to' );
	}

	function hasValidDateRange() {
		var from = fromEl.datepicker( "getDate" ),
			to = toEl.datepicker( "getDate" );
		
		return ( to > from ) ? true : false;
	}

	function getFromDate() {
		var fromDate = fromEl.datepicker( "getDate" );
		return moment(fromDate).format( 'YYYY-MM-DD' );
	}

	function getToDate() {
		var toDate = toEl.datepicker( "getDate" );
		return moment(toDate).format( 'YYYY-MM-DD' );
	}
	
	return {
		initialize: initialize,
		hasValidDateRange: hasValidDateRange,
		getFromDate: getFromDate,
		getToDate: getToDate
	};

}( mcgavren.occupancyChart.occupancies ));
