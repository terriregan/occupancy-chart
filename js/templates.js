
// namespace to avoid potential conflicts 
var mcgavren = mcgavren || {};
mcgavren.occupancyChart = mcgavren.occupancyChart || {};   // probably not needed but just being safe

mcgavren.occupancyChart.templates = (function() {
	'use strict';

	var templateList = [];

	// Main container
	var container = [
		'<div id="occupancy-wrapper">' +
			'<div class="wrapper-controls">' +
				'<div class="legend hold"></div>' + 
				'<div class="legend-label">Hold</div>' + 
				'<div class="legend occupied"></div>' +
				'<div class="legend-label">Occupied</div>' + 
				'<div class="legend occupied-and-fixed"></div>' +
				'<div class="legend-label">Occupied and fixed</div>' + 
				'<div class="legend contracted-but-available"></div>' + 
				'<div class="legend-label">Contracted and available</div>' + 
				'<div class="date-range">' + 
				 	'<span>From</span>' +
		            '<div>' + 
        				'<input id="dr-input-min" readonly>' +
		            '</div>' +
		            '<span>To</span>' +
		            '<div>' + 
        				'<input id="dr-input-max" readonly>' +
		            '</div>' +
		            '<button type="button" class="btn-go">GO</button>' +
        		'</div>' +
			'</div>' +		
			'<div class="wrapper-container clearfix">' +
			    '<div id="wrapper-left-column">' +				// left column wrapper
			        '<div>' +
			            '<table id="tbl-tl"></table>' +
			        '</div>' +
			        '<div id="wrapper-tbl-bl">' +
			            '<table id="tbl-bl"></table>' +
			        '</div>' +
			   ' </div>' +
			   '<div id="wrapper-right-column">' +				// right column wrapper (remove inside scrollbar)	
			        '<div id="wrapper-tbl-tr"> '+
			        	'<div id="wrapper-current-date"></div>' +
			           ' <table id="tbl-tr"></table>' +
			        '</div>' +
			       ' <div id="wrapper-tbl-br">' +
			            '<table id="tbl-br"></table>' +
			        '</div>' +
			    '</div>' +
			'</div>' +
		'</div>'
	].join("\n");
	templateList.push({ id: 'container', tplFn: _.template( container )});

	// Row with occupancies
	var occupancy = '<div class="occupancy" style="width: <%= width %>; left: <%= offset %>"</div>';
	templateList.push({ id: 'occupancy', tplFn: _.template( occupancy )});
	
	// Top left header
	var header = [
		'<tr><th class="tbl-tl-header"></th></tr>' + 
		'<tr><th class="tbl-tl-message"><%= message %></th></tr>'
	].join("\n");
	templateList.push({ id: 'header', tplFn: _.template( header )});

	// Mall row
	var mall = [
		'<tr>' +
		'<td class="tbl-bl-mall"><%= name %></td>' +
		'</tr>'
	].join("\n");
	templateList.push({ id: 'mall', tplFn: _.template( mall )});

	// Unit row
	var unit = [
		'<tr>' +
		'<td class="tbl-bl-unit"><%= id %></td>' +
		'</tr>'
	].join("\n");
	templateList.push({ id: 'unit', tplFn: _.template( unit )});

	var message = [
		'<div class="message"><%= message %>' +
			'<div><button class="btn btn-primary btn-close" data-dismiss="modal"><i class="fa fa-times-circle"></i> Close Window</button></div>' +
		'</div>'
	].join("\n");
	templateList.push({ id: 'message', tplFn: _.template( message )});

	// Occupancy row
	// var occupancy = [
	// 	'<div class="tbl-br-occupancy" style="font-size: .5em; width:<%= width %>;' +
	// 	'left: <%= offset %>;"> <%= label %>' +
	// 	'< /div>'
	// ]join("\n");


	//templateList.push({ id: 'occupancy', tplFn: _.template( occupancy )});

	return {
		getTemplate: function( template, data ) {
			var t = _.find( templateList, function( tpl ) { 
				return tpl.id == template;
			});
		
			return t.tplFn( data );
		}
	};

}());