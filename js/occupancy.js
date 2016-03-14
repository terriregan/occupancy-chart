// namespace to avoid potential conflicts 
var mcgavren = mcgavren || {};
mcgavren.occupancyChart = mcgavren.occupancyChart || {};  

mcgavren.occupancyChart.Occupancy = {

	getWidth: function getWidth( tdWidth ) {
		var	oneDay = 24 * 60 * 60 * 1000,
			numWeeksOccupied,
			numDaysOccupied,
			width;

		numWeeksOccupied = mcgavren.dateUtil.getNumWeeksBetweenDates( this.startDate, this.endDate );
 
		// less than a week of occupancy
		if( !numWeeksOccupied ) {
			numDaysOccupied = mcgavren.dateUtil.getNumDaysBetweenDates( this.startDate, this.endDate );
		}

		if( numWeeksOccupied === 0 ) {
			width = (numDaysOccupied/7).toFixed(1) * tdWidth + 'px';
		} else {
			width = numWeeksOccupied * tdWidth + 'px';
		}
		return width;
	},

	getOffset: function getOffset ( minDate, tdWidth ) {
		var weeksFromMinDate;

		if( this.startDate.isBefore(minDate) ) {
			weeksFromMinDate = -(mcgavren.dateUtil.getNumWeeksBetweenDates( this.startDate, minDate ));
		} else {
			weeksFromMinDate = mcgavren.dateUtil.getNumWeeksBetweenDates( minDate, this.startDate );
		}
		
		return weeksFromMinDate * tdWidth + 'px';
	},

	getColorCls: function getColorCls() {
		var cls = '';
		if( this.status ) {
			cls = this.status.replace(/\s+/gi, "-");
		}
		return cls;
	},

	getInfo: function getInfo() {
		var htmlString = '';
			
		htmlString += '<div class="o-hidden"><h3>' + this.title + '</h3><br>';
		htmlString += this.agency + '<br>';
		htmlString += this.advertiser + '<br>';
		htmlString += moment(this.startDate).format('LL') +  ' - ';
		htmlString += moment(this.endDate).format('LL');
		htmlString += '</div>';

		return htmlString;
	}
};

