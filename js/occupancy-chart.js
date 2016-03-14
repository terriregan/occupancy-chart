/* 

Vendor dependencies: underscore.js, jQuery, jQuery UI (datepicker comp), moment.js, qTip tooltip library, font-awesome.min.css, jquery.bootstrap-growl.min.js

ASSUMPTIONS:
1. panel data for each unit does not overlap
2. unit ids are unique (should this be just within a mall or globally)
3. 12 months of data is returned by default unless a date range is selected. In that case the range is displayed

TO DO: 
- Update renderTopRightTable to use moment methods (make better use of the moment library thru out)
- Need to handle error when clicking GO and request not succeeding
- Fix issues (see issues list below)
- Update to use mustache templates
- Smooth out transitions, add loading icon
- Add full date to week number mouseover
- Add documentation (inline and then use a document generator like phpdocs)

ISSUES:
1. Firefox is rendering slow when scrolling vertically
2. Scrollbar stays on top when plugged in to mouse, screws up the alignment of boxes, alt colors are out of alignment
3. Hide chart until rendering is com
4. Fix display when there is no flight data (the cells height to do match)
5. When new data is fetched with no data, chart is large and then snaps back
*/

// namespace to avoid potential conflicts 
var mcgavren = mcgavren || {};

mcgavren.occupancyChart = (function( $, _ ) {
	'use strict';

	var endPoint = 'http://dev.mgmallplanner.com/app/fetchMallDataOccupancyChart.php',
		mallIds,
		targetEl,
		requestForNewDateRange = false,
		xhr = null;

	var errorMessage = 'There was a problem with your request.',
		noMallDataMessage = 'There was no mall data available',
		dateMessage = 'The "From" date must be earlier than the "To" date';

	var opts = {
		widthContainer: 900,
		widthCell: 30,  
		widthFirstCol: 280,
		heightContainer: 300,    // height of vertical scrollable area
	};

	var tds = [],
		baseRowHeight = 30, 
		templates = mcgavren.occupancyChart.templates,   // cache namespaces
		occupancies = mcgavren.occupancyChart.occupancies,
		Occupancy = mcgavren.occupancyChart.Occupancy,
		dateCmp = mcgavren.occupancyChart.dateCmp,
		util = mcgavren.dateUtil;

	/**
	 * Render occupancy bars to first col in unit
	 * @param  array 	data array of occupancy objs
 	 * @return string   html to append
	 */
	function renderOccupancies( data ) {
		var htmlString = "",
			width,
			offset,
			colorCls;
		
		_.each( data, function( occupancy ) {
			width = occupancy.getWidth( opts.widthCell );
			offset = occupancy.getOffset( occupancies.getMinDate(), opts.widthCell );
			colorCls = occupancy.getColorCls();
			
			htmlString += "<div class='o-tooltip tbl-br-occupancy " + colorCls + "' style='font-size: .5em;width: " + width + "; left:" + offset + "'></div>";
			htmlString += occupancy.getInfo();  // tooltip
			//htmlString += templates.getTemplate( 'occupancy', {width : width, offset: offset, label: label} ); // fix
		});

		return htmlString;
	}

	/**
	 * Render a base row with occupanies (i.e. unit row)
	 * @param  array occupancies occupanies for particular unit
	 * @param  array cols   	 number of columns (td) to render
	 * @return string       	 html to append
	 */
	function renderRowWithOccupancies( occupancies, cols ) {
		var htmlString = "",
			i;

		htmlString += "<tr>";

		for( i = 0; i < cols; i++ ) {
			
			// add all occupancy divs to first td with an absolute position
			// attached it to a wrapping div as opposed to the td to keep z-index correct
			if( i == 0 ) {  
				htmlString += '<td style="width: ' + opts.widthCell + '" class="tbl-br ' + tds[i] + '"><div class="tbl-div">';
				htmlString += renderOccupancies( occupancies );
				htmlString +=  '</div></td>';
			} else {
				htmlString += '<td style="width: ' + opts.widthCell + '" class="tbl-br ' + tds[i] + '"><div class="tbl-div"></div></td>';  //templates.getTemplate('row');
			}
		}
		htmlString += "</tr>";

		return htmlString;
	}

	/**
	 * Render a base row with no occupanies (i.e. mall row)
	 * @param  array cols   number of columns (td) to render
	 * @return string       html to append
	 */
	function renderRow( cols ) {
		var htmlString = "",
			i;
		
		for( i = 0; i < cols; i++ ) {
			htmlString += '<td style="width: ' + opts.widthCell + 'px" class="tbl-br ' + tds[i] + '"><div class="tbl-div"></div></td>';  //templates.getTemplate('row');
		}
		return htmlString;
	}

	/**
	 * Render mall and unit list to bottom left table
	 * @param  array data  array of malls
	 * @return string      html to append
	 */
	function renderBottomLeftTable( data ) {
		var htmlString = '';

		_.each( data, function( mall ){
			htmlString += templates.getTemplate('mall', {name : mall.name} );
			
			_.each( mall.units, function( unit ) {
				htmlString += templates.getTemplate('unit', {id : unit.id} );
			});
		});

		return htmlString;
	}
	
	/**
	 * Render bottom right table - occupanies
	 * @param  array malls 	array of malls
	 * @param  array cols   number of columns (td) to render
	 * @return string       html to append
	 */
	function renderBottomRightTable( malls, cols ) {  // rows, cols
		var htmlString = '',
			unitOccupancies;

		_.each( malls, function( mall ) {	
			htmlString += "<tr>";		
			htmlString += renderRow( cols );
			htmlString += "</tr>";	

			_.each( mall.units, function( unit ) {
				unitOccupancies = occupancies.getUnitOccupancies( unit.id );
				htmlString += renderRowWithOccupancies( unitOccupancies, cols );
			});
		});

		return htmlString;
	}

	/**
	 * Render months and weeks using the earliest and latest dates in data
	 * @param  Date start   earliest occupancy date
	 * @param  Date end     latest occupancy date
	 * @return htmlString  htmlstring to append
	 */
	function renderTopRightTable( start, end ) {
		var htmlString = '';

	 	// start and end are currently moment objects that return local time and not UTC time
	 	// Update this function with moment methods so this conversion to Date is not necessary
	 	start = new Date(start);   
	 	end = new Date(end);
	
		if( start instanceof Date && end instanceof Date ) {
			var months = util.getMonths(),
			c_year = start.getFullYear(),
			c_month = start.getMonth(),
			daysInMonth = 0,
	   		daysInWeek = 0,
	   		dayCtr = 0,
	   		mthCtr = 0,
	   		label,
	   		cls,  wkcls, mthCls,
	    	r_month, r_week, r_days;

		    r_month = "<tr>";
		    r_week = "<tr>";
		    r_days = "<tr>";

   
		    for (start; start <= end; start.setDate( start.getDate() + 1) ) {
		     	if (start.getMonth() !== c_month) {
		     		label = ( daysInMonth > 14 ) ?  months[c_month] +  ' ' + getYrAbbr(c_year)  : '';
		     		cls = (mthCtr % 2) ? '' :  'tbl-td-alt';
		     		mthCls = ( daysInMonth < 7 ) ? 'tbl-td-split-dl' : cls;
		     	 	r_month += '<th class="tbl-tr-month ' + mthCls + '" colspan="' + daysInMonth + '">' + label + '</th>';
	            	c_month = start.getMonth();
	            	daysInMonth = 0;
	            	mthCtr++;
				}
				daysInMonth++;

				if (start.getFullYear() !== c_year) {
		    		c_year = start.getFullYear();
		    	}
	 		 	
	 		 	if ( (daysInWeek % 7)  === 0 ) {
				    if( util.isEndOfMonth(start, dayCtr) ) {
				    	wkcls = (cls == 'tbl-td-alt') ? 'tbl-td-split-ld' : 'tbl-td-split-dl';			    
				    } else {
				  	   wkcls = (cls ==  'tbl-td-alt') ? '': 'tbl-td-alt'; 
				    }	   
				   
				    tds.push( wkcls );
				    r_week += '<th class="tbl-tr-week ' + wkcls + '" style="width:' + opts.widthCell + 'px" colspan="7">' + start.getDate() +  '</th>';  
				    daysInWeek = 0;
				}
				
				daysInWeek++;
				dayCtr++;

				r_days += '<td>' + start.getDate() + '</td>';
		    }

			//console.log( months[c_month] + ' : ' + daysInMonth);		    // display leftovers
		   	
		   	cls = (mthCtr % 2) ? '' :  'tbl-td-alt';
		    r_month += '<th class="tbl-tr-month tbl-tr-month-last ' + cls +  '" colspan="' + (daysInMonth) + '">' + months[c_month] + ' ' + getYrAbbr(c_year) + '</th>';  
		    r_month += "</tr>";
		    r_week += "</tr>";
		    r_days += "</tr>";
		   
		    htmlString = r_month + r_week;
		}
	    
	    return htmlString;
	}

	/**
	 * Render the chart to screen
	 * @param  json data json returned from api
	 * @return void
	 */
	function renderChart ( data ) {

		var maxRowHeight,
			tl   = 	 $("#tbl-tl"),				
			bl   = 	 $("#tbl-bl"),
			tr   = 	 $("#tbl-tr"),
			br   = 	 $("#tbl-br"),
			wrc  = 	 $("#wrapper-right-column"),
			wlc  = 	 $("#wrapper-left-column"),
			wtr  = 	 $("#wrapper-tbl-tr"),
			wbl  = 	 $("#wrapper-tbl-bl"),
			wbr  = 	 $("#wrapper-tbl-br"),
			owr  =   $("#occupancy-wrapper"),
			wcd  =	 $('#wrapper-current-date');

		var numWeeks = occupancies.getNumWeeksBetweenMinMaxDates(),
			offsetFromCurrentDate = occupancies.getOffsetFromCurrentDate( opts.widthCell ),
		 	w = Math.ceil(numWeeks) * opts.widthCell + 'px',   // full width
		 	fcw = opts.widthFirstCol + 'px';

		// set outside wrapper width and min-width
		owr.css( 'width', opts.widthContainer);
		owr.css( 'minWidth', opts.widthContainer);

		// set left column width (left column)
		tl.css( 'width', fcw );   
		bl.css( 'width', fcw );
		wlc.css( 'width', fcw );

		// set right column width (full column width)
		wbr.css( 'width', w );
		wtr.css( 'width', w ); 
		
		// set right column  contraint width
		wrc.css( 'width', opts.widthContainer - opts.widthFirstCol);  

		// set height constraint 
		wbl.css( 'height', opts.heightContainer );  
		wbr.css( 'height', opts.heightContainer );

		wcd.css( 'height', opts.heightContainer ); 
		wcd.css( 'left', offsetFromCurrentDate + 'px' ); 

		tl.append( templates.getTemplate('header', {message : 'Week Starting'} ) );
		bl.append( renderBottomLeftTable( data.malls )); 
		tr.append( renderTopRightTable( occupancies.getMinDate(), occupancies.getMaxDate()) );  
		br.append( renderBottomRightTable( data.malls, numWeeks) );  
		
		// resets height if less than the scrollable height
		// give time to calc height before setting
		setTimeout(function() {
			if( br.height() < wbr.height() ) {
				wbr.css( 'height', br.height() );
				wlc.css( 'height', br.height() );
				wcd.css( 'height', br.height() ); 
			}
		}, 500 );

		maxRowHeight = verifyRowHeight( $( '#tbl-bl tr') );
		if( maxRowHeight > baseRowHeight ) {
			setRowHeight( $( '#tbl-br tr'), maxRowHeight );
		}
		
		// give chart time to draw
		setTimeout(function() {  
			if( occupancies.useDefaultMinMaxDates() ) {
				$('#wrapper-right-column').animate({scrollLeft: offsetFromCurrentDate}, 750);
			}
		}, 500 );

		bindUI();
	}

	/**
	 * Get the height of the tallest cell
	 * @param  object tbl jQuery table containing cells to measure
	 * @return number     height of the tallest cell
	 */
	function verifyRowHeight( tbl ) {
		var max = 0;    
		tbl.each(function() {
		    max = Math.max( $(this).height(), max );
		}).height( max );

		return max;
	}

    /**
     * Set height of each row
     * @param  object tbl  jQuery table containing cells to set height 
     * @param  number h   Height to set cell to
     */
	function setRowHeight( tbl, h ) {
		tbl.each(function() {
		   $(this).height( h );
		});
	}

	/**
	 * Adds event handling
	 * scroll: when bottom left is scrolled, bottom right is scolled and visa versa
	 * mouseover : display tooltip for an occupancy
	 * @return void
	 */
	function bindUI () {
		// keep tables in alignment as they are scrolled
		$('#wrapper-tbl-br').scroll(function() {
	    	var a = $("#wrapper-tbl-br").scrollTop();
	    	$("#wrapper-tbl-bl").scrollTop(a);
		});

		$('#wrapper-tbl-bl').scroll(function() {
	    	var a = $("#wrapper-tbl-bl").scrollTop();
	    	$("#wrapper-tbl-br").scrollTop(a);
		});
		
		// tooltip display
		$('.o-tooltip').each( function() { 
			 $(this).qtip({
		        content: {
		            text: $(this).next('div') // Use the "div" element next to this for the content
		        },
		        position: {
		        	my: 'bottom center',
		        	at: 'top center',
		        	target: 'mouse' 
		        },
		       style: {
			        tip: {
			            corner: true,
			            width: 16
			        }
		       }
		    });
		});

		// fetch new data on date range change
		$( ".btn-go" ).click(function() {
			requestForNewDateRange = true;
			
			if( dateCmp.hasValidDateRange() ) {
				// FORMAT: http://dev.mgmallplanner.com/app/fetchMallDataOccupancyChart.php?mallIds=79,1,10,80,3360&start=2015-10-01&end=2015-11-01
				var url = endPoint + '?mallIds=' + mallIds + '&start=' + dateCmp.getFromDate() + '&end=' + dateCmp.getToDate();
				init( targetEl, url );
				
			} else {
				showErrorMsg( targetEl, dateMessage );
			}
		});
	}


	function getYrAbbr( yr ) {
		return  (yr + '').substr(2, 2);
	}

	/**
	 * Parses flight json into array containing occupancy objects 
	 * @param  array malls array of malls returned from api
	 *                     expectied structure of returned object: malls[0].units[0].fligts[0] structure
	 * @return array result array of occupancy objects
	 */
	function processFlightData ( malls ) { 

		// need to add checks for valid data at each level
		var result = [];

		_.each( malls, function( mall ) {
			_.each( mall.units, function( unit ) {
				_.each( unit.flights, function( flight ) {
					var obj = Object.create( Occupancy );
				
					obj.unitId = unit.id;
					obj.startDate = moment(flight.start, 'YYYY-MM-DD');
					obj.endDate = moment(flight.end, 'YYYY-MM-DD');
					obj.title = flight.title;
					obj.agency = flight.agency;
					obj.advertiser = flight.advertiser;
					obj.status = flight.status;
					
					result.push(obj);
				});
			});
		});

		return result;
	}

	/**
	 * Gets json from an api
	 * @param  url endpoint REST endpoit
	 * @return void
	 */
	function fetchData ( endpoint ) {
		clearXHR();

		xhr = $.ajax({
			// method: 'POST',  
			// timeout: 
			url: endpoint
		})
		.done( function( result ) {
			if( _.isString(result) ) {
				result = JSON.parse(result);
			} 
			if( result.success === false ) {
				showErrorMsg( targetEl, errorMessage );
			} else {
				initializeChart( result );
			}
		})
		.fail( function( jqXHR, textStatus ) {
			showErrorMsg( targetEl, errorMessage );
			log( 'Error : Request failed - ', textStatus ); 
		});
	}

	function showErrorMsg( el, msg ) {
		if( requestForNewDateRange ) {
			$.bootstrapGrowl( msg, {
				ele: targetEl, 
				width: 450, 
				align: 'center', 
				delay: 3000
			});
		} else { 
			reset();
			el.append( templates.getTemplate('message', {message : msg}) );
		}

		requestForNewDateRange = false;
	}

	function initializeChart( data ) {
		var arr, req, 
			dates = {};

		reset();

		if( data.malls && (data.malls.length > 0) ) {
			
			// add datepicker-skin to body class for datepicker theming
			$('body').addClass( 'datepicker-skin' );

			// add container html
			targetEl.append( templates.getTemplate('container') );

			// process request data
			req = data.request;
			if( req ) {
				mallIds = ( req.mallIds ) ? req.mallIds : '';
				dates.start = req.start;
				dates.end = req.end;
			}

			arr = processFlightData( data.malls );

			occupancies.initialize( arr.slice(0), dates );
			dateCmp.initialize( '#dr-input-min', '#dr-input-max' );

			renderChart( data );
		} else {
			showErrorMsg( targetEl, noMallDataMessage );
		}
		
	}

	function log( msg ) {
		console.log( msg );
	}

	function clearXHR() {
		if( xhr !== null ) {
            xhr.abort();
            xhr = null;
        }
	}

	/**
	 * Removes chart 
	 * @return void
	 */
	function reset() {

		tds = [];

		if( occupancies ) {
			occupancies.destroy();
		}

		if( targetEl ) {
			targetEl.empty();
		}

		clearXHR();
		requestForNewDateRange = false;
	}
	
	
	/**
	 * Initializes the chart
	 * @param  jQuery obj el    	Object to which to attach chart 
	 * @param  string value    		Must be valid REST url 
	 * @param  object options 		Object to configure chart:  
	 *                              widthFirstCol - width of first column (mall/unit list) (260px default)
	 *                              widthContainer - width of chart  (900px default)
	 *                              widthCell - width of cells  (30px default)
	 * @return object         		public metthods
	 */
	function init ( el, value, options ) {

		if( !(el instanceof jQuery) ) {
			log( 'Error : requires a jQuery object' ); // set log somewhere
			return;
		}

		if( !value || 0 === value.length ) {
			log('Error : requires a valid url (string)'); 
			return;
		}

		// set element to which attach chart
		targetEl = el;

		// get any options if they are passed
		$.extend( opts, options );
		
		// get data
		fetchData( value );

		// remove ability to pass in a json obj as well as a url
		// if( _.isObject(value) ) {  // this does not adequately check for prescense of valid json object (might not need this))
		// 	renderChart( value );
		// } else {
		// 	fetchData( value );
		// }
	}

	return {
		init: init,
		reset: reset
	};

}( jQuery, _ ));



